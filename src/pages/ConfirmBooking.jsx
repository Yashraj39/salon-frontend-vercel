import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

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

    /* 1️⃣ Get Cart */
    useEffect(() => {
        if (userId && salonId) {
            fetchCart();
        }
    }, [userId, salonId, selectedCustomerName]);


    const fetchCart = async () => {
        const url = new URL("http://localhost:8080/api/cart/get");
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
                `http://localhost:8080/api/barber/salon/${salonId}`
            );
            const data = await res.json();
            setBarbers(data);
        };
        fetchBarbers();
    }, [salonId]);

    /* 3️⃣ Get Available Slots */
    useEffect(() => {
        if (!selectedBarber || !selectedDate || !cart?.totalTime) return;

        const fetchSlots = async () => {
            const url = new URL(
                "http://localhost:8080/api/booking/available-slots"
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
            "http://localhost:8080/api/booking/confirm",
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
            <div className="fixed top-0 left-0 w-full bg-white border-b z-50 px-6 md:px-14">
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
                        <span onClick={() => navigate("/bookings")}>
                            My Bookings
                        </span>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="pt-28 px-6 md:px-14 pb-32 grid md:grid-cols-2 gap-10">

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

                        {slots.map((slot, i) => {
                            const isSelected =
                                selectedSlot?.startTime === slot.startTime &&
                                selectedSlot?.endTime === slot.endTime;

                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`block w-full border p-3 rounded-xl mt-2 ${isSelected
                                        ? "bg-black text-white"
                                        : "bg-gray-50"
                                        }`}
                                >
                                    {slot.startTime} - {slot.endTime}
                                </button>
                            );
                        })}

                    </div>
                </div>
            </div>

            {/* BOTTOM CONFIRM BUTTON */}
            <div className="fixed bottom-0 left-0 w-full bg-white px-6 md:px-14 pb-6">
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
