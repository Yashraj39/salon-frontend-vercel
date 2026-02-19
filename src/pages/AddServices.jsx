import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { IoArrowBack, IoTimeOutline } from "react-icons/io5";
import { FiBell, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import { FaShoppingCart } from "react-icons/fa";

export default function AddServices() {
  const navigate = useNavigate();
  const { salonId } = useParams();
  const [items, setItems] = useState([]);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user.userId;

  const location = useLocation();
  const customerName = location.state?.customerName || user?.name || "";
  const bookedBy = location.state?.bookedBy || user?.name || "";

  const [totalPending, setTotalPending] = useState(0);
  const [navbarCart, setNavbarCart] = useState([]);

  /* ================= FETCH CART ================= */
  useEffect(() => {
    const fetchCart = async () => {
      if (!userId) return;

      try {
        const url = new URL("https://render-qs89.onrender.com/api/cart/get");
        url.searchParams.append("userId", userId);
        url.searchParams.append("salonId", salonId);
        url.searchParams.append("customerName", customerName);

        const res = await fetch(url.toString());
        const data = await res.json();

        if (data?.items) {
          setItems(data.items);
          localStorage.setItem("cartData", JSON.stringify(data));
        }
      } catch {
        const raw = localStorage.getItem("cartData");
        if (raw) setItems(JSON.parse(raw).items || []);
      }
    };

    fetchCart();
  }, [userId, salonId]);

  /* ================= NAVBAR CART ================= */
  const fetchNavbarCart = async () => {
    try {
      if (!userId) return;

      const res = await fetch(
        `https://render-qs89.onrender.com/api/cart/navbar-cart?userId=${userId}`
      );

      if (!res.ok) return;

      const cartData = await res.json();

      setNavbarCart(cartData);

      const total = cartData.reduce(
        (sum, item) => sum + (item.pendingCount || 0),
        0
      );

      setTotalPending(total);
    } catch (error) {
      console.error("Navbar cart error:", error);
    }
  };

  useEffect(() => {
    fetchNavbarCart();
  }, [userId]);

  /* ================= CLEAR CART ================= */
  const handleCancelBooking = async () => {
    try {
      const url = new URL("https://render-qs89.onrender.com/api/cart/clear");
      url.searchParams.append("userId", userId);
      url.searchParams.append("salonId", salonId);
      url.searchParams.append("customerName", customerName);

      await fetch(url.toString(), { method: "DELETE" });

      setItems([]);
      localStorage.removeItem("cartData");

      // 🔥 THIS MAKES IT AUTO UPDATE (NO REFRESH NEEDED)
      fetchNavbarCart();

      toast.success("All services removed");
    } catch {
      toast.error("Cannot cancel booking");
    }
  };

  return (
    <div className="min-h-screen bg-white">

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

          <div className="flex gap-5 relative">
            <FiBell className="text-xl cursor-pointer" />
            <FiUser
              className="text-xl cursor-pointer"
              onClick={() => navigate("/profile")}
            />

            <div className="relative group">
              <div className="relative cursor-pointer">
                <FaShoppingCart className="text-xl" />

                {totalPending > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                    {totalPending}
                  </div>
                )}
              </div>

              <div className="
                absolute right-0 top-10 w-80 
                bg-white shadow-2xl rounded-2xl p-5 z-50
                opacity-0 invisible translate-y-3
                transition-all duration-300 ease-in-out
                group-hover:opacity-100 
                group-hover:visible 
                group-hover:translate-y-0
              ">
                <h3 className="font-semibold text-lg mb-4">
                  Pending Bookings
                </h3>

                {navbarCart.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No Pending Services
                  </p>
                ) : (
                  navbarCart.map((item) => (
                    <div
                      key={item.salonId}
                      className="flex justify-between items-center py-3 border-b hover:bg-gray-50 rounded-lg px-2 transition"
                    >
                      <div>
                        <p className="font-medium">
                          {item.salonName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.pendingCount} Pending Service
                        </p>
                      </div>

                      <div className="bg-red-500 text-white text-xs w-7 h-7 rounded-full flex items-center justify-center">
                        {item.pendingCount}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 sm:px-6 md:px-14 pt-32 pb-40 space-y-6">

        <div className="flex justify-between items-center">
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

          <button
            onClick={handleCancelBooking}
            className="bg-red-500 text-white px-6 cursor-pointer py-2 rounded-lg"
          >
            Cancel Booking
          </button>
        </div>

        {items.length ? (
          items.map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-100 rounded-3xl px-6 md:px-10 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
            >
              <div className="flex items-center gap-6">
                <img
                  src={item.imageUrl}
                  alt={item.serviceName}
                  className="h-20 w-20 rounded-2xl object-cover"
                />
                <h3 className="font-semibold">{item.serviceName}</h3>
              </div>

              <p className="font-semibold">{item.price} Rs.</p>

              <div className="flex items-center gap-2 text-gray-500">
                <IoTimeOutline />
                <span>{item.time} Min</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No services added</p>
        )}
      </div>
       {/* BOTTOM BUTTONS – SAME AS BEFORE */}
      <div className="fixed bottom-0 left-0 w-full bg-white px-4 sm:px-6 md:px-14 pb-8">
        <div className="flex justify-between gap-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-[#0B132B] text-white px-10 cursor-pointer  py-3 rounded-lg "
          >
            Add Another Service
          </button>

          <button
            onClick={() =>
              navigate(`/confirm-booking/${salonId}`, {
                state: { customerName, bookedBy }
              })
            }
            className="bg-[#0B132B] text-white px-10 py-3 rounded-lg"
          >
            Check Out
          </button>


        </div>
      </div>
    </div>
  );
}
