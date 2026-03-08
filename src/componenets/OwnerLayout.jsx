import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  FiBell,
  FiUser,
  FiMenu,
  FiRepeat,
  FiChevronDown,
} from 'react-icons/fi'

export default function OwnerLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const dropdownRef = useRef(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const ownerName = user?.name || 'Yashraj Parmar'
  const ownerRole = 'Owner'

  const menuItems = [
    { name: 'Dashboard', path: '/owner-dashboard' },
    { name: 'Add Salon', path: '/add-salon' },
    { name: 'Barbers', path: '/manage-barbers' },
    { name: 'Services', path: '/services' },
    { name: 'Settings', path: '/settings' },
    { name: '', path: '/reviews' },
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className='flex h-screen bg-[#f5f7fb] overflow-hidden'>
      {mobileMenuOpen && (
        <div
          className='fixed inset-0 bg-black/40 z-30 md:hidden'
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={`
          fixed md:relative z-40 h-screen w-64
          bg-gradient-to-b from-[#07153A] via-[#091842] to-[#0C1D4E]
          text-white px-6 py-6
          transform transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className='flex items-center justify-between mb-10'>
          <div className='flex items-center gap-3'>
            <div className='w-7 h-7 rounded-md bg-black shadow-sm'></div>
            <h2 className='text-[17px] font-semibold tracking-[0.2px]'>
              SlotMyStyle
            </h2>
          </div>

          <button
            className='md:hidden text-xl'
            onClick={() => setMobileMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        <ul className='space-y-3'>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path

            return (
              <li
                key={item.name}
                onClick={() => {
                  navigate(item.path)
                  setMobileMenuOpen(false)
                }}
                className={`cursor-pointer px-5 py-3 rounded-xl transition-all text-[15px] ${
                  isActive
                    ? 'bg-white text-[#111827] font-semibold shadow-[0_10px_25px_rgba(255,255,255,0.10)]'
                    : 'text-gray-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.name}
              </li>
            )
          })}
        </ul>
      </div>

      <div className='flex flex-col flex-1 h-screen'>
        <div className='h-[76px] bg-white border-b border-[#e7eaf0] px-5 md:px-10 flex items-center justify-between shadow-[0_1px_2px_rgba(16,24,40,0.04)] relative z-20'>
          <div className='flex items-center gap-3'>
            <FiMenu
              className='text-2xl cursor-pointer md:hidden text-[#344054]'
              onClick={() => setMobileMenuOpen(true)}
            />
            <h1 className='text-[18px] md:text-[20px] font-semibold text-[#243B63] tracking-[0.2px]'>
              Owner Panel
            </h1>
          </div>

          <div className='flex items-center gap-4 md:gap-5'>
            <button
              type='button'
              className='hidden sm:flex items-center justify-center w-10 h-10 rounded-full border border-[#e6eaf0] bg-white text-[#344054] hover:bg-[#f8fafc] transition'
            >
              <FiBell className='text-[20px]' />
            </button>

            <div className='relative' ref={dropdownRef}>
              <button
                type='button'
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className={`group flex items-center gap-3 h-[50px] pl-4 pr-3 rounded-xl border transition-all bg-white ${
                  profileDropdownOpen
                    ? 'border-[#cfd6e4] shadow-[0_12px_30px_rgba(17,24,39,0.10)]'
                    : 'border-[#d8dee8] shadow-[0_4px_14px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.10)]'
                }`}
              >
                <div className='flex items-center justify-center w-8 h-8 rounded-full bg-[#f3f6fb] text-[#344054] border border-[#e4e7ec]'>
                  <FiUser className='text-[16px]' />
                </div>

                <div className='flex items-center gap-3'>
                  <span className='text-[15px] font-medium text-[#1f2937]'>
                    {ownerRole}
                  </span>
                  <span className='text-[15px] font-semibold text-[#243B63] max-w-[160px] truncate'>
                    {ownerName}
                  </span>
                </div>

                <FiChevronDown
                  className={`text-[18px] text-[#667085] transition-transform duration-200 ${
                    profileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`absolute right-0 top-[58px] w-[290px] origin-top-right transition-all duration-200 ${
                  profileDropdownOpen
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                }`}
              >
                <div className='rounded-2xl border border-[#dde3ec] bg-white shadow-[0_20px_45px_rgba(15,23,42,0.14)] p-3'>
                  <div className='mb-3 rounded-xl border border-[#e6eaf0] bg-[#f8fafc] px-4 py-3'>
                    <div className='text-[12px] font-medium uppercase tracking-[0.08em] text-[#667085]'>
                      Signed in as
                    </div>
                    <div className='mt-1 text-[15px] font-semibold text-[#243B63] truncate'>
                      {ownerName}
                    </div>
                    <div className='text-[13px] text-[#667085]'>{ownerRole}</div>
                  </div>

                  <button
                    type='button'
                    onClick={() => {
                      setProfileDropdownOpen(false)
                      navigate('/')
                    }}
                    className='w-full flex items-center gap-3 rounded-xl px-4 py-3 border border-[#3c3c3c] bg-gradient-to-r from-[#242424] via-[#343434] to-[#464646] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:brightness-110 hover:shadow-[0_10px_24px_rgba(0,0,0,0.24)] transition-all'
                  >
                    <div className='flex items-center justify-center w-8 h-8 rounded-full bg-white/10'>
                      <FiRepeat className='text-[17px]' />
                    </div>
                    <div className='text-left'>
                      <div className='text-[15px] font-semibold leading-none'>
                        Switch to User
                      </div>
                      <div className='text-[12px] text-white/70 mt-1'>
                        Go back to customer side
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto p-6 md:p-8 flex justify-center'>
          <div className='w-full max-w-6xl'>{children}</div>
        </div>
      </div>
    </div>
  )
}