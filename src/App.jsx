import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Auth Pages
import Register from "./pages/Register";
import OTPVerify from "./pages/OTPVerify";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetOTP from "./pages/ResetOTP";
import NewPassword from "./pages/NewPassword";
import SelectService from "./pages/SelectService";
// import ProtectedRoute from "./pages/ProtectedRoute";
import Profile from "./pages/Profile";
import ConfirmBooking from "./pages/ConfirmBooking";


// Main Pages
import Home from "./pages/Home";
import SalonDetails from "./pages/SalonDetails";
import AddServices from "./pages/AddServices";


export default function App() {
  return (
    <BrowserRouter>
      {/* Toast */}
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
        {/* 🌟 DEFAULT HOME PAGE (Login પહેલા) */}
        <Route path="/" element={<Home />} />

        {/* Auth Flow */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<OTPVerify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-otp" element={<ResetOTP />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/success" element={<Home />} />
        <Route path="/profile" element={<Profile />} />

        {/* Pages */}
        <Route path="/home" element={<Home />} />
        <Route path="/salon-details/:id" element={<SalonDetails />} />
        <Route path="/salon/:id" element={<SalonDetails />} />
        <Route path="/add-services/:salonId" element={<AddServices />} />
        <Route path="/book/:salonId" element={<SelectService />} />
        <Route path="/confirm-booking/:salonId" element={<ConfirmBooking />} />

        {/* 404 */}
        <Route
          path="*"
          element={
            <h1 className="text-center mt-10 text-2xl">
              404 Page Not Found
            </h1>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
