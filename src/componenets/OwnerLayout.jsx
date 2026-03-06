import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FiBell, FiUser, FiMenu } from 'react-icons/fi'

export default function OwnerLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = [
    { name: 'Dashboard', path: '/owner-dashboard' },
    { name: 'Add Salon', path: '/add-salon' },
    { name: 'Barbers', path: '/manage-barbers' },
    { name: 'Services', path: '/services' },
    { name: 'Settings', path: '/settings' },
    { name: 'Reviews', path: '/reviews' },
  ]

  return (
    <div className='flex h-screen bg-gray-100 overflow-hidden'>
      {/* ===== Mobile Overlay ===== */}
      {mobileMenuOpen && (
        <div
          className='fixed inset-0 bg-black/40 z-30 md:hidden'
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <div
        className={`
        fixed md:relative
        z-40
        h-screen
        w-64
        bg-gradient-to-b from-[#0B132B] to-[#1C2541]
        text-white
        px-6 py-6
        transform transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}
      >
        {/* Logo */}
        <div className='flex items-center justify-between mb-10'>
          <div className='flex items-center gap-3'>
            <div className='w-6 h-6 bg-black rounded-sm'></div>
            <h2 className='text-lg font-semibold'>SlotMyStyle</h2>
          </div>

          <button
            className='md:hidden text-xl'
            onClick={() => setMobileMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Menu */}
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
                className={`cursor-pointer px-4 py-2 rounded-lg transition-all text-sm ${
                  isActive
                    ? 'bg-white text-black font-medium'
                    : 'hover:bg-white/10 text-gray-300'
                }`}
              >
                {item.name}
              </li>
            )
          })}
        </ul>
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className='flex flex-col flex-1 h-screen'>
        {/* ======= TOP NAVBAR ======= */}
        <div className='bg-white h-16 px-4 md:px-8 flex items-center justify-between shadow-sm'>
          {/* Left */}
          <div className='flex items-center gap-3'>
            <FiMenu
              className='text-2xl cursor-pointer md:hidden'
              onClick={() => setMobileMenuOpen(true)}
            />
            <h1 className='text-lg font-semibold text-gray-700'>Owner Panel</h1>
          </div>

          {/* Right */}
          <div className='flex items-center gap-4'>
            <FiBell className='text-xl cursor-pointer hidden sm:block' />

            <FiUser
              className='text-xl cursor-pointer'
              onClick={() => navigate('/owner-dashboard')}
            />

            <button
              onClick={() => navigate('/')}
              className='bg-black text-white px-4 py-1.5 rounded-md text-sm'
            >
              Switch to User
            </button>
          </div>
        </div>

        {/* ===== PAGE CONTENT ===== */}
        <div className='flex-1 overflow-y-auto p-6 md:p-8 flex justify-center'>
          <div className='w-full max-w-6xl'>{children}</div>
        </div>
      </div>
    </div>
  )
}
