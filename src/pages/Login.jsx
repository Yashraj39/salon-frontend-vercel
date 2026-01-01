import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await api.post("/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE 👉", res.data);

      // ✅ STORE USER DATA (as per your API response)
      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: res.data.userId || "",
          name: res.data.name || "",
          email: res.data.email || "",
          isAccountVerified: res.data.isAccountVerified || false,
        })
      );

      toast.success("Login successful!");
      navigate("/success");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Login failed!"
      );
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
            <h2 className="text-2xl font-semibold mb-2">Log in</h2>
            <p className="text-gray-500 text-sm mb-6">
              Welcome back! Please login to your account.
            </p>

            <input
              type="email"
              className="w-full border px-3 py-2 rounded-md mb-3 text-sm"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="w-full border px-3 py-2 rounded-md mb-4 text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <p
              onClick={() => navigate("/forgot-password")}
              className="text-xs text-gray-500 underline cursor-pointer mb-5"
            >
              Forgot password?
            </p>

            <div className="flex gap-3 mb-2">
              <button
                onClick={handleLogin}
                className="bg-black text-white px-6 py-2 rounded-md text-sm cursor-pointer"
              >
                Log in
              </button>

              <button
                onClick={() => navigate("/register")}
                className="border px-6 py-2 rounded-md text-sm cursor-pointer"
              >
                Sign Up
              </button>
            </div>

            <p className="text-[10px] text-gray-400 mt-2">
              *Keep your credentials safe
            </p>
          </div>
        </div>

        {/* RIGHT ILLUSTRATION */}
        <div className="w-1/2 flex justify-start pl-16">
          <img
            src="public/Hero.png"
            alt="login"
            className="w-[320px]"
          />
        </div>
      </div>
    </div>
  );
}
