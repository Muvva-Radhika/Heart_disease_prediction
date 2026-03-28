import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Splash from "./pages/Splash";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import BiologicalInfo from "./pages/BiologicalInfo";
import ClinicalReportUpload from "./pages/ClinicalReportUpload";
import Results from "./pages/Results";
import History from "./pages/History";
import Recommendations from "./pages/Recommendations";
import Settings from "./pages/Settings";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [resultData, setResultData] = useState(null);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Home page now handles the Dashboard view internally */}
        <Route path="/home" element={<Home data={resultData} />} />

        <Route
          path="/bio"
          element={<BiologicalInfo onResult={(res) => setResultData(res)} />}
        />

        <Route
          path="/bio/upload"
          element={<ClinicalReportUpload onResult={(res) => setResultData(res)} />}
        />

        <Route path="/report-upload" element={<Navigate to="/bio" replace />} />

        <Route path="/results" element={<Results data={resultData} />} />
        <Route path="/history" element={<History />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;