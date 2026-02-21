import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiBell, FiUser } from "react-icons/fi";
import { FaShoppingCart } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import Navbar from "../componenets/Navbar";

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
     <div className='min-h-screen bg-gray-100'>
       {/* NAVBAR */}
       {/* <div className=" top-0 left-0  w-full bg-white border-b z-50 px-4 sm:px-6 "> */}
       {/* <div className="flex items-center justify-between py-4"> */}

       <Navbar />

       {/* TOP SECTION */}
       <div className='px-4 sm:px-6 md:px-14 mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
         <div className='flex items-center gap-4'>
           <button
             onClick={() => navigate(-1)}
             className='mb-6 w-10 h-10 border cursor-pointer rounded-full flex items-center justify-center'
           >
             <IoArrowBack />
           </button>
           <h2 className='text-xl font-semibold mb-6'>Select Details</h2>
         </div>

         <button
           onClick={handleCancelBooking}
           className='bg-red-500 text-white px-6 py-2 cursor-pointer rounded-lg w-full sm:w-auto'
         >
           Cancel Booking
         </button>
       </div>

       {/* MAIN GRID */}
       <div className='px-4 sm:px-6 md:px-14 mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12'>
         {/* LEFT CARD */}
         <div className='bg-[#ececec] p-4 sm:p-6 md:p-8 rounded-3xl'>
           <div className='bg-white p-4 sm:p-6 md:p-8 rounded-3xl'>
             {cart?.items?.map((item, i) => (
               <div key={i} className='mb-6'>
                 <div className='flex flex-col sm:flex-row gap-4 sm:gap-6'>
                   {item.imageUrl && (
                     <img
                       src={item.imageUrl}
                       alt={item.serviceName}
                       className='w-full sm:w-28 h-40 sm:h-28 object-cover rounded-2xl'
                     />
                   )}

                   <div className='flex-1'>
                     <div className='flex justify-between flex-wrap gap-2'>
                       <h3 className='font-semibold text-base sm:text-lg '>
                         {item.serviceName}
                       </h3>
                       <span className='font-semibold'>{item.price} ₹</span>
                     </div>

                     <p className='text-sm text-gray-500 mt-2'>
                       ⏱ {item.time} Min
                     </p>
                   </div>
                 </div>

                 {i !== cart.items.length - 1 && (
                   <div className='border-b mt-6' />
                 )}
               </div>
             ))}

             <div className='border-t pt-6 mt-6 space-y-3'>
               <div className='flex justify-between text-gray-600'>
                 <span>Duration</span>
                 <span>{totalTime} min</span>
               </div>

               <div className='flex justify-between font-semibold text-lg'>
                 <span>Total</span>
                 <span>{cart.totalPrice} ₹</span>
               </div>
             </div>
           </div>
         </div>

         {/* RIGHT SECTION */}
         <div className='bg-white rounded-3xl p-4 sm:p-6 md:p-8 shadow space-y-6'>
           {/* DATE */}
           <div>
             <label className='block mb-2 font-medium'>Select Date</label>
             <input
               type='date'
               onChange={(e) => setSelectedDate(e.target.value)}
               className='w-full border p-3 rounded-xl'
             />
           </div>

           {/* CUSTOMER NAME */}
           <div>
             <label className='block mb-2 font-medium'>Customer Name</label>
             <input
               type='text'
               value={selectedCustomerName}
               onChange={(e) => setSelectedCustomerName(e.target.value)}
               placeholder='Enter customer name'
               className='w-full border p-3 rounded-xl'
             />
           </div>

           {/* BARBERS */}
           <div>
             <label className='block mb-2 font-medium'>Select Barber</label>

             {barbers.map((b) => (
               <button
                 key={b.id}
                 onClick={() => setSelectedBarber(b.id)}
                 className={`block w-full border p-3 rounded-xl mt-2 text-left ${
                   selectedBarber === b.id
                     ? 'bg-black text-white'
                     : 'bg-gray-50'
                 }`}
               >
                 {b.name}
               </button>
             ))}
           </div>

           {/* SLOTS */}
           <div>
             <label className='block mb-2 font-medium'>
               Available Time Slot
             </label>

             {slots.length === 0 ? (
               <p className='text-gray-500 text-sm mt-2'>No slots available</p>
             ) : (
               slots.map((slot, i) => {
                 const isSelected =
                   selectedSlot?.startTime === slot.startTime &&
                   selectedSlot?.endTime === slot.endTime

                 const start = new Date(
                   `1970-01-01T${slot.startTime}Z`
                 ).toLocaleTimeString([], {
                   hour: '2-digit',
                   minute: '2-digit',
                   hour12: true,
                 })

                 const end = new Date(
                   `1970-01-01T${slot.endTime}Z`
                 ).toLocaleTimeString([], {
                   hour: '2-digit',
                   minute: '2-digit',
                   hour12: true,
                 })

                 return (
                   <button
                     key={i}
                     onClick={() => setSelectedSlot(slot)}
                     className={`block w-full border p-3 rounded-xl mt-2 ${
                       isSelected ? 'bg-black text-white' : 'bg-gray-50'
                     }`}
                   >
                     {start} - {end}
                   </button>
                 )
               })
             )}
           </div>
         </div>
       </div>

       {/* BOTTOM CONFIRM BUTTON */}
       <div className='mt-10 pb-12 flex justify-center md:justify-end px-4 sm:px-6 md:px-14'>
         <div className='w-full md:w-140'>
           <button
             onClick={confirmBooking}
             className='w-full bg-[#0B132B] text-white cursor-pointer py-4 rounded-lg shadow-lg text-lg font-semibold'
           >
             Confirm Booking
           </button>
         </div>
       </div>
     </div>

     // </div>
     // </div>
   )}