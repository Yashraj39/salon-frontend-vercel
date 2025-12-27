import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../axiosConfig";

export default function NewPassword() {
  const [password, setPassword] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const handleNewPassword = async () => {
    try {
      await api.post("/new-password", { email, password });
toast.success("Password changed successfully!");
navigate("/login");

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed!");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white w-[380px] p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Set New Password
        </h2>

        <input
          type="password"
          placeholder="Enter New Password"
          className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:border-blue-600 outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-black text-white cursor-pointer py-3 rounded-lg font-bold transition"
          onClick={handleNewPassword}
        >
          Submit
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Back to{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-black cursor-pointer font-medium"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
