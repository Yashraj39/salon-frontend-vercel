import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { toast } from 'sonner'
import {
  FiMail,
  FiLock,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiShield,
  FiClock,
  FiScissors,
} from 'react-icons/fi'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please fill all fields')
      return
    }

    try {
      setLoading(true)

      const res = await api.post('/login', { email, password })

      localStorage.setItem(
        'user',
        JSON.stringify({
          userId: res.data.userId || '',
          name: res.data.name || '',
          email: res.data.email || '',
          isAccountVerified: res.data.isAccountVerified || false,
        })
      )

      toast.success('Login successful!')
      navigate('/')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed!')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className='relative min-h-screen overflow-hidden bg-[#f8fafc]'>
      {/* BACKGROUND */}
      <div className='absolute inset-0'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.05),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.10),transparent_30%),linear-gradient(to_bottom_right,#ffffff,#f8fafc,#eef2ff)]' />
        <div className='absolute top-[-120px] left-[-120px] h-[320px] w-[320px] rounded-full bg-black/5 blur-3xl animate-pulse' />
        <div className='absolute bottom-[-140px] right-[-100px] h-[360px] w-[360px] rounded-full bg-indigo-300/20 blur-3xl animate-pulse' />
        <div className='absolute top-[20%] right-[8%] h-40 w-40 rounded-full border border-white/40 bg-white/20 blur-2xl' />
      </div>

      {/* MAIN */}
      <div className='relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8 py-6'>
        <div className='grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-[32px] border border-white/60 bg-white/55 shadow-[0_30px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:grid-cols-2'>
          {/* LEFT PANEL */}
          <div className='relative flex justify-center p-6 sm:p-7 lg:p-7'>
            <div className='w-full max-w-md pt-2 sm:pt-3 animate-[fadeUp_.7s_ease]'>
  <button
    onClick={() => navigate('/')}
    className='group mb-8 inline-flex items-center gap-3 text-left'
  >
    <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white shadow-lg shadow-black/10 transition-transform duration-300 group-hover:scale-105'>
      <FiScissors className='text-base' />
    </div>
    <div>
      <h1 className='text-lg font-bold tracking-tight text-slate-900 md:mt-4'>
        SlotMyStyle
      </h1>
      <p className='text-[11px] text-slate-500'>
        Smart salon booking platform
      </p>
    </div>
  </button>

  <div className='mb-8'>

                <h2 className='text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight mt-0 sm:mt-10 md:mt-14'>
                  Welcome
                  <br />
                  back
                </h2>

                <p className='mt-4 text-sm sm:text-base leading-7 text-slate-500 max-w-sm'>
                  Sign in to manage bookings, track appointments, and deliver a
                  seamless salon experience.
                </p>
              </div>

              <div className='space-y-5' onKeyDown={handleKeyDown}>
                <div>
                  <label className='mb-2 block text-sm font-semibold text-slate-700'>
                    Email address
                  </label>
                  <div className='group flex h-12 items-center rounded-2xl border border-slate-200 bg-white/90 px-4 shadow-sm transition-all duration-300 hover:border-slate-300 focus-within:border-slate-900 focus-within:shadow-[0_0_0_4px_rgba(15,23,42,0.06)]'>
                    <FiMail className='text-slate-400 transition-colors duration-300 group-focus-within:text-slate-900' />
                    <input
                      type='email'
                      placeholder='Enter your email'
                      className='h-full w-full bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className='mb-2 flex items-center justify-between'>
                    <label className='block text-sm font-semibold text-slate-700'>
                      Password
                    </label>

                    <button
                      type='button'
                      onClick={() => navigate('/forgot-password')}
                      className='text-xs sm:text-sm font-medium text-slate-500 underline-offset-4 transition hover:text-slate-900 hover:underline'
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className='group flex h-12 items-center rounded-2xl border border-slate-200 bg-white/90 px-4 shadow-sm transition-all duration-300 hover:border-slate-300 focus-within:border-slate-900 focus-within:shadow-[0_0_0_4px_rgba(15,23,42,0.06)]'>
                    <FiLock className='text-slate-400 transition-colors duration-300 group-focus-within:text-slate-900' />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Enter your password'
                      className='h-full w-full bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword((prev) => !prev)}
                      className='text-slate-400 transition hover:text-slate-800'
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className='pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className='group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-black active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70'
                  >
                    {loading ? 'Logging in...' : 'Log in'}
                    {!loading && (
                      <FiArrowRight className='transition-transform duration-300 group-hover:translate-x-1' />
                    )}
                  </button>

                  <button
                    onClick={() => navigate('/register')}
                    className='inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-900 hover:text-slate-900'
                  >
                    Create account
                  </button>
                </div>

                <div className='pt-4'>
                  <p className='text-xs leading-6 text-slate-400'>
                    By continuing, you keep your credentials secure and access
                    your account safely.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className='relative hidden lg:flex min-h-[520px] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#1e293b_100%)] p-6'>
            <div className='absolute inset-0'>
              <div className='absolute top-8 left-10 h-36 w-36 rounded-full bg-white/10 blur-3xl' />
              <div className='absolute bottom-10 right-10 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl' />
              <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_25%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.15),transparent_25%)]' />
            </div>

            <div className='relative z-10 flex w-full max-w-xl flex-col justify-between rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md animate-[fadeRight_.9s_ease]'>
              <div>

                <h3 className='max-w-md text-4xl font-bold leading-tight tracking-tight text-white'>
                  Modern salon management made beautifully simple
                </h3>
              </div>

              <div className='my-10 grid gap-4'>
                <div className='rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-md transition duration-300 hover:bg-white/15'>
                  <div className='flex items-start gap-4'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-lg'>
                      <FiShield size={20} />
                    </div>
                    <div>
                      <h4 className='text-base font-semibold text-white'>
                        Secure user access
                      </h4>
                      <p className='mt-1 text-sm leading-6 text-slate-300'>
                        Protected sign-in experience with smooth and reliable
                        account access.
                      </p>
                    </div>
                  </div>
                </div>

                <div className='rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-md transition duration-300 hover:bg-white/15'>
                  <div className='flex items-start gap-4'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-lg'>
                      <FiClock size={20} />
                    </div>
                    <div>
                      <h4 className='text-base font-semibold text-white'>
                        Fast booking workflow
                      </h4>
                      <p className='mt-1 text-sm leading-6 text-slate-300'>
                        Designed for speed so users can get from login to
                        appointment booking in seconds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='relative overflow-hidden rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur-md'>
                <div className='absolute -right-10 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl' />
                <img
                  src='/Hero.png'
                  alt='login visual'
                  className='mx-auto w-full max-w-[240px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)] transition duration-500 hover:scale-[1.03]'
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeRight {
          from {
            opacity: 0;
            transform: translateX(28px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}