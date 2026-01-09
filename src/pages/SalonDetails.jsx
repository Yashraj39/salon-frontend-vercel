import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaLocationDot, FaPhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import toast from "react-hot-toast";

export default function SalonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH SALON ================= */
  useEffect(() => {
    const fetchSalon = async () => {
      try {
        const res = await fetch(
          `https://render-qs89.onrender.com/api/salon/get-salon/${id}`
        );
        const data = await res.json();

        if (!Array.isArray(data.services)) {
          data.services = [];
        }

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

  /* ================= BOOK NOW HANDLER (STRICT) ================= */
  const handleBookNow1 = () => {
  toast.error("Please login and Sign Up");
};
  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!salon) return <p className="text-center mt-10">Salon not found</p>;

  return (
   <div className="min-h-screen flex flex-col bg-white">
       {/* NAVBAR */}
<header className="bg-white border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-3 sm:py-4">
    <div className="flex items-center justify-between">
      
      {/* LOGO */}
      <div
        onClick={() => navigate("/home")}
        className="flex items-center font-bold text-base sm:text-lg cursor-pointer"
      >
        <div className="h-7 w-7 sm:h-8 sm:w-8 mr-2 rounded-md bg-slate-900" />
        <span className="whitespace-nowrap">Glow & Shine</span>
      </div>

      {/* LOGIN & SIGNUP */}
      <div className="flex items-center gap-2 sm:gap-5">
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

    </div>
  </div>
</header>




      {/* CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6">
        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 w-10 h-10 border cursor-pointer rounded-full flex items-center justify-center"
        >
          <IoArrowBack />
        </button>

        {/* TOP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <img
            src={salon.imageUrl}
            alt={salon.name}
            className="w-full h-64 sm:h-80 object-cover rounded-2xl"
          />

          <div className="bg-gray-100 rounded-2xl p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">
              {salon.name}
            </h1>

            <div className="flex gap-4 mb-4">
              <FaLocationDot className="text-xl mt-1" />
              <p className="text-gray-700">
                {salon.address || "Address not available"}
              </p>
            </div>

            <div className="flex gap-4 mb-4">
              <FaPhone className="text-lg" />
              <p className="text-gray-700">
                {salon.contact || "Phone not available"}
              </p>
            </div>

            <div className="flex gap-4">
              <MdEmail className="text-xl" />
              <p className="text-gray-700">
                {salon.email || "Email not available"}
              </p>
            </div>
          </div>
        </div>

        {/* SERVICES */}
        <div className="mt-14">
          <h2 className="text-2xl font-bold mb-8">
            Available Services
          </h2>

          {salon.services.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {salon.services.map((service, i) => (
                <div key={i} className="border rounded-lg p-4">
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

        {/* BOOK */}
        <div className="flex justify-center mt-14">
          <button
            onClick={handleBookNow1}
            className="bg-black text-white cursor-pointer px-8 sm:px-10 py-3 rounded-lg text-base sm:text-lg hover:bg-gray-800"
          >
            Book Now
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-black rounded" />
            <span className="font-semibold text-gray-700">
              Glow & Shine
            </span>
          </div>

          <p>© 2025 Glow & Shine Inc. All rights reserved.</p>

          <div className="flex gap-4">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
