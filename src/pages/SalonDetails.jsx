import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaLocationDot, FaPhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import { FiBell, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import Navbar from "../componenets/Navbar";

export default function SalonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Modal States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingFor, setBookingFor] = useState("myself");
  const [guestName, setGuestName] = useState("");

  const isLoggedIn =
    !!localStorage.getItem("user") || !!localStorage.getItem("token");

  /* ================= FETCH SALON ================= */
  useEffect(() => {
    const fetchSalon = async () => {
      try {
        const res = await fetch(
          `https://render-qs89.onrender.com/api/salon/get-salon/${id}`
        );
        const data = await res.json();

        if (!Array.isArray(data.services)) data.services = [];
        setSalon(data);
      } catch (err) {
        console.error(err);
        setSalon(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSalon();
  }, [id]);

  /* ================= BOOK NOW ================= */
  const handleBookNow = () => {
    if (!isLoggedIn) {
      toast.error("Please login first");
      return;
    }

    setShowBookingModal(true);
  };

  /* ================= CONTINUE ================= */
  const handleContinueBooking = () => {
    if (bookingFor === "someone") {
      if (!guestName) {
        toast.error("Please fill all details");
        return;
      }
    }

    setShowBookingModal(false);

    navigate(`/book/${salon.id}`, {
      state: {
        bookingFor,
        guestName
      },
    });
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!salon) return <p className="text-center mt-10">Salon not found</p>;

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      {/* ================= NAVBAR ================= */}
     <Navbar/>

      {/* ================= CONTENT ================= */}
      <main
        className={`flex-1 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 ${showBookingModal ? "blur-sm pointer-events-none" : ""
          }`}
      >
        <button
          onClick={() => navigate(-1)}
          className="mb-6 w-10 h-10 border rounded-full flex items-center justify-center"
        >
          <IoArrowBack />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <img
            src={salon.imageUrl}
            alt={salon.name}
            className="w-full h-64 sm:h-80 object-cover rounded-2xl"
          />

          <div className="bg-gray-100 rounded-2xl p-6 sm:p-8 md:h-80">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">
              {salon.name}
            </h1>

            <div className="flex gap-4 mb-4">
              <FaLocationDot className="text-xl mt-1" />
              <p>{salon.address || "Address not available"}</p>
            </div>

            <div className="flex gap-4 mb-4">
              <FaPhone className="text-lg" />
              <p>{salon.contact || "Phone not available"}</p>
            </div>

            <div className="flex gap-4">
              <MdEmail className="text-xl" />
              <p>{salon.email || "Email not available"}</p>
            </div>
          </div>
        </div>

        {/* SERVICES */}
        <div className="mt-14">
          <h2 className="text-2xl font-bold mb-8">Available Services</h2>

          {salon.services.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {salon.services.map((service, i) => (
                <div key={i} className="bg-gray-100 border rounded-lg p-4">
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {service.description}
                  </p>
                  {service.price && (
                    <p className="text-blue-500 font-bold">
                      ₹{service.price}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No services available
            </p>
          )}
        </div>

        {/* BOOK BUTTON */}
        <div className="flex justify-center mt-14">
          <button
            onClick={handleBookNow}
            className="bg-black text-white px-8 py-3  cursor-pointer rounded-lg hover:bg-gray-800"
          >
            Book Now
          </button>
        </div>
      </main>

      {/* ================= MODAL ================= */}
      {showBookingModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 
                bg-black/40 backdrop-blur-sm
                transition-opacity duration-300 animate-fadeIn">
          <div className="bg-white w-[90%] sm:w-[400px] rounded-2xl shadow-xl p-6 relative
                transform transition-all duration-300 animate-scaleIn">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute right-4 top-4 text-gray-400 text-xl"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-6 text-center">
              Who is this booking for?
            </h2>

            <div className="flex items-center gap-3 mb-4">
              <input
                type="radio"
                className="accent-black w-4 h-4"
                checked={bookingFor === "myself"}
                onChange={() => setBookingFor("myself")}
              />
              <label>Myself</label>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <input
                type="radio"
                className="accent-black w-4 h-4"
                checked={bookingFor === "someone"}
                onChange={() => setBookingFor("someone")}
              />
              <label>Someone Else</label>
            </div>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out
  ${bookingFor === "someone"
                  ? "max-h-40 opacity-100 mt-3"
                  : "max-h-0 opacity-0"}`}
            >
              <input
                type="text"
                placeholder="Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full border rounded-lg p-2 mb-3
               transition-all duration-500 focus:outline-none
               focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>


            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 border cursor-pointer rounded-lg py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleContinueBooking}
                className="flex-1 bg-black text-white cursor-pointer rounded-lg py-2 
           transition-all duration-500 hover:bg-gray-800"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-black rounded" />
            <span className="font-semibold text-gray-700"> SlotMyStyle</span>
          </div>
          <p>© 2025 Glow & Shine Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}