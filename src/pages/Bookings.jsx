import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  CalendarDays,
  Clock3,
  ArrowRight,
  ArrowUpDown,
  X,
  MapPin,
  Phone,
  Mail,
  Scissors,
  User,
  CreditCard,
} from 'lucide-react'

//const BASE_URL = 'https://render-qs89.onrender.com'
const BASE_URL = 'http://localhost:8080'

const FILTERS = [
  { label: 'All Bookings', value: 'ALL' },
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export default function Bookings() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])

  const userId = user?.userId || user?.userid || ''

  const [filter, setFilter] = useState('ALL')
  const [sort, setSort] = useState('DESC')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedBookingId, setSelectedBookingId] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [bookingDetails, setBookingDetails] = useState(null)

  useEffect(() => {
    if (!userId) {
      toast.error('User not found')
      setLoading(false)
      return
    }

    loadBookings()
  }, [userId, filter, sort])

  useEffect(() => {
    if (!selectedBookingId || !userId) return
    loadBookingDetails(selectedBookingId)
  }, [selectedBookingId, userId])

  const loadBookings = async () => {
    try {
      setLoading(true)

      const url = new URL(`${BASE_URL}/api/booking/user-bookings`)
      url.searchParams.append('userId', userId)
      url.searchParams.append('filter', filter)
      url.searchParams.append('sort', sort)

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error('Failed to load bookings')

      const data = await res.json()
      setBookings(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load bookings')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const loadBookingDetails = async (bookingId) => {
    try {
      setDetailsLoading(true)
      setBookingDetails(null)

      const res = await fetch(
        `${BASE_URL}/api/booking/details/${bookingId}?userId=${encodeURIComponent(userId)}`
      )

      if (!res.ok) throw new Error('Failed to load booking details')

      const data = await res.json()
      setBookingDetails(data)
    } catch {
      toast.error('Failed to load booking details')
      setSelectedBookingId(null)
    } finally {
      setDetailsLoading(false)
    }
  }

  const closeModal = () => {
    setSelectedBookingId(null)
    setBookingDetails(null)
  }

  return (
    <div className='min-h-screen bg-[#f5f6f8]'>
      <div className='max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8'>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8'>
          <div className='bg-[#ececef] rounded-full p-1 flex flex-wrap gap-1 w-full lg:w-auto'>
            {FILTERS.map((item, idx) => (
              <React.Fragment key={item.value}>
                <button
                  onClick={() => setFilter(item.value)}
                  className={`px-6 py-2.5 rounded-full text-sm sm:text-base font-semibold transition ${filter === item.value
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-black'
                    }`}
                >
                  {item.label}
                </button>

                {idx !== FILTERS.length - 1 && (
                  <div className='hidden md:flex items-center text-gray-400 px-1'>|</div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className='flex justify-start lg:justify-end'>
            <div className='relative'>
              <ArrowUpDown
                size={16}
                className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none'
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className='appearance-none bg-white border border-gray-300 rounded-lg pl-10 pr-8 py-2.5 text-sm sm:text-base font-medium text-gray-700 outline-none'
              >
                <option value='DESC'>Sort by: Date</option>
                <option value='ASC'>Sort by: Oldest</option>
              </select>
              <span className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none'>
                ▾
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7'>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className='bg-white rounded-[28px] p-7 shadow-sm border border-gray-100 animate-pulse h-[290px]'
              />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className='bg-white rounded-3xl border border-gray-100 shadow-sm px-6 py-14 text-center'>
            <h2 className='text-2xl font-semibold text-gray-900'>No bookings found</h2>
            <p className='text-gray-500 mt-2'>Your bookings will appear here.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7'>
            {bookings.map((booking) => (
              <BookingCard
                key={booking.bookingId}
                booking={booking}
                onViewDetails={() => setSelectedBookingId(booking.bookingId)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedBookingId && (
        <BookingDetailsModal
          loading={detailsLoading}
          data={bookingDetails}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

function BookingCard({ booking, onViewDetails }) {
  const statusLabel = normalizeBookingStatus(booking?.bookingStatus)
  const paymentLabel = normalizePaymentStatus(booking?.paymentStatus)

  return (
    <div className='relative bg-white rounded-[30px] px-4 pt-9 pb-5.5 shadow-sm border border-gray-100 overflow-hidden'>
      <div className='absolute top-0 left-0'>
        <div className={`px-7 py-2 rounded-br-[40px] text-sm font-semibold ${statusClass(statusLabel)}`}>
          {statusLabel}
        </div>
      </div>

      <div className='absolute top-4 right-5'>
        <span className={`px-4 py-1 rounded-md text-sm font-semibold ${paymentClass(paymentLabel)}`}>
          {paymentLabel}
        </span>
      </div>

      <div className='flex items-start gap-5 mt-4'>
        <img
          src={booking?.salonImageUrl || 'https://via.placeholder.com/96x96?text=Salon'}
          alt={booking?.salonName || 'Salon'}
          className='w-20 h-20 rounded-2xl object-cover border'
        />

        <div className='flex-1 min-w-0'>
          <h3 className='text-lg leading-tight font-semibold text-gray-900 truncate'>
            {booking?.salonName || 'Salon'}
          </h3>

          <p className='text-gray-600 mt-2 text-[15px]'>
            Customer : <span className='font-medium text-gray-900'>{capitalizeWords(booking?.customerName || '-')}</span>
          </p>

          <div className='flex items-center gap-6 mt-2 text-gray-600 text-[15px]'>
            <span>
              {booking?.serviceCount || 0} {booking?.serviceCount === 1 ? 'service' : 'services'}
            </span>
            <span>₹ {Number(booking?.totalPrice || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className='my-4 border-t border-gray-200' />

      <div className='flex items-center justify-between gap-4 text-gray-600 text-[15px]'>
        <div className='flex items-center gap-3 min-w-0'>
          <CalendarDays size={19} className='text-gray-500 shrink-0' />
          <span className='truncate'>{formatDate(booking?.bookingDate)}</span>
        </div>

        <div className='flex items-center gap-3 min-w-0'>
          <Clock3 size={19} className='text-gray-500 shrink-0' />
          <span className='truncate'>
            {formatTime(booking?.startTime)} - {formatTime(booking?.endTime)}
          </span>
        </div>
      </div>

      <div className='mt-4 flex justify-center'>
        <button
          onClick={onViewDetails}
          className='inline-flex items-center gap-3 border border-gray-300 rounded-full px-6 py-2 font-semibold text-gray-900 hover:bg-gray-50 transition'
        >
          <span>View Details</span>
          <span className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
            <ArrowRight size={16} />
          </span>
        </button>
      </div>
    </div>
  )
}

function BookingDetailsModal({ loading, data, onClose }) {
  const salon = data?.salon
  const barber = data?.barber
  const services = Array.isArray(data?.services) ? data.services : []
  const statusLabel = normalizeBookingStatus(data?.bookingStatus)
  const paymentLabel = normalizePaymentStatus(data?.paymentStatus)

  return (
    <div className='fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4'>
      <div className='w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-200'>
        <div className='sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between rounded-t-[30px]'>
          <h2 className='text-2xl font-semibold text-gray-900'>Booking Details</h2>
          <button
            onClick={onClose}
            className='w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center'
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className='p-8'>
            <div className='animate-pulse space-y-4'>
              <div className='h-28 bg-gray-100 rounded-2xl' />
              <div className='h-24 bg-gray-100 rounded-2xl' />
              <div className='h-44 bg-gray-100 rounded-2xl' />
            </div>
          </div>
        ) : !data ? (
          <div className='p-10 text-center text-gray-500'>Failed to load booking details.</div>
        ) : (
          <>
            <div className='px-6 py-6'>
              <div className='flex flex-col xl:flex-row xl:items-start xl:justify-between gap-8'>
                <div className='flex items-start gap-5'>
                  <img
                    src={salon?.imageUrl || 'https://via.placeholder.com/96x96?text=Salon'}
                    alt={salon?.name || 'Salon'}
                    className='w-24 h-24 rounded-2xl object-cover border'
                  />

                  <div>
                    <h3 className='text-2xl font-semibold text-gray-900'>
                      {salon?.name || 'Salon'}
                    </h3>
                    <p className='text-xl text-gray-600 mt-1 capitalize'>
                      {salon?.city || '-'}
                    </p>

                    <div className='flex flex-wrap items-center gap-3 mt-4'>
                      <span className={`px-3 py-1 rounded-xl text-sm font-semibold ${statusClass(statusLabel)}`}>
                        {statusLabel}
                      </span>
                      <span className={`px-3 py-1 rounded-xl text-sm font-semibold ${paymentClass(paymentLabel)}`}>
                        {paymentLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='text-left xl:text-right'>
                  <p className='text-gray-500 text-lg'>Booking ID</p>
                  <p className='text-xl font-medium text-gray-800 break-all'>
                    {data?.bookingId || '-'}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-6 mt-10'>
                <InfoRow
                  icon={<User size={22} />}
                  label='Customer Name'
                  value={capitalizeWords(data?.customerName || '-')}
                />
                <InfoRow
                  icon={<CalendarDays size={22} />}
                  label='Booking Date'
                  value={formatDate(data?.bookingDate)}
                />
                <InfoRow
                  icon={<Clock3 size={22} />}
                  label='Timing'
                  value={`${formatTime(data?.startTime)} - ${formatTime(data?.endTime)}`}
                />
                <InfoRow
                  icon={<Scissors size={22} />}
                  label='Barber'
                  value={barber?.name || '-'}
                />
                <InfoRow
                  icon={<Phone size={22} />}
                  label='Phone'
                  value={salon?.contact || '-'}
                />
                <InfoRow
                  icon={<Mail size={22} />}
                  label='Salon Email'
                  value={salon?.salonEmail || '-'}
                />
              </div>
            </div>

            <SectionTitle title='Salon Details' />

            <div className='px-8 py-8'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-6'>
                <InfoRow
                  icon={<MapPin size={18} />}
                  label='Address'
                  value={salon?.address || '-'}
                />
                <InfoRow
                  icon={<Phone size={18} />}
                  label='Contact'
                  value={salon?.contact || '-'}
                />
                <InfoRow
                  icon={<Clock3 size={18} />}
                  label='Timings'
                  value={`${formatTime(salon?.opentime)} - ${formatTime(salon?.closetime)}`}
                />
                <InfoRow
                  icon={<MapPin size={18} />}
                  label='Google Maps'
                  value={
                    salon?.mapLink ? (
                      <a
                        href={salon.mapLink}
                        target='_blank'
                        rel='noreferrer'
                        className='text-blue-600 hover:underline'
                      >
                        View on Google Maps
                      </a>
                    ) : (
                      '-'
                    )
                  }
                />
              </div>
            </div>

            <SectionTitle title='Services' />

            <div className='px-8 py-8'>
              <div className='space-y-5'>
                {services.length === 0 ? (
                  <div className='text-gray-500'>No services found</div>
                ) : (
                  services.map((service, index) => (
                    <div
                      key={`${service?.serviceId || index}-${index}`}
                      className='flex flex-col sm:flex-row sm:items-center gap-4 border border-gray-200 rounded-2xl p-4'
                    >
                      <img
                        src={service?.imageUrl || 'https://via.placeholder.com/90x90?text=Service'}
                        alt={service?.serviceName || 'Service'}
                        className='w-20 h-20 rounded-2xl object-cover border'
                      />

                      <div className='flex-1'>
                        <h4 className='text-xl font-semibold text-gray-900'>
                          {capitalizeWords(service?.serviceName || 'Service')}
                        </h4>
                        <p className='text-gray-600 mt-1'>{service?.time || 0} min</p>
                      </div>

                      <div className='text-xl font-semibold text-gray-900'>
                        ₹ {Number(service?.price || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className='mt-8 border-t border-gray-200 pt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
                <div className='flex flex-wrap items-center gap-4 text-gray-700'>
                  <span className='font-medium'>
                    {data?.serviceCount || services.length} {data?.serviceCount === 1 || services.length === 1 ? 'Service' : 'Services'}
                  </span>
                  <span className='hidden sm:inline text-gray-300'>|</span>
                  <span>{data?.totalTime || 0} min</span>
                  <span className='hidden sm:inline text-gray-300'>|</span>
                  <span className='font-semibold text-gray-900'>
                    Total ₹ {Number(data?.totalPrice || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className='flex items-center gap-3 text-lg'>
                  <CreditCard size={20} className='text-gray-500' />
                  <span className='text-gray-600'>Payment Status:</span>
                  <span className={`px-4 py-1 rounded-lg text-sm font-semibold ${paymentClass(paymentLabel)}`}>
                    {paymentLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className='px-8 pb-8 flex justify-center gap-3'>
              {String(data?.paymentStatus || '').toUpperCase() === 'PAID' && (
                <button
                  onClick={() =>
                    window.open(
                      `${BASE_URL}/api/booking/bill/${data?.bookingId}?userId=${encodeURIComponent(data?.userId)}`,
                      '_blank'
                    )
                  }
                  className='min-w-[140px] rounded-full bg-black hover:bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition'
                >
                  View Bill
                </button>
              )}

              <button
                onClick={onClose}
                className='min-w-[140px] rounded-full bg-gray-100 hover:bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-900 transition'
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ title }) {
  return (
    <div className='px-6 py-4 bg-[#f7f7f8] border-y border-gray-200'>
      <h3 className='text-2xl font-semibold text-gray-900'>{title}</h3>
    </div>
  )
}

function InfoRow({ icon, label, value, bordered = true }) {
  return (
    <div className={`${bordered ? 'border-b border-gray-200 pb-2' : ''} flex items-center gap-4`}>
      <div className='text-gray-500 shrink-0'>{icon}</div>
      <div className='min-w-0'>
        <p className='text-gray-500 text-sm'>{label}</p>
        <p className='text-xl text-gray-900 break-words'>{value || '-'}</p>
      </div>
    </div>
  )
}

function normalizeBookingStatus(status) {
  const value = String(status || '').toUpperCase()

  if (value === 'CONFIRMED') return 'Confirmed'
  if (value === 'UPCOMING') return 'Upcoming'
  if (value === 'COMPLETED') return 'Completed'
  if (value === 'CANCELLED') return 'Cancelled'

  return status || 'Confirmed'
}

function normalizePaymentStatus(status) {
  const value = String(status || '').toUpperCase()

  if (value === 'PAID') return 'Paid'
  return 'Unpaid'
}

function statusClass(status) {
  if (status === 'Confirmed' || status === 'Completed') {
    return 'bg-[#bde9bf] text-[#226b30]'
  }

  if (status === 'Upcoming') {
    return 'bg-[#f3d58a] text-[#8b5b00]'
  }

  if (status === 'Cancelled') {
    return 'bg-[#f8c5c5] text-[#9e1e1e]'
  }

  return 'bg-[#e5e7eb] text-gray-700'
}

function paymentClass(status) {
  if (status === 'Paid') {
    return 'bg-[#bde9bf] text-[#226b30]'
  }

  return 'bg-[#f2d28f] text-[#8b5b00]'
}

function formatDate(dateStr) {
  if (!dateStr) return '-'

  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(timeStr) {
  if (!timeStr) return '-'

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
    const [h, m] = timeStr.split(':')
    const date = new Date()
    date.setHours(Number(h), Number(m), 0, 0)
    return date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const date = new Date(timeStr)
  if (Number.isNaN(date.getTime())) return timeStr

  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function capitalizeWords(text) {
  return String(text || '')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}