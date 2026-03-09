import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../axiosConfig'
import toast from 'react-hot-toast'
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiMail,
  FiRefreshCw,
} from 'react-icons/fi'

export default function OTPVerify() {
  const [otp, setOtp] = useState(new Array(6).fill(''))
  const [countdown, setCountdown] = useState(30)
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)

  const inputRefs = useRef([])
  const hasAutoSubmitted = useRef(false)

  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email

  useEffect(() => {
    if (!email) {
      toast.error('Email not found. Please register again.')
      navigate('/register')
    }
  }, [email, navigate])

  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  const getErrorMessage = (err, fallback = 'Something went wrong') => {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      (typeof err?.response?.data === 'string' ? err.response.data : null) ||
      err?.message ||
      fallback
    )
  }

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return

    const digit = value.slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
        return
      }

      if (index > 0) {
        inputRefs.current[index - 1]?.focus()
        const newOtp = [...otp]
        newOtp[index - 1] = ''
        setOtp(newOtp)
      }
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)

    if (!pasted) return

    const newOtp = new Array(6).fill('')
    pasted.split('').forEach((char, i) => {
      newOtp[i] = char
    })

    setOtp(newOtp)

    const nextIndex = Math.min(pasted.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const verifyOTP = async (otpValue) => {
    if (!email || otpValue.length !== 6 || verifying) return

    try {
      setVerifying(true)
      await api.post('/verify-otp', { email, otp: otpValue })
      toast.success('OTP verified successfully!')
      navigate('/login')
    } catch (err) {
      hasAutoSubmitted.current = false
      toast.error(getErrorMessage(err, 'Invalid OTP'))
    } finally {
      setVerifying(false)
    }
  }

  useEffect(() => {
    const otpValue = otp.join('')

    if (otpValue.length === 6 && !otp.includes('') && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true
      verifyOTP(otpValue)
    }

    if (otpValue.length < 6) {
      hasAutoSubmitted.current = false
    }
  }, [otp])

  const handleResendOtp = async () => {
    if (!email || countdown > 0 || resending) return

    try {
      setResending(true)
      await api.post('/resend-otp', { email })
      toast.success('OTP resent to your email')
      setOtp(new Array(6).fill(''))
      hasAutoSubmitted.current = false
      setCountdown(30)
      inputRefs.current[0]?.focus()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to resend OTP'))
    } finally {
      setResending(false)
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
              onClick={() => navigate('/register')}
              className='mb-8 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900'
            >
              <FiArrowLeft />
              Back
            </button>

            <div className='mt-2'>
              <div className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600'>
                <FiCheckCircle className='text-slate-500' />
                Email verification
              </div>

              <h2 className='mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl'>
                Verify your
                <br />
                account
              </h2>

              <p className='mt-4 text-sm leading-7 text-slate-500 sm:text-[15px]'>
                We sent a 6-digit verification code to your email address.
                Enter the code below to continue.
              </p>

              <div className='mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
                <div className='mt-0.5 text-slate-500'>
                  <FiMail size={18} />
                </div>
                <div className='min-w-0'>
                  <p className='text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400'>
                    Code sent to
                  </p>
                  <p className='break-all text-sm font-medium text-slate-800'>
                    {email}
                  </p>
                </div>
              </div>
            </div>

            <div className='mt-8'>
              <div className='flex justify-between gap-2 sm:gap-3' onPaste={handlePaste}>
                {otp.map((value, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type='text'
                    inputMode='numeric'
                    autoComplete='one-time-code'
                    maxLength='1'
                    value={value}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={`h-14 w-11 rounded-2xl border-2 bg-white text-center text-lg font-bold text-slate-900 shadow-sm outline-none transition-all duration-300 sm:h-16 sm:w-12 sm:text-xl ${
                      value
                        ? 'border-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.10)]'
                        : 'border-slate-200 focus:border-slate-900 focus:shadow-[0_0_0_4px_rgba(15,23,42,0.06)]'
                    } ${verifying ? 'pointer-events-none opacity-80' : ''}`}
                  />
                ))}
              </div>

              <div className='mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='flex items-center gap-2 text-sm text-slate-600'>
                    {verifying ? (
                      <>
                        <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900' />
                        Verifying OTP...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className='text-slate-400' />
                        Auto verify after 6 digits
                      </>
                    )}
                  </div>

                  <div className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700'>
                    <FiClock />
                    00:{String(Math.max(countdown, 0)).padStart(2, '0')}
                  </div>
                </div>

                <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <p className='text-xs leading-5 text-slate-400'>
                    Didn’t receive the code? You can request a new OTP after 30 seconds.
                  </p>

                  <button
                    type='button'
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || resending}
                    className='inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'
                  >
                    {resending ? (
                      <>
                        <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900' />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiRefreshCw size={15} />
                        Resend OTP
                      </>
                    )}
                  </button>
                </div>
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