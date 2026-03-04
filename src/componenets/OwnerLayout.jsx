import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FiBell, FiUser } from 'react-icons/fi'
import { FaShoppingCart } from 'react-icons/fa'

export default function OwnerLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const BASE_URL = 'https://render-qs89.onrender.com'

  const user = JSON.parse(localStorage.getItem('user')) || {}
  const userId = user.userId

  const [totalPending, setTotalPending] = useState(0)
  const [navbarCart, setNavbarCart] = useState([])
  const [showCartDropdown, setShowCartDropdown] = useState(false)

  const menuItems = [
    { name: 'Dashboard', path: '/owner-dashboard' },
    { name: 'Add Salon', path: '/add-salon' },
    { name: 'Barbers', path: '/manage-barbers' },
    { name: 'Services', path: '/services' },
    { name: 'Settings', path: '/settings' },
    { name: 'Reviews', path: '/reviews' },
  ]


  return (
    <div className='min-h-screen flex bg-gray-100'>
      {/* ================= SIDEBAR ================= */}
      <div className='w-64 bg-linear-to-b from-[#0B132B] to-[#1C2541] text-white px-6 py-6'>
        {/* Logo */}
        <div className='flex items-center gap-3 mb-10'>
          <div className='w-6 h-6 bg-black rounded-sm'></div>
          <h2 className='text-lg font-semibold'>SlotMyStyle</h2>
        </div>

        {/* Menu */}
        <ul className='space-y-3'>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li
                key={item.name}
                onClick={() => navigate(item.path)}
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
      <div className='flex-1 flex flex-col'>
        {/* ======= TOP NAVBAR ======= */}
        <div className='bg-white h-16 px-8 flex items-center justify-between shadow-sm'>
          {/* Left Title */}
          <h1 className='text-lg font-semibold text-gray-700'>Owner Panel</h1>

          {/* Right Icons */}
          <div className='flex items-center gap-6 relative'>
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

        {/* ===== PAGE CONTENT (NOW PROPER CENTER) ===== */}
        <div className='flex-1 p-8 flex justify-center'>
          <div className='w-full max-w-6xl'>{children}</div>
        </div>
      </div>
    </div>
  )
}