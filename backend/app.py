from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import secrets
import re
import random
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient
from PIL import Image
import pytesseract

# Load backend/.env (same folder as this file)
load_dotenv(Path(__file__).resolve().parent / ".env")

# ------------------ CONFIG ------------------
app = Flask(__name__)

_cors = os.getenv("CORS_ORIGINS", "*").strip()
if _cors == "*":
    CORS(app)
else:
    CORS(app, origins=[o.strip() for o in _cors.split(",") if o.strip()])

# 🔗 MongoDB Atlas — set MONGODB_URI in .env (see .env.example)
_mongo_uri = (os.getenv("MONGODB_URI") or "").strip()
if not _mongo_uri:
    raise RuntimeError(
        "MONGODB_URI is missing. Copy backend/.env.example to backend/.env and add your Atlas connection string."
    )

client = MongoClient(
    _mongo_uri,
    serverSelectionTimeoutMS=15000,
)
_db_name = (os.getenv("MONGODB_DB_NAME") or "heartdb").strip()
db = client[_db_name]

patients_col = db["patients"]
users_col = db["users"]
otp_col = db["otp"]


def _verify_mongodb_at_startup():
    """Eager-connect so you see success/failure in the terminal when you run python app.py."""
    try:
        client.admin.command("ping")
        n_pat = patients_col.count_documents({})
        print(
            f"[MongoDB Atlas] Connected | db '{_db_name}' | "
            f"patients={n_pat}, users={users_col.count_documents({})}, otp={otp_col.count_documents({})}"
        )
        print("[MongoDB Atlas] Predictions are saved to heartdb.patients when users run Predict risk.")
    except Exception as e:
        print("[MongoDB Atlas] CONNECTION FAILED:", repr(e))
        print("Fix: set MONGODB_URI in backend/.env | Atlas → Network Access → allow 0.0.0.0/0 or your IP.")
        raise


_verify_mongodb_at_startup()


@app.route("/api/health", methods=["GET"])
def api_health():
    """Use this after deploy to confirm Atlas connectivity and that data can be read."""
    try:
        client.admin.command("ping")
        p_count = patients_col.count_documents({})
        u_count = users_col.count_documents({})
        return jsonify({
            "ok": True,
            "mongodb": "connected",
            "database": _db_name,
            "collections": {
                "patients": p_count,
                "users": u_count,
                "otp": otp_col.count_documents({}),
            },
        })
    except Exception as e:
        return jsonify({"ok": False, "mongodb": "error", "message": str(e)}), 503

# Admin session tokens (in-memory; fine for single-process dev)
ADMIN_TOKENS = set()

# 🔤 Tesseract (optional — Windows paths or Linux package; OCR skipped if not configured)
_tess = (os.getenv("TESSERACT_CMD") or "").strip()
if _tess:
    pytesseract.pytesseract.tesseract_cmd = _tess
elif os.name == "nt":
    _win = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    if Path(_win).is_file():
        pytesseract.pytesseract.tesseract_cmd = _win
        os.environ.setdefault("TESSDATA_PREFIX", r"C:\Program Files\Tesseract-OCR\tessdata")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ------------------ SAFE INT ------------------
def safe_int(value):
    try:
        if value in [None, "", "undefined"]:
            return 0
        return int(float(value))
    except:
        return 0


def safe_float(value):
    try:
        if value in [None, "", "undefined"]:
            return 0.0
        return float(value)
    except:
        return 0.0


def clinical_risk_score(
    age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
):
    """Composite 0–100 score from Cleveland-style features (illustrative, not diagnostic)."""
    s = 6.0
    s += min(age * 0.32, 28)
    s += sex * 4.5
    s += cp * 3.6
    s += min(trestbps * 0.055, 17)
    s += min(chol * 0.032, 13)
    s += fbs * 9
    s += restecg * 2.8
    s += max(0, (192 - thalach) * 0.11)
    s += exang * 13
    s += min(oldpeak * 5.8, 18)
    s += slope * 4.2
    s += ca * 7.2
    if thal == 6:
        s += 15
    elif thal == 7:
        s += 11
    return max(0.0, min(s, 100.0))

# ------------------ OCR EXTRACTION ------------------
def extract_values(text):
    bp, chol = None, None

    bp_match = re.search(r'(BP|Blood Pressure)[^\d]*(\d+)', text, re.IGNORECASE)
    chol_match = re.search(r'(Cholesterol)[^\d]*(\d+)', text, re.IGNORECASE)

    if bp_match:
        bp = int(bp_match.group(2))
    if chol_match:
        chol = int(chol_match.group(2))

    return bp, chol

