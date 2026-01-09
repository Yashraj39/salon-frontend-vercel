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
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && index > 0 && !otp[index]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async () => {
    const otpValue = otp.join("");

    try {
      await api.post("/verify-otp", { email, otp: otpValue });
      toast.success("OTP Verified!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-sm sm:max-w-md p-6 sm:p-8 rounded-xl shadow-lg text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">
          Verify OTP
        </h2>

        <p className="text-sm sm:text-base text-gray-600 break-all">
          OTP sent to <span className="font-medium">{email}</span>
        </p>

        <div className="flex justify-between gap-2 sm:gap-3 mt-6 mb-6">
          {otp.map((value, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={value}
              ref={(el) => (inputRefs.current[index] = el)}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleBackspace(e, index)}
              className="
                w-10 h-12 sm:w-12 sm:h-14
                text-center text-lg sm:text-xl font-semibold
                border-2 border-gray-300 rounded-lg
                focus:border-black outline-none transition
              "
            />
          ))}
        </div>

        <button
          onClick={verifyOTP}
          disabled={otp.join("").length !== 6}
          className="
            w-full py-3 rounded-lg font-bold text-white
            bg-black disabled:opacity-50 disabled:cursor-not-allowed
            transition
          "
        >
          Verify OTP
        </button>
      </div>
    </div>
  );
}
