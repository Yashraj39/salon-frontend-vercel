import React, { useState } from 'react'
import Navbar from '../componenets/Navbar'
// import Navbar from './componenets/Navbar'

const BASE_URL = 'https://render-qs89.onrender.com'

export default function AddSalon() {
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [contact, setContact] = useState('')
  const [salonEmail, setSalonEmail] = useState('')
  const [opentime, setOpenTime] = useState('')
  const [closetime, setCloseTime] = useState('')
  const [mapLink, setMapLink] = useState('')
  const [documentType, setDocumentType] = useState('GST_CERTIFICATE')

  const [cover, setCover] = useState(null)
  const [interior, setInterior] = useState(null)
  const [exterior, setExterior] = useState(null)
  const [ownerPhoto, setOwnerPhoto] = useState(null)
  const [document, setDocument] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const ownerId = user?.userId

      const formatTime = (time) => (time.length === 5 ? time + ':00' : time)

      const formData = new FormData()

      formData.append('ownerId', ownerId)
      formData.append('name', name)
      formData.append('city', city)
      formData.append('address', address)
      formData.append('contact', contact)
      formData.append('salonEmail', salonEmail)
      formData.append('opentime', formatTime(opentime))
      formData.append('closetime', formatTime(closetime))
      formData.append('mapLink', mapLink)
      formData.append('documentType', documentType)

      formData.append('cover', cover)
      formData.append('interior', interior)
      formData.append('exterior', exterior)
      formData.append('ownerPhoto', ownerPhoto)
      formData.append('document', document)

      const response = await fetch(`${BASE_URL}/api/salon/add-salon`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Salon add failed')

      alert('Salon Added Successfully ✅')
    } catch (error) {
      alert('Something went wrong')
    }
  }

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col'>
      <Navbar />

      <div className='flex flex-1'>
        {/* Sidebar */}
        <div className='w-64 bg-gradient-to-b from-[#0B132B] to-[#1C2541] text-white px-6 py-6 min-h-screen'>
          <h2 className='text-xl font-semibold mb-8'>SlotMyStyle</h2>

          <ul className='space-y-6'>
            <li className='cursor-pointer'>Dashboard</li>
            <li className='cursor-pointer font-medium'>Add Salon</li>
            <li className='cursor-pointer'>Barbers</li>
            <li className='cursor-pointer'>Services</li>
            <li className='cursor-pointer'>Settings</li>
            <li className='cursor-pointer'>Reviews</li>
          </ul>
        </div>

        {/* Right Content */}
        <div className='flex-1 p-10'>
          <h1 className='text-3xl font-bold mb-2'>Add New Salon</h1>
          <p className='text-gray-500 mb-8'>
            Fill in the details to add your new salon.
          </p>

          <form onSubmit={handleSubmit} className='space-y-6 max-w-4xl'>
            <div className='grid grid-cols-2 gap-6'>
              <input
                type='text'
                placeholder='Salon Name'
                className='border p-3 rounded-lg'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type='text'
                placeholder='City'
                className='border p-3 rounded-lg'
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <textarea
              placeholder='Full Address'
              className='border p-3 rounded-lg w-full'
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />

            <div className='grid grid-cols-2 gap-6'>
              <input
                type='text'
                placeholder='Contact Number'
                className='border p-3 rounded-lg'
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
              <input
                type='email'
                placeholder='Salon Email'
                className='border p-3 rounded-lg'
                value={salonEmail}
                onChange={(e) => setSalonEmail(e.target.value)}
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-6'>
              <input
                type='time'
                className='border p-3 rounded-lg'
                value={opentime}
                onChange={(e) => setOpenTime(e.target.value)}
                required
              />
              <input
                type='time'
                className='border p-3 rounded-lg'
                value={closetime}
                onChange={(e) => setCloseTime(e.target.value)}
                required
              />
            </div>

            <input
              type='text'
              placeholder='Google Map Link'
              className='border p-3 rounded-lg w-full'
              value={mapLink}
              onChange={(e) => setMapLink(e.target.value)}
            />

            <select
              className='border p-3 rounded-lg w-full'
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            >
              <option value='GST_CERTIFICATE'>GST Certificate</option>
              <option value='SHOP_LICENSE'>Shop License</option>
            </select>

            {/* Upload Section */}
            <div className='space-y-6'>
              {/* Cover Image */}
              <div className='border-2 border-dashed border-gray-300 rounded-xl p-6 bg-white'>
                <label className='block text-sm font-semibold text-gray-700 mb-3'>
                  Cover Image
                </label>
                <input
                  type='file'
                  onChange={(e) => setCover(e.target.files[0])}
                  required
                  className='block w-full text-sm text-gray-500
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-lg file:border-0
                 file:text-sm file:font-semibold
                 file:bg-blue-50 file:text-blue-700
                 hover:file:bg-blue-100'
                />
              </div>

              {/* Interior Image */}
              <div className='border-2 border-dashed border-gray-300 rounded-xl p-6 bg-white'>
                <label className='block text-sm font-semibold text-gray-700 mb-3'>
                  Interior Image
                </label>
                <input
                  type='file'
                  onChange={(e) => setInterior(e.target.files[0])}
                  required
                  className='block w-full text-sm text-gray-500
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-lg file:border-0
                 file:text-sm file:font-semibold
                 file:bg-blue-50 file:text-blue-700
                 hover:file:bg-blue-100'
                />
              </div>

              {/* Exterior Image */}
              <div className='border-2 border-dashed border-gray-300 rounded-xl p-6 bg-white'>
                <label className='block text-sm font-semibold text-gray-700 mb-3'>
                  Exterior Image
                </label>
                <input
                  type='file'
                  onChange={(e) => setExterior(e.target.files[0])}
                  required
                  className='block w-full text-sm text-gray-500
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-lg file:border-0
                 file:text-sm file:font-semibold
                 file:bg-blue-50 file:text-blue-700
                 hover:file:bg-blue-100'
                />
              </div>

              {/* Owner Photo */}
              <div className='border-2 border-dashed border-gray-300 rounded-xl p-6 bg-white'>
                <label className='block text-sm font-semibold text-gray-700 mb-3'>
                  Owner Photo
                </label>
                <input
                  type='file'
                  onChange={(e) => setOwnerPhoto(e.target.files[0])}
                  required
                  className='block w-full text-sm text-gray-500
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-lg file:border-0
                 file:text-sm file:font-semibold
                 file:bg-blue-50 file:text-blue-700
                 hover:file:bg-blue-100'
                />
              </div>

              {/* Document */}
              <div className='border-2 border-dashed border-gray-300 rounded-xl p-6 bg-white'>
                <label className='block text-sm font-semibold text-gray-700 mb-3'>
                  Document
                </label>
                <input
                  type='file'
                  onChange={(e) => setDocument(e.target.files[0])}
                  required
                  className='block w-full text-sm text-gray-500
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-lg file:border-0
                 file:text-sm file:font-semibold
                 file:bg-blue-50 file:text-blue-700
                 hover:file:bg-blue-100'
                />
              </div>
            </div>

            <div className='flex justify-end gap-4 pt-6'>
              <button type='button' className='px-6 py-3 border rounded-lg'>
                Cancel
              </button>
              <button
                type='submit'
                className='px-6 py-3 bg-black text-white rounded-lg '
              >
                Add Salon
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
