import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IoArrowBack, IoTimeOutline } from 'react-icons/io5'
import toast from 'react-hot-toast'
import Navbar from '../componenets/Navbar'

export default function AddServices() {
  const bookingMeta = JSON.parse(sessionStorage.getItem('bookingMeta') || '{}')
  const bookingFor = bookingMeta?.bookingFor || 'myself'

  const navigate = useNavigate()
  const { salonId } = useParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userId = user?.userId

  const customerName = bookingMeta?.customerName || ''
  const bookedBy = bookingMeta?.bookedBy || user?.name || ''

  const [totalPending, setTotalPending] = useState(0)
  const [navbarCart, setNavbarCart] = useState([])

  useEffect(() => {
    const fetchCart = async () => {
      if (!userId || !salonId || !customerName.trim()) {
        setItems([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        const url = new URL('https://render-qs89.onrender.com/api/cart/get')
        url.searchParams.append('userId', userId)
        url.searchParams.append('salonId', salonId)
        url.searchParams.append('customerName', customerName.trim())

        const res = await fetch(url.toString())

        if (!res.ok) {
          const errText = await res.text()
          console.error('Fetch cart failed:', res.status, errText)
          setItems([])
          return
        }

        const data = await res.json()

        if (data?.items) {
          setItems(data.items)
          localStorage.setItem('cartData', JSON.stringify(data))
        } else {
          setItems([])
        }
      } catch (err) {
        console.error(err)
        const raw = localStorage.getItem('cartData')
        if (raw) setItems(JSON.parse(raw).items || [])
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [userId, salonId, customerName])

  const fetchNavbarCart = async () => {
    try {
      if (!userId) return

      const res = await fetch(
        `https://render-qs89.onrender.com/api/cart/navbar-cart?userId=${userId}`
      )

      if (!res.ok) return

      const cartData = await res.json()

      setNavbarCart(cartData)

      const total = cartData.reduce(
        (sum, item) => sum + (item.pendingCount || 0),
        0
      )

      setTotalPending(total)
    } catch (error) {
      console.error('Navbar cart error:', error)
    }
  }

  useEffect(() => {
    fetchNavbarCart()
  }, [userId])

  const handleCancelBooking = async () => {
    try {
      setClearing(true)

      const url = new URL('https://render-qs89.onrender.com/api/cart/clear')
      url.searchParams.append('userId', userId)
      url.searchParams.append('salonId', salonId)
      url.searchParams.append('customerName', customerName)

      await fetch(url.toString(), { method: 'DELETE' })

      setItems([])
      localStorage.removeItem('cartData')

      navigate(`/book/${salonId}`, {
        state: {
          customerName: customerName,
        },
      })

      fetchNavbarCart()
      toast.success('All services removed')
    } catch {
      toast.error('Cannot cancel booking')
    } finally {
      setClearing(false)
    }
  }

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.price || 0), 0)
  }, [items])

  const totalDuration = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.time || 0), 0)
  }, [items])

  return (
    <div className='min-h-screen bg-gradient-to-b from-white via-gray-50/40 to-white flex flex-col'>
      <Navbar />

      <div className='flex-1'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 pt-6 sm:pt-8 pb-36'>
          <div className='flex flex-col gap-4 sm:gap-5 mb-6'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex items-center gap-4'>
                <button
                  onClick={() => navigate(-1)}
                  className='w-11 h-11 border border-gray-200 bg-white shadow-sm rounded-full flex cursor-pointer items-center justify-center hover:shadow-md hover:-translate-x-0.5 transition-all duration-300'
                >
                  <IoArrowBack className='text-lg' />
                </button>

                <div>
                  <h2 className='text-2xl sm:text-[28px] font-bold text-gray-950 tracking-tight capitalize'>
                    Add Services
                  </h2>
                  <p className='text-sm text-gray-500 mt-1'>
                    Review selected services before checkout.
                  </p>
                </div>
              </div>

              <button
                onClick={handleCancelBooking}
                disabled={clearing || items.length === 0}
                className='hidden sm:inline-flex bg-red-500 text-white px-5 py-2.5 cursor-pointer rounded-2xl text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300'
              >
                {clearing ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>

            {(customerName || bookedBy) && (
              <div className='flex flex-wrap gap-3'>
                {customerName && (
                  <div className='inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm'>
                    For: <span className='font-semibold ml-1'>{customerName}</span>
                  </div>
                )}

                {bookedBy && bookingFor === 'someone' && (
                  <div className='inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm'>
                    Booked by: <span className='font-semibold ml-1'>{bookedBy}</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleCancelBooking}
              disabled={clearing || items.length === 0}
              className='sm:hidden w-full bg-red-500 text-white px-5 py-3 cursor-pointer rounded-2xl text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300'
            >
              {clearing ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          </div>

          {loading ? (
            <div className='space-y-4'>
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className='bg-white border border-gray-200 shadow-sm rounded-3xl p-4 sm:p-5 animate-pulse'
                >
                  <div className='flex items-center gap-4'>
                    <div className='h-20 w-20 rounded-2xl bg-gray-200 shrink-0' />
                    <div className='flex-1'>
                      <div className='h-4 w-32 bg-gray-200 rounded mb-3' />
                      <div className='h-3 w-20 bg-gray-100 rounded' />
                    </div>
                    <div className='h-4 w-16 bg-gray-200 rounded' />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length ? (
            <>
              <div className='grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start'>
                <div className='space-y-4'>
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className='bg-white border border-gray-200 shadow-sm rounded-3xl px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-all duration-300 animate-[fadeUp_.35s_ease]'
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <div className='flex items-center gap-4 min-w-0 flex-1'>
                        <div className='relative overflow-hidden rounded-2xl bg-gray-100 shrink-0'>
                          <img
                            src={item.imageUrl}
                            alt={item.serviceName}
                            className='h-20 w-20 rounded-2xl object-cover'
                          />
                        </div>

                        <div className='min-w-0'>
                          <h3 className='font-semibold text-gray-900 text-base truncate'>
                            {item.serviceName}
                          </h3>
                          <p className='text-sm text-gray-500 mt-1'>
                            Selected service
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center justify-between sm:justify-end gap-6 sm:gap-10'>
                        <div className='text-left sm:text-center'>
                          <p className='text-xs text-gray-500 mb-1'>Price</p>
                          <p className='font-semibold text-gray-950'>₹ {item.price}</p>
                        </div>

                        <div className='flex items-center gap-2 text-gray-500 min-w-fit'>
                          <IoTimeOutline className='text-lg' />
                          <span className='text-sm'>{item.time} Min</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='bg-white border border-gray-200 shadow-sm rounded-3xl p-5 sm:p-6 xl:sticky xl:top-24 animate-[fadeUp_.45s_ease]'>
                  <h3 className='text-lg font-semibold text-gray-950 mb-5'>
                    Booking Summary
                  </h3>

                  <div className='space-y-4'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-500'>Services</span>
                      <span className='font-medium text-gray-900'>{items.length}</span>
                    </div>

                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-500'>Total Duration</span>
                      <span className='font-medium text-gray-900'>{totalDuration} Min</span>
                    </div>

                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-500'>Customer</span>
                      <span className='font-medium text-gray-900 truncate ml-3'>
                        {customerName || '—'}
                      </span>
                    </div>

                    <div className='pt-4 border-t border-gray-100 flex items-center justify-between'>
                      <span className='text-gray-600 font-medium'>Total</span>
                      <span className='text-xl font-bold text-gray-950'>₹ {totalAmount}</span>
                    </div>
                  </div>

                  <div className='mt-6 space-y-3'>
                    <button
                      onClick={() => navigate(-1)}
                      className='w-full border border-gray-200 bg-white text-gray-700 px-5 py-3 cursor-pointer rounded-2xl hover:bg-gray-50 transition-all duration-300'
                    >
                      Add Another Service
                    </button>

                    <button
                      onClick={() => navigate(`/confirm-booking/${salonId}`)}
                      className='w-full bg-black text-white px-5 py-3 cursor-pointer rounded-2xl hover:bg-gray-800 shadow-md shadow-black/10 transition-all duration-300'
                    >
                      Check Out
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className='rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center'>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                No services added
              </h3>
              <p className='text-sm text-gray-500 mb-6'>
                Add at least one service to continue your booking.
              </p>
              <button
                onClick={() => navigate(-1)}
                className='bg-black text-white px-6 py-3 rounded-2xl cursor-pointer hover:bg-gray-800 transition-all duration-300'
              >
                Add Service
              </button>
            </div>
          )}
        </div>
      </div>

      {!loading && items.length > 0 && (
        <div className='xl:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 sm:px-6 py-4 z-30'>
          <div className='flex items-center justify-between gap-3 mb-3'>
            <div>
              <p className='text-xs text-gray-500'>Total</p>
              <p className='text-lg font-bold text-gray-950'>₹ {totalAmount}</p>
            </div>
            <div className='text-right'>
              <p className='text-xs text-gray-500'>Duration</p>
              <p className='text-sm font-medium text-gray-900'>{totalDuration} Min</p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <button
              onClick={() => navigate(-1)}
              className='bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all duration-300'
            >
              Add More
            </button>

            <button
              onClick={() => navigate(`/confirm-booking/${salonId}`)}
              className='bg-black text-white px-4 py-3 cursor-pointer rounded-2xl hover:bg-gray-800 transition-all duration-300'
            >
              Check Out
            </button>
          </div>
        </div>
      )}

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
    </div>
  )
}