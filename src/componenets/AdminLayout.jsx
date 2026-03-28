import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FiMenu } from 'react-icons/fi'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = [
    { name: 'City', path: '/admin/city' },
    { name: 'Category Service', path: '/admin/category-service' },
    { name: 'Approve Owner', path: '/admin/approve-owner' },
    { name: 'Approve Salon', path: '/admin/approve-salon' },
  ]

  return (
    <div className='min-h-screen bg-[#f5f7fb] flex'>
      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className='fixed inset-0 bg-black/40 z-30 md:hidden'
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static top-0 left-0 z-40 h-screen w-64
          bg-gradient-to-b from-[#07153A] via-[#091842] to-[#0C1D4E]
          text-white px-6 py-6
          transform transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className='flex items-center justify-between mb-10'>
          <h2 className='text-[18px] font-semibold'>SlotMyStyle</h2>

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
                className={`cursor-pointer px-5 py-3 rounded-xl transition-all text-[15px] ${
                  isActive
                    ? 'bg-white text-[#111827] font-semibold'
                    : 'text-gray-200 hover:bg-white/10'
                }`}
              >
                {item.name}
              </li>
            )
          })}
        </ul>
      </div>

      {/* Main Content */}
      <div className='flex-1 w-full'>
        {/* Mobile Menu Button (since navbar removed) */}
        <div className='md:hidden p-4'>
          <FiMenu
            className='text-2xl cursor-pointer'
            onClick={() => setMobileMenuOpen(true)}
          />
        </div>

        {/* Page Content */}
        <div className='p-6 md:p-8'>
          {children || (
            <h1 className='text-2xl font-bold'>Admin Dashboard ✅</h1>
          )}
        </div>
      </div>
    </div>
  )
}
