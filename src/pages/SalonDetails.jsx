import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaLocationDot, FaPhone } from 'react-icons/fa6'
import { MdEmail } from 'react-icons/md'
import { IoArrowBack } from 'react-icons/io5'
import { FiCheckCircle } from 'react-icons/fi'
import { toast } from 'sonner'
import Navbar from '../componenets/Navbar'

export default function SalonDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [salon, setSalon] = useState(null)
  const [loading, setLoading] = useState(true)

  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingFor, setBookingFor] = useState('myself')
  const [guestName, setGuestName] = useState('')

  const isLoggedIn =
    !!localStorage.getItem('user') || !!localStorage.getItem('token')

  useEffect(() => {
    const fetchSalon = async () => {
      try {
        const res = await fetch(
          `https://render-qs89.onrender.com/api/salon/get-salon/${id}`
        )
        const data = await res.json()

        if (!Array.isArray(data.services)) data.services = []
        setSalon(data)
      } catch (err) {
        console.error(err)
        setSalon(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSalon()
  }, [id])

  const handleBookNow = () => {
    if (!isLoggedIn) {
      toast.error('Please login first')
      return
    }

    setShowBookingModal(true)
  }

  const handleContinueBooking = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const bookedBy = user?.name || ''

    const finalCustomerName =
      bookingFor === 'myself' ? bookedBy : guestName.trim()

    if (bookingFor === 'someone' && !finalCustomerName) {
      toast.error('Please enter guest name')
      return
    }

    sessionStorage.setItem(
      'bookingMeta',
      JSON.stringify({
        bookingFor,
        bookedBy,
        customerName: finalCustomerName,
      })
    )

    setShowBookingModal(false)
    navigate(`/book/${salon._id || salon.id}`)
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-white'>
        <Navbar />
        <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10'>
          <div className='animate-pulse'>
            <div className='h-10 w-10 rounded-full border mb-6'></div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              <div className='h-[260px] sm:h-[360px] rounded-3xl bg-gray-200'></div>
              <div className='h-[260px] sm:h-[360px] rounded-3xl bg-gray-100'></div>
            </div>

            <div className='mt-14'>
              <div className='h-8 w-56 bg-gray-200 rounded mb-8'></div>
              <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className='h-36 rounded-2xl bg-gray-100 border border-gray-200'
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!salon) {
    return (
      <div className='min-h-screen bg-white'>
        <Navbar />
        <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-16 text-center'>
          <div className='max-w-md mx-auto bg-white border border-gray-200 shadow-sm rounded-3xl p-8'>
            <h2 className='text-2xl font-bold text-gray-900 mb-3'>
              Salon not found
            </h2>
            <p className='text-gray-600 mb-6'>
              The salon you are looking for does not exist or may have been removed.
            </p>
            <button
              onClick={() => navigate(-1)}
              className='bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition cursor-pointer'
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-white via-gray-50/40 to-white relative overflow-x-hidden'>
      <Navbar />

      <main
        className={`flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 py-4 sm:py-6 transition-all duration-300 ${showBookingModal ? 'blur-sm pointer-events-none select-none' : ''
          }`}
      >
        <button
          onClick={() => navigate(-1)}
          className='mb-6 sm:mb-8 w-11 h-11 border border-gray-200 bg-white shadow-sm rounded-full cursor-pointer flex items-center justify-center hover:shadow-md hover:-translate-x-1 transition-all duration-300'
        >
          <IoArrowBack className='text-lg' />
        </button>

        <div className='grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5 items-start'>
          <div className='group relative overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-gray-100 bg-white animate-[fadeUp_.5s_ease]'>
            <div className='absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-transparent z-10 pointer-events-none'></div>
            <img
              src={salon.imageUrl}
              alt={salon.name}
              className='w-full h-56 sm:h-64 md:h-[418px] object-cover transition-transform duration-700 group-hover:scale-[1.03]'
            />
          </div>

          <div className='relative bg-white rounded-2xl px-5 py-4 sm:px-5 sm:py-5 border border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.05)] animate-[fadeUp_.7s_ease]'>
            <div className='relative z-10'>
              <h1 className='text-2xl sm:text-[34px] leading-tight font-bold text-gray-950 mb-4'>
                {salon.name}
              </h1>

              <div className='space-y-3'>
                <div className='flex items-start gap-3 rounded-xl bg-gray-50 border border-gray-100 px-3 py-3 transition-all duration-300'>
                  <div className='w-9 h-9 shrink-0 rounded-lg bg-black text-white flex items-center justify-center'>
                    <FaLocationDot className='text-sm' />
                  </div>
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold text-gray-900 mb-0.5'>
                      Address
                    </p>
                    <p className='text-[15px] text-gray-600 leading-6 break-words'>
                      {salon.address || 'Address not available'}
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-3 rounded-xl bg-gray-50 border border-gray-100 px-3 py-3 transition-all duration-300'>
                  <div className='w-9 h-9 shrink-0 rounded-lg bg-black text-white flex items-center justify-center'>
                    <FaPhone className='text-sm' />
                  </div>
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold text-gray-900 mb-0.5'>
                      Contact
                    </p>
                    <p className='text-[15px] text-gray-600 leading-6 break-words'>
                      {salon.contact || 'Phone not available'}
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-3 rounded-xl bg-gray-50 border border-gray-100 px-3 py-3 transition-all duration-300'>
                  <div className='w-9 h-9 shrink-0 rounded-lg bg-black text-white flex items-center justify-center'>
                    <MdEmail className='text-sm' />
                  </div>
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold text-gray-900 mb-0.5'>
                      Email
                    </p>
                    <p className='text-[15px] text-gray-600 leading-6 break-all'>
                      {salon.email || salon.salonEmail || 'Email not available'}
                    </p>
                  </div>
                </div>
              </div>

              <div className='mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-3'>
                <button
                  onClick={handleBookNow}
                  className='bg-black text-white px-5 py-2.5 cursor-pointer rounded-xl hover:bg-gray-800 shadow-md shadow-black/10 transition-all duration-300'
                >
                  Book Appointment
                </button>

                <button
                  onClick={() => navigate(-1)}
                  className='px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-300 cursor-pointer'
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>

        <section className='mt-16 sm:mt-20 animate-[fadeUp_.9s_ease]'>
          <div className='flex items-center justify-between gap-4 mb-8'>
            <div>
              <h2 className='text-2xl sm:text-3xl font-bold text-gray-950'>
                Available Services
              </h2>
              <p className='text-gray-500 mt-2 text-sm sm:text-base'>
                Explore the services currently offered by this salon.
              </p>
            </div>

            {salon.services.length > 0 && (
              <div className='hidden sm:flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm'>
                {salon.services.length} Service
                {salon.services.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {salon.services.length ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
              {salon.services.map((service, i) => (
                <div
                  key={i}
                  className='group relative rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-[0_14px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300'
                >
                  <div className='absolute inset-x-[1px] top-[0px] h-2 rounded-t-[20px] bg-gradient-to-r from-black via-gray-700 to-gray-400 opacity-90'></div>

                  <div className='flex items-start justify-between gap-3 mb-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      {service.name}
                    </h3>

                    {service.price ? (
                      <span className='shrink-0 rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-900'>
                        ₹{service.price}
                      </span>
                    ) : null}
                  </div>

                  <p className='text-sm text-gray-600 leading-7 min-h-[72px]'>
                    {service.description || 'Service details not available.'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className='rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                No services available
              </h3>
              <p className='text-gray-500'>
                This salon has not added services yet.
              </p>
            </div>
          )}
        </section>

        <div className='flex justify-center mt-14 sm:mt-16'>
          <button
            onClick={handleBookNow}
            className='bg-black text-white px-10 py-3.5 cursor-pointer rounded-2xl hover:bg-gray-800 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300'
          >
            Book Now
          </button>
        </div>
      </main>

      {showBookingModal && (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm px-4 animate-[fadeIn_.25s_ease]'>
          <div className='relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-white/50 p-6 sm:p-7 animate-[scaleIn_.25s_ease]'>
            <button
              onClick={() => setShowBookingModal(false)}
              className='absolute right-4 top-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-lg transition cursor-pointer flex items-center justify-center'
            >
              ✕
            </button>

            <div className='mb-6'>
              <h2 className='text-xl sm:text-2xl font-semibold text-center text-gray-950'>
                Who is this booking for?
              </h2>
              <p className='text-sm text-gray-500 text-center mt-2'>
                Choose who will attend this appointment.
              </p>
            </div>

            <div className='space-y-3'>
              <label
                className={`flex items-center gap-3 rounded-2xl border p-4 cursor-pointer transition-all duration-300 ${bookingFor === 'myself'
                  ? 'border-black bg-gray-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <input
                  type='radio'
                  className='accent-black w-4 h-4'
                  checked={bookingFor === 'myself'}
                  onChange={() => setBookingFor('myself')}
                />
                <span className='font-medium text-gray-900'>Myself</span>
              </label>

              <label
                className={`flex items-center gap-3 rounded-2xl border p-4 cursor-pointer transition-all duration-300 ${bookingFor === 'someone'
                  ? 'border-black bg-gray-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <input
                  type='radio'
                  className='accent-black w-4 h-4'
                  checked={bookingFor === 'someone'}
                  onChange={() => setBookingFor('someone')}
                />
                <span className='font-medium text-gray-900'>Someone Else</span>
              </label>
            </div>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${bookingFor === 'someone'
                ? 'max-h-40 opacity-100 mt-4'
                : 'max-h-0 opacity-0'
                }`}
            >
              <input
                type='text'
                placeholder='Enter guest name'
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className='w-full border border-gray-200 rounded-2xl px-4 py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black'
              />
            </div>

            <div className='flex gap-3 mt-6'>
              <button
                onClick={() => setShowBookingModal(false)}
                className='flex-1 border border-gray-200 bg-white cursor-pointer rounded-2xl py-3 font-medium hover:bg-gray-50 transition'
              >
                Cancel
              </button>

              <button
                onClick={handleContinueBooking}
                className='flex-1 bg-black text-white cursor-pointer rounded-2xl py-3 font-medium transition-all duration-300 hover:bg-gray-800'
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className='border-t bg-white/80 backdrop-blur-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-4'>
          <div className='flex items-center gap-3'>
            <img
              src="/logo.png"
              alt="logo"
              className="h-8 w-8 rounded-xl object-cover"
            />
            <span className='font-semibold text-gray-800'>SlotMyStyle</span>
          </div>
          <p>© 2025 SlotMyStyle Inc. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}