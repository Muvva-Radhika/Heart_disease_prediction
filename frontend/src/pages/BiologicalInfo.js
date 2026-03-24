import React, { useState } from "react";

import { useNavigate } from "react-router-dom";

import "./Form.css";



export default function BiologicalInfo() {

    const navigate = useNavigate();



    const [bioData, setBioData] = useState({

        age: "", sex: "1", cp: "0", trestbps: "", chol: "",

        thalach: "", exang: "0", oldpeak: "",

        slope: "1", ca: "0", thal: "1"

    });




    const handleChange = (e) => {

        setBioData({ ...bioData, [e.target.name]: e.target.value });

    };



    const handleNext = () => {

        // Validation: Ensure mandatory fields are not empty before moving to upload

        const required = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak'];

        if (required.some(field => !bioData[field])) {

            alert("Please fill in clinical parameters or use 'Skip' if you only have a report.");

            return;

        }

        // Passing bioData inside an object named 'params' for clear retrieval

        navigate("/report-upload", { state: { params: bioData } });

    };



    return (

        <div className="card neat-form-container">

            <h3 className="form-title">Clinical Parameters</h3>

            <p className="form-subtitle">Step 1: Enter Medical Details</p>



            <div className="form-scroll-area">

                <div className="form-row">

                    <label>Age</label>

                    <input type="number" name="age" className="form-input" onChange={handleChange} />

                </div>

                <div className="form-row">

                    <label>Blood Pressure</label>

                    <input type="number" name="trestbps" className="form-input" onChange={handleChange} />

                </div>

                <div className="form-row">

                    <label>Cholesterol</label>

                    <input type="number" name="chol" className="form-input" onChange={handleChange} />

                </div>

                <div className="form-row">

                    <label>Max Heart Rate</label>

                    <input type="number" name="thalach" className="form-input" onChange={handleChange} />

                </div>

                <div className="form-row">

                    <label>ST Depression</label>

                    <input type="number" step="0.1" name="oldpeak" className="form-input" onChange={handleChange} />

                </div>

                {/* Include your other select dropdowns (sex, cp, slope, etc.) here */}

            </div>



            <button className="submit-form-btn next-btn-blue" onClick={handleNext}>

                Next: Upload Report

            </button>

        </div>

    );

}