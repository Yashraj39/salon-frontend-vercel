import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBell, FiUser } from "react-icons/fi";

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("user");

  return (
    <header className="bg-white border-b px-4 md:px-10 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* LOGO */}
        <div
          className="flex items-center font-bold text-base sm:text-lg cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="h-7 w-7 mr-2 rounded-md bg-slate-900" />
          Glow & Shine
        </div>

        {/* RIGHT SIDE */}
        {!isLoggedIn ? (
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              to="/login"
              className="text-gray-700 hover:text-black text-sm sm:text-base"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="bg-black text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base"
            >
              Sign up
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <FiBell className="text-xl cursor-pointer" />
            <FiUser
              className="text-xl cursor-pointer"
              onClick={() => navigate("/profile")}
            />
          </div>
        )}
      </div>
    </header>
  );
}
