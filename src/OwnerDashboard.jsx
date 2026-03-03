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
            <li onClick={() => navigate('/owner/add-salon')} className='cursor-pointer'>Add Salon</li>
            <li className='cursor-pointer'>Barbers</li>
            <li className='cursor-pointer'>Services</li>
            <li className='cursor-pointer'>Settings</li>
            <li className='cursor-pointer'>Reviews</li>
          </ul>
        </div>

        {/* Main Content */}
        <div className='flex-1 flex flex-col items-center justify-center'>

          <button
            onClick={() => navigate('/add-salon')}
            className='border px-6 py-3 rounded-lg mb-6'
          >

          <button onClick={() => navigate('/owner/add-salon')} className='border px-6 py-3 rounded-lg mb-6 bg-white'>

            + Add salon
          </button>
          </button>

          <h1 className='text-3xl font-semibold'>Add your first salon!!</h1>
 
        </div>
      </div>
    </div>
    
  )
}