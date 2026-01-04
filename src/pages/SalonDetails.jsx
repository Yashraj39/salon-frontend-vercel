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
    <div>
      {/* ================= NAVBAR ================= */}
      <nav className="w-full bg-white border-b">
        <div className="max-w-7xl mx-auto px-10 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-black rounded"></div>
            <span className="font-bold text-lg">Glow & Shine</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="text-gray-700 hover:text-black">
              Log in
            </Link>
            <Link
              to="/register"
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= CONTENT ================= */}
      <div className="min-h-screen bg-white px-25 py-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 w-10 h-10 border rounded-full cursor-pointer flex items-center justify-center"
        >
          <IoArrowBack />
        </button>

        {/* TOP SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <img
            src={salon.imageUrl}
            alt={salon.name}
            className="w-250px h-[350px] object-cover rounded-2xl"
          />

          <div className="bg-gray-100 rounded-2xl p-8">
            <h1 className="text-3xl font-bold mb-6">{salon.name}</h1>

            <div className="flex items-start gap-4 mb-4">
              <FaLocationDot className="text-xl mt-1" />
              <p className="text-gray-700">
                {salon.address || "Address not available"}
              </p>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <FaPhone className="text-lg" />
              <p className="text-gray-700">
                {salon.contact || "Phone not available"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <MdEmail className="text-xl" />
              <p className="text-gray-700">
                {salon.email || "Email not available"}
              </p>
            </div>
          </div>
        </div>

        {/* SERVICES */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Available Services</h2>

          {salon.services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {salon.services.map((service, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">
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
            <p className="text-gray-500 text-center mt-6">
              No services available
            </p>
          )}
        </div>

        {/* BOOK NOW */}
        <div className="flex justify-center mt-16">
          <button
            onClick={handleBookNow1}
            className="bg-black text-white px-10 py-3 cursor-pointer rounded-lg text-lg hover:bg-gray-800"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="w-full border-t mt-20">
        <div className="max-w-7xl mx-auto px-10 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-2 mb-3 md:mb-0">
            <div className="w-5 h-5 bg-black rounded"></div>
            <span className="font-semibold text-gray-700">
              Glow & Shine
            </span>
          </div>

          <p>© 2025 Glow & Shine Inc. All rights reserved.</p>

          <div className="flex gap-4">
            <a href="#" className="hover:text-black">Terms</a>
            <a href="#" className="hover:text-black">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
