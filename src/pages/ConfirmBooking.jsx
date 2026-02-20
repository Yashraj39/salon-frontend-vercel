import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiBell, FiUser } from "react-icons/fi";
import { FaShoppingCart } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";

export default function Checkout() {
    const navigate = useNavigate();
    const { salonId } = useParams();

    const user = JSON.parse(localStorage.getItem("user")) || {};
    const userId = user?.userId;

    const location = useLocation();
    const stateCustomerName = location.state?.customerName;

    const [cart, setCart] = useState(null);
    const [barbers, setBarbers] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedCustomerName, setSelectedCustomerName] =
        useState(stateCustomerName || user?.name || "");

    const [totalPending, setTotalPending] = useState(0);
    const [navbarCart, setNavbarCart] = useState([]);

    /* ================= FETCH CART ================= */
    useEffect(() => {
        if (!userId || !salonId) return;

        const fetchCart = async () => {
            try {
                const url = new URL("https://render-qs89.onrender.com/api/cart/get");
                url.searchParams.append("userId", userId);
                url.searchParams.append("salonId", salonId);
                url.searchParams.append("customerName", selectedCustomerName);

                const res = await fetch(url.toString());
                const data = await res.json();
                setCart(data || { items: [], totalPrice: 0 });
            } catch (err) {
                console.error(err);
            }
        };

        fetchCart();
    }, [userId, salonId, selectedCustomerName]);

    /* ================= FETCH BARBERS ================= */
    useEffect(() => {
        if (!salonId) return;

        const fetchBarbers = async () => {
            try {
                const res = await fetch(
                    `https://render-qs89.onrender.com/api/barber/salon/${salonId}`
                );
                const data = await res.json();
                setBarbers(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchBarbers();
    }, [salonId]);

    /* ================= FETCH NAVBAR CART ================= */
    useEffect(() => {
        if (!userId) return;

        const fetchNavbarCart = async () => {
            try {
                const res = await fetch(
                    `https://render-qs89.onrender.com/api/cart/navbar-cart?userId=${userId}`
                );

                if (!res.ok) return;

                const data = await res.json();
                const safeData = Array.isArray(data) ? data : [];

                setNavbarCart(safeData);

                const total = safeData.reduce(
                    (sum, item) => sum + (item.pendingCount || 0),
                    0
                );

                setTotalPending(total);
            } catch (err) {
                console.error(err);
            }
        };

        fetchNavbarCart();
    }, [userId]);

    /* ================= FETCH SLOTS ================= */
    useEffect(() => {
        if (!selectedBarber || !selectedDate) return;

        const fetchSlots = async () => {
            try {
                const url = new URL(
                    "https://render-qs89.onrender.com/api/booking/available-slots"
                );

                const formattedDate = new Date(selectedDate)
                    .toISOString()
                    .split("T")[0];

                url.searchParams.append("userId", userId);
                url.searchParams.append("salonId", salonId);
                url.searchParams.append("barberId", selectedBarber);
                url.searchParams.append("customerName", selectedCustomerName);
                url.searchParams.append("date", formattedDate);

                const res = await fetch(url.toString());
                const data = await res.json();

                setSlots(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchSlots();
    }, [selectedBarber, selectedDate, userId, salonId, selectedCustomerName]);

    /* ================= TOTAL TIME ================= */
    const totalTime =
        cart?.items?.reduce(
            (sum, item) => sum + (Number(item.time) || 0),
            0
        ) || 0;

    /* ================= CONFIRM BOOKING ================= */
    const confirmBooking = async () => {
        if (!selectedBarber) return toast.error("Please select a barber");
        if (!selectedSlot) return toast.error("Please select a time slot");
        if (!selectedDate) return toast.error("Please select a date");

        try {
            const res = await fetch(
                "https://render-qs89.onrender.com/api/booking/confirm",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId,
                        salonId,
                        barberId: selectedBarber,
                        customerName: selectedCustomerName,
                        bookingDate: selectedDate,
                        startTime: selectedSlot.startTime,
                        endTime: selectedSlot.endTime,
                    }),
                }
            );

            if (res.ok) {
                toast.success("Booking Confirmed");
                navigate("/success");
            } else {
                const error = await res.text();
                toast.error(error);
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        }
    };

    if (!cart) return <p className="text-center mt-10">Loading...</p>;

    const handleCancelBooking = async () => {
        try {
            const url = new URL("https://render-qs89.onrender.com/api/cart/clear");

            url.searchParams.append("userId", userId);
            url.searchParams.append("salonId", salonId);
            url.searchParams.append("customerName", selectedCustomerName);

            const res = await fetch(url.toString(), {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to clear cart");
            }

            // Clear UI state
            setCart({ items: [], totalPrice: 0 });
            setSelectedBarber(null);
            setSelectedSlot(null);
            setSelectedDate("");

            toast.success("Booking cancelled");

            // ✅ Navigate to SelectService page
            navigate(`/book/${salonId}`, {
                state: {
                    customerName: selectedCustomerName,
                },
            });

        } catch (error) {
            console.error(error);
            toast.error("Cannot cancel booking");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">

            {/* NAVBAR */}
            <div className="top-0 left-0 w-full bg-white border-b z-50 px-4 sm:px-6 md:px-14">

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
                                            onClick={() =>
                                                navigate(`/add-services/${item.salonId}`, {
                                                    state: {
                                                        customerName: item.customerName || "",
                                                        bookedBy: user?.name || "",
                                                    },
                                                })
                                            }
                                            className="flex justify-between items-center py-3 border-b hover:bg-gray-50 rounded-lg px-2 cursor-pointer transition"
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



            {/* TOP SECTION */}
            <div className="px-6 md:px-14 mt-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-9 h-9 rounded-full border flex items-center justify-center bg-white"
                    >
                        <IoArrowBack size={18} />
                    </button>
                    <h2 className="text-lg font-semibold">select details</h2>
                </div>

                <button
                    onClick={handleCancelBooking}
                    className="bg-red-500 text-white px-6 cursor-pointer py-2 rounded-lg"
                >
                    Cancel Booking
                </button>
            </div>

            {/* MAIN GRID */}
            <div className="px-6 md:px-14 mt-8 grid md:grid-cols-2 gap-12">

                {/* LEFT CARD */}
                <div className="bg-[#ececec] p-8 rounded-3xl">
                    <div className="bg-white p-8 rounded-3xl">

                        {cart?.items?.map((item, i) => (
                            <div key={i} className="mb-8">

                                <div className="flex gap-6">
                                    {item.imageUrl && (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.serviceName}
                                            className="w-28 h-28 object-cover rounded-2xl"
                                        />
                                    )}

                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h3 className="font-semibold text-lg">
                                                {item.serviceName}
                                            </h3>
                                            <span className="font-semibold">
                                                {item.price} ₹
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-500 mt-2">
                                            ⏱ {item.time} Min
                                        </p>
                                    </div>
                                </div>

                                {i !== cart.items.length - 1 && (
                                    <div className="border-b mt-6" />
                                )}
                            </div>
                        ))}

                        <div className="border-t pt-6 mt-6 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Duration</span>
                                <span>{totalTime} min</span>
                            </div>

                            <div className="flex justify-between font-semibold text-lg">
                                <span>Total</span>
                                <span>{cart.totalPrice} ₹</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SECTION */}
                <div className="bg-white rounded-3xl p-8 shadow space-y-6">

                    {/* DATE */}
                    <div>
                        <label className="block mb-2 font-medium">
                            Select Date
                        </label>
                        <input
                            type="date"
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full border p-3 rounded-xl"
                        />
                    </div>



                    {/* CUSTOMER NAME */}
                    <div>
                        <label className="block mb-2 font-medium">
                            Customer Name
                        </label>
                        <input
                            type="text"
                            value={selectedCustomerName}
                            onChange={(e) => setSelectedCustomerName(e.target.value)}
                            placeholder="Enter customer name"
                            className="w-full border p-3 rounded-xl"
                        />
                    </div>

                    {/* BARBERS */}
                    <div>
                        <label className="block mb-2 font-medium">
                            Select Barber
                        </label>

                        {barbers.map((b) => (
                            <button
                                key={b.id}
                                onClick={() => setSelectedBarber(b.id)}
                                className={`block w-full border p-3 rounded-xl mt-2 text-left ${selectedBarber === b.id
                                    ? "bg-black text-white"
                                    : "bg-gray-50"
                                    }`}
                            >
                                {b.name}
                            </button>
                        ))}
                    </div>

                    {/* SLOTS */}
                    <div>
                        <label className="block mb-2 font-medium">
                            Available Time Slot
                        </label>

                        {slots.length === 0 ? (
                            <p className="text-gray-500 text-sm mt-2">No slots available</p>
                        ) : (
                            slots.map((slot, i) => {
                                const isSelected =
                                    selectedSlot?.startTime === slot.startTime &&
                                    selectedSlot?.endTime === slot.endTime;

                                // Convert to local AM/PM format
                                const start = new Date(`1970-01-01T${slot.startTime}Z`).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                });

                                const end = new Date(`1970-01-01T${slot.endTime}Z`).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                });

                                return (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`block w-full border p-3 rounded-xl mt-2 ${isSelected ? 'bg-black text-white' : 'bg-gray-50'
                                            }`}
                                    >
                                        {start} - {end}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* BOTTOM CONFIRM BUTTON */}
            <div className="flex justify-center mt-12 pb-12">
                <button
                    onClick={confirmBooking}
                    className="bg-[#0B132B] text-white px-16 py-4 rounded-lg shadow-lg text-lg font-semibold"
                >
                    Confirm Booking
                </button>
            </div>
        </div>



    )
}