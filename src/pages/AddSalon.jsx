import React, { useState } from 'react'

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
      const ownerId = localStorage.getItem('ownerId')

      const user = JSON.parse(localStorage.getItem('user'))

      const userId = user?.userId

      console.log('OwnerId:', ownerId)
      console.log('UserId:', userId)

      const formatTime = (time) => (time.length === 5 ? time + ':00' : time)

      const formData = new FormData()

      // IDs
      formData.append('id', ownerId)
      formData.append('salonOwnerId', userId)

      // Basic Info
      formData.append('name', name)
      formData.append('city', city)
      formData.append('address', address)
      formData.append('contact', contact)
      formData.append('salonEmail', salonEmail)
      formData.append('opentime', formatTime(opentime))
      formData.append('closetime', formatTime(closetime))
      formData.append('mapLink', mapLink)
      formData.append('documentType', documentType)

      // Images
      formData.append('cover', cover)
      formData.append('interior', interior)
      formData.append('exterior', exterior)
      formData.append('ownerPhoto', ownerPhoto)
      formData.append('document', document)

      console.log([...formData.entries()])

      const response = await fetch(`${BASE_URL}/api/salon/add-salon`, {
        method: 'POST',
        body: formData,
      })

      let data = null

      try {
        data = await response.json()
      } catch {
        data = null
      }

      console.log('Response:', data)

      if (!response.ok) {
        throw new Error('Salon add failed')
      }

      alert('Salon Added Successfully ✅')
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong')
    }
  }

  return (
    <div className='max-w-3xl mx-auto p-6'>
      <h2 className='text-2xl font-bold mb-6'>Add Salon</h2>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <input
          type='text'
          placeholder='Salon Name'
          className='border p-3 w-full'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type='text'
          placeholder='City'
          className='border p-3 w-full'
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />

        <input
          type='text'
          placeholder='Address'
          className='border p-3 w-full'
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <input
          type='text'
          placeholder='Contact'
          className='border p-3 w-full'
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
        />

        <input
          type='email'
          placeholder='Salon Email'
          className='border p-3 w-full'
          value={salonEmail}
          onChange={(e) => setSalonEmail(e.target.value)}
          required
        />

        <div className='flex gap-4'>
          <input
            type='time'
            className='border p-3 w-full'
            value={opentime}
            onChange={(e) => setOpenTime(e.target.value)}
            required
          />

          <input
            type='time'
            className='border p-3 w-full'
            value={closetime}
            onChange={(e) => setCloseTime(e.target.value)}
            required
          />
        </div>

        <input
          type='text'
          placeholder='Google Map Link'
          className='border p-3 w-full'
          value={mapLink}
          onChange={(e) => setMapLink(e.target.value)}
        />

        <select
          className='border p-3 w-full'
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
        >
          <option value='GST_CERTIFICATE'>GST Certificate</option>
          <option value='SHOP_LICENSE'>Shop License</option>
        </select>

        <div>
          Cover Image
          <input
            type='file'
            onChange={(e) => setCover(e.target.files[0])}
            required
          />
        </div>

        <div>
          Interior Image
          <input
            type='file'
            onChange={(e) => setInterior(e.target.files[0])}
            required
          />
        </div>

        <div>
          Exterior Image
          <input
            type='file'
            onChange={(e) => setExterior(e.target.files[0])}
            required
          />
        </div>

        <div>
          Owner Photo
          <input
            type='file'
            onChange={(e) => setOwnerPhoto(e.target.files[0])}
            required
          />
        </div>

        <div>
          Document
          <input
            type='file'
            onChange={(e) => setDocument(e.target.files[0])}
            required
          />
        </div>

        <button
          type='submit'
          className='w-full bg-black text-white py-3 rounded-lg'
        >
          Add Salon
        </button>
      </form>
    </div>
  )
}
