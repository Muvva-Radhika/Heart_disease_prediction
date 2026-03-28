import API_BASE_URL, { apiUrl, isUserConfiguredRemoteApi } from "../config";
import {
    hasRequiredClinicalParams,
    mergeWithClinicalDefaults,
} from "./clinicalDefaults";

export function appendClinicalToFormData(formData, data) {
    formData.append("email", localStorage.getItem("userEmail") || "guest@heartai.local");
    formData.append("age", data.age || "0");
    formData.append("sex", data.sex ?? "0");
    formData.append("cp", data.cp ?? "0");
    formData.append("trestbps", data.trestbps || "0");
    formData.append("bp", data.trestbps || "0");
    formData.append("chol", data.chol || "0");
    formData.append("fbs", data.fbs ?? "0");
    formData.append("restecg", data.restecg ?? "0");
    formData.append("thalach", data.thalach || "0");
    formData.append("exang", data.exang ?? "0");
    formData.append("oldpeak", data.oldpeak ?? "0");
    formData.append("slope", data.slope ?? "1");
    formData.append("ca", data.ca ?? "0");
    formData.append("thal", data.thal ?? "3");
    formData.append("smoking", data.exang === "1" ? "Yes" : "No");
}

/**
 * @param {{ data: object, file?: File|null, onResult?: function, navigate: function }} opts
 */
export async function runPredictRequest({ data, file, onResult, navigate }) {
    const merged = mergeWithClinicalDefaults(data);
    const paramsOk = hasRequiredClinicalParams(merged);
    if (!paramsOk && !file) {
        alert(
            "Fill the five required fields on the previous page, or choose a report image so missing numbers can use safe defaults with OCR."
        );
        return false;
    }

    const payload = mergeWithClinicalDefaults(data);
    const formData = new FormData();
    appendClinicalToFormData(formData, payload);
    if (file) {
        formData.append("file", file);
    }

    let res;
    try {
        res = await fetch(apiUrl("/predict"), {
            method: "POST",
            body: formData,
        });
    } catch (err) {
        const msg = err?.message || String(err);
        alert(
            isUserConfiguredRemoteApi
                ? `Cannot reach your API:\n${API_BASE_URL}\n\n` +
                  "Check that the server is up and allows browser requests (CORS). " +
                  "For local Flask instead, remove REACT_APP_API_URL from frontend/.env and restart npm start.\n\n" +
                  `Network: ${msg}`
                : `Cannot reach Flask at:\n${API_BASE_URL}\n\n` +
                  "Open a terminal and run:\n" +
                  "  cd backend\n" +
                  "  python app.py\n\n" +
                  "Wait until you see it listening on port 5000, then try Predict again.\n" +
                  "Restart npm start after any .env change.\n\n" +
                  `Details: ${msg}`
        );
        return false;
    }

    let result = {};
    try {
        result = await res.json();
    } catch (_) {
        alert(
            `The server did not return JSON (HTTP ${res.status}). ` +
                "Make sure you are running this project’s Flask app.py on port 5000."
        );
        return false;
    }

    if (result.success) {
        const forDashboard = {
            ...result,
            prediction: result.status,
        };
        try {
            sessionStorage.setItem("lastPrediction", JSON.stringify(forDashboard));
            sessionStorage.setItem("lastPredictionAt", new Date().toISOString());
        } catch (_) {}
        onResult?.(forDashboard);
        navigate("/results", { state: result });
        return true;
    }

    alert(result.message || `Prediction failed (HTTP ${res.status})`);
    return false;
}
