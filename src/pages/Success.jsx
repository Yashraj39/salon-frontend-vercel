import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  /* FETCH SALONS */
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

  /* FILTER */
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

  return (
    <div className="min-h-screen bg-gray-50">
     {/* NAVBAR */}
      <div className=" top-0 left-0 w-full bg-white border-b z-50 px-4 sm:px-6 md:px-14">
        <div className="flex items-center justify-between py-4">
          <div
            onClick={() => navigate("/success")}
            className="flex items-center gap-2 font-semibold cursor-pointer"
          >
            <div className="h-7 w-7 bg-black rounded-md" />
            Glow & Shine
          </div>

          <div className="hidden md:flex gap-8 text-sm cursor-pointer">
            <span onClick={() => navigate("/success")}>Home</span>
            <span
              onClick={() => navigate("/bookings")}
              className="border-b-2 border-black cursor-pointer"
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



      {/* HERO */}
      <div className="bg-white py-10 text-center px-4">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          Find the best salons near you
        </h2>
        <p className="text-gray-500 mb-6 text-sm md:text-base">
          Book appointments for hair, nails, spa, and beauty services instantly.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by salon or city"
            className="w-full sm:w-96 px-4 py-3 border rounded-lg"
          />
          <button
            onClick={() => setSearch(searchInput)}
            className="bg-black text-white px-6 cursor-pointer py-3 rounded-lg"
          >
            Search
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex flex-col lg:flex-row px-4 md:px-10 py-8 gap-8">
        {/* SIDEBAR */}
        <div className="w-full lg:w-72 bg-gray-100 rounded-xl p-6 h-fit">
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
                <label key={city} className="flex gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCity === city}
                    onChange={() =>
                      setSelectedCity((p) => (p === city ? "" : city))
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
            className="flex justify-between font-semibold cursor-pointer"
          >
            <span>Search by Service</span>
            {openService ? <IoIosArrowDown /> : <IoIosArrowUp />}
          </div>

          {openService && (
            <div className="mt-3 space-y-2 text-sm">
              {["Haircut", "Hair Coloring", "Pedicure"].map((service) => (
                <label key={service} className="flex gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedService === service}
                    onChange={() =>
                      setSelectedService((p) =>
                        p === service ? "" : service
                      )
                    }
                  />
                  {service}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
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
<footer className="border-t bg-white mt-10">
  <div className="max-w-7xl mx-auto px-4 md:px-10 py-6
                  flex flex-col md:flex-row
                  items-center justify-between gap-4">

    {/* LEFT */}
    <div className="flex items-center gap-3">
      <div className="h-7 w-7 rounded-md bg-slate-900"></div>
      <span className="font-semibold">Glow & Shine</span>
    </div>

    {/* CENTER */}
    <p className="text-sm text-gray-500 text-center">
      © 2025 Glow & Shine Inc. All rights reserved.
    </p>

    {/* RIGHT */}
    <div className="flex gap-6 text-sm text-gray-500">
      <a href="#" className="hover:text-black cursor-pointer">
        Terms
      </a>
      <a href="#" className="hover:text-black cursor-pointer">
        Privacy
      </a>
    </div>

  </div>
</footer>

    </div>
  );
}
