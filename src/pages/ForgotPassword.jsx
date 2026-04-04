import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../axiosConfig'
import { toast } from 'sonner'
import { FiArrowLeft, FiLock, FiMail, FiShield } from 'react-icons/fi'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const getErrorMessage = (err, fallback = 'Failed to send OTP') => {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      (typeof err?.response?.data === 'string' ? err.response.data : null) ||
      err?.message ||
      fallback
    )
  }

  const handleForgot = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email')
      return
    }

    try {
      setLoading(true)
      await api.post('/forgot-password', { email })
      toast.success('Reset OTP sent to your email!')
      navigate('/reset-otp', { state: { email } })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to send OTP'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative min-h-screen overflow-hidden bg-[#f8fafc]'>
      <div className='absolute inset-0'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.05),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.10),transparent_30%),linear-gradient(to_bottom_right,#ffffff,#f8fafc,#eef2ff)]' />
        <div className='absolute top-[-120px] left-[-120px] h-[320px] w-[320px] rounded-full bg-black/5 blur-3xl animate-pulse' />
        <div className='absolute bottom-[-140px] right-[-100px] h-[360px] w-[360px] rounded-full bg-indigo-300/20 blur-3xl animate-pulse' />
      </div>

      <div className='relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8'>
        <div className='w-full max-w-xl overflow-hidden rounded-[32px] border border-white/60 bg-white/70 shadow-[0_30px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl'>
          <div className='p-6 sm:p-8 md:p-10'>
            <button
              onClick={() => navigate('/login')}
              className='mb-8 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900'
            >
              <FiArrowLeft />
              Back to login
            </button>

            <h2 className='mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl'>
              Forgot your
              <br />
              password?
            </h2>

            <p className='mt-4 text-sm leading-7 text-slate-500 sm:text-[15px]'>
              Enter your registered email address and we’ll send you a reset OTP
              to continue.
            </p>

            <div className='mt-8'>
              <label className='mb-2 block text-sm font-semibold text-slate-700'>
                Email address
              </label>

              <div className='group flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition-all duration-300 hover:border-slate-300 focus-within:border-slate-900 focus-within:shadow-[0_0_0_4px_rgba(15,23,42,0.06)]'>
                <FiMail className='text-slate-400 transition-colors duration-300 group-focus-within:text-slate-900' />
                <input
                  type='email'
                  placeholder='Enter your email'
                  className='h-full w-full bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleForgot()}
                />
              </div>
            </div>

            <div className='mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4'>
              <div className='flex items-start gap-3'>
                <div className='mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm'>
                  <FiLock />
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-slate-800'>
                    Password reset flow
                  </h3>
                  <p className='mt-1 text-sm leading-6 text-slate-500'>
                    We’ll send a 6-digit OTP to your email. After verification,
                    you can set a new password.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleForgot}
              disabled={loading || !email.trim()}
              className='mt-8 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>

            <p className='mt-5 text-center text-sm text-slate-500'>
              Remember password?{' '}
              <button
                onClick={() => navigate('/login')}
                className='font-semibold text-slate-900 underline-offset-4 transition hover:underline'
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px white inset !important;
          -webkit-text-fill-color: #0f172a !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  )
}