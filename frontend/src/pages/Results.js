import React from "react";
import { useLocation, useNavigate } from "react-router-dom";


export default function Results() {

    const location = useLocation();
    const navigate = useNavigate();

    const data = location.state;

    if (!data) {
        return <h3>No Data Found</h3>;
    }

    const riskValue = parseInt(data.risk);

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

            <button onClick={() => navigate("/recommendations")}>
                View Recommendations
            </button>

        </div>
    );
}