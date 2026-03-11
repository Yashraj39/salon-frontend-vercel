import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaCamera,
} from 'react-icons/fa'
import { FiArrowRight, FiEdit3, FiHome, FiLogOut, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import Navbar from '../componenets/Navbar'

const BASE_URL = 'https://render-qs89.onrender.com'

export default function Profile() {
  const navigate = useNavigate()

  const [editMode, setEditMode] = useState(false)
  const [backup, setBackup] = useState(null)

  const [userData, setUserData] = useState({
    userId: '',
    name: '',
    email: '',
    phone: '',
    avatar: '',
  })

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) return

    const user = JSON.parse(stored)

    setUserData({
      userId: user.userId || '',
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar: '',
    })

    fetch(`${BASE_URL}/api/v1.0/get-profile-image/${user.userId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.imageUrl) {
          setUserData((prev) => ({
            ...prev,
            avatar: data.imageUrl,
          }))
        }
      })
      .catch(() => {})
  }, [])

  const initials = useMemo(() => {
    const text = (userData.name || 'U').trim()
    if (!text) return 'U'
    const parts = text.split(' ').filter(Boolean)
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U'
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
  }, [userData.name])

  const joinedLabel = useMemo(() => {
    return 'Member'
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !userData.userId) return

    try {
      const formData = new FormData()
      formData.append('userId', userData.userId)
      formData.append('image', file)

      const res = await fetch(`${BASE_URL}/api/v1.0/add-profile-image`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        toast.error('Image upload not allowed')
        return
      }

      let data = null
      try {
        data = await res.json()
      } catch {}

      if (data?.imageUrl) {
        setUserData((prev) => ({ ...prev, avatar: data.imageUrl }))
      }

      toast.success('Profile image updated')
    } catch {
      toast.error('Image upload failed')
    }
  }

  const handleRemovePhoto = () => {
    setUserData((prev) => ({ ...prev, avatar: '' }))
  }

  const handleSave = () => {
    localStorage.setItem(
      'user',
      JSON.stringify({
        userId: userData.userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
      })
    )

    toast.success('Profile updated')
    setEditMode(false)
  }

  const handleCancel = () => {
    if (backup) setUserData(backup)
    setEditMode(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    toast.success('Logout successfully')
    navigate('/home')
  }

  return (
    <div className='min-h-screen bg-[#f8fafc] text-slate-900 animate-[fadeIn_.35s_ease]'>
      <Navbar />

      <section className='relative overflow-hidden border-b border-slate-200 bg-white'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.06),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_30%)]' />

        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10'>
          <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8'>
            <div className='max-w-2xl'>
              <span className='inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600'>
                My Profile
              </span>

              <h1 className='mt-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight'>
                Manage your profile and personal details
              </h1>

              <p className='mt-4 text-sm sm:text-base md:text-lg text-slate-500 leading-7 max-w-xl'>
                View your account information, update your phone number and
                profile photo, and keep your booking experience smooth and
                personalized.
              </p>
            </div>

            <div className='flex flex-wrap gap-3'>
              <button
                onClick={() => navigate('/home')}
                className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50'
              >
                <FiHome />
                Home
              </button>

              <button
                onClick={() => navigate('/bookings')}
                className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50'
              >
                My Bookings
                <FiArrowRight />
              </button>

              <button
                onClick={handleLogout}
                className='inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]'
              >
                <FiLogOut />
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10'>
        <div className='grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-6 xl:gap-8'>
          <aside className='xl:sticky xl:top-24 h-fit'>
            <div className='overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)]'>
              <div className='relative h-28 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700' />

              <div className='relative px-6 pb-6'>
                <div className='-mt-14 flex flex-col items-center text-center'>
                  <div className='relative'>
                    <div className='h-28 w-28 rounded-full border-4 border-white bg-slate-100 shadow-lg overflow-hidden flex items-center justify-center'>
                      {userData.avatar ? (
                        <img
                          src={userData.avatar}
                          alt='profile'
                          className='h-full w-full object-cover'
                        />
                      ) : (
                        <span className='text-3xl font-bold text-slate-700'>
                          {initials}
                        </span>
                      )}
                    </div>

                    {editMode && (
                      <label className='absolute -bottom-1 -right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition hover:bg-slate-800'>
                        <FaCamera className='text-sm' />
                        <input
                          type='file'
                          accept='image/*'
                          hidden
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>

                  <h2 className='mt-4 text-xl font-semibold text-slate-900'>
                    {userData.name || 'Your Name'}
                  </h2>

                  <p className='mt-1 text-sm text-slate-500 break-all'>
                    {userData.email || 'your@email.com'}
                  </p>

                  <div className='mt-4 flex flex-wrap justify-center gap-2'>
                    <span className='rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700'>
                      {joinedLabel}
                    </span>
                    {userData.phone && (
                      <span className='rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700'>
                        +91 {userData.phone}
                      </span>
                    )}
                  </div>
                </div>

                {editMode && userData.avatar && (
                  <button
                    onClick={handleRemovePhoto}
                    className='mt-5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50'
                  >
                    Remove current photo
                  </button>
                )}

                <div className='mt-6 grid grid-cols-2 gap-3'>
                  <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left'>
                    <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>
                      Status
                    </p>
                    <p className='mt-2 text-sm font-semibold text-slate-900'>
                      Active
                    </p>
                  </div>

                  <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left'>
                    <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>
                      Account
                    </p>
                    <p className='mt-2 text-sm font-semibold text-slate-900'>
                      Customer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className='min-w-0 space-y-6'>
            <div className='rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 md:p-8 shadow-[0_8px_24px_rgba(15,23,42,0.05)]'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div>
                  <h3 className='text-xl sm:text-2xl font-semibold text-slate-900'>
                    Personal Information
                  </h3>
                  <p className='mt-1 text-sm sm:text-base text-slate-500'>
                    Update the information linked to your account.
                  </p>
                </div>

                {!editMode ? (
                  <button
                    onClick={() => {
                      setBackup({ ...userData })
                      setEditMode(true)
                    }}
                    className='inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]'
                  >
                    <FiEdit3 />
                    Edit Profile
                  </button>
                ) : (
                  <div className='flex flex-wrap gap-3'>
                    <button
                      onClick={handleSave}
                      className='rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]'
                    >
                      Save Changes
                    </button>

                    <button
                      onClick={handleCancel}
                      className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                    >
                      <FiX />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className='mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6'>
                <Input
                  label='Username'
                  icon={<FaUser />}
                  name='name'
                  value={userData.name}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder='Enter your full name'
                />

                <Input
                  label='Email Address'
                  icon={<FaEnvelope />}
                  value={userData.email}
                  disabled
                  placeholder='Email address'
                />

                <Input
                  label='Phone Number'
                  icon={<FaPhone />}
                  name='phone'
                  value={userData.phone}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder='Enter phone number'
                />

                <Input
                  label='Password'
                  icon={<FaLock />}
                  type='password'
                  value='********'
                  disabled
                  placeholder='Password'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
              <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]'>
                <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700'>
                  <FaUser />
                </div>
                <h4 className='mt-4 text-lg font-semibold text-slate-900'>
                  Profile Details
                </h4>
                <p className='mt-2 text-sm leading-6 text-slate-500'>
                  Keep your personal information updated for a better booking
                  experience.
                </p>
              </div>

              <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]'>
                <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700'>
                  <FaCamera />
                </div>
                <h4 className='mt-4 text-lg font-semibold text-slate-900'>
                  Profile Photo
                </h4>
                <p className='mt-2 text-sm leading-6 text-slate-500'>
                  Add a nice profile image so your account feels more personal
                  and complete.
                </p>
              </div>

              <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]'>
                <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700'>
                  <FiArrowRight />
                </div>
                <h4 className='mt-4 text-lg font-semibold text-slate-900'>
                  Quick Access
                </h4>
                <p className='mt-2 text-sm leading-6 text-slate-500'>
                  Move quickly to your bookings or return to the homepage from
                  here.
                </p>
              </div>
            </div>
          </main>
        </div>
      </section>

      <footer className='mt-14 border-t border-slate-200 bg-white'>
        <div className='max-w-[1600px] mx-auto px-6 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='h-8 w-8 rounded-xl bg-slate-900' />
            <span className='font-semibold text-slate-900'>SlotMyStyle</span>
          </div>

          <p className='text-sm text-slate-500 text-center'>
            © 2025 SlotMyStyle Inc. All rights reserved.
          </p>

          <div className='flex gap-6 text-sm text-slate-500'>
            <a href='#' className='transition hover:text-slate-900'>
              Terms
            </a>
            <a href='#' className='transition hover:text-slate-900'>
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Input({ label, icon, disabled, ...props }) {
  return (
    <div>
      <label className='text-sm font-medium text-slate-700'>{label}</label>

      <div
        className={`mt-2 flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
          disabled
            ? 'border-slate-200 bg-slate-50'
            : 'border-slate-200 bg-white focus-within:border-slate-300 focus-within:shadow-[0_0_0_4px_rgba(15,23,42,0.04)]'
        }`}
      >
        <span className='text-slate-400'>{icon}</span>

        <input
          {...props}
          disabled={disabled}
          className='flex-1 bg-transparent text-sm sm:text-base text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed'
        />
      </div>
    </div>
  )
}