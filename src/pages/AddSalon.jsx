import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import OwnerLayout from '../componenets/OwnerLayout'
import {
  Trash2,
  Plus,
  Image as ImageIcon,
  X,
  Clock3,
  BadgeCheck,
} from 'lucide-react'
import { createPortal } from 'react-dom'

const BASE_URL = 'https://render-qs89.onrender.com' // Change this to your actual backend URL

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

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const isValidIndianPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(phone)
}

const isValidUrl = (value) => {
  if (!value) return true
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

const validateSalonForm = ({
  form,
  requireDocument = false,
  requireCover = false,
  addDocument,
  addCover,
}) => {
  if (!form.name?.trim()) return 'Salon name is required'
  if (!form.city?.trim()) return 'City is required'
  if (!form.address?.trim()) return 'Address is required'
  if (!form.contact?.trim()) return 'Contact number is required'
  if (!isValidIndianPhone(form.contact.trim()))
    return 'Enter valid 10 digit contact number'
  if (!form.salonEmail?.trim()) return 'Salon email is required'
  if (!isValidEmail(form.salonEmail.trim())) return 'Enter valid salon email'
  if (!form.opentime) return 'Open time is required'
  if (!form.closetime) return 'Close time is required'
  if (form.opentime >= form.closetime)
    return 'Open time must be before close time'
  if (form.mapLink && !isValidUrl(form.mapLink.trim()))
    return 'Enter valid map link'

  if (requireDocument && !addDocument)
    return 'Please upload verification document'
  if (requireCover && !addCover) return 'Please upload cover image'

  return null
}

export default function ManageSalons() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const ownerId = user?.userId

  const [salons, setSalons] = useState([])
  const [selectedSalon, setSelectedSalon] = useState(null)

  const [showPopup, setShowPopup] = useState(false)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [salonToDelete, setSalonToDelete] = useState(null)

  const [editForm, setEditForm] = useState(emptyForm)
  const [addForm, setAddForm] = useState(emptyForm)
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
  const [cities, setCities] = useState([])

  const loadCities = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/city/owner/active`)
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'City list load failed')
      }

      const data = await res.json()
      setCities(Array.isArray(data) ? data : [])
    } catch (error) {
      setCities([])
      toast.error(error.message || 'City list load failed')
    }
  }

  const loadSalons = async (preferredSalonId = null) => {
    try {
      const res = await fetch(`${BASE_URL}/api/salon/get-salon-by-owner/${ownerId}`)
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Salon load failed')
      }

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
        setEditForm(salonFormData)
        setOriginalForm(salonFormData)
      } else {
        setSelectedSalon(null)
        setEditForm(emptyForm)
        setOriginalForm(emptyForm)
      }
    } catch (error) {
      toast.error(error.message || 'Salon load failed')
    }
  }

  useEffect(() => {
    if (showPopup || deleteModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [showPopup, deleteModalOpen])

  useEffect(() => {
    loadCities()
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
    setEditForm(salonFormData)
    setOriginalForm(salonFormData)
    setEditCover(null)
  }

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleAddChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value })
  }

  const resetPopupForm = () => {
    setAddForm(emptyForm)
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
  }

  const handleAddSalon = async () => {
    const validationError = validateSalonForm({
      form: addForm,
      requireDocument: true,
      requireCover: true,
      addDocument,
      addCover,
    })

    if (validationError) {
      toast.error(validationError)
      return
    }

    setIsAddingSalon(true)

    try {
      const formData = new FormData()

      formData.append('ownerId', ownerId)
      formData.append('documentType', documentType)

      Object.keys(addForm).forEach((key) => {
        formData.append(key, addForm[key])
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

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Add salon failed')
      }

      const createdSalon = await res.json()

      toast.success('Salon added successfully')
      setShowPopup(false)
      resetPopupForm()
      await loadSalons(createdSalon?.id || null)
    } catch (error) {
      toast.error(error.message || 'Add salon failed')
    } finally {
      setIsAddingSalon(false)
    }
  }

  const handleUpdateSalon = async () => {
    if (!selectedSalon) {
      toast.error('No salon selected')
      return
    }

    if (!hasSalonChanged) return

    const validationError = validateSalonForm({
      form: editForm,
      requireDocument: false,
      requireCover: false,
      addDocument: null,
      addCover: null,
    })

    if (validationError) {
      toast.error(validationError)
      return
    }

    setIsUpdatingSalon(true)

    try {
      const formData = new FormData()

      formData.append('ownerId', ownerId)

      Object.keys(editForm).forEach((key) => {
        formData.append(key, editForm[key])
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

      const response = await fetch(
        `${BASE_URL}/api/salon/delete-salon/${salonToDelete.id}?ownerId=${currentOwnerId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Delete failed')
      }

      const updatedSalons = salons.filter((s) => s.id !== salonToDelete.id)
      setSalons(updatedSalons)

      if (selectedSalon?.id === salonToDelete.id) {
        if (updatedSalons.length > 0) {
          handleSelectSalon(updatedSalons[0])
        } else {
          setSelectedSalon(null)
          setEditForm(emptyForm)
          setOriginalForm(emptyForm)
        }
      }

      toast.success('Salon deleted successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to delete salon')
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
    JSON.stringify(editForm) !== JSON.stringify(originalForm)

  const hasSalonChanged = hasFormChanged || !!editCover

  return (
    <OwnerLayout>
      <div className='max-w-7xl mx-auto py-4 animate-fadeIn relative'>
        <div className='mb-6'>
          <h1 className='text-2xl sm:text-[28px] font-bold text-gray-950 tracking-tight'>
            Manage Salons
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            View, update, add, and manage all your salons in one place.
          </p>
        </div>

        <div className='flex flex-col xl:flex-row gap-5 sm:gap-6'>
          <div className='xl:w-[360px] bg-white rounded-3xl border border-gray-200 shadow-sm p-5 animate-slideUp'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-gray-950'>Salon List</h2>
              <span className='text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600'>
                {salons.length} Total
              </span>
            </div>

            <button
              type='button'
              onClick={handleOpenAddPopup}
              className='w-full bg-black hover:bg-gray-800 hover:-translate-y-0.5 text-white py-3 rounded-2xl mb-4 transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-sm hover:shadow-md'
            >
              <Plus size={18} />
              Add Salon
            </button>

            <div className='space-y-3 max-h-[620px] overflow-y-auto pr-1'>
              {salons.length > 0 ? (
                salons.map((salon, index) => (
                  <div
                    key={salon.id}
                    onClick={() => handleSelectSalon(salon)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${selectedSalon?.id === salon.id
                      ? 'bg-black text-white border-black shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                      }`}
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className='flex justify-between gap-3'>
                      <div className='min-w-0'>
                        <div className='flex items-center gap-2'>
                          <h3 className='font-semibold text-base truncate'>{salon.name}</h3>

                          <div className='relative group shrink-0'>
                            {String(salon?.verificationStatus || '').toUpperCase() === 'APPROVED' ? (
                              <BadgeCheck
                                size={16}
                                className={`${selectedSalon?.id === salon.id ? 'text-emerald-300' : 'text-emerald-600'
                                  }`}
                              />
                            ) : (
                              <Clock3
                                size={16}
                                className={`${selectedSalon?.id === salon.id ? 'text-amber-300' : 'text-amber-500'
                                  }`}
                              />
                            )}

                            <div
                              className={`pointer-events-none absolute left-1/2 top-[-38px] -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-medium shadow-md opacity-0 group-hover:opacity-100 transition ${selectedSalon?.id === salon.id
                                ? 'bg-white text-gray-900'
                                : 'bg-gray-900 text-white'
                                }`}
                            >
                              {String(salon?.verificationStatus || '').toUpperCase() === 'APPROVED'
                                ? 'Approved'
                                : 'Pending'}
                            </div>
                          </div>
                        </div>

                        <p
                          className={`text-sm mt-1 ${selectedSalon?.id === salon.id
                            ? 'text-white/80'
                            : 'text-gray-500'
                            }`}
                        >
                          {salon.city || 'No city'}
                        </p>
                      </div>

                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClick(salon)
                        }}
                        className={`p-2 rounded-xl transition shrink-0 ${selectedSalon?.id === salon.id
                          ? 'hover:bg-white/10 text-white'
                          : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                          }`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className='rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500'>
                  No salons added yet
                </div>
              )}
            </div>
          </div>

          <div className='flex-1 bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-6 animate-slideUp-delayed'>
            {selectedSalon ? (
              <>
                <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6'>
                  <div>
                    <h2 className='text-xl sm:text-2xl font-bold text-gray-950'>
                      Salon Details
                    </h2>
                    <p className='text-sm text-gray-500 mt-1'>
                      Update salon profile details and cover image.
                    </p>
                  </div>

                  <div className='inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600'>
                    Selected: <span className='font-semibold ml-1'>{selectedSalon.name}</span>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mb-5'>
                  <InputField
                    label='Salon Name'
                    name='name'
                    value={editForm.name}
                    onChange={handleEditChange}
                    placeholder='Enter salon name'
                  />

                  <div>
                    <label className='block mb-2 text-sm font-medium text-gray-800'>City</label>
                    <select
                      name='city'
                      value={editForm.city}
                      onChange={handleEditChange}
                      className='border border-gray-200 px-4 py-3 rounded-2xl w-full outline-none focus:border-gray-400 transition-all duration-300'
                    >
                      <option value=''>Select City</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className='mb-5'>
                  <label className='block mb-2 text-sm font-medium text-gray-800'>
                    Address
                  </label>
                  <textarea
                    name='address'
                    value={editForm.address}
                    onChange={handleEditChange}
                    rows='4'
                    className='border border-gray-200 px-4 py-3 rounded-2xl w-full resize-none outline-none focus:border-gray-400 transition-all duration-300'
                    placeholder='Enter salon address'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mb-5'>
                  <InputField
                    label='Contact'
                    name='contact'
                    value={editForm.contact}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setEditForm({ ...editForm, contact: onlyDigits })
                    }}
                    placeholder='Enter contact number'
                  />

                  <InputField
                    label='Salon Email'
                    name='salonEmail'
                    type='email'
                    value={editForm.salonEmail}
                    onChange={handleEditChange}
                    placeholder='Enter salon email'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mb-5'>
                  <InputField
                    label='Open Time'
                    name='opentime'
                    type='time'
                    value={editForm.opentime}
                    onChange={handleEditChange}
                  />

                  <InputField
                    label='Close Time'
                    name='closetime'
                    type='time'
                    value={editForm.closetime}
                    onChange={handleEditChange}
                  />
                </div>

                <div className='mb-6'>
                  <InputField
                    label='Google Map Link'
                    name='mapLink'
                    value={editForm.mapLink}
                    onChange={handleEditChange}
                    placeholder='Paste Google Map link'
                  />
                </div>

                <div className='mb-8'>
                  <label className='block mb-2 text-sm font-medium text-gray-800'>
                    Cover Image
                  </label>

                  <div className='border border-gray-200 rounded-3xl p-4 sm:p-5 bg-gray-50 transition-all duration-300'>
                    {!editCover && currentCoverUrl ? (
                      <div>
                        <p className='text-sm text-gray-500 mb-3'>Current cover image</p>
                        <img
                          src={currentCoverUrl}
                          alt='Salon Cover'
                          className='w-full h-56 sm:h-64 object-cover rounded-2xl border border-gray-200 mb-3'
                        />
                      </div>
                    ) : null}

                    {editCover ? (
                      <div>
                        <p className='text-sm text-gray-500 mb-3'>New selected cover image</p>
                        <img
                          src={URL.createObjectURL(editCover)}
                          alt='New Cover Preview'
                          className='w-full h-56 sm:h-64 object-cover rounded-2xl border border-gray-200 mb-3'
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
                      <div className='h-56 sm:h-64 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white text-gray-400 mb-3'>
                        <ImageIcon size={28} />
                        <p className='text-sm mt-2'>No cover image available</p>
                      </div>
                    )}

                    <input
                      type='file'
                      accept='image/*'
                      onChange={(e) => setEditCover(e.target.files[0])}
                      className='w-full border border-gray-200 p-3 rounded-2xl bg-white mt-3'
                    />
                  </div>
                </div>

                <button
                  type='button'
                  onClick={handleUpdateSalon}
                  disabled={isUpdatingSalon || !hasSalonChanged}
                  className={`px-6 py-3 rounded-2xl transition-all duration-300 text-white font-medium ${isUpdatingSalon || !hasSalonChanged
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-black hover:bg-gray-800 hover:-translate-y-0.5 shadow-sm hover:shadow-md'
                    }`}
                >
                  {isUpdatingSalon ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <div className='h-full min-h-[420px] flex items-center justify-center text-gray-500 text-center'>
                No salon selected
              </div>
            )}
          </div>
        </div>
      </div>

      {deleteModalOpen && (
        <ModalPortal>
          <div className='fixed inset-0 z-[9999] bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-4 animate-fadeIn'>
            <div className='bg-white p-6 rounded-3xl shadow-lg w-full max-w-md animate-scaleIn relative'>
              <button
                type='button'
                onClick={cancelDelete}
                className='absolute top-4 right-4 w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition'
              >
                <X size={18} />
              </button>

              <h2 className='text-2xl font-bold mb-3 text-gray-950'>Confirm Delete</h2>
              <p className='mb-6 text-gray-600 leading-7'>
                Are you sure you want to delete <strong>{salonToDelete?.name}</strong>?
              </p>

              <div className='flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={cancelDelete}
                  className='px-5 py-2.5 border border-gray-200 rounded-2xl hover:bg-gray-50 transition'
                >
                  Cancel
                </button>

                <button
                  type='button'
                  onClick={confirmDelete}
                  className='px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl transition'
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {showPopup && (
        <ModalPortal>
          <div
            className='fixed inset-0 z-[9999] bg-black/55 backdrop-blur-[2px] overflow-y-auto animate-fadeIn'
            onClick={handleClosePopup}
          >
            <div className='min-h-screen flex items-start justify-center p-4 sm:p-6 lg:p-8'>
              <div
                className='bg-white w-full max-w-6xl rounded-3xl shadow-2xl p-6 sm:p-8 relative animate-scaleIn my-6'
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type='button'
                  onClick={handleClosePopup}
                  className='absolute top-5 right-5 w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition'
                >
                  <X size={20} />
                </button>

                <div className='mb-6 pr-12'>
                  <h2 className='text-2xl font-bold text-gray-950 mb-1'>Add New Salon</h2>
                  <p className='text-sm text-gray-500'>
                    Fill salon details, upload salon images, and choose one verification document.
                  </p>
                </div>

                <h3 className='text-lg font-semibold mb-3 text-gray-950'>Basic Details</h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                  <PopupInput
                    type='text'
                    name='name'
                    placeholder='Salon Name'
                    value={addForm.name}
                    onChange={handleAddChange}
                  />

                  <select
                    name='city'
                    value={addForm.city}
                    onChange={handleAddChange}
                    className='w-full border border-gray-200 px-4 py-3 rounded-2xl outline-none focus:border-gray-400 transition-all duration-300'
                  >
                    <option value=''>Select City</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  name='address'
                  placeholder='Salon Address'
                  value={addForm.address}
                  onChange={handleAddChange}
                  className='w-full border border-gray-200 px-4 py-3 rounded-2xl resize-none mb-4 outline-none focus:border-gray-400 transition-all duration-300'
                  rows='4'
                />

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                  <PopupInput
                    type='text'
                    name='contact'
                    placeholder='Contact Number'
                    value={addForm.contact}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setAddForm({ ...addForm, contact: onlyDigits })
                    }}
                  />

                  <PopupInput
                    type='email'
                    name='salonEmail'
                    placeholder='Salon Email'
                    value={addForm.salonEmail}
                    onChange={handleAddChange}
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                  <PopupInput
                    type='time'
                    name='opentime'
                    value={addForm.opentime}
                    onChange={handleAddChange}
                  />

                  <PopupInput
                    type='time'
                    name='closetime'
                    value={addForm.closetime}
                    onChange={handleAddChange}
                  />
                </div>

                <PopupInput
                  type='text'
                  name='mapLink'
                  placeholder='Google Map Link'
                  value={addForm.mapLink}
                  onChange={handleAddChange}
                  className='mb-6'
                />

                <h3 className='text-lg font-semibold mb-3 text-gray-950'>Salon Images</h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mb-6'>
                  <UploadCard
                    label='Cover Image'
                    file={addCover}
                    setFile={setAddCover}
                    accept='image/*'
                    previewType='image'
                  />

                  <UploadCard
                    label='Interior Image'
                    file={addInterior}
                    setFile={setAddInterior}
                    accept='image/*'
                    previewType='image'
                  />

                  <UploadCard
                    label='Exterior Image'
                    file={addExterior}
                    setFile={setAddExterior}
                    accept='image/*'
                    previewType='image'
                  />

                  <UploadCard
                    label='Owner Photo'
                    file={addOwnerPhoto}
                    setFile={setAddOwnerPhoto}
                    accept='image/*'
                    previewType='image'
                  />
                </div>

                <div className='mb-6'>
                  <h3 className='text-lg font-semibold mb-3 text-gray-950'>
                    Verification Document
                  </h3>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    <div>
                      <label className='block mb-2 text-sm font-medium text-gray-800'>
                        Document Type
                      </label>
                      <select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className='w-full border border-gray-200 px-4 py-3 rounded-2xl outline-none focus:border-gray-400 transition-all duration-300'
                      >
                        <option value='GST_CERTIFICATE'>GST Certificate</option>
                        <option value='ELECTRICITY_BILL'>Electricity Bill</option>
                        <option value='GUMASTA_LICENSE'>Gumasta License</option>
                        <option value='RENT_AGREEMENT'>Rent Agreement</option>
                        <option value='MUNICIPAL_TRADE_LICENSE'>Municipal Trade License</option>
                      </select>
                    </div>

                    <UploadCard
                      label='Upload Document'
                      file={addDocument}
                      setFile={setAddDocument}
                      previewType='file'
                    />
                  </div>
                </div>

                <div className='flex justify-end gap-3'>
                  <button
                    type='button'
                    onClick={handleClosePopup}
                    className='px-5 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 transition'
                  >
                    Cancel
                  </button>

                  <button
                    type='button'
                    onClick={handleAddSalon}
                    disabled={isAddingSalon}
                    className={`px-5 py-3 text-white rounded-2xl transition-all duration-300 ${isAddingSalon
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-black hover:bg-gray-800 hover:-translate-y-0.5 shadow-sm hover:shadow-md'
                      }`}
                  >
                    {isAddingSalon ? 'Adding Salon...' : 'Add Salon'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.35s ease both;
        }

        .animate-slideUp {
          animation: slideUp 0.45s ease both;
        }

        .animate-slideUp-delayed {
          animation: slideUp 0.6s ease 0.08s both;
        }

        .animate-scaleIn {
          animation: scaleIn 0.25s ease both;
        }
      `}</style>
    </OwnerLayout>
  )
}

function ModalPortal({ children }) {
  if (typeof document === 'undefined') return null
  return createPortal(children, document.body)
}

function InputField({ label, className = '', ...props }) {
  return (
    <div className={className}>
      <label className='block mb-2 text-sm font-medium text-gray-800'>{label}</label>
      <input
        {...props}
        className='border border-gray-200 px-4 py-3 rounded-2xl w-full outline-none focus:border-gray-400 transition-all duration-300'
      />
    </div>
  )
}

function PopupInput({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full border border-gray-200 px-4 py-3 rounded-2xl outline-none focus:border-gray-400 transition-all duration-300 ${className}`}
    />
  )
}

function UploadCard({ label, file, setFile, accept, previewType = 'image' }) {
  return (
    <div className='border border-gray-200 rounded-3xl p-4 bg-gray-50 transition-all duration-300 hover:shadow-sm'>
      <label className='block mb-2 text-sm font-medium text-gray-800'>{label}</label>
      <input
        type='file'
        accept={accept}
        onChange={(e) => setFile(e.target.files[0])}
        className='w-full border border-gray-200 p-3 rounded-2xl bg-white'
      />

      {file && previewType === 'image' && (
        <div className='mt-3 animate-fadeIn'>
          <img
            src={URL.createObjectURL(file)}
            alt='Preview'
            className='w-full h-40 object-cover rounded-2xl border border-gray-200'
          />
          <button
            type='button'
            onClick={() => setFile(null)}
            className='mt-2 text-sm text-red-600'
          >
            Remove image
          </button>
        </div>
      )}

      {file && previewType === 'file' && (
        <div className='mt-3 rounded-2xl border border-gray-200 bg-white px-3 py-3 animate-fadeIn'>
          <p className='text-sm truncate text-gray-700'>{file.name}</p>
          <button
            type='button'
            onClick={() => setFile(null)}
            className='mt-2 text-sm text-red-600'
          >
            Remove document
          </button>
        </div>
      )}
    </div>
  )
}