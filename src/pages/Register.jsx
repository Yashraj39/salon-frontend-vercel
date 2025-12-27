import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await api.post("/register", {
        id: Date.now().toString(),
        name,
        email,
        password,
      });
      toast.success("OTP sent successfully!");
      navigate("/otp", { state: { email } });
    } catch (error) {
      console.log(error);
      toast.error("Registration Failed!");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* TOP BRAND */}
      <div className="px-10 py-6">
        <h1 className="text-lg font-semibold underline">Glow & Shine</h1>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 items-center justify-between px-32">
        {/* LEFT FORM */}
        <div className="w-1/2 flex justify-end pr-16">
          <div className="w-[320px]">
            <h2 className="text-2xl font-semibold mb-2 cursor-pointer">Sign Up</h2>
            <p className="text-gray-500 text-sm mb-6">
              You are a step away from something great!
            </p>

            <input
              className="w-full border px-3 py-2 rounded-md mb-3 text-sm"
              placeholder="Username"
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="w-full border px-3 py-2 rounded-md mb-3 text-sm"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="w-full border px-3 py-2 rounded-md mb-3 text-sm"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center gap-2 text-xs mb-4">
              <input type="checkbox" />
              <span>
                I agree to{" "}
                <span className="underline cursor-pointer">terms of services.</span>
              </span>
            </div>

            <div className="flex gap-3 mb-2">
              <button
                onClick={handleRegister}
                className="bg-black text-white px-6 py-2 rounded-md text-sm cursor-pointer"
              >
                Sign Up
              </button>

              <button
                onClick={() => navigate("/login")}
                className="border px-6 py-2 rounded-md text-sm cursor-pointer"
              >
                Log in
              </button>
            </div>

            <p className="text-[10px] text-gray-400 mt-2">
              *This is some important notice...
            </p>
          </div>
        </div>

        {/* RIGHT ILLUSTRATION */}
        <div className="w-1/2 flex justify-start pl-16">
          <img
            src="public/Hero.png"
            alt="signup"
            className="w-[320px]"
          />
        </div>
      </div>
    </div>
  );
}
