import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Form.css";


export default function Results() {

    const location = useLocation();
    const navigate = useNavigate();

    const data = location.state;

    if (!data) {
        return (
            <div className="card" style={{ maxWidth: 420, margin: "48px auto", textAlign: "center" }}>
                <h3 className="form-title">No result yet</h3>
                <p style={{ color: "#666", marginBottom: 24 }}>
                    Run a prediction from the home screen, then your risk summary will appear here.
                </p>
                <button type="button" className="next-btn" onClick={() => navigate("/home")}>
                    Back to home
                </button>
            </div>
        );
    }

    const riskValue = parseInt(String(data.risk).replace(/[^0-9]/g, ""), 10) || 0;

    return (
        <div className="card">

            <h3>Risk Result</h3>

            <h2>{data.risk}</h2>

            <div style={{
                width: "100%",
                height: "10px",
                background: "#ddd",
                borderRadius: "5px"
            }}>
                <div style={{
                    width: `${riskValue}%`,
                    height: "10px",
                    background:
                        data.status === "Low Risk" ? "green" :
                            data.status === "Moderate Risk" ? "orange" : "red"
                }}></div>
            </div>

            <p><b>Status:</b> {data.status}</p>
            <p><b>Recommendation:</b> {data.recommendation}</p>

            {data.file && <p><b>File:</b> {data.file}</p>}

            {data.ocr_text && (
                <p><b>OCR:</b> {data.ocr_text}</p>
            )}

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: 16 }}>
                <button type="button" className="next-btn" onClick={() => navigate("/recommendations")}>
                    View recommendations
                </button>
                <button type="button" className="back-btn" onClick={() => navigate("/home")}>
                    Back to home
                </button>
            </div>

        </div>
    );
}