import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { FiBell, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";

export default function SelectService() {
  const { salonId } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [categoryOpen, setCategoryOpen] = useState(false);

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ OLD GENDER LOGIC
  const [genderOpen, setGenderOpen] = useState(false);
  const [gender, setGender] = useState("all");

  // ================= AI STATES =================
  const [aiImage, setAiImage] = useState(null);
  const [aiGender, setAiGender] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiServices, setAiServices] = useState([]);
  // AI Modal
  const [aiModalOpen, setAiModalOpen] = useState(false);





  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    if (!salonId) return;

    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `https://render-qs89.onrender.com/api/service-category/get-service-categories/${salonId}`
        );
        const list = await res.json();

        console.log("CATEGORY API:", list);
        setCategories(list);

        if (list.length > 0) {
          setSelectedCategory({
            id: list[0].id,
            name: list[0].name,
          });
        }
      } catch (err) {
        console.error("Category Error:", err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, [salonId]);

  /* ================= FETCH SERVICES ================= */
  useEffect(() => {
    if (!salonId || !selectedCategory?.id) return;

    const fetchServices = async () => {
      try {
        setLoading(true);

        const url = `https://render-qs89.onrender.com/api/service/get-services?salonId=${salonId}&categoryId=${selectedCategory.id}`;
        const res = await fetch(url);
        const json = await res.json();

        const list = Array.isArray(json) ? json : json?.data || [];
        console.log("RAW SERVICES:", list);

        // ✅ FRONTEND FILTER WITH BACKEND MAPPING
        let filteredData = list;

        if (gender !== "all") {
          filteredData = list.filter((s) => {
            const backendGender =
              s.genderCategory?.toLowerCase() ||
              s.gender?.toLowerCase();

            if (gender === "men") return backendGender === "men";
            if (gender === "women") return backendGender === "women";
            if (gender === "kid") return backendGender === "kid";

            return true;
          });
        }

        console.log("FILTERED SERVICES:", filteredData);
        setServices(filteredData);
      } catch (err) {
        console.error("Service Error:", err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [salonId, selectedCategory, gender]);

  /* ================= FETCH SERVICES FOR AI (NO GENDER FILTER) ================= */
  useEffect(() => {
    if (!salonId || !selectedCategory?.id) return;

    const fetchAiServices = async () => {
      try {
        const res = await fetch(
          `https://render-qs89.onrender.com/api/service/get-services-for-ai?salonId=${salonId}&categoryId=${selectedCategory.id}`
        );
        const json = await res.json();
        setAiServices(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("AI Service Error:", err);
        setAiServices([]);
      }
    };

    fetchAiServices();
  }, [salonId, selectedCategory]);


  /* ================= ADD SERVICE ================= */
  const handleAddService = async (service) => {
    try {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const userId = user.userId;

      if (!userId) {
        toast.error("User not logged in!");
        navigate("/login");
        return;
      }

      const serviceId = service._id || service.id;
      const categoryId = selectedCategory.id;

      let cartData = JSON.parse(localStorage.getItem("cartData")) || {
        items: [],
      };

      const categoryAlreadyAdded = cartData.items.some(
        (item) =>
          item.userId === userId &&
          item.salonId === salonId &&
          item.categoryId === categoryId
      );

      if (categoryAlreadyAdded) {
        toast.error("Service from this category already added");
        return;
      }

      cartData.items.push({
        serviceId,
        salonId,
        userId,
        categoryId,
        serviceName: service.name,
        price: service.price,
        time: service.time,
        imageUrl: service.imageUrl,
      });

      localStorage.setItem("cartData", JSON.stringify(cartData));
      toast.success("Service added!");
      navigate(`/add-services/${salonId}`);
    } catch (err) {
      toast.error("Cannot add service");
    }
  };

  /* ================= AI SUGGEST HANDLER ================= */
  const isHaircutCategory =
    selectedCategory?.name?.toLowerCase().includes("haircut");

  const handleAiSuggest = async () => {
    if (!aiImage) {
      toast.error("Please upload your photo");
      return;
    }

    if (!aiGender) {
      toast.error("Please select gender for AI suggestion");
      return;
    }

    if (!Array.isArray(aiServices) || aiServices.length === 0) {
      toast.error("No services available for AI suggestion");
      return;
    }

    try {
      setAiLoading(true);
      setAiSuggestions([]);

      // 1️⃣ Upload image to Cloudinary via render backend
      const fd = new FormData();
      fd.append("file", aiImage);

      const uploadRes = await fetch(
        "https://render-qs89.onrender.com/api/upload/image",
        {
          method: "POST",
          body: fd,
        }
      );

      if (!uploadRes.ok) {
        toast.error("Image upload failed");
        return;
      }

      const uploadJson = await uploadRes.json();

      if (
        !uploadJson ||
        typeof uploadJson.imageUrl !== "string" ||
        !uploadJson.imageUrl.startsWith("http")
      ) {
        toast.error("Invalid image upload response");
        return;
      }


      // 2️⃣ Call Gemini API
      const res = await fetch(
        "http://localhost:8081/api/gemini/suggest-with-images",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: uploadJson.imageUrl,
            gender: aiGender,
            hairstyles: aiServices,
          }),
        }
      );

      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (!res.ok || data.error) {
        toast.error(data.error || "AI could not suggest hairstyle");
        setAiSuggestions([]);
        return;
      }

      if (!Array.isArray(data.geminiResponse) || data.geminiResponse.length === 0) {
        toast.error("No suitable hairstyle found");
        setAiSuggestions([]);
        return;
      }

      setAiSuggestions(data.geminiResponse);

    } catch (err) {
      console.error(err);
      toast.error("AI suggestion failed");
    } finally {
      setAiLoading(false);
    }
  };


  return (
    <div className="h-screen flex flex-col bg-white">
      {/* NAVBAR */}
      <div className="fixed top-0 left-0 w-full bg-white border-b z-50 px-4 sm:px-6 md:px-14">
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
              {selectedCategory?.name || "Select Category"}
              {categoryOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </button>

            {categoryOpen && (
              <div className="absolute w-full bg-white shadow rounded-xl mt-2 z-10 max-h-64 overflow-y-auto">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory({
                        id: cat.id,
                        name: cat.name,
                      });
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

          {/* ✅ GENDER — OLD UI */}
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
        {/* AI BUTTON */}
        {isHaircutCategory && (
          <div className="mb-8 flex justify-center">
            <button
              onClick={() => setAiModalOpen(true)}
              className="bg-black text-white px-6 py-2 rounded-full"
            >
              Open AI Hairstyle Suggestion
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-center">Loading services...</p>
        ) : services.length === 0 ? (
          <p className="text-center text-gray-500">No services found</p>
        ) : (
          <>
            {/* SERVICES GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
              {services.map((s) => (
                <div
                  key={s._id || s.id}
                  className="bg-gray-100 rounded-3xl p-4 flex flex-col"
                >
                  {s.imageUrl && (
                    <img
                      src={s.imageUrl}
                      alt={s.name}
                      className="h-36 w-full rounded-xl object-cover"
                    />
                  )}


                  <h3 className="mt-4 font-semibold text-sm">{s.name}</h3>

                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {s.description}
                  </p>

                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                    ⏱ {s.time} Min
                  </div>

                  <p className="mt-2 font-semibold text-sm">₹ {s.price}</p>

                  <button
                    className="mt-4 bg-black text-white text-xs py-2 cursor-pointer rounded-full"
                    onClick={() => handleAddService(s)}
                  >
                    Add Service
                  </button>
                </div>
              ))}
            </div>

          </>
        )}
      </div>
      {/* ================= AI MODAL ================= */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white w-full max-w-4xl rounded-3xl p-6 relative">

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setAiModalOpen(false)}
              className="absolute top-4 right-4 text-xl"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-6">
              Suggest Hairstyle with AI
            </h3>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAiImage(e.target.files[0])}
                className="flex-1"
              />

              <select
                value={aiGender}
                onChange={(e) => setAiGender(e.target.value)}
                className="bg-gray-100 px-4 py-2 rounded-full"
              >
                <option value="">Select Gender</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kid">Kid</option>
              </select>

              <button
                onClick={handleAiSuggest}
                className="bg-black text-white px-6 py-2 rounded-full"
              >
                {aiLoading ? "Analyzing..." : "Suggest with AI"}
              </button>
            </div>

            {aiSuggestions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {aiSuggestions.map((s, i) => (
                  <div key={i} className="bg-gray-100 p-4 rounded-2xl">
                    <img
                      src={s.imageUrl}
                      alt={s.name}
                      className="h-36 w-full rounded-xl object-cover"
                    />
                    <h4 className="mt-2 font-semibold text-sm">{s.name}</h4>
                    <p className="text-xs text-gray-500">{s.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
