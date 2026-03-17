import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api'
import getErrorMessage from '../utils/getErrorMessage'
import {
  FiMail,
  FiLock,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiShield,
  FiCheckCircle,
  FiScissors,
  FiSettings,
  FiHome,
  FiLayers,
  FiUsers,
} from 'react-icons/fi'

export default function AdminLogin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const isFormValid = email.trim() !== '' && password.trim() !== ''

  const handleAdminLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill all fields')
      return
    }

    try {
      setLoading(true)

      const res = await api.post('/admin/login', {
        email,
        password,
      })

      localStorage.setItem(
        'admin',
        JSON.stringify({
          adminId: res.data.adminId || res.data.userId || '',
          name: res.data.name || 'Admin',
          email: res.data.email || email,
          role: res.data.role || 'ADMIN',
          token: res.data.token || '',
        })
      )

      toast.success('Admin login successful!')
      navigate('/admin/dashboard')
    } catch (error) {
      const msg = getErrorMessage(error, 'Admin login failed!')
      toast.dismiss()
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative min-h-screen overflow-hidden bg-[#edf2ff]'>
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.14),transparent_30%),linear-gradient(135deg,#f8fbff_0%,#eef2ff_45%,#e0e7ff_100%)]' />

        <div className='absolute -top-24 -left-20 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl animate-floatSlow' />
        <div className='absolute top-[12%] right-[8%] h-80 w-80 rounded-full bg-slate-900/10 blur-3xl animate-floatMedium' />
        <div className='absolute bottom-[-90px] left-[10%] h-64 w-64 rounded-full bg-violet-300/20 blur-3xl animate-floatSlow' />
        <div className='absolute bottom-[-60px] right-[-40px] h-72 w-72 rounded-full bg-blue-300/20 blur-3xl animate-floatMedium' />

        <div className='absolute top-[20%] left-[18%] h-28 w-28 rounded-full border border-white/50 bg-white/20 backdrop-blur-2xl animate-pulse' />
        <div className='absolute bottom-[18%] right-[18%] h-24 w-24 rounded-full border border-white/40 bg-white/10 backdrop-blur-2xl animate-pulse' />
      </div>

      <div className='relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8'>
        <div className='hidden w-full max-w-7xl grid-cols-2 gap-6 lg:grid'>
          <div className='animate-slideUp'>
            <div className='h-full rounded-[34px] border border-white/60 bg-white/70 p-8 shadow-[0_30px_80px_rgba(30,41,59,0.12)] backdrop-blur-2xl xl:p-10'>
              <div className='mx-auto flex h-full max-w-lg flex-col'>
                <div className='flex items-center justify-between'>
                  <button
                    onClick={() => navigate('/')}
                    className='group inline-flex items-center gap-3 text-left'
                  >
                    <div className='relative flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-[0_16px_30px_rgba(15,23,42,0.25)] transition duration-300 group-hover:scale-105 group-hover:rotate-3'>
                      <FiScissors className='text-lg' />
                      <div className='absolute inset-0 rounded-[20px] ring-1 ring-white/10' />
                    </div>

                    <div>
                      <h1 className='text-[28px] font-extrabold tracking-tight text-slate-900'>
                        SlotMyStyle
                      </h1>
                      <p className='text-xs font-medium tracking-wide text-slate-500'>
                        ADMIN CONTROL PORTAL
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/')}
                    className='inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:text-slate-900'
                  >
                    <FiHome size={15} />
                    Back to site
                  </button>
                </div>

                <div className='mt-12'>
                  <div className='inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm'>
                    <FiShield />
                    Secure admin-only access
                  </div>

                  <h2 className='mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900'>
                    Welcome back,
                    <br />
                    <span className='bg-gradient-to-r from-slate-900 via-indigo-700 to-violet-600 bg-clip-text text-transparent'>
                      Admin
                    </span>
                  </h2>

                  <p className='mt-5 max-w-md text-[15px] leading-7 text-slate-500'>
                    Sign in to control approvals, owners, salon operations,
                    categories, records, and overall platform management from a
                    secure dashboard.
                  </p>
                </div>

                <div className='mt-10 space-y-5'>
                  <div>
                    <label className='mb-2.5 block text-sm font-semibold text-slate-700'>
                      Admin email
                    </label>
                    <div className='group flex h-14 items-center rounded-[20px] border border-slate-200 bg-white/80 px-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition-all duration-300 hover:border-indigo-200 focus-within:-translate-y-0.5 focus-within:border-indigo-400 focus-within:shadow-[0_0_0_5px_rgba(99,102,241,0.10)]'>
                      <FiMail className='text-slate-400 transition-colors duration-300 group-focus-within:text-indigo-600' />
                      <input
                        type='email'
                        placeholder='Enter admin email'
                        autoComplete='email'
                        className='h-full w-full bg-transparent px-3 text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === 'Enter' && handleAdminLogin()
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className='mb-2.5 block text-sm font-semibold text-slate-700'>
                      Password
                    </label>

                    <div className='group flex h-14 items-center rounded-[20px] border border-slate-200 bg-white/80 px-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition-all duration-300 hover:border-indigo-200 focus-within:-translate-y-0.5 focus-within:border-indigo-400 focus-within:shadow-[0_0_0_5px_rgba(99,102,241,0.10)]'>
                      <FiLock className='text-slate-400 transition-colors duration-300 group-focus-within:text-indigo-600' />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Enter password'
                        autoComplete='current-password'
                        className='h-full w-full bg-transparent px-3 text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === 'Enter' && handleAdminLogin()
                        }
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword((prev) => !prev)}
                        className='rounded-full p-1 text-slate-400 transition duration-300 hover:bg-slate-100 hover:text-slate-800'
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAdminLogin}
                    disabled={loading || !isFormValid}
                    className='group relative inline-flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-[20px] bg-gradient-to-r from-slate-950 via-indigo-900 to-slate-900 px-6 text-sm font-bold text-white shadow-[0_18px_40px_rgba(15,23,42,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.32)] disabled:cursor-not-allowed disabled:opacity-70'
                  >
                    <span className='absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.15),transparent)] translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-1000' />
                    {loading ? (
                      <>
                        <span className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Admin Log in
                        <FiArrowRight className='transition-transform duration-300 group-hover:translate-x-1' />
                      </>
                    )}
                  </button>

                  <div className='grid gap-4 pt-1 sm:grid-cols-2'>
                    <div className='rounded-[20px] border border-emerald-100 bg-emerald-50/90 p-4 shadow-sm'>
                      <div className='flex items-start gap-3'>
                        <div className='mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm'>
                          <FiCheckCircle />
                        </div>
                        <div>
                          <h4 className='text-sm font-bold text-slate-800'>
                            Protected workflow
                          </h4>
                          <p className='mt-1 text-xs leading-6 text-slate-600'>
                            Admin actions should be validated by backend role
                            checks and secure token verification.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='rounded-[20px] border border-amber-100 bg-amber-50/90 p-4 shadow-sm'>
                      <div className='flex items-start gap-3'>
                        <div className='mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm'>
                          <FiShield />
                        </div>
                        <div>
                          <h4 className='text-sm font-bold text-slate-800'>
                            Restricted portal
                          </h4>
                          <p className='mt-1 text-xs leading-6 text-slate-600'>
                            Only authorized administrators should be allowed to
                            log in to this control panel.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className='pt-1 text-xs leading-6 text-slate-400'>
                    Make sure your backend returns success only when the user has
                    valid <span className='font-semibold text-slate-600'>ADMIN</span> role access.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='animate-slideUp delay-150'>
            <div className='relative h-full overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,#020617_0%,#0f172a_35%,#1e1b4b_100%)] p-8 shadow-[0_35px_90px_rgba(15,23,42,0.28)] xl:p-10'>
              <div className='absolute inset-0'>
                <div className='absolute left-[-50px] top-[-30px] h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl animate-floatSlow' />
                <div className='absolute bottom-[-40px] right-[-30px] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl animate-floatMedium' />
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_22%),radial-gradient(circle_at_78%_70%,rgba(99,102,241,0.26),transparent_25%)]' />
              </div>

              <div className='relative z-10 flex h-full flex-col'>
                <div>
                  <div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-slate-200 backdrop-blur-md'>
                    <FiLayers />
                    ADMIN EXPERIENCE
                  </div>

                  <h3 className='mt-6 max-w-xl text-[42px] font-extrabold leading-[1.12] tracking-tight text-white xl:text-[48px]'>
                    Control the entire salon platform with a secure and premium admin panel
                  </h3>

                  <p className='mt-5 max-w-lg text-[15px] leading-7 text-slate-300'>
                    Review owner requests, manage salon records, control service
                    categories, and keep platform operations streamlined from one
                    intelligent admin workspace.
                  </p>
                </div>

                <div className='mt-10 grid gap-4'>
                  <div className='group rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/15'>
                    <div className='flex items-start gap-4'>
                      <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-lg transition duration-300 group-hover:scale-105'>
                        <FiShield size={22} />
                      </div>
                      <div>
                        <h4 className='text-lg font-bold text-white'>
                          Role-protected sign in
                        </h4>
                        <p className='mt-2 text-sm leading-7 text-slate-300'>
                          Only verified admin accounts should be granted access
                          to the control portal and sensitive platform actions.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='group rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/15'>
                    <div className='flex items-start gap-4'>
                      <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-lg transition duration-300 group-hover:scale-105'>
                        <FiSettings size={22} />
                      </div>
                      <div>
                        <h4 className='text-lg font-bold text-white'>
                          Operational control
                        </h4>
                        <p className='mt-2 text-sm leading-7 text-slate-300'>
                          Manage salon approvals, owners, categories, services,
                          moderation, status controls, and admin workflows.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='group rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/15'>
                    <div className='flex items-start gap-4'>
                      <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-lg transition duration-300 group-hover:scale-105'>
                        <FiUsers size={22} />
                      </div>
                      <div>
                        <h4 className='text-lg font-bold text-white'>
                          Centralized management
                        </h4>
                        <p className='mt-2 text-sm leading-7 text-slate-300'>
                          Handle all three panels from one place: User, Owner,
                          and Admin with a cleaner management flow.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='mt-auto pt-8'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-md'>
                      <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>
                        Access
                      </p>
                      <h5 className='mt-3 text-3xl font-extrabold text-white'>
                        Admin
                      </h5>
                      <p className='mt-2 text-sm text-slate-300'>Secure portal</p>
                    </div>

                    <div className='rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-md'>
                      <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>
                        Scope
                      </p>
                      <h5 className='mt-3 text-3xl font-extrabold text-white'>
                        3 Panels
                      </h5>
                      <p className='mt-2 text-sm text-slate-300'>User • Owner • Admin</p>
                    </div>
                  </div>

                  <div className='mt-4 rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),rgba(99,102,241,0.16))] p-5 backdrop-blur-md'>
                    <p className='text-sm leading-7 text-slate-200'>
                      Keep admin access isolated from the public flow. Use a
                      dedicated route like{' '}
                      <span className='rounded-lg bg-white/10 px-2.5 py-1 font-bold text-white'>
                        /admin/login
                      </span>{' '}
                      and protect admin dashboard routes after successful login.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='w-full max-w-xl lg:hidden animate-slideUp'>
          <div className='overflow-hidden rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:p-7'>
            <div className='flex items-start justify-between gap-4'>
              <button
                onClick={() => navigate('/')}
                className='group inline-flex items-center gap-3 text-left'
              >
                <div className='flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-lg transition duration-300 group-hover:scale-105'>
                  <FiScissors className='text-base' />
                </div>
                <div>
                  <h1 className='text-2xl font-extrabold tracking-tight text-slate-900'>
                    SlotMyStyle
                  </h1>
                  <p className='text-[11px] font-medium tracking-wide text-slate-500'>
                    ADMIN CONTROL PORTAL
                  </p>
                </div>
              </button>

              <button
                onClick={() => navigate('/')}
                className='shrink-0 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm'
              >
                Back
              </button>
            </div>

            <div className='mt-10'>
              <div className='inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700'>
                <FiShield />
                Secure admin-only access
              </div>

              <h2 className='mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900'>
                Welcome back,
                <br />
                <span className='bg-gradient-to-r from-slate-900 via-indigo-700 to-violet-600 bg-clip-text text-transparent'>
                  Admin
                </span>
              </h2>

              <p className='mt-4 text-[15px] leading-7 text-slate-500'>
                Sign in to access the admin dashboard and control platform
                operations securely.
              </p>
            </div>

            <div className='mt-8 space-y-5'>
              <div>
                <label className='mb-2.5 block text-sm font-semibold text-slate-700'>
                  Admin email
                </label>
                <div className='group flex h-14 items-center rounded-[20px] border border-slate-200 bg-white px-4 shadow-sm transition-all duration-300 focus-within:border-indigo-400 focus-within:shadow-[0_0_0_5px_rgba(99,102,241,0.10)]'>
                  <FiMail className='text-slate-400 group-focus-within:text-indigo-600' />
                  <input
                    type='email'
                    placeholder='Enter admin email'
                    autoComplete='email'
                    className='h-full w-full bg-transparent px-3 text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                  />
                </div>
              </div>

              <div>
                <label className='mb-2.5 block text-sm font-semibold text-slate-700'>
                  Password
                </label>
                <div className='group flex h-14 items-center rounded-[20px] border border-slate-200 bg-white px-4 shadow-sm transition-all duration-300 focus-within:border-indigo-400 focus-within:shadow-[0_0_0_5px_rgba(99,102,241,0.10)]'>
                  <FiLock className='text-slate-400 group-focus-within:text-indigo-600' />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter password'
                    autoComplete='current-password'
                    className='h-full w-full bg-transparent px-3 text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
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

              <button
                onClick={handleAdminLogin}
                disabled={loading || !isFormValid}
                className='inline-flex h-14 w-full items-center justify-center gap-3 rounded-[20px] bg-gradient-to-r from-slate-950 via-indigo-900 to-slate-900 px-6 text-sm font-bold text-white shadow-[0_16px_40px_rgba(15,23,42,0.24)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70'
              >
                {loading ? (
                  <>
                    <span className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                    Signing in...
                  </>
                ) : (
                  <>
                    Admin Log in
                    <FiArrowRight />
                  </>
                )}
              </button>

              <div className='rounded-[20px] border border-amber-100 bg-amber-50/90 p-4'>
                <p className='text-xs leading-6 text-amber-700'>
                  Only authorized admin credentials should be accepted here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatSlow {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-18px) translateX(10px);
          }
        }

        @keyframes floatMedium {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(14px) translateX(-12px);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease both;
        }

        .animate-floatSlow {
          animation: floatSlow 8s ease-in-out infinite;
        }

        .animate-floatMedium {
          animation: floatMedium 10s ease-in-out infinite;
        }

        .delay-150 {
          animation-delay: 0.15s;
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