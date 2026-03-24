from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from PIL import Image
import pytesseract
import re
import random
from datetime import datetime
from pymongo import MongoClient

# ------------------ CONFIG ------------------
app = Flask(__name__)
CORS(app)

# 🔗 MongoDB Atlas
client = MongoClient("mongodb+srv://radhikamuvva61_db_user:Radhika2006@cluster0.klxjcab.mongodb.net/")
db = client["heartdb"]

patients_col = db["patients"]
users_col = db["users"]
otp_col = db["otp"]

# 🔤 Tesseract setup
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
os.environ["TESSDATA_PREFIX"] = r"C:\Program Files\Tesseract-OCR\tessdata"

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ------------------ SAFE INT ------------------
def safe_int(value):
    try:
        if value in [None, "", "undefined"]:
            return 0
        return int(value)
    except:
        return 0

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
        bp = safe_int(request.form.get("bp"))
        chol = safe_int(request.form.get("chol"))
        smoking = request.form.get("smoking", "No")
        user = request.form.get("user", "Guest")

        file = request.files.get("file")

        text = ""
        filename = None

        # 🔹 OCR
        if file:
            filepath = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(filepath)
            filename = file.filename

            image = Image.open(filepath)
            text = pytesseract.image_to_string(image, config='--psm 6')

            print("OCR TEXT:", text)

            ocr_bp, ocr_chol = extract_values(text)

            if ocr_bp:
                bp = ocr_bp
            if ocr_chol:
                chol = ocr_chol

        # 🔹 Risk Calculation
        risk = (age * 0.5) + (bp * 0.2) + (chol * 0.1)

        if smoking == "Yes":
            risk += 15

        risk = min(risk, 100)

        # 🔹 Result
        if risk < 30:
            status = "Low Risk"
            rec = "Maintain healthy lifestyle."
        elif risk < 60:
            status = "Moderate Risk"
            rec = "Exercise and balanced diet recommended."
        else:
            status = "High Risk"
            rec = "Consult a cardiologist immediately."

        # 🔥 SAVE TO MONGODB
        patients_col.insert_one({
            "user": user,
            "age": age,
            "bp": bp,
            "chol": chol,
            "smoking": smoking,
            "risk": int(risk),
            "status": status,
            "date": datetime.now().strftime("%Y-%m-%d %H:%M")
        })

        return jsonify({
            "success": True,
            "risk": f"{int(risk)}%",
            "status": status,
            "recommendation": rec,
            "file": filename,
            "ocr_text": text[:300]
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

# ------------------ RUN ------------------
if __name__ == "__main__":
    app.run(debug=True)