import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function OwnerDashboard() {
  const navigate = useNavigate()

  return (
    <div className='flex min-h-screen bg-gray-100'>
      {/* Sidebar */}
      <div className='w-64 bg-gradient-to-b from-[#0B132B] to-[#1C2541] text-white p-6'>
        <h2 className='text-xl font-semibold mb-8'>SlotMyStyle</h2>

        <ul className='space-y-6'>
          <li className='cursor-pointer font-medium'>Dashboard</li>
          <li className='cursor-pointer'>Barbers</li>
          <li className='cursor-pointer'>Services</li>
          <li className='cursor-pointer'>Settings</li>
          <li className='cursor-pointer'>Reviews</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col'>
        {/* Top Header */}
        <div className='bg-white shadow px-8 py-4 flex justify-between items-center'>
          <h2 className='text-lg font-semibold'>Owner Panel</h2>

          <button
            onClick={() => navigate('/success')}
            className='bg-black text-white px-4 py-2 rounded-lg'
          >
            Back to User
          </button>
        </div>

        {/* Empty State */}
        <div className='flex-1 flex flex-col items-center justify-center'>
          <button className='border px-6 py-3 rounded-lg mb-6'>
            + Add salon
          </button>

          <h1 className='text-3xl font-semibold'>Add your first salon!!</h1>
        </div>
      </div>
    </div>
  )
}
