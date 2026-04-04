import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import OwnerLayout from './componenets/OwnerLayout'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const BASE_URL = 'https://render-qs89.onrender.com'

export default function OwnerDashboard() {
  const navigate = useNavigate()

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])

  const ownerId = user?.userId

  const [salons, setSalons] = useState([])
  const [selectedSalonId, setSelectedSalonId] = useState(
    localStorage.getItem('salonId') || ''
  )

  const [range] = useState('7')
  const [loading, setLoading] = useState(true)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [salonDropdownOpen, setSalonDropdownOpen] = useState(false)

  const [stats, setStats] = useState({
    todayBookings: 0,
    todayConfirmed: 0,
    todayRevenue: 0,
    activeBarbers: 0,
  })

  const [chart, setChart] = useState([])

  useEffect(() => {
    if (!ownerId) {
      toast.error('Owner not found')
      setLoading(false)
      return
    }

    setLoading(true)

    fetch(`${BASE_URL}/api/salon/get-salon-by-owner/${ownerId}`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setSalons(list)

        const already = localStorage.getItem('salonId')
        const firstId = list?.[0]?._id || list?.[0]?.id || ''
        const nextSalonId = already || firstId

        if (nextSalonId) {
          setSelectedSalonId(nextSalonId)
          localStorage.setItem('salonId', nextSalonId)

          const salonObj = list.find((s) => (s._id || s.id) === nextSalonId)
          if (salonObj) localStorage.setItem('salon', JSON.stringify(salonObj))
        }

        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load salon')
        setLoading(false)
      })
  }, [ownerId])

  useEffect(() => {
    if (!selectedSalonId) return

    setDashboardLoading(true)

    const url = new URL(`${BASE_URL}/api/owner/dashboard`)
    url.searchParams.append('salonId', selectedSalonId)
    url.searchParams.append('days', range)

    fetch(url.toString())
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then((data) => {
        setStats({
          todayBookings: data?.todayBookings ?? 0,
          todayConfirmed: data?.confirmedBookings ?? 0,
          todayRevenue: data?.todayRevenue ?? 0,
          activeBarbers: data?.activeBarbers ?? 0,
        })

        const series = Array.isArray(data?.revenueLast7Days)
          ? data.revenueLast7Days.map((d) => ({
            label: new Date(d.date).toLocaleDateString('en-IN', {
              weekday: 'short',
            }),
            revenue: d.revenue ?? 0,
          }))
          : []

        setChart(series)
        setDashboardLoading(false)
      })
      .catch(() => {
        const demo = [
          { label: 'Mon', revenue: 0 },
          { label: 'Tue', revenue: 1200 },
          { label: 'Wed', revenue: 1400 },
          { label: 'Thu', revenue: 1100 },
          { label: 'Fri', revenue: 1300 },
          { label: 'Sat', revenue: 1250 },
          { label: 'Sun', revenue: 1900 },
        ]
        setChart(demo)
        setDashboardLoading(false)
      })
  }, [selectedSalonId, range])

  const selectedSalon = useMemo(() => {
    return salons.find((s) => (s._id || s.id) === selectedSalonId) || null
  }, [salons, selectedSalonId])

  const onChangeSalon = (e) => {
    const id = e.target.value
    setSelectedSalonId(id)
    localStorage.setItem('salonId', id)

    const salonObj = salons.find((s) => (s._id || s.id) === id)
    if (salonObj) localStorage.setItem('salon', JSON.stringify(salonObj))
  }

  if (!loading && salons.length === 0) {
    return (
      <OwnerLayout>
        <div className='flex items-center justify-center min-h-[70vh] px-4'>
          <div className='text-center max-w-md'>
            <button
              onClick={() => navigate('/add-salon')}
              className='border border-gray-200 px-6 py-3 rounded-2xl mb-6 bg-white shadow-sm hover:bg-gray-50 transition-all duration-300'
            >
              + Add Salon
            </button>

            <h1 className='text-2xl sm:text-3xl font-semibold text-gray-950'>
              Add your first salon!
            </h1>

            <p className='text-sm text-gray-500 mt-2'>
              Create your salon first to view dashboard stats and revenue.
            </p>
          </div>
        </div>
      </OwnerLayout>
    )
  }

  return (
    <OwnerLayout>
      <div className='w-full max-w-7xl mx-auto px-3 sm:px-5 md:px-6 py-4 sm:py-5'>
        <div className='flex flex-col lg:flex-row lg:items-center gap-4 mb-6'>
          <div className='flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-4 shadow-sm flex items-center gap-3 relative'>
            <div className='w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center text-lg shrink-0'>
              🏪
            </div>

            <div className='flex-1 min-w-0'>
              <p className='text-xs text-gray-500 mb-1'>Selected Salon</p>

              {/* Dropdown Button */}
              <button
                onClick={() => setSalonDropdownOpen(!salonDropdownOpen)}
                className='w-full flex justify-between items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold hover:bg-white transition'
              >
                {selectedSalon?.name || 'Select Salon'}
                <span className='text-gray-400'>▾</span>
              </button>

              {/* Dropdown Menu */}
              {salonDropdownOpen && (
                <div className='absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden'>
                  {salons.map((s) => {
                    const id = s._id || s.id

                    return (
                      <div
                        key={id}
                        onClick={() => {
                          onChangeSalon({ target: { value: id } })
                          setSalonDropdownOpen(false)
                        }}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-100 transition ${selectedSalonId === id ? 'bg-gray-100 font-semibold' : ''
                          }`}
                      >
                        {s.name}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/add-salon')}
            className='bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm hover:bg-gray-50 transition-all duration-300 w-full lg:w-auto'
          >
            + Add Salon
          </button>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5'>
          <StatCard
            title="Today's Bookings"
            big={stats.todayBookings}
            sub={`${stats.todayConfirmed} Confirmed`}
            icon='📅'
          />

          <StatCard
            title="Today's Revenue"
            big={`₹ ${Number(stats.todayRevenue || 0).toLocaleString('en-IN')}`}
            icon='₹'
          />

          <StatCard
            title='Active Barbers'
            big={stats.activeBarbers}
            icon='✂️'
          />
        </div>

        <div className='mt-6 bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-100'>
            <div>
              <h3 className='font-semibold text-gray-950 text-lg'>
                Revenue Overview
              </h3>
              <p className='text-xs text-gray-500 mt-1'>
                {selectedSalon?.name || 'No salon selected'}
              </p>
            </div>

            <div className='inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 shadow-sm'>
              Last 7 days overview
            </div>
          </div>

          <div className='p-4 sm:p-5 md:p-6'>
            {dashboardLoading ? (
              <div className='h-[240px] sm:h-[300px] md:h-[340px] lg:h-[360px] animate-pulse rounded-2xl bg-gray-50 border border-gray-100' />
            ) : (
              <div className='h-[240px] sm:h-[300px] md:h-[340px] lg:h-[360px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart
                    data={chart}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                    <XAxis
                      dataKey='label'
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '16px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                      }}
                    />

                    <Line
                      type='monotone'
                      dataKey='revenue'
                      stroke='#111827'
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </OwnerLayout>
  )
}

function StatCard({ title, big, sub, icon }) {
  return (
    <div className='bg-white border border-gray-200 rounded-3xl shadow-sm p-5 h-full flex flex-col justify-between hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-all duration-300'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='w-11 h-11 rounded-2xl bg-gray-100 text-gray-800 flex items-center justify-center text-lg'>
          {icon}
        </div>

        <p className='text-sm font-semibold text-gray-700'>{title}</p>
      </div>

      <p className='text-2xl sm:text-3xl font-bold text-gray-950 break-words'>
        {big}
      </p>

      {sub && <p className='text-sm text-gray-500 mt-2'>{sub}</p>}
    </div>
  )
}