# ------------------ PREDICT ------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        age = safe_int(request.form.get("age"))
        sex = safe_int(request.form.get("sex"))
        cp = safe_int(request.form.get("cp"))
        trestbps = safe_int(request.form.get("trestbps") or request.form.get("bp"))
        chol = safe_int(request.form.get("chol"))
        fbs = safe_int(request.form.get("fbs"))
        restecg = safe_int(request.form.get("restecg"))
        thalach = safe_int(request.form.get("thalach"))
        exang = safe_int(request.form.get("exang"))
        oldpeak = safe_float(request.form.get("oldpeak"))
        slope = safe_int(request.form.get("slope"))
        ca = safe_int(request.form.get("ca"))
        thal = safe_int(request.form.get("thal"))

        smoking = request.form.get("smoking", "No")
        if smoking not in ("Yes", "No"):
            smoking = "Yes" if exang == 1 else "No"

        user = request.form.get("email") or request.form.get("user") or "Guest"
        file = request.files.get("file")

        text = ""
        filename = None

        if file and file.filename:
            filepath = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(filepath)
            filename = file.filename
            try:
                image = Image.open(filepath)
                text = pytesseract.image_to_string(image, config="--psm 6")
                print("OCR TEXT:", text[:500])
                ocr_bp, ocr_chol = extract_values(text)
                if ocr_bp:
                    trestbps = ocr_bp
                if ocr_chol:
                    chol = ocr_chol
            except Exception as ocr_err:
                print("OCR skipped:", ocr_err)
                text = ""

        risk = clinical_risk_score(
            age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak,
            slope, ca, thal,
        )

        if risk < 30:
            status = "Low Risk"
            rec = "Maintain healthy lifestyle."
        elif risk < 55:
            status = "Moderate Risk"
            rec = "Exercise and balanced diet recommended."
        else:
            status = "High Risk"
            rec = "Consult a cardiologist immediately."

        patients_col.insert_one({
            "user": user,
            "age": age,
            "sex": sex,
            "cp": cp,
            "bp": trestbps,
            "trestbps": trestbps,
            "chol": chol,
            "fbs": fbs,
            "restecg": restecg,
            "thalach": thalach,
            "exang": exang,
            "oldpeak": oldpeak,
            "slope": slope,
            "ca": ca,
            "thal": thal,
            "smoking": smoking,
            "risk": int(round(risk)),
            "status": status,
            "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        })

        return jsonify({
            "success": True,
            "risk": f"{int(round(risk))}%",
            "status": status,
            "recommendation": rec,
            "file": filename,
            "ocr_text": text[:300] if text else "",
        })

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({
            "success": False,
            "message": str(e)
        })

# ------------------ GET ALL PATIENTS ------------------
@app.route("/patients", methods=["GET"])
def get_patients():
    try:
        data = []
        for item in patients_col.find().sort("_id", -1):
            item["_id"] = str(item["_id"])
            data.append(item)

        return jsonify({
            "success": True,
            "data": data
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

# ------------------ HISTORY ------------------
@app.route("/api/history", methods=["GET"])
def get_history():
    data = []
    for item in patients_col.find().sort("_id", -1):
        data.append({
            "user": item.get("user"),
            "risk": item.get("risk"),
            "date": item.get("date")
        })
    return jsonify(data)

# ------------------ SEND OTP ------------------
@app.route("/api/send-otp", methods=["POST"])
def send_otp():
    email = request.json.get("email")
    otp = str(random.randint(100000, 999999))

    otp_col.update_one(
        {"email": email},
        {"$set": {"otp": otp}},
        upsert=True
    )

    print("OTP:", otp)  # simulate email
    return jsonify({"success": True, "message": "OTP sent"})

# ------------------ RESET PASSWORD ------------------
@app.route("/api/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    email = data.get("email")
    otp = data.get("otp")
    new_password = data.get("newPassword")

    record = otp_col.find_one({"email": email})

    if record and record["otp"] == otp:
        users_col.update_one(
            {"email": email},
            {"$set": {"password": new_password}},
            upsert=True
        )
        return jsonify({"success": True, "message": "Password updated!"})
    else:
        return jsonify({"success": False, "message": "Invalid OTP"})

# ------------------ ADMIN ------------------
def _admin_unauthorized():
    return jsonify({"success": False, "message": "Unauthorized"}), 401


def _admin_token_ok():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return False
    return auth[7:].strip() in ADMIN_TOKENS


@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    try:
        body = request.get_json(force=True, silent=True) or {}
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""
        admin_email = (os.getenv("ADMIN_EMAIL") or "admin@localhost").strip().lower()
        admin_password = os.getenv("ADMIN_PASSWORD") or "admin123"
        if email != admin_email or password != admin_password:
            return jsonify({"success": False, "message": "Invalid credentials"}), 401
        token = secrets.token_urlsafe(32)
        ADMIN_TOKENS.add(token)
        return jsonify({"success": True, "token": token})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route("/api/admin/summary", methods=["GET"])
def admin_summary():
    if not _admin_token_ok():
        return _admin_unauthorized()
    try:
        return jsonify({
            "success": True,
            "counts": {
                "users": users_col.count_documents({}),
                "patients": patients_col.count_documents({}),
                "otp_records": otp_col.count_documents({}),
            },
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route("/api/admin/users", methods=["GET"])
def admin_users_list():
    if not _admin_token_ok():
        return _admin_unauthorized()
    try:
        rows = []
        for u in users_col.find().sort("_id", -1):
            rows.append({
                "id": str(u["_id"]),
                "username": u.get("username") or (u.get("email") or "").split("@")[0] or "—",
                "email": u.get("email", "—"),
                "patient_id": u.get("patient_id", "—"),
                "created_at": u.get("created_at"),
            })
        return jsonify({"success": True, "data": rows})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route("/api/admin/patients", methods=["GET"])
def admin_patients_list():
    if not _admin_token_ok():
        return _admin_unauthorized()
    try:
        data = []
        for item in patients_col.find().sort("_id", -1):
            row = {k: v for k, v in item.items() if k != "_id"}
            row["_id"] = str(item["_id"])
            data.append(row)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# ------------------ RUN ------------------
if __name__ == "__main__":
    _port = int(os.getenv("PORT", "5000"))
    _debug = os.getenv("FLASK_DEBUG", "1") == "1"
    app.run(host="0.0.0.0", port=_port, debug=_debug)