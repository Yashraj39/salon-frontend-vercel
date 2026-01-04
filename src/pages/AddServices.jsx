import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack, IoTimeOutline } from "react-icons/io5";
import { FiBell, FiUser } from "react-icons/fi";

export default function AddServices() {
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("cartData");
    if (raw) {
      const cart = JSON.parse(raw);
      if (cart?.items?.length > 0) {
        // ✅ last added service only
        setItem(cart.items[cart.items.length - 1]);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ================= NAVBAR ================= */}
      <div className="fixed top-0 left-0 w-full bg-white border-b z-50 px-14">
        <div className="flex items-center justify-between py-4">
          <div
            className="flex items-center gap-2 font-semibold cursor-pointer"
            onClick={() => navigate("/success")}
          >
            <div className="h-7 w-7 bg-black rounded-md" />
            Glow & Shine
          </div>

          <div className="flex gap-8 text-sm">
            <span
              onClick={() => navigate("/success")}
              className="cursor-pointer"
            >
              Home
            </span>
            <span
              onClick={() => navigate("/bookings")}
              className="cursor-pointer border-b-2 border-black"
            >
              My Bookings
            </span>
          </div>

          <div className="flex gap-5">
            <FiBell className="text-xl cursor-pointer" />
            <FiUser
              className="text-xl cursor-pointer"
              onClick={() => navigate("/profile")}
            />
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      {/* 🔥 pt-32 added so navbar overlap nahi kare */}
      <div className="px-14 pt-32 pb-36 relative">
        {/* TOP ROW */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 border rounded-full flex items-center justify-center"
            >
              <IoArrowBack />
            </button>
            <h2 className="text-lg font-semibold lowercase">
              add services
            </h2>
          </div>

          <button className="bg-red-500 text-white px-6 py-2 rounded-lg text-sm">
            Cancel Booking
          </button>
        </div>

        {/* ================= SERVICE CARD ================= */}
        {item ? (
          <div className="bg-gray-100 rounded-3xl px-10 py-8 flex justify-between items-center">
            <div className="flex items-center gap-8">
              <img
                src={item.imageUrl}
                alt={item.serviceName}
                className="h-20 w-20 rounded-2xl object-cover"
              />
              <h3 className="font-semibold">
                {item.serviceName}
              </h3>
            </div>

            <p className="font-semibold">
              {item.price} Rs.
            </p>

            <div className="flex items-center gap-2 text-gray-500">
              <IoTimeOutline />
              <span>{item.time} Min</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No service added</p>
        )}
      </div>

      {/* ================= BOTTOM BUTTONS ================= */}
      <div className="fixed bottom-0 left-0 w-full px-14 pb-8 bg-white">
        <div className="flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="bg-[#0B132B] text-white px-16 py-3 rounded-lg"
          >
            Add Another Service
          </button>

          <button
            onClick={() => navigate("/checkout")}
            className="bg-[#0B132B] text-white px-16 py-3 rounded-lg"
          >
            Check Out
          </button>
        </div>
      </div>
    </div>
  );
}
