import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
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

  const [range, setRange] = useState('7') // 7, 30
  const [loading, setLoading] = useState(true)

  // dashboard data
  const [stats, setStats] = useState({
    todayBookings: 0,
    todayConfirmed: 0,
    todayRevenue: 0,
    activeBarbers: 0,
  })

  const [chart, setChart] = useState([]) // [{ label: 'Mon', revenue: 1200 }, ...]

  // 1) Load salons for owner
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

        // pick salon
        const already = localStorage.getItem('salonId')
        const firstId = list?.[0]?._id || list?.[0]?.id || ''
        const nextSalonId = already || firstId

        if (nextSalonId) {
          setSelectedSalonId(nextSalonId)
          localStorage.setItem('salonId', nextSalonId)

          const salonObj = list.find((s) => (s._id || s.id) === nextSalonId) || list[0]
          if (salonObj) localStorage.setItem('salon', JSON.stringify(salonObj))
        }

        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load salon')
        setLoading(false)
      })
  }, [ownerId])

  // 2) Load dashboard for selected salon
  useEffect(() => {
    if (!ownerId) return
    if (!selectedSalonId) return

    // ✅ If you don’t have backend API ready yet, it will fall back to demo UI safely.
    // Recommended backend endpoint (we will make it next):
    // GET /api/owner/dashboard?ownerId=...&salonId=...&days=7
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
            label: new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' }), // Mon, Tue...
            revenue: d.revenue ?? 0,
          }))
          : []

        setChart(series)
      })
      .catch(() => {
        // fallback demo series (so UI still looks like your design even if API not ready)
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
        // keep stats as is (or demo)
      })
  }, [ownerId, selectedSalonId, range])

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

  // ===================== EMPTY STATE (your 1st photo) =====================
  if (!loading && salons.length === 0) {
    return (
      <OwnerLayout>
        <div className='min-h-screen bg-gray-100 flex flex-col'>
          <div className='flex flex-1'>
            <div className='flex-1 flex flex-col items-center justify-center'>
              <button
                onClick={() => navigate('/add-salon')}
                className='border px-6 py-3 rounded-lg mb-6 bg-white shadow'
              >
                + Add Salon
              </button>
              <h1 className='text-3xl font-semibold'>Add your first salon!!</h1>
            </div>
          </div>
        </div>
      </OwnerLayout>
    )
  }

  // ===================== DASHBOARD (your 2nd photo) =====================
  return (
    <OwnerLayout>
      <div className='min-h-screen bg-[#f4f5f7]'>
        <div className='px-4 sm:px-6 md:px-10 py-6'>
          {/* Top Row */}
          <div className='flex flex-col lg:flex-row lg:items-center gap-4'>
            {/* Salon Select */}
            <div className='flex-1'>
              <div className='bg-white border rounded-xl px-4 py-3 shadow-sm flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center'>
                  <span className='text-lg'>👤</span>
                </div>

                <div className='flex-1'>
                  <p className='text-xs text-gray-500'>Selected Salon</p>
                  <select
                    value={selectedSalonId}
                    onChange={onChangeSalon}
                    className='w-full outline-none bg-transparent font-semibold text-gray-800'
                  >
                    {salons.map((s) => {
                      const id = s._id || s.id
                      const label = `${s?.name || 'Salon'}${s?.city ? `, ${s.city}` : ''}`
                      return (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div className='text-gray-400'>▾</div>
              </div>
            </div>

            {/* Add Salon Button */}
            <button
              onClick={() => navigate('/add-salon')}
              className='bg-white border rounded-xl px-5 py-3 shadow-sm flex items-center justify-center gap-3 hover:bg-gray-50'
            >
              <span className='text-xl font-bold'>+</span>
              <span className='font-semibold'>Add salon</span>
            </button>
          </div>

          {/* Cards */}
          <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
            <StatCard
              title="Today's Bookings"
              big={stats.todayBookings}
              sub={`${stats.todayConfirmed} Confirmed`}
              pill
              icon='✅'
            />
            <StatCard
              title="Today's Revenue"
              big={`₹ ${Number(stats.todayRevenue || 0).toLocaleString('en-IN')}`}
              icon='₹'
            />
            <StatCard
              title='Active Barbers'
              big={stats.activeBarbers}
              icon='👤'
            />
          </div>

          {/* Revenue Overview */}
          <div className='mt-6 bg-white border rounded-2xl shadow-sm'>
            <div className='px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b'>
              <div>
                <h3 className='font-semibold text-gray-900'>Revenue Overview</h3>
                <p className='text-xs text-gray-500'>
                  {selectedSalon?.name ? `Salon: ${selectedSalon.name}` : ''}
                </p>
              </div>

              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className='w-full sm:w-auto border rounded-xl px-4 py-2 text-sm bg-white'
              >
                <option value='7'>Last 7 Days</option>
                <option value='30'>Last 30 Days</option>
              </select>
            </div>

            <div className='p-4 sm:p-6'>
              <div className='h-[280px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={chart}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='label' />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type='monotone'
                      dataKey='revenue'
                      strokeWidth={3}
                      dot
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OwnerLayout>
  )
}

// ===================== UI COMPONENT =====================
function StatCard({ title, big, sub, pill, icon }) {
  return (
    <div className='bg-white border rounded-2xl shadow-sm p-5'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div className='w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center'>
            <span className='text-lg'>{icon}</span>
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-900'>{title}</p>
          </div>
        </div>

        {pill && (
          <span className='text-xs bg-gray-100 border px-3 py-1 rounded-full text-gray-700'>
            Live
          </span>
        )}
      </div>

      <div className='mt-4 flex items-end justify-between'>
        <div>
          <p className='text-3xl font-bold text-gray-900'>{big}</p>
          {sub ? (
            <p className='mt-2 text-sm text-gray-600 inline-flex items-center gap-2'>
              <span className='px-3 py-1 rounded-full bg-gray-100 border text-xs'>
                {sub}
              </span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}