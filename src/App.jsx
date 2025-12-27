import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Auth Pages
import Register from "./pages/Register";
import OTPVerify from "./pages/OTPVerify";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetOTP from "./pages/ResetOTP";
import NewPassword from "./pages/NewPassword";
import Success from "./pages/Success";

// Main Pages
import Home from "./pages/Home";
import SalonDetails from "./pages/SalonDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            padding: "16px",
            color: "black",
            fontWeight: "bold",
            borderRadius: "8px",
          },
        }}
      />

      <Routes>

        <Route path="/" element={<Home />} />

        {/* Auth Flow */}
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<OTPVerify />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-otp" element={<ResetOTP />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/success" element={<Success />} />

        {/* After Login */}
        <Route path="/home" element={<Home />} />
        <Route path="/salon/:id" element={<SalonDetails />} />
      </Routes>
    </BrowserRouter>
  );
}
