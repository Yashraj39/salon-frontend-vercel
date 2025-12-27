import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../axiosConfig";
import toast from "react-hot-toast";

export default function OTPVerify() {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const handleChange = (value, index) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && index > 0 && !otp[index]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const verifyOTP = async () => {
    const otpValue = otp.join("");

    try {
      await api.post("/verify-otp", { email, otp: otpValue });
      toast.success("OTP Verified!"); // ✅ toast success
      navigate("/login"); // Redirect to login page
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP"); // ✅ toast error
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white w-[380px] p-8 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Verify OTP</h2>
        <p className="text-sm text-gray-600">
          OTP sent to <span className="font-medium">{email}</span>
        </p>

        <div className="flex justify-between mt-6 mb-6">
          {otp.map((value, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={value}
              ref={(el) => (inputRefs.current[index] = el)}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleBackspace(e, index)}
              className="w-12 h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-600 outline-none transition"
            />
          ))}
        </div>

        <button
          className={`w-full py-3 rounded-lg text-white cursor-pointer font-bold transition ${
            otp.join("").length === 6
              ? "bg-black"
              : "bg-black"
          }`}
          disabled={otp.join("").length !== 6}
          onClick={verifyOTP}
        >
          Verify OTP
        </button>
      </div>
    </div>
  );
}
