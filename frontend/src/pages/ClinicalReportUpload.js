import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Form.css";
import "./ClinicalParameters.css";
import { mergeWithClinicalDefaults, hasRequiredClinicalParams } from "./clinicalDefaults";
import { runPredictRequest } from "./clinicalSubmit";

export default function ClinicalReportUpload({ onResult }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const rawParams = location.state?.params;
    const bioData = rawParams && typeof rawParams === "object" ? rawParams : {};

    useEffect(() => {
        if (!location.state?.params || typeof location.state.params !== "object") {
            navigate("/bio", { replace: true });
        }
    }, [location.state, navigate]);

    const mergedPreview = mergeWithClinicalDefaults(bioData);
    const coreOk = hasRequiredClinicalParams(mergedPreview);

    const handlePredict = async () => {
        setLoading(true);
        try {
            await runPredictRequest({
                data: bioData,
                file,
                onResult,
                navigate,
            });
        } catch (err) {
            console.error(err);
            alert(err?.message || "Unexpected error during prediction.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="clinical-shell">
            <div className="clinical-card neat-form-container">
                <header className="clinical-card-header">
                    <p className="clinical-step">Optional OCR</p>
                    <h1 className="clinical-card-title">Upload report image</h1>
                    <p className="clinical-card-lead">
                        Your clinical entries from the previous page are kept. Add a PNG or JPG of a lab or vitals
                        report; the server uses OCR to refine blood pressure and cholesterol when it finds them, then
                        runs the same risk model.
                    </p>
                </header>

                <div className="clinical-upload-page-body">
                    <div className={`clinical-params-status ${coreOk ? "ok" : "warn"}`}>
                        {coreOk ? (
                            <span>Core clinical fields are complete for this run.</span>
                        ) : (
                            <span>
                                Some core fields were empty — safe defaults will fill gaps. Adding a clear report image
                                helps OCR correct BP and cholesterol.
                            </span>
                        )}
                    </div>

                    <section className="upload-zone clinical-upload-zone-tall">
                        <p className="upload-zone-title">Choose file</p>
                        <p className="upload-zone-desc">
                            Optional: if you skip the file, you can still tap Predict risk to use your typed values
                            only (same as on the previous screen).
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        {file ? <p className="upload-file-name">Selected: {file.name}</p> : null}
                    </section>
                </div>

                <div className="clinical-predict-row">
                    <button
                        type="button"
                        className="clinical-btn-predict"
                        onClick={handlePredict}
                        disabled={loading}
                    >
                        {loading
                            ? "Running prediction…"
                            : file
                              ? "Predict risk (form + OCR)"
                              : "Predict risk (clinical data only)"}
                    </button>
                    <div className="clinical-bottom-split">
                        <button
                            type="button"
                            className="clinical-btn-secondary"
                            onClick={() => navigate("/bio", { state: { params: bioData } })}
                        >
                            ← Edit clinical parameters
                        </button>
                        <button type="button" className="clinical-btn-ghost" onClick={() => navigate("/home")}>
                            Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
