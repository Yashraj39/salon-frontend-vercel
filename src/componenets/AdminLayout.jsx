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
    { name: 'Manage Owners', path: '/admin/manage-owners' },
  ]

  return (
    <div className='min-h-screen bg-[#f5f7fb]'>
      {mobileMenuOpen && (
        <div
          className='fixed inset-0 bg-black/40 z-30 md:hidden'
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 z-40 h-screen w-64
          bg-gradient-to-b from-[#07153A] via-[#091842] to-[#0C1D4E]
          text-white px-6 py-6 overflow-y-auto
          transform transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className='flex items-center justify-between mb-10'>
          <div className='flex items-center gap-3'>
            <img
              src="/logo.png"   // 👈 put your logo file here
              alt="logo"
              className="h-9 w-9 rounded-xl object-contain"
            />
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
                className={`cursor-pointer px-5 py-3 rounded-xl transition-all text-[15px] ${isActive
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

      <div className='w-full md:pl-64'>
        <div className='md:hidden p-4'>
          <FiMenu
            className='text-2xl cursor-pointer'
            onClick={() => setMobileMenuOpen(true)}
          />
        </div>

        <div className='p-6 md:p-8'>
          {children || (
            <h1 className='text-2xl font-bold'>Admin Dashboard ✅</h1>
          )}
        </div>
      </div>
    </div>
  )
}

//latest commit