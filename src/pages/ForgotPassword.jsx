import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axiosConfig";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleForgot = async () => {
    try {
      await api.post("/forgot-password", { email });
      toast.success("Reset OTP sent to your email!"); // ✅ toast success
      navigate("/reset-otp", { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP"); // ✅ toast error
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 w-[380px] rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Forgot Password?
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your email to receive reset OTP
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500 transition"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleForgot}
          className="w-full bg-black text-white py-3 rounded-lg cursor-pointer text-md font-semibold  transition"
        >
          Send OTP
        </button>

        <p className="text-sm text-gray-600 text-center mt-4">
          Remember password?{" "}
          <span
            className="text-black font-semibold cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
