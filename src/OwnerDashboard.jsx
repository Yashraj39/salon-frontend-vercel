import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './componenets/Navbar'

export default function OwnerDashboard() {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col'>
      <Navbar />

      <div className='flex flex-1'>
        {/* Sidebar */}
        <div className='w-64 bg-gradient-to-b from-[#0B132B] to-[#1C2541] text-white px-6 py-6 min-h-screen'>
          <h2 className='text-xl font-semibold mb-8'>SlotMyStyle</h2>

          <ul className='space-y-6'>
            <li className='cursor-pointer font-medium'>Dashboard</li>

            {/* 🔥 IMPORTANT CHANGE HERE */}
            <li
              onClick={() => navigate('/add-salon')}
              className='cursor-pointer hover:text-gray-300'
            >
              Add Salon
            </li>

            <li
              onClick={() => navigate('/manage-barbers')}
              className='cursor-pointer hover:text-gray-300'
            >
              Barbers
            </li>
            <li className='cursor-pointer hover:text-gray-300'>Services</li>
            <li className='cursor-pointer hover:text-gray-300'>Settings</li>
            <li className='cursor-pointer hover:text-gray-300'>Reviews</li>
          </ul>
        </div>

        {/* Main Content */}
        <div className='flex-1 flex flex-col items-center justify-center'>
          {/* 🔥 SAME CHANGE HERE */}
          <button
            onClick={() => navigate('/add-salon')}
            className='border px-6 py-3 rounded-lg mb-6 bg-white shadow'
          >
            + Add Salon
          </button>

          <h1 className='text-3xl font-semibold'>Add your first salon!!</h1>
        </div>
      </div>
    </div>
  )
}
