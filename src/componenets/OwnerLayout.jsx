import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function OwnerLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

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
      {/* ===== SIDEBAR ===== */}
      <div className='w-64 bg-gradient-to-b from-[#0B132B] to-[#1C2541] text-white px-6 py-6 min-h-screen'>
        <h2 className='text-xl font-semibold mb-8'>SlotMyStyle</h2>

        <ul className='space-y-6'>
          {menuItems.map((item) => (
            <li
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`cursor-pointer px-3 py-2 rounded-lg transition-all ${
                location.pathname === item.path
                  ? 'bg-white text-black font-medium'
                  : 'hover:bg-white/10'
              }`}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </div>

      {/* ===== PAGE CONTENT ===== */}
      <div className='flex-1 p-8'>{children}</div>
    </div>
  )
}
