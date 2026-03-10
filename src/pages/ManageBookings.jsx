import React, { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import OwnerLayout from '../componenets/OwnerLayout'
import {
  FiChevronLeft,
  FiChevronRight,
  FiMoreHorizontal,
  FiCalendar,
} from 'react-icons/fi'

// const BASE_URL = 'https://render-qs89.onrender.com'
const BASE_URL = 'http://localhost:8080'
const PAGE_SIZE = 5

export default function ManageBookings() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])

  const ownerId = user?.userId

  const [loading, setLoading] = useState(true)
  const [filterLoading, setFilterLoading] = useState(false)

  const [bookings, setBookings] = useState([])
  const [salons, setSalons] = useState([])
  const [barbers, setBarbers] = useState([])

  const [selectedSalonId, setSelectedSalonId] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedBarberId, setSelectedBarberId] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  const [page, setPage] = useState(0)
  const [totalBookings, setTotalBookings] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const didInitialLoad = useRef(false)

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ]

  const fetchBookings = async ({
    salonId = selectedSalonId,
    date = selectedDate,
    barberId = selectedBarberId,
    status = selectedStatus,
    pageNo = page,
    showMainLoader = false,
  } = {}) => {
    if (!ownerId) {
      toast.error('Owner not found')
      setLoading(false)
      return
    }

    try {
      if (showMainLoader) {
        setLoading(true)
      } else {
        setFilterLoading(true)
      }

      const url = new URL(`${BASE_URL}/api/owner/bookings`)
      url.searchParams.append('ownerId', ownerId)
      url.searchParams.append('page', pageNo)
      url.searchParams.append('size', PAGE_SIZE)

      if (salonId) url.searchParams.append('salonId', salonId)
      if (date) url.searchParams.append('date', date)
      if (barberId) url.searchParams.append('barberId', barberId)
      if (status) url.searchParams.append('status', status)

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error(await res.text())

      const data = await res.json()

      setBookings(Array.isArray(data?.bookings) ? data.bookings : [])
      setSalons(Array.isArray(data?.salons) ? data.salons : [])
      setBarbers(Array.isArray(data?.barbers) ? data.barbers : [])
      setTotalBookings(data?.totalBookings ?? 0)
      setTotalPages(data?.totalPages ?? 0)
    } catch (err) {
      toast.error('Failed to load bookings')
      console.error(err)
    } finally {
      setLoading(false)
      setFilterLoading(false)
    }
  }

  useEffect(() => {
    if (!ownerId) return

    setSelectedSalonId('')
    setSelectedDate('')
    setSelectedBarberId('')
    setSelectedStatus('')
    setPage(0)

    fetchBookings({
      salonId: '',
      date: '',
      barberId: '',
      status: '',
      pageNo: 0,
      showMainLoader: true,
    })

    didInitialLoad.current = true
  }, [ownerId])

  useEffect(() => {
    if (!didInitialLoad.current || !ownerId) return

    fetchBookings({
      salonId: selectedSalonId,
      date: selectedDate,
      barberId: selectedBarberId,
      status: selectedStatus,
      pageNo: page,
      showMainLoader: false,
    })
  }, [page])

  useEffect(() => {
    if (!didInitialLoad.current || !ownerId) return

    setPage(0)

    fetchBookings({
      salonId: selectedSalonId,
      date: selectedDate,
      barberId: selectedBarberId,
      status: selectedStatus,
      pageNo: 0,
      showMainLoader: false,
    })
  }, [selectedSalonId, selectedDate, selectedBarberId, selectedStatus])

  const handleSalonChange = (e) => {
    const newSalonId = e.target.value
    setSelectedSalonId(newSalonId)
    setSelectedBarberId('')
  }

  const handleClearFilters = () => {
    setSelectedSalonId('')
    setSelectedDate('')
    setSelectedBarberId('')
    setSelectedStatus('')
    setPage(0)
  }

  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return
    setPage(newPage)
  }

  const visiblePages = useMemo(() => {
    if (totalPages <= 5) {
      return [...Array(totalPages)].map((_, i) => i)
    }

    if (page <= 1) return [0, 1, 2, 3, 4]

    if (page >= totalPages - 2) {
      return [
        totalPages - 5,
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
      ]
    }

    return [page - 1, page, page + 1]
  }, [page, totalPages])

  const formatDateTime = (bookingDate, startTime) => {
    if (!bookingDate) return { date: '-', time: '-' }

    let dateText = bookingDate
    if (/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) {
      const [year, month, day] = bookingDate.split('-').map(Number)
      const dateObj = new Date(year, month - 1, day)
      dateText = dateObj.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    }

    let timeText = '-'
    if (startTime && /^\d{2}:\d{2}(:\d{2})?$/.test(startTime)) {
      const [h, m] = startTime.split(':')
      const temp = new Date()
      temp.setHours(Number(h), Number(m), 0, 0)
      timeText = temp.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    }

    return { date: dateText, time: timeText }
  }

  const getServiceText = (item) => {
    if (!item?.serviceNames || item.serviceNames.length === 0) return '-'
    if (item.serviceNames.length === 1) return item.serviceNames[0]
    return `${item.serviceNames[0]} +${item.serviceNames.length - 1}`
  }

  const getStatusClasses = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700 border border-green-200'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700 border border-blue-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border border-red-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200'
    }
  }

  const startIndex = totalBookings === 0 ? 0 : page * PAGE_SIZE + 1
  const endIndex = Math.min((page + 1) * PAGE_SIZE, totalBookings)

  return (
    <OwnerLayout>
      <div className='w-full max-w-7xl mx-auto px-3 sm:px-5 md:px-6 py-4 sm:py-5'>
        <div className='mb-6'>
          <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-950 tracking-tight'>
            Bookings
          </h1>
          <p className='text-sm sm:text-base text-gray-500 mt-2'>
            View and manage all bookings from your salons in one place.
          </p>
        </div>

        <div className='bg-white border border-gray-200 rounded-3xl shadow-sm p-4 sm:p-5 mb-5'>
          <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
            <FilterSelect
              label='Select Salon'
              value={selectedSalonId}
              onChange={handleSalonChange}
            >
              <option value=''>All Salons</option>
              {salons.map((salon) => (
                <option key={salon.id || salon._id} value={salon.id || salon._id}>
                  {salon.name}
                </option>
              ))}
            </FilterSelect>

            <FilterInput
              label='Select Date'
              type='date'
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              icon={<FiCalendar size={16} />}
            />

            <FilterSelect
              label='Select Barber'
              value={selectedBarberId}
              onChange={(e) => setSelectedBarberId(e.target.value)}
            >
              <option value=''>All Barbers</option>
              {barbers.map((barber) => (
                <option key={barber.id || barber._id} value={barber.id || barber._id}>
                  {barber.name}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              label='Status'
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statusOptions.map((item) => (
                <option key={item.value || 'all'} value={item.value}>
                  {item.label}
                </option>
              ))}
            </FilterSelect>
          </div>

          <div className='mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
            <p className='text-sm text-gray-500'>
              Filters apply automatically when changed.
            </p>

            <button
              onClick={handleClearFilters}
              disabled={filterLoading}
              className='h-[46px] px-5 rounded-2xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-60 self-start sm:self-auto'
            >
              {filterLoading ? 'Updating...' : 'Clear'}
            </button>
          </div>
        </div>

        <div className='mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
          <p className='text-sm sm:text-base text-gray-500'>
            <span className='font-semibold text-gray-900'>{totalBookings}</span>{' '}
            Total Bookings
          </p>

          {filterLoading && !loading && (
            <p className='text-sm text-[#173a8f] font-medium'>Updating results...</p>
          )}
        </div>

        <div className='lg:hidden space-y-4'>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className='bg-white border border-gray-200 rounded-3xl p-4 shadow-sm'>
                <div className='animate-pulse h-28 bg-gray-100 rounded-2xl' />
              </div>
            ))
          ) : bookings.length === 0 ? (
            <div className='bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-sm text-center'>
              <div className='w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mb-4'>
                📅
              </div>
              <h3 className='text-lg font-semibold text-gray-900'>No bookings found</h3>
              <p className='text-sm text-gray-500 mt-2'>
                Try changing the filters to view bookings.
              </p>
            </div>
          ) : (
            bookings.map((item) => {
              const { date, time } = formatDateTime(item.bookingDate, item.startTime)

              return (
                <div
                  key={item.bookingId}
                  className='bg-white border border-gray-200 rounded-3xl p-4 shadow-sm'
                >
                  <div className='flex items-start justify-between gap-3 mb-4'>
                    <div className='flex items-start gap-3 min-w-0'>
                      <div className='w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700 shrink-0'>
                        {(item.customerName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className='min-w-0'>
                        <p className='text-[15px] font-semibold text-gray-900 break-words'>
                          {capitalizeWords(item.customerName) || '-'}
                        </p>
                        <p className='text-xs text-gray-400 mt-1 break-all'>
                          {item.customerEmail || '-'}
                        </p>
                      </div>
                    </div>

                    <button className='w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-500 flex items-center justify-center transition shrink-0'>
                      <FiMoreHorizontal size={18} />
                    </button>
                  </div>

                  <div className='grid grid-cols-1 xs:grid-cols-2 gap-3 text-sm'>
                    <InfoBox label='Salon' value={item.salonName || '-'} />
                    <InfoBox label='City' value={item.city || '-'} />
                    <InfoBox label='Date' value={date} />
                    <InfoBox label='Time' value={time} />
                    <InfoBox label='Barber' value={item.barberName || '-'} />
                    <InfoBox label='Service' value={getServiceText(item)} />
                  </div>

                  <div className='mt-4 flex items-center justify-between gap-3 flex-wrap'>
                    <p className='text-sm font-semibold text-gray-900'>
                      ₹ {Number(item.totalPrice || 0).toLocaleString('en-IN')}
                    </p>

                    <span
                      className={`inline-flex items-center justify-center min-w-[108px] px-4 py-2 rounded-xl text-sm font-semibold ${getStatusClasses(
                        item.status
                      )}`}
                    >
                      {capitalizeWords(item.status || '-')}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className='hidden lg:block bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[980px]'>
              <thead>
                <tr className='border-b border-gray-200 bg-white'>
                  <th className='text-left px-5 py-5 text-sm font-semibold text-gray-600'>Client</th>
                  <th className='text-left px-5 py-5 text-sm font-semibold text-gray-600'>Salon</th>
                  <th className='text-left px-5 py-5 text-sm font-semibold text-gray-600'>Date & Time</th>
                  <th className='text-left px-5 py-5 text-sm font-semibold text-gray-600'>Barber</th>
                  <th className='text-left px-5 py-5 text-sm font-semibold text-gray-600'>Service</th>
                  <th className='text-left px-5 py-5 text-sm font-semibold text-gray-600'>Status</th>
                  <th className='text-left px-5 py-5 text-sm font-semibold text-gray-600'>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className='border-b border-gray-100'>
                      <td className='px-5 py-5'><div className='animate-pulse h-12 bg-gray-100 rounded-xl' /></td>
                      <td className='px-5 py-5'><div className='animate-pulse h-12 bg-gray-100 rounded-xl' /></td>
                      <td className='px-5 py-5'><div className='animate-pulse h-12 bg-gray-100 rounded-xl' /></td>
                      <td className='px-5 py-5'><div className='animate-pulse h-12 bg-gray-100 rounded-xl' /></td>
                      <td className='px-5 py-5'><div className='animate-pulse h-12 bg-gray-100 rounded-xl' /></td>
                      <td className='px-5 py-5'><div className='animate-pulse h-10 bg-gray-100 rounded-xl' /></td>
                      <td className='px-5 py-5'><div className='animate-pulse h-10 bg-gray-100 rounded-xl' /></td>
                    </tr>
                  ))
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan='7' className='px-5 py-16 text-center'>
                      <div className='max-w-md mx-auto'>
                        <div className='w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mb-4'>
                          📅
                        </div>
                        <h3 className='text-lg font-semibold text-gray-900'>No bookings found</h3>
                        <p className='text-sm text-gray-500 mt-2'>
                          Try changing the filters to view bookings.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map((item) => {
                    const { date, time } = formatDateTime(item.bookingDate, item.startTime)

                    return (
                      <tr
                        key={item.bookingId}
                        className='border-b border-gray-100 hover:bg-gray-50/60 transition'
                      >
                        <td className='px-5 py-5 align-top'>
                          <div className='flex items-start gap-3'>
                            <div className='w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700 shrink-0'>
                              {(item.customerName || 'U').charAt(0).toUpperCase()}
                            </div>

                            <div className='min-w-0'>
                              <p className='text-[15px] font-semibold text-gray-900 break-words'>
                                {capitalizeWords(item.customerName) || '-'}
                              </p>
                              <p className='text-xs text-gray-400 mt-0.5 break-all'>
                                {item.customerEmail || '-'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className='px-5 py-5 align-top'>
                          <p className='text-[15px] font-medium text-gray-900 break-words'>
                            {item.salonName || '-'}
                          </p>
                          <p className='text-sm text-gray-500 mt-1'>{item.city || '-'}</p>
                        </td>

                        <td className='px-5 py-5 align-top'>
                          <p className='text-[15px] font-medium text-gray-900'>{date}</p>
                          <p className='text-sm text-gray-500 mt-1'>{time}</p>
                        </td>

                        <td className='px-5 py-5 align-top'>
                          <div className='flex items-start gap-3'>
                            <div className='w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700 shrink-0'>
                              {(item.barberName || 'B').charAt(0).toUpperCase()}
                            </div>

                            <div className='min-w-0'>
                              <p className='text-[15px] font-medium text-gray-900'>
                                {item.barberName || '-'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className='px-5 py-5 align-top'>
                          <p className='text-[15px] font-medium text-gray-900 break-words'>
                            {getServiceText(item)}
                          </p>
                          <p className='text-sm text-gray-500 mt-1'>
                            ₹ {Number(item.totalPrice || 0).toLocaleString('en-IN')}
                          </p>
                        </td>

                        <td className='px-5 py-5 align-top'>
                          <span
                            className={`inline-flex items-center justify-center min-w-[108px] px-4 py-2 rounded-xl text-sm font-semibold ${getStatusClasses(
                              item.status
                            )}`}
                          >
                            {capitalizeWords(item.status || '-')}
                          </span>
                        </td>

                        <td className='px-5 py-5 align-top'>
                          <button className='w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-500 flex items-center justify-center transition'>
                            <FiMoreHorizontal size={18} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className='mt-4 px-1 sm:px-0 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
          <p className='text-sm text-gray-500'>
            Showing {startIndex}-{endIndex} out of {totalBookings}
          </p>

          <div className='flex flex-wrap items-center gap-2'>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className='h-11 px-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition flex items-center gap-2'
            >
              <FiChevronLeft />
              Previous
            </button>

            {page > 2 && totalPages > 5 && (
              <>
                <PageButton
                  pageNumber={0}
                  active={page === 0}
                  onClick={() => handlePageChange(0)}
                />
                <span className='px-1 text-gray-400'>...</span>
              </>
            )}

            {visiblePages.map((pageIndex) => (
              <PageButton
                key={pageIndex}
                pageNumber={pageIndex}
                active={page === pageIndex}
                onClick={() => handlePageChange(pageIndex)}
              />
            ))}

            {page < totalPages - 3 && totalPages > 5 && (
              <>
                <span className='px-1 text-gray-400'>...</span>
                <PageButton
                  pageNumber={totalPages - 1}
                  active={page === totalPages - 1}
                  onClick={() => handlePageChange(totalPages - 1)}
                />
              </>
            )}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages - 1 || totalPages === 0}
              className='h-11 px-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition flex items-center gap-2'
            >
              Next
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </OwnerLayout>
  )
}

function FilterSelect({ label, value, onChange, children }) {
  return (
    <div>
      <label className='block text-sm font-medium text-gray-600 mb-2'>
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className='w-full h-[52px] px-4 rounded-2xl border border-gray-200 bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300'
      >
        {children}
      </select>
    </div>
  )
}

function FilterInput({ label, icon, ...props }) {
  return (
    <div>
      <label className='block text-sm font-medium text-gray-600 mb-2'>
        {label}
      </label>
      <div className='relative'>
        <input
          {...props}
          className='w-full h-[52px] px-4 pr-11 rounded-2xl border border-gray-200 bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300'
        />
        <div className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
          {icon}
        </div>
      </div>
    </div>
  )
}

function PageButton({ pageNumber, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-11 h-11 rounded-2xl text-sm font-semibold transition ${active
        ? 'bg-[#173a8f] text-white shadow-sm'
        : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
        }`}
    >
      {pageNumber + 1}
    </button>
  )
}

function InfoBox({ label, value }) {
  return (
    <div className='rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 min-w-0'>
      <p className='text-[11px] uppercase tracking-wide text-gray-400'>{label}</p>
      <p className='text-sm font-medium text-gray-800 mt-1 break-words'>{value}</p>
    </div>
  )
}

function capitalizeWords(value) {
  if (!value) return ''
  return String(value)
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}