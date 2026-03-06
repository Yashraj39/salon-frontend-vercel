import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import OwnerLayout from '../componenets/OwnerLayout'
// import OwnerLayout from '../components/OwnerLayout'

const BASE_URL = 'https://render-qs89.onrender.com'

export default function ManageSalons() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const ownerId = user?.userId

  const [salons, setSalons] = useState([])
  const [selectedSalon, setSelectedSalon] = useState(null)

  const [showPopup, setShowPopup] = useState(false)
  const [editingSalon, setEditingSalon] = useState(null)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false) // modal open/close control
  const [salonToDelete, setSalonToDelete] = useState(null) // kaun salon delete karva ma ave che

  const [form, setForm] = useState({
    name: '',
    city: '',
    address: '',
    contact: '',
    salonEmail: '',
    opentime: '',
    closetime: '',
    mapLink: '',
  })

  const [cover, setCover] = useState(null)
  const [interior, setInterior] = useState(null)
  const [exterior, setExterior] = useState(null)
  const [ownerPhoto, setOwnerPhoto] = useState(null)
  const [document, setDocument] = useState(null)

  const [documentType, setDocumentType] = useState('GST_CERTIFICATE')

  // ================= LOAD SALONS =================

  const loadSalons = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/salon/get-salon-by-owner/${ownerId}`
      )
      const data = await res.json()

      setSalons(data)

      if (data.length > 0) {
        setSelectedSalon(data[0])
      }
    } catch {
      toast.error('Salon load failed')
    }
  }

  useEffect(() => {
    if (ownerId) loadSalons()
  }, [ownerId])

  // ================= INPUT CHANGE =================

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // ================= ADD SALON =================

  const handleAddSalon = async () => {
    try {
      const formData = new FormData()

      formData.append('ownerId', ownerId)
      formData.append('documentType', documentType)

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key])
      })

      if (cover) formData.append('cover', cover)
      if (interior) formData.append('interior', interior)
      if (exterior) formData.append('exterior', exterior)
      if (ownerPhoto) formData.append('ownerPhoto', ownerPhoto)
      if (document) formData.append('document', document)

      const res = await fetch(`${BASE_URL}/api/salon/add-salon`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error()

      toast.success('Salon Added')

      setShowPopup(false)
      loadSalons()
    } catch {
      toast.error('Add salon failed')
    }
  }

  // ================= UPDATE SALON =================

  const handleUpdateSalon = async () => {
    try {
      const formData = new FormData()

      formData.append('ownerId', ownerId)

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key])
      })

      if (cover) formData.append('cover', cover)
      if (interior) formData.append('interior', interior)
      if (exterior) formData.append('exterior', exterior)
      if (ownerPhoto) formData.append('ownerPhoto', ownerPhoto)
      if (document) formData.append('document', document)

      const res = await fetch(
        `${BASE_URL}/api/salon/update-salon/${editingSalon.id}`,
        {
          method: 'PATCH',
          body: formData,
        }
      )

      if (!res.ok) throw new Error()

      toast.success('Salon Updated')

      setEditingSalon(null)
      setShowPopup(false)

      loadSalons()
    } catch {
      toast.error('Update failed')
    }
  }

  // ================= DELETE =================

  const confirmDelete = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const ownerId = user?.userId

      const formData = new FormData()
      formData.append('ownerId', ownerId)

      const response = await fetch(
        `https://render-qs89.onrender.com/api/salon/delete-salon/${salonToDelete.id}`,
        {
          method: 'DELETE',
          body: formData,
        }
      )

      if (!response.ok) throw new Error('Delete failed')

      // Success → UI thi remove karo
      setSalons(salons.filter((s) => s.id !== salonToDelete.id))
      toast.success('Salon deleted successfully')
    } catch (err) {
      toast.error('Failed to delete salon')
    } finally {
      setDeleteModalOpen(false)
      setSalonToDelete(null)
    }
  }

  const handleDeleteClick = (salon) => {
    setSalonToDelete(salon) // store karo
    setDeleteModalOpen(true) // modal open karo
  }

  const cancelDelete = () => {
    setDeleteModalOpen(false)
    setSalonToDelete(null)
  }

  // ================= UI =================

  return (
    <OwnerLayout>
      <div className='flex gap-6 p-6 bg-gray-100 min-h-screen'>
        {/* LEFT PANEL */}

        <div className='w-1/3 bg-white p-5 rounded-xl shadow'>
          <h2 className='text-lg font-semibold mb-4'>Salon List</h2>

          <button
            onClick={() => {
              setEditingSalon(null)
              setShowPopup(true)
            }}
            className='w-full bg-blue-600 text-white py-2 rounded mb-4'
          >
            + Add Salon
          </button>

          {salons.map((salon) => (
            <div
              key={salon.id}
              onClick={() => setSelectedSalon(salon)}
              className={`p-3 mb-3 rounded cursor-pointer border ${
                selectedSalon?.id === salon.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50'
              }`}
            >
              <div className='flex justify-between'>
                <span>{salon.name}</span>

                <div className='flex gap-2'>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingSalon(salon)
                      setForm(salon)
                      setShowPopup(true)
                    }}
                    className='bg-green-600 text-white px-4 py-2 rounded'
                  >
                    Edit
                  </button>

                  <button
                    className='bg-red-500 text-white px-4 py-2 rounded'
                    onClick={() => handleDeleteClick(salon)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p className='text-sm'>{salon.city}</p>
            </div>
          ))}
        </div>

        {deleteModalOpen && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
            <div className='bg-white p-6 rounded-xl shadow-lg w-96'>
              <h2 className='text-xl font-bold mb-4'>Confirm Delete</h2>
              <p className='mb-6'>
                Are you sure you want to delete{' '}
                <strong>{salonToDelete.name}</strong>?
              </p>

              <div className='flex justify-end gap-4'>
                <button
                  onClick={cancelDelete}
                  className='px-4 py-2 border rounded-lg'
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
                  className='px-4 py-2 bg-red-500 text-white rounded-lg'
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT PANEL */}

        <div className='flex-1 bg-white p-6 rounded-xl shadow'>
          {selectedSalon ? (
            <>
              <h2 className='text-2xl font-bold mb-4'>{selectedSalon.name}</h2>

              <div className='space-y-2'>
                <p>
                  <b>City:</b> {selectedSalon.city}
                </p>

                <p>
                  <b>Address:</b> {selectedSalon.address}
                </p>

                <p>
                  <b>Contact:</b> {selectedSalon.contact}
                </p>

                <p>
                  <b>Email:</b> {selectedSalon.salonEmail}
                </p>

                <p>
                  <b>Open Time:</b> {selectedSalon.opentime}
                </p>

                <p>
                  <b>Close Time:</b> {selectedSalon.closetime}
                </p>

                <p>
                  <b>Map:</b> {selectedSalon.mapLink}
                </p>
              </div>
            </>
          ) : (
            <p>No Salon Selected</p>
          )}
        </div>
      </div>

      {/* POPUP */}

      {showPopup && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
          <div className='bg-white w-[700px] max-h-[90vh] overflow-y-auto rounded-xl p-6 shadow-xl'>
            <h2 className='text-2xl font-semibold mb-6'>
              {editingSalon ? 'Edit Salon' : 'Add Salon'}
            </h2>

            {/* BASIC INFO */}

            <h3 className='font-semibold mb-2 text-gray-600'>
              Basic Information
            </h3>

            <div className='grid grid-cols-2 gap-4 mb-4'>
              <input
                type='text'
                name='name'
                placeholder='Salon Name'
                value={form.name}
                onChange={handleChange}
                className='border p-3 rounded'
              />

              <input
                type='text'
                name='city'
                placeholder='City'
                value={form.city}
                onChange={handleChange}
                className='border p-3 rounded'
              />
            </div>

            <textarea
              name='address'
              placeholder='Salon Address'
              value={form.address}
              onChange={handleChange}
              className='border p-3 rounded w-full mb-4'
            />

            {/* CONTACT */}

            <h3 className='font-semibold mb-2 text-gray-600'>
              Contact Details
            </h3>

            <div className='grid grid-cols-2 gap-4 mb-4'>
              <input
                type='text'
                name='contact'
                placeholder='Contact Number'
                value={form.contact}
                onChange={handleChange}
                className='border p-3 rounded'
              />

              <input
                type='email'
                name='salonEmail'
                placeholder='Salon Email'
                value={form.salonEmail}
                onChange={handleChange}
                className='border p-3 rounded'
              />
            </div>

            {/* TIMING */}

            <h3 className='font-semibold mb-2 text-gray-600'>Salon Timing</h3>

            <div className='grid grid-cols-2 gap-4 mb-4'>
              <input
                type='time'
                name='opentime'
                value={form.opentime}
                onChange={handleChange}
                className='border p-3 rounded'
              />

              <input
                type='time'
                name='closetime'
                value={form.closetime}
                onChange={handleChange}
                className='border p-3 rounded'
              />
            </div>

            {/* MAP */}

            <input
              type='text'
              name='mapLink'
              placeholder='Google Map Link'
              value={form.mapLink}
              onChange={handleChange}
              className='border p-3 rounded w-full mb-6'
            />

            <div className='mb-6'>
              <label className='block mb-2 font-medium text-gray-700'>
                Document Type
              </label>

              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className='w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='GST_CERTIFICATE'>GST Certificate</option>

                <option value='SHOP_LICENSE'>Shop License</option>

                <option value='FSSAI_LICENSE'>FSSAI License</option>

                <option value='OTHER'>Other</option>
              </select>
            </div>

            {/* IMAGES */}

            <h3 className='font-semibold mb-2 text-gray-600'>Salon Images</h3>

            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div>
                <label className='text-sm text-gray-500'>Cover Image</label>
                <input
                  type='file'
                  onChange={(e) => setCover(e.target.files[0])}
                />
              </div>

              <div>
                <label className='text-sm text-gray-500'>Interior Image</label>
                <input
                  type='file'
                  onChange={(e) => setInterior(e.target.files[0])}
                />
              </div>

              <div>
                <label className='text-sm text-gray-500'>Exterior Image</label>
                <input
                  type='file'
                  onChange={(e) => setExterior(e.target.files[0])}
                />
              </div>

              <div>
                <label className='text-sm text-gray-500'>Owner Photo</label>
                <input
                  type='file'
                  onChange={(e) => setOwnerPhoto(e.target.files[0])}
                />
              </div>
            </div>

            {/* DOCUMENT */}

            <div className='mb-6'>
              <label className='text-sm text-gray-500'>Salon Document</label>

              <input
                type='file'
                onChange={(e) => setDocument(e.target.files[0])}
              />
            </div>

            {/* BUTTONS */}

            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setShowPopup(false)}
                className='px-5 py-2 border rounded-lg'
              >
                Cancel
              </button>

              <button
                onClick={editingSalon ? handleUpdateSalon : handleAddSalon}
                className='px-5 py-2 bg-blue-600 text-white rounded-lg'
              >
                {editingSalon ? 'Update Salon' : 'Add Salon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  )
}
