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

  const [range, setRange] = useState('7')
  const [loading, setLoading] = useState(true)

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
        <div className='flex items-center justify-center min-h-[70vh]'>
          <div className='text-center'>
            <button
              onClick={() => navigate('/add-salon')}
              className='border px-6 py-3 rounded-xl mb-6 bg-white shadow hover:bg-gray-50'
            >
              + Add Salon
            </button>
            <h1 className='text-2xl sm:text-3xl font-semibold'>
              Add your first salon!
            </h1>
          </div>
        </div>
      </OwnerLayout>
    )
  }

  return (
    <OwnerLayout>
      <div className='w-full max-w-7xl mx-auto px-3 sm:px-5 md:px-6 py-3'>
        {/* Top Controls */}
        <div className='flex flex-col md:flex-row md:items-center gap-4 mb-6'>
          <div className='flex-1 bg-white border rounded-xl px-4 py-3 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center'>
              👤
            </div>

            <div className='flex-1'>
              <p className='text-xs text-gray-500'>Selected Salon</p>

              <select
                value={selectedSalonId}
                onChange={onChangeSalon}
                className='w-full outline-none font-semibold'
              >
                {salons.map((s) => {
                  const id = s._id || s.id
                  return (
                    <option key={id} value={id}>
                      {s.name}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          <button
            onClick={() => navigate('/add-salon')}
            className='bg-white border rounded-xl px-5 py-3 shadow-sm hover:bg-gray-50 w-full md:w-auto'
          >
            + Add Salon
          </button>
        </div>

        {/* Stat Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
          <StatCard
            title="Today's Bookings"
            big={stats.todayBookings}
            sub={`${stats.todayConfirmed} Confirmed`}
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

        {/* Chart */}
        <div className='mt-6 bg-white border rounded-2xl shadow-sm'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b'>
            <div>
              <h3 className='font-semibold'>Revenue Overview</h3>
              <p className='text-xs text-gray-500'>{selectedSalon?.name}</p>
            </div>

            <h3>
              Last 7 days overview 
            </h3>
          </div>

          <div className='p-4 sm:p-6'>
            <div className='h-[220px] sm:h-[280px] md:h-[320px] lg:h-[350px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={chart}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='label' />
                  <YAxis />
                  <Tooltip />

                  <Line
                    type='monotone'
                    dataKey='revenue'
                    stroke='#2563eb'
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
    </OwnerLayout>
  )
}

function StatCard({ title, big, sub, icon }) {
  return (
    <div className='bg-white border rounded-2xl shadow-sm p-5 h-full flex flex-col justify-between'>
      <div className='flex items-center gap-3 mb-3'>
        <div className='w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center'>
          {icon}
        </div>

        <p className='text-sm font-semibold'>{title}</p>
      </div>

      <p className='text-3xl font-bold'>{big}</p>

      {sub && <p className='text-sm text-gray-500 mt-2'>{sub}</p>}
    </div>
  )
}
