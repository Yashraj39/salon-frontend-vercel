import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { toast } from 'sonner'
import getErrorMessage from '../utils/getErrorMessage'
import {
    FiMail,
    FiLock,
    FiArrowRight,
    FiEye,
    FiEyeOff,
    FiShield,
    FiClock,
    FiScissors,
    FiUser,
} from 'react-icons/fi'

export default function AuthPage({ defaultMode = 'login' }) {
    const navigate = useNavigate()
    const [isRegister, setIsRegister] = useState(defaultMode === 'register')

    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [showLoginPassword, setShowLoginPassword] = useState(false)
    const [loginLoading, setLoginLoading] = useState(false)

    const [name, setName] = useState('')
    const [registerEmail, setRegisterEmail] = useState('')
    const [registerPassword, setRegisterPassword] = useState('')
    const [showRegisterPassword, setShowRegisterPassword] = useState(false)
    const [registerLoading, setRegisterLoading] = useState(false)

    const handleLogin = async () => {
        if (!loginEmail.trim() || !loginPassword.trim()) {
            toast.error('Please fill all fields')
            return
        }

        let loadingToastId

        try {
            setLoginLoading(true)
            loadingToastId = toast.loading('Logging in...')

            const res = await api.post('/login', {
                email: loginEmail.trim(),
                password: loginPassword,
            })

            localStorage.setItem(
                'user',
                JSON.stringify({
                    userId: res.data.userId || '',
                    name: res.data.name || '',
                    email: res.data.email || '',
                    role: res.data.role || 'USER',
                    isAccountVerified: res.data.isAccountVerified || false,
                    ownerFrozen: res.data.ownerFrozen || false,
                })
            )

            toast.dismiss(loadingToastId)
            toast.success('Login successful!')

            setTimeout(() => {
                navigate('/')
            }, 800)
        } catch (err) {
            const msg = getErrorMessage(err, 'Login failed!')
            console.log('Login error:', err)
            console.log('Toast message:', msg)
            if (loadingToastId) toast.dismiss(loadingToastId)
            toast.error(msg)
        } finally {
            setLoginLoading(false)
        }
    }

    const handleRegister = async () => {
        if (!name.trim() || !registerEmail.trim() || !registerPassword.trim()) {
            toast.error('Please fill all fields')
            return
        }

        if (!isStrongPassword(registerPassword)) {
            toast.error(
                'Password must be at least 8 characters and include uppercase, lowercase, and one symbol'
            )
            return
        }

        let loadingToastId

        try {
            setRegisterLoading(true)
            loadingToastId = toast.loading('Creating account...')

            await api.post('/register', {
                id: Date.now().toString(),
                name: name.trim(),
                email: registerEmail.trim(),
                password: registerPassword,
            })

            toast.dismiss(loadingToastId)
            toast.success('OTP sent successfully!')

            setTimeout(() => {
                navigate('/otp', { state: { email: registerEmail.trim() } })
            }, 900)
        } catch (error) {
            const msg = getErrorMessage(error, 'Registration failed!')
            console.log('Register error:', error)
            console.log('Toast message:', msg)
            if (loadingToastId) toast.dismiss(loadingToastId)
            toast.error(msg)
        } finally {
            setRegisterLoading(false)
        }
    }

    const isStrongPassword = (password) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/.test(password)
    }

    const isLoginFormValid =
        loginEmail.trim() !== '' &&
        loginPassword.trim() !== ''

    const isRegisterFormValid =
        name.trim() !== '' &&
        registerEmail.trim() !== '' &&
        registerPassword.trim() !== ''

    return (
        <div className='relative min-h-screen overflow-hidden bg-[#f8fafc]'>
            <div className='absolute inset-0'>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.05),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.10),transparent_30%),linear-gradient(to_bottom_right,#ffffff,#f8fafc,#eef2ff)]' />
                <div className='absolute top-[-120px] left-[-120px] h-[320px] w-[320px] rounded-full bg-black/5 blur-3xl animate-pulse' />
                <div className='absolute bottom-[-140px] right-[-100px] h-[360px] w-[360px] rounded-full bg-indigo-300/20 blur-3xl animate-pulse' />
                <div className='absolute top-[20%] right-[8%] h-40 w-40 rounded-full border border-white/40 bg-white/20 blur-2xl' />
            </div>

            <div className='relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8'>
                <div className='relative hidden h-[760px] w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/60 bg-white/55 shadow-[0_30px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:block'>
                    <div
                        className={`absolute inset-y-0 left-0 w-1/2 p-8 transition-transform duration-700 ease-in-out ${isRegister ? 'translate-x-full' : 'translate-x-0'
                            }`}
                    >
                        <div className='flex h-full items-start justify-center rounded-[28px] bg-white px-10 py-8'>
                            <div className='w-full max-w-md'>
                                <button
                                    type='button'
                                    onClick={() => navigate('/')}
                                    className='group inline-flex items-center gap-3 text-left'
                                >
                                    <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-lg shadow-black/10 transition-transform duration-300 group-hover:scale-105 overflow-hidden'>

                                        <img
                                            src='/logo.png'   // put your logo path here
                                            alt='Logo'
                                            className='h-full w-full object-cover'
                                        />

                                    </div>
                                    <div>
                                        <h1 className='text-xl font-bold tracking-tight text-slate-900'>
                                            SlotMyStyle
                                        </h1>
                                        <p className='text-[11px] text-slate-500'>
                                            Smart salon booking platform
                                        </p>
                                    </div>
                                </button>

                                {!isRegister ? (
                                    <>
                                        <div className='mt-14'>
                                            <h2 className='text-4xl font-bold leading-tight tracking-tight text-slate-900'>
                                                Welcome
                                                <br />
                                                back
                                            </h2>

                                            <p className='mt-4 max-w-sm text-[15px] leading-7 text-slate-500'>
                                                Sign in to manage bookings, track appointments, and
                                                deliver a seamless salon experience.
                                            </p>
                                        </div>

                                        <div className='mt-10 space-y-5'>
                                            <div>
                                                <label className='mb-2 block text-sm font-semibold text-slate-700'>
                                                    Email address
                                                </label>
                                                <div className='group flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition-all duration-300 hover:border-slate-300 focus-within:border-slate-900 focus-within:shadow-[0_0_0_4px_rgba(15,23,42,0.06)]'>
                                                    <FiMail className='text-slate-400 transition-colors duration-300 group-focus-within:text-slate-900' />
                                                    <input
                                                        type='email'
                                                        placeholder='Enter your email'
                                                        autoComplete='email'
                                                        className='h-full w-full bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400'
                                                        value={loginEmail}
                                                        onChange={(e) => setLoginEmail(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
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
                                                        className='text-xs font-medium text-slate-500 underline-offset-4 transition hover:text-slate-900 hover:underline'
                                                    >
                                                        Forgot password?
                                                    </button>
                                                </div>

                                                <div className='group flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition-all duration-300 hover:border-slate-300 focus-within:border-slate-900 focus-within:shadow-[0_0_0_4px_rgba(15,23,42,0.06)]'>
                                                    <FiLock className='text-slate-400 transition-colors duration-300 group-focus-within:text-slate-900' />
                                                    <input
                                                        type={showLoginPassword ? 'text' : 'password'}
                                                        placeholder='Enter your password'
                                                        autoComplete='current-password'
                                                        className='h-full w-full bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400'
                                                        value={loginPassword}
                                                        onChange={(e) => setLoginPassword(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                                    />
                                                    <button
                                                        type='button'
                                                        onClick={() => setShowLoginPassword((prev) => !prev)}
                                                        className='text-slate-400 transition hover:text-slate-800'
                                                    >
                                                        {showLoginPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className='grid grid-cols-2 gap-3 pt-2'>
                                                <button
                                                    type='button'
                                                    onClick={() => setIsRegister(true)}
                                                    className='inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-900 hover:text-slate-900'
                                                >
                                                    Create account
                                                </button>
                                                <button
                                                    type='button'
                                                    onClick={handleLogin}
                                                    disabled={loginLoading || !isLoginFormValid}
                                                    className='group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-70'
                                                >
                                                    {loginLoading ? 'Logging in...' : 'Log in'}
                                                    {!loginLoading && (
                                                        <FiArrowRight className='transition-transform duration-300 group-hover:translate-x-1' />
                                                    )}
                                                </button>
                                            </div>

                                            <div className='pt-4'>
                                                <p className='text-xs leading-6 text-slate-400'>
                                                    By continuing, you keep your credentials secure and
                                                    access your account safely.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className='mt-12'>
                                            <h2 className='text-4xl font-bold leading-tight tracking-tight text-slate-900'>
                                                Create
                                                <br />
                                                account
                                            </h2>

                                            <p className='mt-4 max-w-sm text-[15px] leading-7 text-slate-500'>
                                                Join the platform and start managing bookings, clients,
                                                and salon operations with ease.
                                            </p>
                                        </div>

                                        <div className='mt-8 space-y-4'>
                                            <div>
                                                <label className='mb-2 block text-sm font-semibold text-slate-700'>
                                                    Full name
                                                </label>
                                                <div className='group flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition-all duration-300 hover:border-slate-300 focus-within:border-slate-900 focus-within:shadow-[0_0_0_4px_rgba(15,23,42,0.06)]'>
                                                    <FiUser className='text-slate-400 transition-colors duration-300 group-focus-within:text-slate-900' />
                                                    <input
                                                        type='text'
                                                        placeholder='Enter your name'
                                                        autoComplete='name'
                                                        className='h-full w-full bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400'
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className='mb-2 block text-sm font-semibold text-slate-700'>
                                                    Email address
                                                </label>
                                                <div className='group flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition-all duration-300 hover:border-slate-300 focus-within:border-slate-900 focus-within:shadow-[0_0_0_4px_rgba(15,23,42,0.06)]'>
                                                    <FiMail className='text-slate-400 transition-colors duration-300 group-focus-within:text-slate-900' />
                                                    <input
                                                        type='email'
                                                        placeholder='Enter your email'
                                                        autoComplete='email'
                                                        className='h-full w-full bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400'
                                                        value={registerEmail}
                                                        onChange={(e) => setRegisterEmail(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
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
                                                        className='text-xs font-medium text-slate-500 underline-offset-4 transition hover:text-slate-900 hover:underline'
                                                    >
                                                        Forgot password?
                                                    </button>
                                                </div>

                                                <div className='group flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition-all duration-300 hover:border-slate-300 focus-within:border-slate-900 focus-within:shadow-[0_0_0_4px_rgba(15,23,42,0.06)]'>
                                                    <FiLock className='text-slate-400 transition-colors duration-300 group-focus-within:text-slate-900' />
                                                    <input
                                                        type={showRegisterPassword ? 'text' : 'password'}
                                                        placeholder='Enter your password'
                                                        autoComplete='new-password'
                                                        className='h-full w-full bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400'
                                                        value={registerPassword}
                                                        onChange={(e) => setRegisterPassword(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                                                    />
                                                    <button
                                                        type='button'
                                                        onClick={() => setShowRegisterPassword((prev) => !prev)}
                                                        className='text-slate-400 transition hover:text-slate-800'
                                                    >
                                                        {showRegisterPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className='grid grid-cols-2 gap-3 pt-2'>
                                                <button
                                                    type='button'
                                                    onClick={() => setIsRegister(false)}
                                                    className='inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-900 hover:text-slate-900'
                                                >
                                                    Log in
                                                </button>
                                                <button
                                                    type='button'
                                                    onClick={handleRegister}
                                                    disabled={registerLoading || !isRegisterFormValid}
                                                    className='group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-70'
                                                >
                                                    {registerLoading ? 'Signing up...' : 'Sign up'}
                                                    {!registerLoading && (
                                                        <FiArrowRight className='transition-transform duration-300 group-hover:translate-x-1' />
                                                    )}
                                                </button>
                                            </div>

                                            <div className='pt-2'>
                                                <p className='text-xs leading-6 text-slate-400'>
                                                    Your account will be protected with a secure
                                                    verification flow.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div
                        className={`absolute inset-y-0 right-0 w-1/2 p-6 transition-transform duration-700 ease-in-out ${isRegister ? '-translate-x-full' : 'translate-x-0'
                            }`}
                    >
                        <div className='relative flex h-full flex-col justify-between overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#1e293b_100%)] p-8 shadow-2xl'>
                            <div className='absolute inset-0'>
                                <div className='absolute top-8 left-10 h-36 w-36 rounded-full bg-white/10 blur-3xl' />
                                <div className='absolute bottom-10 right-10 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl' />
                                <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_25%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.15),transparent_25%)]' />
                            </div>

                            <div className='relative z-10'>
                                <h3 className='max-w-md text-4xl font-bold leading-tight tracking-tight text-white'>
                                    {isRegister
                                        ? 'Build your salon presence with a smarter start'
                                        : 'Modern salon management made beautifully simple'}
                                </h3>
                            </div>

                            <div className='relative z-10 my-10 grid gap-4'>
                                <div className='rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-md transition duration-300 hover:bg-white/15'>
                                    <div className='flex items-start gap-4'>
                                        <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-lg'>
                                            {isRegister ? <FiUser size={20} /> : <FiShield size={20} />}
                                        </div>
                                        <div>
                                            <h4 className='text-base font-semibold text-white'>
                                                {isRegister
                                                    ? 'Create your salon identity'
                                                    : 'Secure user access'}
                                            </h4>
                                            <p className='mt-1 text-sm leading-6 text-slate-300'>
                                                {isRegister
                                                    ? 'Set up your account and begin your onboarding journey in minutes.'
                                                    : 'Protected sign-in experience with smooth and reliable account access.'}
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
                                                {isRegister
                                                    ? 'Fast onboarding flow'
                                                    : 'Fast booking workflow'}
                                            </h4>
                                            <p className='mt-1 text-sm leading-6 text-slate-300'>
                                                {isRegister
                                                    ? 'Designed to help new salons get started without any unnecessary friction.'
                                                    : 'Designed for speed so users can get from login to appointment booking in seconds.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='relative z-10 overflow-hidden rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur-md'>
                                <div className='absolute -right-10 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl' />
                                <img
                                    src='/Hero.png'
                                    alt='auth visual'
                                    className='mx-auto w-full max-w-[260px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)] transition duration-500 hover:scale-[1.03]'
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='w-full max-w-xl lg:hidden'>
                    <div className='overflow-hidden rounded-[28px] border border-white/60 bg-white/75 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl'>
                        <div className='w-full'>
                            <button
                                type='button'
                                onClick={() => navigate('/')}
                                className='group inline-flex items-center gap-3 text-left'
                            >
                                <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-lg shadow-black/10 transition-transform duration-300 group-hover:scale-105'>
                                    <FiScissors className='text-base' />
                                </div>
                                <div>
                                    <h1 className='text-xl font-bold tracking-tight text-slate-900'>
                                        SlotMyStyle
                                    </h1>
                                    <p className='text-[11px] text-slate-500'>
                                        Smart salon booking platform
                                    </p>
                                </div>
                            </button>

                            {!isRegister ? (
                                <>
                                    <div className='mt-12'>
                                        <h2 className='text-4xl font-bold leading-tight tracking-tight text-slate-900'>
                                            Welcome
                                            <br />
                                            back
                                        </h2>
                                        <p className='mt-4 max-w-sm text-[15px] leading-7 text-slate-500'>
                                            Sign in to manage bookings, track appointments, and deliver
                                            a seamless salon experience.
                                        </p>
                                    </div>

                                    <div className='mt-8 space-y-5'>
                                        <div>
                                            <label className='mb-2 block text-sm font-semibold text-slate-700'>
                                                Email address
                                            </label>
                                            <div className='group flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm'>
                                                <FiMail className='text-slate-400' />
                                                <input
                                                    type='email'
                                                    placeholder='Enter your email'
                                                    autoComplete='email'
                                                    className='h-full w-full bg-transparent px-3 text-sm text-slate-900 outline-none'
                                                    value={loginEmail}
                                                    onChange={(e) => setLoginEmail(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className='mb-2 flex items-center justify-between gap-3'>
                                                <label className='block text-sm font-semibold text-slate-700'>
                                                    Password
                                                </label>

                                                <button
                                                    type='button'
                                                    onClick={() => navigate('/forgot-password')}
                                                    className='shrink-0 text-xs font-medium text-slate-500 underline-offset-4 transition hover:text-slate-900 hover:underline'
                                                >
                                                    Forgot password?
                                                </button>
                                            </div>

                                            <div className='group flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm'>
                                                <FiLock className='text-slate-400' />
                                                <input
                                                    type={showLoginPassword ? 'text' : 'password'}
                                                    placeholder='Enter your password'
                                                    autoComplete='current-password'
                                                    className='h-full w-full bg-transparent px-3 text-sm text-slate-900 outline-none'
                                                    value={loginPassword}
                                                    onChange={(e) => setLoginPassword(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                                />
                                                <button
                                                    type='button'
                                                    onClick={() => setShowLoginPassword((prev) => !prev)}
                                                    className='text-slate-400'
                                                >
                                                    {showLoginPassword ? <FiEyeOff /> : <FiEye />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className='grid grid-cols-2 gap-3'>
                                            <button
                                                type='button'
                                                onClick={() => setIsRegister(true)}
                                                className='order-1 inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800'
                                            >
                                                Create account
                                            </button>

                                            <button
                                                type='button'
                                                onClick={handleLogin}
                                                disabled={loginLoading || !isLoginFormValid}
                                                className='order-2 inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70'
                                            >
                                                {loginLoading ? 'Logging in...' : 'Log in'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className='mt-12'>
                                        <h2 className='text-4xl font-bold leading-tight tracking-tight text-slate-900'>
                                            Create
                                            <br />
                                            account
                                        </h2>
                                        <p className='mt-4 max-w-sm text-[15px] leading-7 text-slate-500'>
                                            Join the platform and start managing bookings, clients,
                                            and salon operations with ease.
                                        </p>
                                    </div>

                                    <div className='mt-8 space-y-4'>
                                        <div>
                                            <label className='mb-2 block text-sm font-semibold text-slate-700'>
                                                Full name
                                            </label>
                                            <div className='group flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm'>
                                                <FiUser className='text-slate-400' />
                                                <input
                                                    type='text'
                                                    placeholder='Enter your name'
                                                    autoComplete='name'
                                                    className='h-full w-full bg-transparent px-3 text-sm text-slate-900 outline-none'
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className='mb-2 block text-sm font-semibold text-slate-700'>
                                                Email address
                                            </label>
                                            <div className='group flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm'>
                                                <FiMail className='text-slate-400' />
                                                <input
                                                    type='email'
                                                    placeholder='Enter your email'
                                                    autoComplete='email'
                                                    className='h-full w-full bg-transparent px-3 text-sm text-slate-900 outline-none'
                                                    value={registerEmail}
                                                    onChange={(e) => setRegisterEmail(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className='mb-2 block text-sm font-semibold text-slate-700'>
                                                Password
                                            </label>
                                            <div className='group flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm'>
                                                <FiLock className='text-slate-400' />
                                                <input
                                                    type={showRegisterPassword ? 'text' : 'password'}
                                                    placeholder='Create your password'
                                                    autoComplete='new-password'
                                                    className='h-full w-full bg-transparent px-3 text-sm text-slate-900 outline-none'
                                                    value={registerPassword}
                                                    onChange={(e) => setRegisterPassword(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                                                />
                                                <button
                                                    type='button'
                                                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                                                    className='text-slate-400'
                                                >
                                                    {showRegisterPassword ? <FiEyeOff /> : <FiEye />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className='grid grid-cols-2 gap-3'>
                                            <button
                                                type='button'
                                                onClick={() => setIsRegister(false)}
                                                className='inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800'
                                            >
                                                Log in
                                            </button>
                                            <button
                                                type='button'
                                                onClick={handleRegister}
                                                disabled={registerLoading || !isRegisterFormValid}
                                                className='inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70'
                                            >
                                                {registerLoading ? 'Signing up...' : 'Sign up'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
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