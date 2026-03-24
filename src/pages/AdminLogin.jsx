import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
  FiArrowRight,
} from 'react-icons/fi'
import toast from 'react-hot-toast'

const BASE_URL = 'https://render-qs89.onrender.com'

export default function AdminLogin() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.body.style.background = '#f8fafc'
    return () => {
      document.body.style.background = ''
    }
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const validateForm = () => {
    if (!form.email.trim()) {
      toast.error('Admin email is required')
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('Enter a valid email')
      return false
    }

    if (!form.password.trim()) {
      toast.error('Password is required')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || 'Login failed')
      }

      if (!data?.role || data.role.toUpperCase() !== 'ADMIN') {
        throw new Error('Access denied. Admin account required.')
      }

      localStorage.setItem('user', JSON.stringify(data))
      toast.success('Admin login successful')
      navigate('/admin/dashboard')
    } catch (error) {
      toast.error(error.message || 'Admin login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-[#f8fafc] relative overflow-hidden flex items-center justify-center px-4'>
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute top-[-80px] left-[-60px] h-72 w-72 rounded-full bg-slate-200/50 blur-3xl animate-pulse' />
        <div className='absolute bottom-[-100px] right-[-60px] h-80 w-80 rounded-full bg-blue-100/40 blur-3xl animate-pulse' />
      </div>

      <div className='relative w-full max-w-md animate-[fadeInScale_.45s_ease]'>
        <div className='rounded-[30px] border border-slate-200 bg-white/90 backdrop-blur-md shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-6 sm:p-8'>
          <div className='flex flex-col items-center text-center mb-8'>
            <div className='h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-md'>
              <FiShield className='text-2xl' />
            </div>

            <h1 className='mt-4 text-3xl font-bold tracking-tight text-slate-900'>
              Admin Login
            </h1>

            <p className='mt-2 text-sm text-slate-500'>
              Secure access to dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <label className='block mb-2 text-sm font-medium text-slate-700'>
                Email
              </label>
              <div className='relative'>
                <FiMail className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg' />
                <input
                  type='email'
                  name='email'
                  value={form.email}
                  onChange={handleChange}
                  placeholder='Enter admin email'
                  className='w-full h-13 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-800 outline-none transition-all duration-300 focus:bg-white focus:border-slate-300 focus:shadow-[0_0_0_4px_rgba(15,23,42,0.04)]'
                />
              </div>
            </div>

            <div>
              <div className='flex items-center justify-between mb-2'>
                <label className='text-sm font-medium text-slate-700'>
                  Password
                </label>
                <button
                  type='button'
                  onClick={() => navigate('/forgot-password')}
                  className='text-xs font-medium text-slate-500 hover:text-slate-900 transition'
                >
                  Forgot Password?
                </button>
              </div>

              <div className='relative'>
                <FiLock className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg' />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={form.password}
                  onChange={handleChange}
                  placeholder='Enter password'
                  className='w-full h-13 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm text-slate-800 outline-none transition-all duration-300 focus:bg-white focus:border-slate-300 focus:shadow-[0_0_0_4px_rgba(15,23,42,0.04)]'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((prev) => !prev)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition'
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <label className='inline-flex items-center gap-2 cursor-pointer text-sm text-slate-600'>
              <input
                type='checkbox'
                name='remember'
                checked={form.remember}
                onChange={handleChange}
                className='h-4 w-4 rounded border-slate-300 accent-black'
              />
              Remember me
            </label>

            <button
              type='submit'
              disabled={loading}
              className={`group inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-white transition-all duration-300 ${
                loading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 hover:-translate-y-0.5 shadow-sm hover:shadow-lg'
              }`}
            >
              {loading ? 'Signing in...' : 'Login'}
              {!loading && (
                <FiArrowRight className='transition-transform duration-300 group-hover:translate-x-0.5' />
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.97) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}