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
    const stateCustomerName = location.state?.customerName; // from AddServices
    const stateBookedBy = location.state?.bookedBy;

    const [cart, setCart] = useState(null);
    const [barbers, setBarbers] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedCustomerName, setSelectedCustomerName] = useState(
        stateCustomerName || user?.name || ""
    );


    const [totalPending, setTotalPending] = useState(0);
    const [navbarCart, setNavbarCart] = useState([]);


    /* 1️⃣ Get Cart */
    useEffect(() => {
        if (userId && salonId) {
            fetchCart();
        }
    }, [userId, salonId, selectedCustomerName]);


    const fetchCart = async () => {
        const url = new URL("https://render-qs89.onrender.com/api/cart/get");
        url.searchParams.append("userId", userId);
        url.searchParams.append("salonId", salonId);
        url.searchParams.append("customerName", selectedCustomerName);

        const res = await fetch(url);
        const data = await res.json();
        setCart(data);
    };

    /* 2️⃣ Get Barbers */
    useEffect(() => {
        const fetchBarbers = async () => {
            const res = await fetch(
                `https://render-qs89.onrender.com/api/barber/salon/${salonId}`
            );
            const data = await res.json();
            setBarbers(data);
        };
        fetchBarbers();
    }, [salonId]);


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


    /* 3️⃣ Get Available Slots */
    useEffect(() => {
        if (!selectedBarber || !selectedDate || !cart?.totalTime) return;

        const fetchSlots = async () => {
            const url = new URL(
                "https://render-qs89.onrender.com/api/booking/available-slots"
            );
            url.searchParams.append("userId", userId);
            url.searchParams.append("salonId", salonId);
            url.searchParams.append("barberId", selectedBarber);
            url.searchParams.append("customerName", selectedCustomerName);
            if (selectedDate) {
                const formattedDate = new Date(selectedDate).toISOString().split("T")[0]; // yyyy-MM-dd
                url.searchParams.append("date", formattedDate);
            }


            const res = await fetch(url);
            const data = await res.json();
            setSlots(data);
        };

        fetchSlots();
    }, [selectedBarber, selectedDate]);

    // Add useEffect for selectedCustomerName change
    useEffect(() => {
        if (userId && salonId && selectedCustomerName) fetchCart();
    }, [selectedCustomerName]);

    useEffect(() => {
        if (barbers.length && !selectedBarber) {
            setSelectedBarber(barbers[0].id);
        }
    }, [barbers]);

    /* 4️⃣ Confirm Booking */
    const confirmBooking = async () => {

        if (!selectedBarber) {
            toast.error("Please select a barber");
            return;
        }

        if (!selectedSlot) {
            toast.error("Please select a time slot");
            return;
        }

        const res = await fetch(
            "https://render-qs89.onrender.com/api/booking/confirm",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    salonId,
                    barberId: selectedBarber,
                    customerName: selectedCustomerName,  // 🔹 add this
                    bookingDate: selectedDate,
                    startTime: selectedSlot.startTime,
                    endTime: selectedSlot.endTime,
                }),
            }
        );

        const data = await res.text();

        if (res.ok) {
            toast.success("Booking Confirmed");
            navigate("/success");
        } else {
            toast.error(data);
        }
    };


    if (!cart) return <p>Loading...</p>;

    return (
        <div className="min-h-screen bg-gray-100">

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

            {/* BACK BUTTON SECTION */}
            <div className="px-6 md:px-14 mt-6">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 border rounded-full flex items-center justify-center bg-white shadow hover:bg-gray-100 transition"
                >
                    <IoArrowBack size={18} />
                </button>
            </div>


            {/* MAIN CONTENT */}
            <div className="px-6 md:px-14 pb-15 mt-6 grid md:grid-cols-2 gap-10">




                {/* LEFT SIDE - CART */}
                <div className="bg-white rounded-3xl p-8 shadow">
                    {cart.items.map((item, i) => (
                        <div key={i} className="flex justify-between border-b py-4">
                            <div>
                                <p className="font-semibold">{item.serviceName}</p>
                                <p className="text-sm text-gray-500">{item.time} Min</p>
                            </div>
                            <span>{item.price} ₹</span>
                        </div>
                    ))}

                    <div className="flex justify-between mt-6 font-bold text-lg">
                        <span>Total</span>
                        <span>{cart.totalPrice} ₹</span>
                    </div>
                </div>

                {/* RIGHT SIDE - BOOKING DETAILS */}
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

                        {(() => {
                            const filteredSlots = slots.filter(slot => {
                                // Only filter past slots if selected date is today
                                if (selectedDate === new Date().toISOString().split("T")[0]) {
                                    const now = new Date();
                                    const [hour, minute] = slot.startTime.split(":").map(Number);
                                    const slotTime = new Date();
                                    slotTime.setHours(hour, minute, 0, 0);
                                    return slotTime > now; // only keep future slots
                                }
                                return true; // future dates, keep all slots
                            });

                            if (filteredSlots.length === 0) {
                                return <p className="text-gray-500 text-sm mt-2">No slots available</p>;
                            }

                            return filteredSlots.map((slot, i) => {
                                const start = new Date(`1970-01-01T${slot.startTime}Z`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                const end = new Date(`1970-01-01T${slot.endTime}Z`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                const isSelected =
                                    selectedSlot?.startTime === slot.startTime &&
                                    selectedSlot?.endTime === slot.endTime;

                                return (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`block w-full border p-3 rounded-xl mt-2 ${isSelected ? "bg-black text-white" : "bg-gray-50"}`}
                                    >
                                        {start} - {end}
                                    </button>
                                );
                            });
                        })()}
                    </div>

                </div>
            </div>

            {/* BOTTOM CONFIRM BUTTON */}
            <div className="  left-0 w-full bg-white px-6 md:px-14  pb-6">
                <button
                    onClick={confirmBooking}
                    className="w-full bg-[#0B132B] text-white py-4 rounded-xl font-semibold text-lg"
                >
                    Confirm Booking
                </button>
            </div>

        </div>
    );

}
