import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { FiBell, FiUser } from "react-icons/fi";

export default function Home() {
  const navigate = useNavigate();

  const [salons, setSalons] = useState([]);
  const [filteredSalons, setFilteredSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const [openCity, setOpenCity] = useState(true);
  const [openService, setOpenService] = useState(true);

  // 🔹 FETCH SALONS
  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const res = await fetch(
          "https://render-qs89.onrender.com/api/salon/get-all-salon"
        );
        const data = await res.json();
        setSalons(data);
        setFilteredSalons(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSalons();
  }, []);

  // 🔍 FILTER LOGIC
  useEffect(() => {
    let result = [...salons];

    if (search) {
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(search.toLowerCase()) ||
          s.city?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedCity) {
      result = result.filter((s) => s.city === selectedCity);
    }

    if (selectedService) {
      result = result.filter((s) =>
        s.services?.includes(selectedService)
      );
    }

    setFilteredSalons(result);
  }, [search, selectedCity, selectedService, salons]);

  const handleSearch = () => {
    setSearch(searchInput);
  };

  const handleServiceChange = (service) => {
    setSelectedService((prev) =>
      prev === service ? "" : service
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            className="cursor-pointer border-b-2 border-black pb-1"
          >
            Home
          </span>
          <span
            onClick={() => navigate("/bookings")}
            className="cursor-pointer text-gray-500 hover:text-black"
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

      {/* HERO */}
      <div className="bg-white py-12 text-center">
        <h2 className="text-5xl font-bold mb-4">
          Find the best salons near you
        </h2>
        <p className="text-gray-500 mb-6">
          Book appointments for hair, nails, spa, and beauty services instantly.
        </p>

        <div className="flex justify-center gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by salon or city"
            className="w-96 px-4 py-3 border rounded-lg"
          />
          <button
            onClick={handleSearch}
            className="bg-black text-white px-6 rounded-lg"
          >
            Search
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex px-10 py-8 gap-8">
        {/* SIDEBAR */}
        <div className="w-72 bg-gray-100 rounded-xl p-6 h-fit">
          {/* CITY */}
          <div
            onClick={() => setOpenCity(!openCity)}
            className="flex justify-between font-semibold cursor-pointer"
          >
            <span>Search by City</span>
            {openCity ? <IoIosArrowDown /> : <IoIosArrowUp />}
          </div>

          {openCity && (
            <div className="mt-3 space-y-2 text-sm">
              {["Surat", "Ahmedabad", "Rajkot"].map((city) => (
                <label key={city} className="flex items-center  cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCity === city}
                    onChange={() =>
                      setSelectedCity((prev) =>
                        prev === city ? "" : city
                      )
                    }
                  />
                  {city}
                </label>
              ))}
            </div>
          )}

          <hr className="my-5" />

          {/* SERVICE */}
          <div
            onClick={() => setOpenService(!openService)}
            className="flex justify-between font-semibold "
          >
            <span>Search by Service</span>
            {openService ? <IoIosArrowDown /> : <IoIosArrowUp />}
          </div>

          {openService && (
            <div className="mt-3 space-y-2 text-sm  ">
              {["Haircut", "Hair Color", "Pedicure"].map((service) => (
                <label key={service} className="flex items-center  cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    checked={selectedService === service}
                    onChange={() => handleServiceChange(service)}
                  />
                  {service}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          {loading ? (
            <p className="col-span-3 text-center">Loading salons...</p>
          ) : filteredSalons.length === 0 ? (
            <p className="col-span-3 text-center text-gray-500">
              ❌ Salon not found
            </p>
          ) : (
            filteredSalons.map((salon) => (
              <div
                key={salon.salonId}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <img
                  src={salon.imageUrl}
                  alt={salon.name}
                  className="h-36 w-full object-cover"
                />

                <div className="p-4 space-y-1">
                  <h3 className="font-semibold text-sm">{salon.name}</h3>
                  <p className="text-xs text-gray-500">{salon.city}</p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {salon.services?.length > 0 ? (
                      salon.services.map((s, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-400">
                        No services
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/salon/${salon.salonId}`)
                    }
                    className="mt-3 w-full border py-1.5 cursor-pointer rounded-md text-xs hover:bg-gray-50"
                  >
                    View Salon
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t bg-white py-5 mt-10">
        <div className="mx-auto max-w-7xl px-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-md bg-slate-900"></div>
            <span className="font-semibold">Glow & Shine</span>
          </div>

          <p className="text-sm text-gray-500">
            © 2025 Glow & Shine Inc. All rights reserved.
          </p>

          <div className="flex gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-black">Terms</a>
            <a href="#" className="hover:text-black">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
