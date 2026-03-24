import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Form.css";

export default function ReportUpload() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // ✅ FIX: Retrieve the nested 'params' object passed from BiologicalInfo
    const bioData = location.state?.params || {};

    const handlePredict = async () => {
        if (!file) return alert("Please choose a medical report file!");

        setLoading(true);
        const formData = new FormData();

        // ✅ FIX: Sending correct keys to backend to avoid 0% Risk Result
        formData.append("email", "test@gmail.com");
        formData.append("age", bioData.age || "0");
        formData.append("bp", bioData.trestbps || "0");
        formData.append("chol", bioData.chol || "0");
        formData.append("smoking", bioData.exang === "1" ? "Yes" : "No");
        formData.append("file", file);

        try {
            const res = await fetch("http://127.0.0.1:5000/predict", {
                method: "POST",
                body: formData
            });
            const result = await res.json();

            if (result.success) {
                // Navigate to the results dashboard
                navigate("/results", { state: result });
            } else {
                alert(result.message || "Prediction failed");
            }
        } catch (err) {
            console.error(err);
            alert("Backend connection error. Ensure Flask is running on port 5000.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card neat-form-container">
            <h3 className="form-title">Final Step</h3>
            <p className="form-subtitle">Upload Report for AI Analysis</p>

            <div className="upload-section" style={{ padding: "40px 20px", textAlign: "center", border: "2px dashed #3498db", borderRadius: "8px", margin: "20px 0" }}>
                <label className="file-label" style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
                    Select Medical Document
                </label>
                <input
                    type="file"
                    className="form-input"
                    onChange={(e) => setFile(e.target.files[0])}
                />
                {file && <p style={{ color: "#2ecc71", marginTop: "10px" }}>Selected: {file.name}</p>}
            </div>

            <div className="button-group">
                <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
                <button
                    className="predict-btn-blue"
                    onClick={handlePredict}
                    disabled={loading}
                >
                    {loading ? "Analyzing Report..." : "Predict Risk Result"}
                </button>
            </div>
        </div>
    );
}