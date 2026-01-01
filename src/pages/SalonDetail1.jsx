import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaLocationDot } from "react-icons/fa6";
import { FaPhone } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import { FiBell, FiUser } from "react-icons/fi";
export default function SalonDetail1() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error(error);
        setSalon(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSalon();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!salon) return <p className="text-center mt-10">Salon not found</p>;

  return (
   <div>
      
      {/* NAVBAR */}
      <div className="flex items-center justify-between px-10 py-4 bg-white border-b">
        {/* LEFT */}
        <div
          className="flex items-center gap-2 text-lg font-semibold cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <div className="h-7 w-7 rounded-md bg-slate-900"></div>
          Glow & Shine
        </div>

        {/* CENTER */}
        <div className="flex items-center gap-10 text-sm font-medium">
          <span
            onClick={() => navigate("/home")}
            className="cursor-pointer text-gray-500 hover:text-black"
          >
            Home
          </span>
          <span
            onClick={() => navigate("/bookings")}
            className="cursor-pointer  border-b-2 border-black pb-1"
          >
            My Bookings
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5">
         
            <div className="flex items-center gap-5">
          <FiBell className="text-xl cursor-pointer" />

          {/* 👇 USER ICON CLICK */}
          <FiUser
            className="text-xl cursor-pointer"
            onClick={() => navigate("/profile")}
          />
        </div>
        </div>
        </div>
      {/* Back Button */}
    <div className="min-h-screen bg-white px-25 py-6">
    
        <button
          onClick={() => navigate(-1)}
          className="mb-4 w-10 h-10 border cursor-pointer rounded-full flex items-center justify-center"
        >
          <IoArrowBack />
        </button>

      {/* TOP SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* LEFT IMAGE */}
        <div>
          <img
            src={salon.imageUrl}
            alt={salon.name}
            className="w-250px h-[350px] object-cover rounded-2xl"
          />
        </div>

        {/* RIGHT INFO CARD */}
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
                {salon.phone || "Phone not available"}
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


      {/* BOOK NOW BUTTON */}
      <div className="flex justify-center mt-16">
       <button
  onClick={() => navigate(`/book/${salon.id}`)}
  className="bg-black text-white px-10 py-3 cursor-pointer rounded-lg text-lg hover:bg-gray-800 transition"
>
  Book Now
</button>
      </div>
    </div>
    <footer className="w-full border-t mt-20">
      <div className="max-w-7xl mx-auto px-10 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        
        {/* Left */}
        <div className="flex items-center gap-2 mb-3 md:mb-0">
          <div className="w-5 h-5 bg-black rounded"></div>
          <span className="font-semibold text-gray-700">
            Glow & Shine
          </span>
        </div>

        {/* Center */}
        <p className="mb-3 md:mb-0">
          © 2025 Glow & Shine Inc. All rights reserved.
        </p>

        {/* Right */}
        <div className="flex gap-4">
          <a href="#" className="hover:text-black">
            Terms
          </a>
          <a href="#" className="hover:text-black">
            Privacy
          </a>
        </div>
      </div>
    </footer>
    </div>
  );
}