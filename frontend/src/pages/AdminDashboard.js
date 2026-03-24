import React, { useEffect, useState } from "react";
import "./Admin.css";

export default function AdminDashboard() {

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await fetch("http://127.0.0.1:5000/patients");
            const data = await res.json();

            if (data.success) {
                setPatients(data.data);
            } else {
                alert("Failed to fetch data");
            }
        } catch (err) {
            console.error(err);
            alert("Backend not connected");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">

            <h2 className="admin-title">Admin Dashboard</h2>

            {loading ? (
                <p>Loading data...</p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Age</th>
                            <th>BP</th>
                            <th>Cholesterol</th>
                            <th>Smoking</th>
                            <th>Risk</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.length === 0 ? (
                            <tr>
                                <td colSpan="6">No records found</td>
                            </tr>
                        ) : (
                            patients.map((p, index) => (
                                <tr key={index}>
                                    <td>{p.age}</td>
                                    <td>{p.bp}</td>
                                    <td>{p.chol}</td>
                                    <td>{p.smoking}</td>
                                    <td>{p.risk}%</td>
                                    <td className={
                                        p.status === "High Risk"
                                            ? "high"
                                            : p.status === "Moderate Risk"
                                                ? "moderate"
                                                : "low"
                                    }>
                                        {p.status}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}