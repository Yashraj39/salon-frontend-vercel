import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { FiBell, FiUser } from "react-icons/fi";

export default function SelectService() {
  const { salonId } = useParams();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);
  const [gender, setGender] = useState("all");

  const CATEGORIES = [
    { name: "Haircut", id: "694ce6be84ba8f65cd26743b" },
    { name: "Hair Styling", id: "694ce6be84ba8f65cd26743c" },
    { name: "Hair Coloring", id: "694ce6be84ba8f65cd26743d" },
    { name: "Facial", id: "694ce6be84ba8f65cd267440" },
    { name: "Cleanup", id: "694ce6be84ba8f65cd267441" },
    { name: "Manicure", id: "694ce6be84ba8f65cd267443" },
    { name: "Pedicure", id: "694ce6be84ba8f65cd267444" },
    { name: "Waxing", id: "694ce6be84ba8f65cd267446" },
    { name: "Makeup", id: "694ce6be84ba8f65cd267449" },
    { name: "Massage", id: "694ce6be84ba8f65cd26744b" },
  ];

  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

  /* ================= FETCH SERVICES ================= */
  useEffect(() => {
    if (!salonId || !selectedCategory) return;

    const fetchServices = async () => {
      setLoading(true);
      try {
        const url = `https://render-qs89.onrender.com/api/service/get-services?salonId=${salonId}&categoryId=${selectedCategory.id}`;
        const res = await fetch(url);
        const data = await res.json();

        let filteredData = Array.isArray(data) ? data : [];

        // FRONTEND gender filter (API ma gender param nathi)
        if (gender !== "all") {
          filteredData = filteredData.filter(
            (s) =>
              s.genderCategory?.toLowerCase() ===
              (gender === "kid" ? "kid" : gender)
          );
        }

        setServices(filteredData);
      } catch (err) {
        console.error(err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [salonId, selectedCategory, gender]);

  /* ================= ADD SERVICE ================= */
const handleAddService = async (service) => {
  try {
    const serviceId = service._id || service.id;

    const formData = new FormData();
    formData.append("userId", "694800ad64ee233d55c0ba67");
    formData.append("salonId", salonId);
    formData.append("serviceId", serviceId);

    const res = await fetch(
      "https://render-qs89.onrender.com/api/cart/add",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    // 🔥 IMPORTANT: backend cart save
    localStorage.setItem("cartData", JSON.stringify(data));

    navigate(`/add-services/${salonId}`);
  } catch (err) {
    console.error(err);
  }
};





  return (
    <div className="h-screen flex flex-col bg-white">
      {/* NAVBAR */}
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
            <span onClick={() => navigate("/success")} className="cursor-pointer">
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

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-14 pt-24 pb-28">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 w-10 h-10 border cursor-pointer rounded-full flex items-center justify-center"
        >
          <IoArrowBack />
        </button>

        <h2 className="text-xl font-semibold mb-8">Select Service</h2>

        {/* FILTERS */}
        <div className="flex gap-6 mb-10">
          {/* CATEGORY */}
          <div className="relative w-72">
            <button
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="w-full bg-gray-100 px-5 py-3 rounded-full flex justify-between items-center"
            >
              {selectedCategory.name}
              {categoryOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </button>

            {categoryOpen && (
              <div className="absolute w-full bg-white shadow rounded-xl mt-2 z-10 max-h-64 overflow-y-auto">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCategoryOpen(false);
                    }}
                    className="px-5 py-3 hover:bg-gray-100 cursor-pointer"
                  >
                    {cat.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GENDER */}
          <div className="relative w-56">
            <button
              onClick={() => setGenderOpen(!genderOpen)}
              className="w-full bg-gray-100 px-5 py-3 rounded-full flex justify-between items-center"
            >
              {gender === "all"
                ? "All"
                : gender === "men"
                ? "Men"
                : gender === "women"
                ? "Women"
                : "Kid"}
              {genderOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </button>

            {genderOpen && (
              <div className="absolute w-full bg-white shadow rounded-xl mt-2 z-10">
                {["all", "men", "women", "kid"].map((g) => (
                  <div
                    key={g}
                    onClick={() => {
                      setGender(g);
                      setGenderOpen(false);
                    }}
                    className="px-5 py-3 hover:bg-gray-100 cursor-pointer"
                  >
                    {g === "all"
                      ? "All"
                      : g === "men"
                      ? "Men"
                      : g === "women"
                      ? "Women"
                      : "Kid"}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SERVICES */}
        {loading ? (
          <p className="text-center">Loading services...</p>
        ) : services.length === 0 ? (
          <p className="text-center text-gray-500">No services found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
            {services.map((s) => (
              <div
                key={s.id}
                className="bg-gray-100 rounded-3xl p-4 flex flex-col"
              >
                <img
                  src={s.imageUrl}
                  alt={s.name}
                  className="h-44 w-full rounded-2xl object-cover"
                />

                <h3 className="mt-4 font-semibold text-sm">{s.name}</h3>

                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {s.description}
                </p>

                <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                  ⏱ {s.time} Min
                </div>

                <p className="mt-2 font-semibold text-sm">
                  ₹ {s.price}
                </p>

                <button
  className="mt-4 bg-black text-white text-xs py-2 cursor-pointer rounded-full"
  onClick={() => handleAddService(s)}
>
  Add Service
</button>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      {/* <footer className="fixed bottom-0 left-0 w-full border-t bg-white z-50">
        <div className="max-w-7xl mx-auto px-14 py-4 flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-md bg-black" />
            <span className="font-semibold text-black">Glow & Shine</span>
          </div>
          <p>© 2025 Glow & Shine Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-black">
              Terms
            </a>
            <a href="#" className="hover:text-black">
              Privacy
            </a>
          </div>
        </div>
      </footer> */}
    </div>
  );
}
