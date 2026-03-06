import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import OwnerLayout from '../componenets/OwnerLayout'

const BASE_URL = 'https://render-qs89.onrender.com'

const emptyForm = {
  name: '',
  city: '',
  address: '',
  contact: '',
  salonEmail: '',
  opentime: '',
  closetime: '',
  mapLink: '',
}

export default function ManageSalons() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const ownerId = user?.userId

  const [salons, setSalons] = useState([])
  const [selectedSalon, setSelectedSalon] = useState(null)

  const [showPopup, setShowPopup] = useState(false)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [salonToDelete, setSalonToDelete] = useState(null)

  const [form, setForm] = useState(emptyForm)
  const [documentType, setDocumentType] = useState('GST_CERTIFICATE')

  const [editCover, setEditCover] = useState(null)

  const [addCover, setAddCover] = useState(null)
  const [addInterior, setAddInterior] = useState(null)
  const [addExterior, setAddExterior] = useState(null)
  const [addOwnerPhoto, setAddOwnerPhoto] = useState(null)
  const [addDocument, setAddDocument] = useState(null)

  const [isAddingSalon, setIsAddingSalon] = useState(false)
  const [isUpdatingSalon, setIsUpdatingSalon] = useState(false)
  const [originalForm, setOriginalForm] = useState(emptyForm)

  const loadSalons = async (preferredSalonId = null) => {
    try {
      const res = await fetch(`${BASE_URL}/api/salon/get-salon-by-owner/${ownerId}`)
      const data = await res.json()

      const safeData = Array.isArray(data) ? data : []
      setSalons(safeData)

      if (safeData.length > 0) {
        const salonToSelect =
          safeData.find((salon) => salon.id === preferredSalonId) || safeData[0]

        const salonFormData = {
          name: salonToSelect.name || '',
          city: salonToSelect.city || '',
          address: salonToSelect.address || '',
          contact: salonToSelect.contact || '',
          salonEmail: salonToSelect.salonEmail || '',
          opentime: salonToSelect.opentime || '',
          closetime: salonToSelect.closetime || '',
          mapLink: salonToSelect.mapLink || '',
        }

        setSelectedSalon(salonToSelect)
        setForm(salonFormData)
        setOriginalForm(salonFormData)
      } else {
        setSelectedSalon(null)
        setForm(emptyForm)
        setOriginalForm(emptyForm)
      }
    } catch {
      toast.error('Salon load failed')
    }
  }

  useEffect(() => {
    if (ownerId) loadSalons()
  }, [ownerId])

  const handleSelectSalon = (salon) => {
    const salonFormData = {
      name: salon.name || '',
      city: salon.city || '',
      address: salon.address || '',
      contact: salon.contact || '',
      salonEmail: salon.salonEmail || '',
      opentime: salon.opentime || '',
      closetime: salon.closetime || '',
      mapLink: salon.mapLink || '',
    }

    setSelectedSalon(salon)
    setForm(salonFormData)
    setOriginalForm(salonFormData)
    setEditCover(null)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const resetPopupForm = () => {
    setForm(emptyForm)
    setDocumentType('GST_CERTIFICATE')
    setAddCover(null)
    setAddInterior(null)
    setAddExterior(null)
    setAddOwnerPhoto(null)
    setAddDocument(null)
  }

  const handleOpenAddPopup = () => {
    resetPopupForm()
    setShowPopup(true)
  }

  const handleClosePopup = () => {
    setShowPopup(false)
    resetPopupForm()

    if (selectedSalon) {
      handleSelectSalon(selectedSalon)
    }
  }

  const handleAddSalon = async () => {
    if (!addDocument) {
      toast.error('Please upload verification document')
      return
    }

    if (!addCover) {
      toast.error('Please upload cover image')
      return
    }

    setIsAddingSalon(true)

    try {
      const formData = new FormData()

      formData.append('ownerId', ownerId)
      formData.append('documentType', documentType)

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key])
      })

      if (addCover) formData.append('cover', addCover)
      if (addInterior) formData.append('interior', addInterior)
      if (addExterior) formData.append('exterior', addExterior)
      if (addOwnerPhoto) formData.append('ownerPhoto', addOwnerPhoto)
      if (addDocument) formData.append('document', addDocument)

      const res = await fetch(`${BASE_URL}/api/salon/add-salon`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error()

      toast.success('Salon Added')
      setShowPopup(false)
      resetPopupForm()
      await loadSalons()
    } catch {
      toast.error('Add salon failed')
    } finally {
      setIsAddingSalon(false)
    }
  }

  const handleUpdateSalon = async () => {
    if (!selectedSalon) {
      toast.error('No salon selected')
      return
    }

    if (!hasSalonChanged) {
      return
    }

    setIsUpdatingSalon(true)

    try {
      const formData = new FormData()

      formData.append('ownerId', ownerId)

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key])
      })

      if (editCover) formData.append('cover', editCover)

      const res = await fetch(
        `${BASE_URL}/api/salon/update-salon/${selectedSalon.id}`,
        {
          method: 'PATCH',
          body: formData,
        }
      )

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Update failed')
      }

      toast.success('Salon updated successfully')
      await loadSalons(selectedSalon.id)
      setEditCover(null)
    } catch (error) {
      toast.error(error.message || 'Update failed')
    } finally {
      setIsUpdatingSalon(false)
    }
  }

  const confirmDelete = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const currentOwnerId = currentUser?.userId

      const formData = new FormData()
      formData.append('ownerId', currentOwnerId)

      const response = await fetch(
        `${BASE_URL}/api/salon/delete-salon/${salonToDelete.id}`,
        {
          method: 'DELETE',
          body: formData,
        }
      )

      if (!response.ok) throw new Error('Delete failed')

      const updatedSalons = salons.filter((s) => s.id !== salonToDelete.id)
      setSalons(updatedSalons)

      if (selectedSalon?.id === salonToDelete.id) {
        if (updatedSalons.length > 0) {
          handleSelectSalon(updatedSalons[0])
        } else {
          setSelectedSalon(null)
          setForm(emptyForm)
        }
      }

      toast.success('Salon deleted successfully')
    } catch {
      toast.error('Failed to delete salon')
    } finally {
      setDeleteModalOpen(false)
      setSalonToDelete(null)
    }
  }

  const handleDeleteClick = (salon) => {
    setSalonToDelete(salon)
    setDeleteModalOpen(true)
  }

  const cancelDelete = () => {
    setDeleteModalOpen(false)
    setSalonToDelete(null)
  }

  const currentCoverUrl =
    selectedSalon?.coverImageUrl ||
    selectedSalon?.coverUrl ||
    selectedSalon?.cover ||
    selectedSalon?.imageUrl ||
    selectedSalon?.image ||
    ''

  const hasFormChanged =
    JSON.stringify(form) !== JSON.stringify(originalForm)

  const hasSalonChanged = hasFormChanged || !!editCover

  return (
    <OwnerLayout>
      <div className='min-h-screen bg-gray-100 p-6 flex flex-col lg:flex-row gap-6'>
        <div className='lg:w-1/3 bg-white rounded-xl shadow p-5'>
          <h2 className='text-lg font-semibold mb-4'>Salon List</h2>

          <button
            onClick={handleOpenAddPopup}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg mb-4 transition'
          >
            + Add Salon
          </button>

          <div className='space-y-4'>
            {salons.map((salon) => (
              <div
                key={salon.id}
                onClick={() => handleSelectSalon(salon)}
                className={`p-4 rounded-lg border cursor-pointer transition ${selectedSalon?.id === salon.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-50 hover:bg-gray-100'
                  }`}
              >
                <div className='flex justify-between gap-3'>
                  <div className='min-w-0'>
                    <h3 className='font-medium text-lg truncate'>{salon.name}</h3>
                    <p
                      className={`text-sm mt-1 ${selectedSalon?.id === salon.id
                        ? 'text-white/90'
                        : 'text-gray-600'
                        }`}
                    >
                      {salon.city}
                    </p>
                  </div>

                  <button
                    className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm shrink-0'
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteClick(salon)
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='lg:w-2/3 bg-white rounded-xl shadow p-6'>
          {selectedSalon ? (
            <>
              <h2 className='text-xl font-bold mb-6'>Salon Details</h2>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                <div>
                  <label className='block mb-1 font-medium'>Salon Name</label>
                  <input
                    type='text'
                    name='name'
                    value={form.name}
                    onChange={handleChange}
                    className='border p-2 rounded w-full'
                  />
                </div>

                <div>
                  <label className='block mb-1 font-medium'>City</label>
                  <input
                    type='text'
                    name='city'
                    value={form.city}
                    onChange={handleChange}
                    className='border p-2 rounded w-full'
                  />
                </div>
              </div>

              <div className='mb-6'>
                <label className='block mb-1 font-medium'>Address</label>
                <textarea
                  name='address'
                  value={form.address}
                  onChange={handleChange}
                  rows='3'
                  className='border p-2 rounded w-full resize-none'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                <div>
                  <label className='block mb-1 font-medium'>Contact</label>
                  <input
                    type='text'
                    name='contact'
                    value={form.contact}
                    onChange={handleChange}
                    className='border p-2 rounded w-full'
                  />
                </div>

                <div>
                  <label className='block mb-1 font-medium'>Salon Email</label>
                  <input
                    type='email'
                    name='salonEmail'
                    value={form.salonEmail}
                    onChange={handleChange}
                    className='border p-2 rounded w-full'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                <div>
                  <label className='block mb-1 font-medium'>Open Time</label>
                  <input
                    type='time'
                    name='opentime'
                    value={form.opentime}
                    onChange={handleChange}
                    className='border p-2 rounded w-full'
                  />
                </div>

                <div>
                  <label className='block mb-1 font-medium'>Close Time</label>
                  <input
                    type='time'
                    name='closetime'
                    value={form.closetime}
                    onChange={handleChange}
                    className='border p-2 rounded w-full'
                  />
                </div>
              </div>

              <div className='mb-6'>
                <label className='block mb-1 font-medium'>Google Map Link</label>
                <input
                  type='text'
                  name='mapLink'
                  value={form.mapLink}
                  onChange={handleChange}
                  className='border p-2 rounded w-full'
                />
              </div>

              <div className='mb-8'>
                <label className='block mb-2 font-medium'>Cover Image</label>

                <div className='border rounded-xl p-4 bg-gray-50'>
                  {!editCover && currentCoverUrl ? (
                    <div>
                      <p className='text-sm text-gray-500 mb-2'>Current cover image</p>
                      <img
                        src={currentCoverUrl}
                        alt='Salon Cover'
                        className='w-full h-56 object-cover rounded-lg border mb-3'
                      />
                    </div>
                  ) : null}

                  {editCover ? (
                    <div>
                      <p className='text-sm text-gray-500 mb-2'>New selected cover image</p>
                      <img
                        src={URL.createObjectURL(editCover)}
                        alt='New Cover Preview'
                        className='w-full h-56 object-cover rounded-lg border mb-3'
                      />
                      <button
                        type='button'
                        onClick={() => setEditCover(null)}
                        className='text-sm text-red-600 hover:text-red-700'
                      >
                        Remove selected cover
                      </button>
                    </div>
                  ) : null}

                  {!currentCoverUrl && !editCover && (
                    <div className='h-56 flex items-center justify-center rounded-lg border bg-white text-gray-400 mb-3'>
                      No cover image available
                    </div>
                  )}

                  <input
                    type='file'
                    accept='image/*'
                    onChange={(e) => setEditCover(e.target.files[0])}
                    className='w-full border p-2 rounded bg-white mt-3'
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateSalon}
                disabled={isUpdatingSalon || !hasSalonChanged}
                className={`px-6 py-2 rounded-lg transition text-white ${isUpdatingSalon || !hasSalonChanged
                  ? 'bg-green-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
                  }`}
              >
                {isUpdatingSalon ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <div className='h-full flex items-center justify-center text-gray-500'>
              No salon selected
            </div>
          )}
        </div>
      </div>

      {deleteModalOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-2xl shadow-lg w-[420px]'>
            <h2 className='text-2xl font-bold mb-4'>Confirm Delete</h2>
            <p className='mb-6 text-lg'>
              Are you sure you want to delete{' '}
              <strong>{salonToDelete?.name}</strong>?
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
                className='px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showPopup && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-white w-full max-w-5xl rounded-2xl shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto'>
            <h2 className='text-2xl font-bold mb-1'>Add New Salon</h2>
            <p className='text-sm text-gray-500 mb-6'>
              Fill salon details, upload salon images, and choose one
              verification document.
            </p>

            <h3 className='text-lg font-semibold mb-3'>Basic Details</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              <input
                type='text'
                name='name'
                placeholder='Salon Name'
                value={form.name}
                onChange={handleChange}
                className='w-full border p-3 rounded-lg'
              />

              <input
                type='text'
                name='city'
                placeholder='City'
                value={form.city}
                onChange={handleChange}
                className='w-full border p-3 rounded-lg'
              />
            </div>

            <textarea
              name='address'
              placeholder='Salon Address'
              value={form.address}
              onChange={handleChange}
              className='w-full border p-3 rounded-lg resize-none mb-4'
              rows='3'
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              <input
                type='text'
                name='contact'
                placeholder='Contact Number'
                value={form.contact}
                onChange={handleChange}
                className='w-full border p-3 rounded-lg'
              />

              <input
                type='email'
                name='salonEmail'
                placeholder='Salon Email'
                value={form.salonEmail}
                onChange={handleChange}
                className='w-full border p-3 rounded-lg'
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              <input
                type='time'
                name='opentime'
                value={form.opentime}
                onChange={handleChange}
                className='w-full border p-3 rounded-lg'
              />

              <input
                type='time'
                name='closetime'
                value={form.closetime}
                onChange={handleChange}
                className='w-full border p-3 rounded-lg'
              />
            </div>

            <input
              type='text'
              name='mapLink'
              placeholder='Google Map Link'
              value={form.mapLink}
              onChange={handleChange}
              className='w-full border p-3 rounded-lg mb-6'
            />

            <h3 className='text-lg font-semibold mb-3'>Salon Images</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mb-6'>
              <div className='border rounded-xl p-4'>
                <label className='block mb-2 font-medium'>Cover Image</label>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(e) => setAddCover(e.target.files[0])}
                  className='w-full border p-2 rounded-lg'
                />
                {addCover && (
                  <div className='mt-3'>
                    <img
                      src={URL.createObjectURL(addCover)}
                      alt='Cover Preview'
                      className='w-full h-40 object-cover rounded-lg border'
                    />
                    <button
                      type='button'
                      onClick={() => setAddCover(null)}
                      className='mt-2 text-sm text-red-600'
                    >
                      Remove image
                    </button>
                  </div>
                )}
              </div>

              <div className='border rounded-xl p-4'>
                <label className='block mb-2 font-medium'>Interior Image</label>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(e) => setAddInterior(e.target.files[0])}
                  className='w-full border p-2 rounded-lg'
                />
                {addInterior && (
                  <div className='mt-3'>
                    <img
                      src={URL.createObjectURL(addInterior)}
                      alt='Interior Preview'
                      className='w-full h-40 object-cover rounded-lg border'
                    />
                    <button
                      type='button'
                      onClick={() => setAddInterior(null)}
                      className='mt-2 text-sm text-red-600'
                    >
                      Remove image
                    </button>
                  </div>
                )}
              </div>

              <div className='border rounded-xl p-4'>
                <label className='block mb-2 font-medium'>Exterior Image</label>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(e) => setAddExterior(e.target.files[0])}
                  className='w-full border p-2 rounded-lg'
                />
                {addExterior && (
                  <div className='mt-3'>
                    <img
                      src={URL.createObjectURL(addExterior)}
                      alt='Exterior Preview'
                      className='w-full h-40 object-cover rounded-lg border'
                    />
                    <button
                      type='button'
                      onClick={() => setAddExterior(null)}
                      className='mt-2 text-sm text-red-600'
                    >
                      Remove image
                    </button>
                  </div>
                )}
              </div>

              <div className='border rounded-xl p-4'>
                <label className='block mb-2 font-medium'>Owner Photo</label>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(e) => setAddOwnerPhoto(e.target.files[0])}
                  className='w-full border p-2 rounded-lg'
                />
                {addOwnerPhoto && (
                  <div className='mt-3'>
                    <img
                      src={URL.createObjectURL(addOwnerPhoto)}
                      alt='Owner Preview'
                      className='w-full h-40 object-cover rounded-lg border'
                    />
                    <button
                      type='button'
                      onClick={() => setAddOwnerPhoto(null)}
                      className='mt-2 text-sm text-red-600'
                    >
                      Remove image
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className='mb-6'>
              <h3 className='text-lg font-semibold mb-3'>
                Verification Document
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div>
                  <label className='block mb-2 font-medium'>Document Type</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className='w-full border p-3 rounded-lg'
                  >
                    <option value='GST_CERTIFICATE'>GST Certificate</option>
                    <option value='SHOP_LICENSE'>Shop License</option>
                    <option value='FSSAI_LICENSE'>FSSAI License</option>
                    <option value='OTHER'>Other</option>
                  </select>
                </div>

                <div>
                  <label className='block mb-2 font-medium'>
                    Upload Document
                  </label>
                  <input
                    type='file'
                    onChange={(e) => setAddDocument(e.target.files[0])}
                    className='w-full border p-3 rounded-lg'
                  />

                  {addDocument && (
                    <div className='mt-3 rounded-lg border bg-gray-50 px-3 py-2'>
                      <p className='text-sm truncate'>{addDocument.name}</p>
                      <button
                        type='button'
                        onClick={() => setAddDocument(null)}
                        className='mt-2 text-sm text-red-600'
                      >
                        Remove document
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='flex justify-end gap-3'>
              <button
                onClick={handleClosePopup}
                className='px-5 py-2 border rounded-lg'
              >
                Cancel
              </button>

              <button
                onClick={handleAddSalon}
                disabled={isAddingSalon}
                className={`px-5 py-2 text-white rounded-lg ${isAddingSalon ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {isAddingSalon ? 'Adding Salon...' : 'Add Salon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  )
}