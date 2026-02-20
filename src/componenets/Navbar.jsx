import { Link, useNavigate } from "react-router-dom";
import { FiBell, FiUser, FiMenu } from "react-icons/fi";
import { FaShoppingCart } from "react-icons/fa";
import React, { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("user");

  const [totalPending, setTotalPending] = useState(0);
  const [navbarCart, setNavbarCart] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user.userId;

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

  // Close dropdown when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = () => {
      setShowCartDropdown(false);
    };

    if (showCartDropdown) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showCartDropdown]);

  return (
    <header className="w-full bg-white border-b z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-14 py-4 flex items-center justify-between">

        {/* LOGO */}
        <div
          onClick={() => navigate("/success")}
          className="flex items-center gap-2 font-semibold cursor-pointer"
        >
          <div className="h-7 w-7 bg-black rounded-md" />
          SlotMyStyle
        </div>

        {!isLoggedIn ? (
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-black text-sm sm:text-base"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="bg-black text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base"
            >
              Sign up
            </Link>
          </div>
        ) : (
          <>
            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center gap-8 text-sm">
              <span
                onClick={() => navigate("/success")}
                className="border-b-2 border-black cursor-pointer"
              >
                Home
              </span>

              <span
                onClick={() => navigate("/bookings")}
                className="cursor-pointer"
              >
                My Bookings
              </span>
            </div>

            {/* RIGHT SIDE ICONS */}
            <div className="flex items-center gap-4 md:gap-6 relative">

              <FiBell className="text-xl cursor-pointer hidden sm:block" />

              {/* CART */}
              <div
                className="relative group cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <FaShoppingCart
                  className="text-xl cursor-pointer"
                  onClick={() => setShowCartDropdown(!showCartDropdown)}
                />

                {totalPending > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                    {totalPending}
                  </div>
                )}

                {/* DROPDOWN */}
               <div
  className={`
    fixed md:absolute
    top-20 md:top-10
    left-1/2 md:left-auto
    -translate-x-1/2 md:translate-x-0
    md:right-0
    w-[95%] max-w-sm md:w-80
    bg-white shadow-2xl rounded-2xl p-5 z-50
    transition-all duration-300 ease-in-out
    ${
      showCartDropdown
        ? "opacity-100 visible translate-y-0"
        : "opacity-0 invisible translate-y-3"
    }
    md:opacity-0 md:invisible md:translate-y-3
    md:group-hover:opacity-100 md:group-hover:visible md:group-hover:translate-y-0
  `}
>
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
                        onClick={() =>
                          navigate(`/add-services/${item.salonId}`, {
                            state: {
                              customerName: item.customerName || "",
                              bookedBy: user?.name || "",
                            },
                          })
                        }
                        className="flex justify-between items-center py-3 border-b hover:bg-gray-50 rounded-lg px-2 transition cursor-pointer"
                      >
                        <div>
                          <p className="font-medium">
                            {item.salonName || "Salon"}
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

              <FiUser
                className="text-xl cursor-pointer"
                onClick={() => navigate("/profile")}
              />

              <FiMenu
                className="text-2xl md:hidden cursor-pointer"
                onClick={() => setMobileMenu(!mobileMenu)}
              />
            </div>
          </>
        )}
      </div>

      {/* MOBILE MENU */}
      {mobileMenu && isLoggedIn && (
        <div className="md:hidden bg-white border-t px-6 py-4 space-y-4">
          <div
            onClick={() => navigate("/success")}
            className="cursor-pointer"
          >
            Home
          </div>

          <div
            onClick={() => navigate("/bookings")}
            className="cursor-pointer"
          >
            My Bookings
          </div>
        </div>
      )}
    </header>
  );
}