import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { IoArrowBack, IoTimeOutline, IoCalendarOutline } from 'react-icons/io5'
import Navbar from '../componenets/Navbar'

export default function Checkout() {
  const navigate = useNavigate()
  const { salonId } = useParams()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userId = user?.userId

  const bookingMeta = JSON.parse(sessionStorage.getItem('bookingMeta') || '{}')

  const [selectedCustomerName, setSelectedCustomerName] = useState(
    bookingMeta?.customerName || ''
  )

  const [cart, setCart] = useState(null)
  const [barbers, setBarbers] = useState([])
  const [selectedBarber, setSelectedBarber] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)

  const [totalPending, setTotalPending] = useState(0)
  const [navbarCart, setNavbarCart] = useState([])
  const [payLoading, setPayLoading] = useState(false)

  useEffect(() => {
    if (!selectedCustomerName?.trim()) {
      toast.error('Customer name missing. Please start booking again.')
      navigate(`/salon/${salonId}`)
    }
  }, [selectedCustomerName, salonId, navigate])

  useEffect(() => {
    if (!userId || !salonId || !selectedCustomerName?.trim()) return

    const fetchCart = async () => {
      try {
        const url = new URL('https://render-qs89.onrender.com/api/cart/get')
        url.searchParams.append('userId', userId)
        url.searchParams.append('salonId', salonId)
        url.searchParams.append('customerName', selectedCustomerName.trim())

        const res = await fetch(url.toString())

        if (!res.ok) {
          const errText = await res.text()
          console.error('Cart fetch error:', res.status, errText)
          setCart({ items: [], totalPrice: 0 })
          toast.error(errText || 'Failed to load cart')
          return
        }

        const data = await res.json()
        setCart(data || { items: [], totalPrice: 0 })
      } catch (err) {
        console.error(err)
        setCart({ items: [], totalPrice: 0 })
      }
    }

    fetchCart()
  }, [userId, salonId, selectedCustomerName])

  useEffect(() => {
    if (!salonId) return

    const fetchBarbers = async () => {
      try {
        const res = await fetch(
          `https://render-qs89.onrender.com/api/barber/salon/${salonId}`
        )
        const data = await res.json()
        setBarbers(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
      }
    }

    fetchBarbers()
  }, [salonId])

  useEffect(() => {
    if (!userId) return

    const fetchNavbarCart = async () => {
      try {
        const res = await fetch(
          `https://render-qs89.onrender.com/api/cart/navbar-cart?userId=${userId}`
        )

        if (!res.ok) return

        const data = await res.json()
        const safeData = Array.isArray(data) ? data : []

        setNavbarCart(safeData)

        const total = safeData.reduce(
          (sum, item) => sum + (item.pendingCount || 0),
          0
        )

        setTotalPending(total)
      } catch (err) {
        console.error(err)
      }
    }

    fetchNavbarCart()
  }, [userId])

  useEffect(() => {
    if (
      !selectedBarber ||
      !selectedDate ||
      !userId ||
      !salonId ||
      !selectedCustomerName?.trim()
    ) {
      setSlots([])
      return
    }

    const fetchSlots = async () => {
      try {
        const url = new URL(
          'https://render-qs89.onrender.com/api/booking/available-slots'
        )

        url.searchParams.append('userId', userId)
        url.searchParams.append('salonId', salonId)
        url.searchParams.append('barberId', selectedBarber)
        url.searchParams.append('customerName', selectedCustomerName.trim())
        url.searchParams.append('date', selectedDate)

        const res = await fetch(url.toString())

        if (!res.ok) {
          const errorText = await res.text()
          console.error('Slot API error:', res.status, errorText)
          setSlots([])
          toast.error(errorText || 'Slots not available')
          return
        }

        const data = await res.json()
        setSlots(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        setSlots([])
        toast.error('Failed to load slots')
      }
    }

    fetchSlots()
  }, [selectedBarber, selectedDate, userId, salonId, selectedCustomerName])

  const totalTime =
    cart?.items?.reduce((sum, item) => sum + (Number(item.time) || 0), 0) || 0

  const confirmBooking = async () => {
    if (!selectedBarber) return toast.error('Please select a barber')
    if (!selectedSlot) return toast.error('Please select a time slot')
    if (!selectedDate) return toast.error('Please select a date')

    try {
      setPayLoading(true)

      const orderRes = await fetch(
        'https://render-qs89.onrender.com/api/payment/create-order',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            salonId,
            customerName: selectedCustomerName.trim(),
          }),
        }
      )

      if (!orderRes.ok) {
        const t = await orderRes.text()
        setPayLoading(false)
        return toast.error(t || 'Cannot create payment order')
      }

      const orderData = await orderRes.json()

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SlotMyStyle',
        description: 'Salon Booking Payment',
        order_id: orderData.orderId,

        handler: async function (response) {
          try {
            const verifyRes = await fetch(
              'https://render-qs89.onrender.com/api/payment/verify-and-confirm',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId,
                  salonId,
                  barberId: selectedBarber,
                  customerName: selectedCustomerName.trim(),
                  bookingDate: selectedDate,
                  startTime: selectedSlot.startTime,
                  endTime: selectedSlot.endTime,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              }
            )

            if (!verifyRes.ok) {
              const err = await verifyRes.text()
              setPayLoading(false)
              return toast.error(err || 'Payment verified but booking failed')
            }

            setPayLoading(false)
            toast.success('Payment Successful & Booking Confirmed')
            navigate('/success')
          } catch (e) {
            console.error(e)
            setPayLoading(false)
            toast.error('Payment done but confirm failed')
          }
        },

        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },

        theme: { color: '#0B132B' },

        modal: {
          ondismiss: function () {
            setPayLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function () {
        setPayLoading(false)
        toast.error('Payment Failed')
      })
      rzp.open()
    } catch (err) {
      console.error(err)
      setPayLoading(false)
      toast.error('Something went wrong')
    }
  }

  const handleCancelBooking = async () => {
    try {
      const url = new URL('https://render-qs89.onrender.com/api/cart/clear')

      url.searchParams.append('userId', userId)
      url.searchParams.append('salonId', salonId)
      url.searchParams.append('customerName', selectedCustomerName)

      const res = await fetch(url.toString(), {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to clear cart')
      }

      setCart({ items: [], totalPrice: 0 })
      setSelectedBarber(null)
      setSelectedSlot(null)
      setSelectedDate('')

      toast.success('Booking cancelled')

      navigate(`/book/${salonId}`, {
        state: {
          customerName: selectedCustomerName.trim(),
        },
      })
    } catch (error) {
      console.error(error)
      toast.error('Cannot cancel booking')
    }
  }

  const formatTime = (t) => {
    const [hh, mm] = t.split(':').map(Number)
    const ampm = hh >= 12 ? 'PM' : 'AM'
    const h12 = hh % 12 || 12
    return `${h12}:${String(mm).padStart(2, '0')} ${ampm}`
  }

  const selectedSlotLabel = useMemo(() => {
    if (!selectedSlot) return ''
    return `${formatTime(selectedSlot.startTime)} - ${formatTime(
      selectedSlot.endTime
    )}`
  }, [selectedSlot])

  if (!cart) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-white via-gray-50/40 to-white'>
        <Navbar />
        <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse'>
            <div className='rounded-3xl bg-white border border-gray-200 p-6'>
              <div className='h-24 bg-gray-100 rounded-2xl mb-4'></div>
              <div className='h-24 bg-gray-100 rounded-2xl mb-4'></div>
              <div className='h-24 bg-gray-100 rounded-2xl'></div>
            </div>
            <div className='rounded-3xl bg-white border border-gray-200 p-6'>
              <div className='h-12 bg-gray-100 rounded-xl mb-4'></div>
              <div className='h-12 bg-gray-100 rounded-xl mb-4'></div>
              <div className='h-24 bg-gray-100 rounded-xl mb-4'></div>
              <div className='h-40 bg-gray-100 rounded-2xl'></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-white via-gray-50/40 to-white'>
      <Navbar />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 pt-6 sm:pt-8 pb-32'>
        <div className='flex flex-col gap-4 sm:gap-5 mb-6'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => navigate(-1)}
                className='w-11 h-11 border border-gray-200 bg-white shadow-sm cursor-pointer rounded-full flex items-center justify-center hover:shadow-md hover:-translate-x-0.5 transition-all duration-300'
              >
                <IoArrowBack className='text-lg' />
              </button>

              <div>
                <h2 className='text-2xl sm:text-[28px] font-bold text-gray-950 tracking-tight'>
                  Confirm Details & Pay
                </h2>
                <p className='text-sm text-gray-500 mt-1'>
                  Review your booking details and complete payment.
                </p>
              </div>
            </div>

            <button
              onClick={handleCancelBooking}
              className='bg-red-500 text-white px-5 py-2.5 cursor-pointer rounded-2xl text-sm font-medium hover:bg-red-600 transition-all duration-300 w-full sm:w-auto'
            >
              Cancel Booking
            </button>
          </div>

          <div className='flex flex-wrap gap-3'>
            <div className='inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm'>
              Customer:
              <span className='font-semibold ml-1'>{selectedCustomerName || '—'}</span>
            </div>

            {user?.name && (
              <div className='inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm'>
                User:
                <span className='font-semibold ml-1'>{user.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 xl:gap-8 items-start'>
          <div className='bg-white border border-gray-200 rounded-3xl shadow-sm p-4 sm:p-6 animate-[fadeUp_.35s_ease]'>
            <div className='flex items-center justify-between mb-5'>
              <h3 className='text-lg font-semibold text-gray-950'>
                Booking Summary
              </h3>
              <span className='text-sm text-gray-500'>
                {cart?.items?.length || 0} service{cart?.items?.length > 1 ? 's' : ''}
              </span>
            </div>

            {cart?.items?.length ? (
              <div className='space-y-4'>
                {cart.items.map((item, i) => (
                  <div
                    key={i}
                    className='rounded-3xl border border-gray-200 bg-gray-50/70 p-4 sm:p-5 transition-all duration-300 hover:shadow-sm'
                  >
                    <div className='flex flex-col sm:flex-row gap-4 sm:gap-5'>
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.serviceName}
                          className='w-full sm:w-24 h-40 sm:h-24 object-cover rounded-2xl'
                        />
                      )}

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between gap-3'>
                          <h3 className='font-semibold text-base sm:text-lg text-gray-950 line-clamp-1'>
                            {item.serviceName}
                          </h3>
                          <span className='font-semibold text-gray-950 whitespace-nowrap'>
                            ₹ {item.price}
                          </span>
                        </div>

                        <div className='mt-3 inline-flex items-center gap-2 text-sm text-gray-500'>
                          <IoTimeOutline className='text-base' />
                          <span>{item.time} Min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className='border-t border-gray-100 pt-5 mt-5 space-y-3'>
                  <div className='flex justify-between text-sm text-gray-600'>
                    <span>Duration</span>
                    <span>{totalTime} min</span>
                  </div>

                  <div className='flex justify-between items-center font-semibold text-xl text-gray-950'>
                    <span>Total</span>
                    <span>₹ {cart.totalPrice}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className='rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center'>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  No items in cart
                </h3>
                <p className='text-sm text-gray-500'>
                  Add services to continue booking.
                </p>
              </div>
            )}
          </div>

          <div className='bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-6 sticky top-24 space-y-5 animate-[fadeUp_.45s_ease]'>
            <h3 className='text-lg font-semibold text-gray-950'>
              Appointment Details
            </h3>

            <div>
              <label className='block mb-2 text-sm font-medium text-gray-800'>
                Select Date
              </label>
              <div className='relative'>
                <input
                  type='date'
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setSelectedSlot(null)
                  }}
                  className='w-full border border-gray-200 bg-white p-3 rounded-2xl outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all duration-300'
                />
              </div>
            </div>

            <div>
              <label className='block mb-2 text-sm font-medium text-gray-800'>
                Customer Name
              </label>
              <input
                type='text'
                value={selectedCustomerName}
                readOnly
                className='w-full border border-gray-200 p-3 rounded-2xl bg-gray-50 text-gray-600 cursor-not-allowed'
              />
              <p className='text-xs text-gray-500 mt-2'>
                Customer name is locked for this booking flow.
              </p>
            </div>

            <div>
              <label className='block mb-2 text-sm font-medium text-gray-800'>
                Select Barber
              </label>

              <div className='grid grid-cols-1 gap-2.5'>
                {barbers.length === 0 ? (
                  <div className='rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-sm text-gray-500 text-center'>
                    No barbers available
                  </div>
                ) : (
                  barbers.map((b) => (
                    <button
                      key={b.id || b._id}
                      onClick={() => {
                        setSelectedBarber(b.id || b._id)
                        setSelectedSlot(null)
                      }}
                      className={`block w-full border p-3 rounded-2xl text-left transition-all duration-300 ${
                        selectedBarber === (b.id || b._id)
                          ? 'bg-black text-white border-black shadow-md'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className='flex items-center justify-between mb-2'>
                <label className='text-sm font-medium text-gray-800'>
                  Available Time Slot
                </label>

                {!!selectedSlot && (
                  <span className='text-xs px-3 py-1 rounded-full bg-black text-white'>
                    Selected
                  </span>
                )}
              </div>

              <div className='border border-gray-200 rounded-2xl bg-gray-50 p-3'>
                {slots.length === 0 ? (
                  <div className='py-6 text-center'>
                    <p className='text-gray-500 text-sm'>No slots available</p>
                    <p className='text-gray-400 text-xs mt-1'>
                      Try another date or barber
                    </p>
                  </div>
                ) : (
                  <div className='max-h-64 overflow-auto pr-1'>
                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
                      {slots.map((slot, i) => {
                        const isSelected =
                          selectedSlot?.startTime === slot.startTime &&
                          selectedSlot?.endTime === slot.endTime

                        const start = formatTime(slot.startTime)
                        const end = formatTime(slot.endTime)

                        return (
                          <button
                            key={i}
                            type='button'
                            onClick={() => setSelectedSlot(slot)}
                            className={`px-3 py-2.5 rounded-xl text-sm border transition-all duration-300 ${
                              isSelected
                                ? 'bg-[#0B132B] text-white border-[#0B132B]'
                                : 'bg-white border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <div className='font-semibold'>{start}</div>
                            <div
                              className={`${
                                isSelected ? 'text-white/80' : 'text-gray-500'
                              } text-xs`}
                            >
                              to {end}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {!!selectedSlot && (
                <p className='text-xs text-gray-500 mt-2'>
                  You selected: <b>{selectedSlotLabel}</b>
                </p>
              )}
            </div>

            <div className='border-t border-gray-100 pt-4 space-y-3'>
              <div className='flex items-center justify-between text-sm text-gray-600'>
                <span>Total Amount</span>
                <span className='font-medium text-gray-950'>
                  ₹ {cart?.totalPrice || 0}
                </span>
              </div>

              <button
                type='button'
                disabled={
                  payLoading ||
                  !selectedDate ||
                  !selectedBarber ||
                  !selectedSlot ||
                  !(cart?.totalPrice > 0)
                }
                onClick={confirmBooking}
                className={`w-full py-3.5 rounded-2xl shadow-md text-base font-semibold transition-all duration-300 ${
                  payLoading ||
                  !selectedDate ||
                  !selectedBarber ||
                  !selectedSlot ||
                  !(cart?.totalPrice > 0)
                    ? 'bg-gray-300 text-white cursor-not-allowed'
                    : 'bg-[#0B132B] text-white cursor-pointer hover:opacity-95'
                }`}
              >
                {payLoading
                  ? 'Opening Payment...'
                  : `Proceed to Payment • ₹ ${cart?.totalPrice || 0}`}
              </button>

              <p className='text-xs text-gray-500 text-center'>
                Secure checkout powered by Razorpay. You can pay via UPI,
                Netbanking, or Wallet.
              </p>
            </div>
          </div>
        </div>
      </div>

      {!payLoading && (
        <style>{`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(18px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      )}
    </div>
  )
}