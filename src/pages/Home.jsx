import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* NAVBAR */}
     <header className="bg-white border-b px-4 md:px-10 py-4">
  <div className="flex items-center justify-between max-w-7xl mx-auto">
    
    {/* LOGO */}
    <div
      className="flex items-center font-bold text-base sm:text-lg cursor-pointer"
      onClick={() => navigate("/home")}
    >
      <div className="h-7 w-7 mr-2 rounded-md bg-slate-900" />
      Glow & Shine
    </div>

    {/* LOGIN & SIGNUP — ALWAYS VISIBLE */}
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

  </div>
</header>


      {/* HERO */}
      <section className="bg-white py-10 md:py-14 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">
          Find the best salons near you
        </h2>
        <p className="text-gray-500 mb-6 max-w-xl mx-auto text-sm sm:text-base">
          Book appointments for hair, nails, spa, and beauty services instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by salon or city"
            className="w-full px-4 py-3 border rounded-lg"
          />
          <button
            onClick={() => setSearch(searchInput)}
            className="bg-black text-white px-6 py-3 cursor-pointer rounded-lg"
          >
            Search
          </button>
        </div>
      </section>

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
                      navigate(`/salon-details/${salon.salonId}`)
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
