import React from 'react'
import AdminLayout from '../componenets/AdminLayout'


export default function AdminApproveSalonPage() {
  return (
    <AdminLayout>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Approve Salons</h1>
        <p className='text-sm text-gray-500 mt-1'>
          Review and approve salon submissions.
        </p>
      </div>
    </AdminLayout>
  )
}