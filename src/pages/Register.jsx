import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    if (!agreeTerms) {
      toast.error("Please agree to terms of services");
      return;
    }

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
      <div className="px-6 sm:px-10 py-6">
        <h1 className="text-lg font-semibold underline">Glow & Shine</h1>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 flex-col md:flex-row items-center justify-center px-4 md:px-32">
        {/* LEFT FORM */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end mb-8 md:mb-0 md:pr-16">
          <div className="w-full max-w-[320px]">
            <h2 className="text-2xl font-semibold mb-2 cursor-pointer">Sign Up</h2>
            <p className="text-gray-500 text-sm mb-6">
              You are a step away from something great!
            </p>

            <input
              className="w-full border px-3 py-2 rounded-md mb-3 text-sm"
              placeholder="Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="w-full border px-3 py-2 rounded-md mb-3 text-sm"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="w-full border px-3 py-2 rounded-md mb-3 text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center gap-2 text-xs mb-4">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                I agree to{" "}
                <span
                  className="underline cursor-pointer"
                  onClick={() => toast("Show Terms of Services")}
                >
                  terms of services.
                </span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-2">
              <button
                onClick={handleRegister}
                className="bg-black text-white px-6 py-2 rounded-md text-sm flex-1"
              >
                Sign Up
              </button>

              <button
                onClick={() => navigate("/login")}
                className="border px-6 py-2 rounded-md text-sm flex-1"
              >
                Log in
              </button>
            </div>

            <p className="text-[10px] text-gray-400 mt-2">
              *This is some important notice...
            </p>
          </div>
        </div>

        {/* RIGHT ILLUSTRATION - Only on Desktop */}
        <div className="hidden md:flex w-1/2 justify-start pl-16">
          <img
            src="/Hero.png"
            alt="signup"
            className="w-[320px] object-contain"
          />
        </div>
      </div>
    </div>
  );
}
