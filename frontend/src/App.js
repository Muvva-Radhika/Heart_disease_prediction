import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Splash from "./pages/Splash";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard"; // <-- Create/Import your new Dashboard component
import BiologicalInfo from "./pages/BiologicalInfo";
import ReportUpload from "./pages/ReportUpload";
import Results from "./pages/Results";
import History from "./pages/History";
import Recommendations from "./pages/Recommendations";

function App() {
  const [allData, setAllData] = useState({});
  const [resultData, setResultData] = useState(null);

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Splash />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Dashboard & Home - Ensure your Sidebar links to /home or /dashboard */}
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard data={resultData} />} />

        {/* Prediction Flow */}
        <Route
          path="/bio"
          element={<BiologicalInfo onNext={(data) => setAllData(data)} />}
        />
        <Route
          path="/report-upload"
          element={<ReportUpload allData={allData} onResult={(res) => setResultData(res)} />}
        />
        <Route path="/results" element={<Results data={resultData} />} />

        {/* Other Features */}
        <Route path="/history" element={<History />} />
        <Route path="/recommendations" element={<Recommendations />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;