import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Form.css";
import "./ClinicalParameters.css";
import { SKIP_CLINICAL_DEFAULTS } from "./clinicalDefaults";
import { runPredictRequest } from "./clinicalSubmit";

const INITIAL = {
    age: "",
    sex: "1",
    cp: "0",
    trestbps: "",
    chol: "",
    fbs: "0",
    restecg: "0",
    thalach: "",
    exang: "0",
    oldpeak: "",
    slope: "1",
    ca: "0",
    thal: "3",
};

export default function BiologicalInfo({ onResult }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [bioData, setBioData] = useState(INITIAL);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const p = location.state?.params;
        if (p && typeof p === "object") {
            setBioData((prev) => ({ ...prev, ...p }));
        }
    }, [location.state]);

    const handleChange = (e) => {
        setBioData({ ...bioData, [e.target.name]: e.target.value });
    };

    const handlePredictRisk = async () => {
        setLoading(true);
        try {
            await runPredictRequest({
                data: bioData,
                file: null,
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

    const handleOpenFileUploadPage = () => {
        navigate("/bio/upload", { state: { params: bioData } });
    };

    const applyDemoDefaults = () => {
        setBioData((prev) => ({ ...prev, ...SKIP_CLINICAL_DEFAULTS }));
    };

    return (
        <div className="clinical-shell">
            <div className="clinical-card neat-form-container">
                <header className="clinical-card-header">
                    <p className="clinical-step">Risk assessment</p>
                    <h1 className="clinical-card-title">Clinical parameters</h1>
                    <p className="clinical-card-lead">
                        Enter each value in order. Use <strong>Predict risk</strong> below for a result from your typed
                        data only. To optionally attach a report photo for OCR, open the next screen with{" "}
                        <strong>Optional file upload</strong>.
                    </p>
                </header>

                <div className="form-scroll-area">
                    <fieldset className="clinical-fieldset">
                        <legend className="clinical-fieldset-legend">Demographics</legend>
                        <div className="clinical-line-stack">
                            <div className="clinical-field">
                                <label htmlFor="age">1. Age (years)</label>
                                <span className="hint">Required</span>
                                <input
                                    id="age"
                                    type="number"
                                    name="age"
                                    min="18"
                                    max="120"
                                    value={bioData.age}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="clinical-field">
                                <label htmlFor="sex">2. Sex</label>
                                <select id="sex" name="sex" value={bioData.sex} onChange={handleChange}>
                                    <option value="0">Female</option>
                                    <option value="1">Male</option>
                                </select>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="clinical-fieldset">
                        <legend className="clinical-fieldset-legend">Presentation &amp; labs</legend>
                        <div className="clinical-line-stack">
                            <div className="clinical-field">
                                <label htmlFor="cp">3. Chest pain type</label>
                                <select id="cp" name="cp" value={bioData.cp} onChange={handleChange}>
                                    <option value="0">Typical angina</option>
                                    <option value="1">Atypical angina</option>
                                    <option value="2">Non-anginal pain</option>
                                    <option value="3">Asymptomatic</option>
                                </select>
                            </div>
                            <div className="clinical-field">
                                <label htmlFor="trestbps">4. Resting blood pressure (mm Hg)</label>
                                <span className="hint">Required</span>
                                <input
                                    id="trestbps"
                                    type="number"
                                    name="trestbps"
                                    min="80"
                                    max="250"
                                    value={bioData.trestbps}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="clinical-field">
                                <label htmlFor="chol">5. Serum cholesterol (mg/dl)</label>
                                <span className="hint">Required</span>
                                <input
                                    id="chol"
                                    type="number"
                                    name="chol"
                                    min="100"
                                    max="600"
                                    value={bioData.chol}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="clinical-field">
                                <label htmlFor="fbs">6. Fasting blood sugar</label>
                                <select id="fbs" name="fbs" value={bioData.fbs} onChange={handleChange}>
                                    <option value="0">≤ 120 mg/dl</option>
                                    <option value="1">&gt; 120 mg/dl</option>
                                </select>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="clinical-fieldset">
                        <legend className="clinical-fieldset-legend">ECG &amp; exercise</legend>
                        <div className="clinical-line-stack">
                            <div className="clinical-field">
                                <label htmlFor="restecg">7. Resting ECG</label>
                                <select id="restecg" name="restecg" value={bioData.restecg} onChange={handleChange}>
                                    <option value="0">Normal</option>
                                    <option value="1">ST-T abnormality</option>
                                    <option value="2">Left ventricular hypertrophy</option>
                                </select>
                            </div>
                            <div className="clinical-field">
                                <label htmlFor="thalach">8. Max heart rate achieved</label>
                                <span className="hint">Required</span>
                                <input
                                    id="thalach"
                                    type="number"
                                    name="thalach"
                                    min="60"
                                    max="220"
                                    value={bioData.thalach}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="clinical-field">
                                <label htmlFor="exang">9. Exercise-induced angina</label>
                                <select id="exang" name="exang" value={bioData.exang} onChange={handleChange}>
                                    <option value="0">No</option>
                                    <option value="1">Yes</option>
                                </select>
                            </div>
                            <div className="clinical-field">
                                <label htmlFor="oldpeak">10. ST depression — oldpeak (mm vs rest)</label>
                                <span className="hint">Required</span>
                                <input
                                    id="oldpeak"
                                    type="number"
                                    step="0.1"
                                    name="oldpeak"
                                    min="0"
                                    max="10"
                                    value={bioData.oldpeak}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="clinical-field">
                                <label htmlFor="slope">11. ST segment slope (peak exercise)</label>
                                <select id="slope" name="slope" value={bioData.slope} onChange={handleChange}>
                                    <option value="0">Upsloping</option>
                                    <option value="1">Flat</option>
                                    <option value="2">Downsloping</option>
                                </select>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="clinical-fieldset">
                        <legend className="clinical-fieldset-legend">Angiography (if known)</legend>
                        <div className="clinical-line-stack">
                            <div className="clinical-field">
                                <label htmlFor="ca">12. Major vessels colored by fluoroscopy (0–3)</label>
                                <select id="ca" name="ca" value={bioData.ca} onChange={handleChange}>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </select>
                            </div>
                            <div className="clinical-field">
                                <label htmlFor="thal">13. Thalassemia / perfusion defect</label>
                                <select id="thal" name="thal" value={bioData.thal} onChange={handleChange}>
                                    <option value="3">Normal</option>
                                    <option value="6">Fixed defect</option>
                                    <option value="7">Reversible defect</option>
                                </select>
                            </div>
                        </div>
                    </fieldset>
                </div>

                <div className="clinical-predict-row">
                    <button
                        type="button"
                        className="clinical-btn-predict"
                        onClick={handlePredictRisk}
                        disabled={loading}
                    >
                        {loading ? "Running prediction…" : "Predict risk"}
                    </button>

                    <button
                        type="button"
                        className="clinical-btn-upload-next"
                        onClick={handleOpenFileUploadPage}
                        disabled={loading}
                    >
                        Optional file upload — next page
                        <span className="clinical-btn-upload-sub">Add a report image for OCR, then predict</span>
                    </button>

                    <p className="clinical-predict-hint">
                        Required for form-only prediction: age, resting BP, cholesterol, max HR, ST depression. The
                        upload page can still run with defaults plus OCR if needed.
                    </p>

                    <button type="button" className="clinical-btn-secondary" onClick={applyDemoDefaults}>
                        Fill sample values (demo)
                    </button>
                    <button type="button" className="clinical-btn-ghost" onClick={() => navigate("/home")}>
                        Back to home
                    </button>
                </div>
            </div>
        </div>
    );
}
