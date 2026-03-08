import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi'
import OwnerLayout from '../componenets/OwnerLayout'

const BASE_URL = 'https://render-qs89.onrender.com'

export default function ServicesPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const ownerId = user?.userid || user?.userId || ''

  const [salons, setSalons] = useState([])
  const savedSalonId = localStorage.getItem('salonId')
  const [selectedSalonId, setSelectedSalonId] = useState(
    savedSalonId && savedSalonId !== 'undefined' ? savedSalonId : ''
  )

  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)

  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  const [showServiceModal, setShowServiceModal] = useState(false)
  const [editingService, setEditingService] = useState(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteType, setDeleteType] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const [masterCategories, setMasterCategories] = useState([])
  const [selectedMasterCategoryId, setSelectedMasterCategoryId] = useState('')

  const [isSavingService, setIsSavingService] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    genderCategory: 'women',
    price: '',
    time: '',
    image: null,
  })

  useEffect(() => {
    if (!ownerId) {
      toast.error('Owner not found, please login again')
      setSalons([])
      setSelectedSalonId('')
      localStorage.removeItem('salonId')
      return
    }

    fetch(`${BASE_URL}/api/salon/get-salon-by-owner/${ownerId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch salons')
        return res.json()
      })
      .then((data) => {
        const raw = Array.isArray(data) ? data : []

        const normalized = raw
          .map((s) => {
            const sid = s?.id || s?._id?.$oid || s?._id || s?.salonId
            return sid ? { ...s, sid } : null
          })
          .filter(Boolean)

        const unique = Array.from(
          new Map(normalized.map((s) => [s.sid, s])).values()
        )

        setSalons(unique)

        if (unique.length === 0) {
          toast.error('No salons found')
          setSelectedSalonId('')
          localStorage.removeItem('salonId')
          return
        }

        const stored = localStorage.getItem('salonId')
        const storedValid =
          stored &&
          stored !== 'undefined' &&
          unique.some((s) => s.sid === stored)

        const initialSalonId = storedValid ? stored : unique[0].sid
        setSelectedSalonId(initialSalonId)
        localStorage.setItem('salonId', initialSalonId)
      })
      .catch(() => {
        toast.error('Failed to load salons')
        setSalons([])
        setSelectedSalonId('')
        localStorage.removeItem('salonId')
      })
  }, [ownerId])

  useEffect(() => {
    if (selectedSalonId) fetchCategories(selectedSalonId)
  }, [selectedSalonId])

  const fetchCategories = async (sid) => {
    try {
      setLoading(true)
      const res = await axios.get(
        `${BASE_URL}/api/service-category/get-service-categories/${sid}`
      )
      const data = Array.isArray(res.data) ? res.data : []
      setCategories(data)

      if (data.length > 0) {
        setSelectedCategory(data[0])
        fetchServices(sid, data[0].id)
      } else {
        setSelectedCategory(null)
        setServices([])
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async (sid, categoryId) => {
    try {
      setLoading(true)
      const res = await axios.get(`${BASE_URL}/api/service/get-services`, {
        params: { salonId: sid, categoryId },
      })
      setServices(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySubmit = async () => {
    try {
      if (!selectedMasterCategoryId) {
        toast.error('Please select a category')
        return
      }

      await axios.post(
        `${BASE_URL}/api/service-category/add-service-category/${selectedSalonId}/${selectedMasterCategoryId}`
      )

      toast.success('Category added to salon')
      setShowCategoryModal(false)
      fetchCategories(selectedSalonId)
    } catch (err) {
      console.error(err)
      toast.error('Failed to add category')
    }
  }

  const handleServiceSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Please enter service name')
        return
      }

      if (!formData.price) {
        toast.error('Please enter price')
        return
      }

      if (!formData.time) {
        toast.error('Please select time')
        return
      }

      if (!editingService && !formData.image) {
        toast.error('Please select service image')
        return
      }

      setIsSavingService(true)

      const data = new FormData()
      data.append('name', formData.name)
      data.append('description', formData.description)
      data.append('genderCategory', formData.genderCategory)
      data.append('price', formData.price)
      data.append('time', formData.time)
      if (formData.image) data.append('image', formData.image)

      if (editingService) {
        await axios.patch(
          `${BASE_URL}/api/service/update-service/${editingService.id}`,
          data
        )
        toast.success('Service updated successfully')
      } else {
        await axios.post(
          `${BASE_URL}/api/service/add-service/${selectedCategory.id}?salonId=${selectedSalonId}`,
          data,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        toast.success('Service added successfully')
      }

      setShowServiceModal(false)
      setEditingService(null)
      setFormData({
        name: '',
        description: '',
        genderCategory: 'women',
        price: '',
        time: '',
        image: null,
      })

      fetchServices(selectedSalonId, selectedCategory.id)
    } catch (err) {
      console.error(err)
      toast.error('Failed to save service')
    } finally {
      setIsSavingService(false)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true)

      if (deleteType === 'category') {
        await axios.delete(
          `${BASE_URL}/api/service-category/delete-service-category/${selectedSalonId}/${deleteId}`
        )
        toast.success('Category deleted successfully')
        fetchCategories(selectedSalonId)
      }

      if (deleteType === 'service') {
        await axios.delete(
          `${BASE_URL}/api/service/delete-service/${selectedCategory.id}/${deleteId}`
        )
        toast.success('Service deleted successfully')
        fetchServices(selectedSalonId, selectedCategory.id)
      }

      setShowDeleteModal(false)
      setDeleteId(null)
      setDeleteType(null)
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete')
    } finally {
      setIsDeleting(false)
    }
  }

  const fetchMasterCategories = async () => {
    const res = await axios.get(
      `${BASE_URL}/api/service-category/get-all-master-categories`
    )
    const data = Array.isArray(res.data) ? res.data : []
    setMasterCategories(data)
    setSelectedMasterCategoryId(data[0]?.id || '')
  }

  return (
    <OwnerLayout>
      <div className='max-w-7xl mx-auto py-4 animate-fadeIn'>
        <div className='mb-6'>
          <h1 className='text-2xl sm:text-[28px] font-bold text-gray-950 tracking-tight'>
            Manage Services
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Manage salon categories and services with pricing, timing, and gender targeting.
          </p>
        </div>

        <div className='flex flex-col lg:flex-row gap-5 sm:gap-6 items-start'>
          <div className='w-full lg:w-[300px] xl:w-[340px] bg-white p-5 rounded-3xl border border-gray-200 shadow-sm animate-slideUp'>
            <div className='mb-4'>
              <label className='block text-sm font-medium mb-2 text-gray-800'>
                Select Salon
              </label>

              <select
                value={selectedSalonId || ''}
                onChange={(e) => {
                  const sid = e.target.value
                  setSelectedSalonId(sid)
                  localStorage.setItem('salonId', sid)
                  setCategories([])
                  setSelectedCategory(null)
                  setServices([])
                }}
                className='w-full border border-gray-200 px-4 py-3 rounded-2xl bg-white text-sm sm:text-base outline-none focus:border-gray-400 transition-all duration-300'
              >
                {salons.length === 0 ? (
                  <option value=''>No salons found</option>
                ) : (
                  salons.map((s) => (
                    <option key={s.sid} value={s.sid}>
                      {s.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4'>
              <h2 className='text-xl font-semibold text-gray-950'>Service Categories</h2>
              <button
                onClick={async () => {
                  try {
                    await fetchMasterCategories()
                    setShowCategoryModal(true)
                  } catch (e) {
                    toast.error('Failed to load master categories')
                  }
                }}
                className='bg-black text-white px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300'
              >
                <FiPlus /> Add
              </button>
            </div>

            {categories.length === 0 ? (
              <div className='text-sm text-gray-500 border border-dashed border-gray-300 rounded-2xl p-5 text-center bg-gray-50'>
                No categories found
              </div>
            ) : (
              <div className='space-y-3'>
                {categories.map((cat, index) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat)
                      fetchServices(selectedSalonId, cat.id)
                    }}
                    className={`p-4 rounded-2xl flex justify-between items-center gap-3 cursor-pointer text-sm sm:text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${selectedCategory?.id === cat.id
                      ? 'bg-black text-white border border-black shadow-md'
                      : 'bg-gray-50 text-gray-800 border border-gray-200 hover:bg-gray-100'
                      }`}
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <span className='truncate flex-1 font-medium'>{cat.name}</span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteType('category')
                        setDeleteId(cat.id)
                        setShowDeleteModal(true)
                      }}
                      className={`p-2 rounded-xl shrink-0 transition ${selectedCategory?.id === cat.id
                        ? 'hover:bg-white/10'
                        : 'hover:bg-gray-200'
                        }`}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='w-full flex-1 min-w-0 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm animate-slideUp-delayed'>
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4'>
              <div>
                <h2 className='text-lg sm:text-xl font-semibold break-words text-gray-950'>
                  Services – {selectedCategory?.name || 'Select Category'}
                </h2>
                <p className='text-sm text-gray-500 mt-1'>
                  {selectedCategory
                    ? 'View and manage services for the selected category.'
                    : 'Choose a category to manage services.'}
                </p>
              </div>

              {selectedCategory && (
                <button
                  onClick={() => {
                    setEditingService(null)
                    setFormData({
                      name: '',
                      description: '',
                      genderCategory: 'women',
                      price: '',
                      time: '',
                      image: null,
                    })
                    setShowServiceModal(true)
                  }}
                  className='bg-black text-white px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300'
                >
                  <FiPlus /> Add Service
                </button>
              )}
            </div>

            {!selectedCategory ? (
              <div className='text-sm text-gray-500 border border-dashed border-gray-300 rounded-2xl p-6 text-center bg-gray-50'>
                Please select a category to view services
              </div>
            ) : loading ? (
              <div className='space-y-3'>
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className='h-24 rounded-2xl bg-gray-50 border border-gray-100 animate-pulse'
                  />
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className='text-sm text-gray-500 border border-dashed border-gray-300 rounded-2xl p-6 text-center bg-gray-50'>
                No services found in this category
              </div>
            ) : (
              <>
                <div className='hidden lg:block w-full overflow-x-auto'>
                  <table className='w-full min-w-[720px] text-sm lg:text-base'>
                    <thead>
                      <tr className='border-b border-gray-100 text-left text-gray-500'>
                        <th className='py-3 pr-4 font-medium'>Image</th>
                        <th className='py-3 pr-4 font-medium'>Name</th>
                        <th className='py-3 pr-4 font-medium'>Price</th>
                        <th className='py-3 pr-4 font-medium'>Time</th>
                        <th className='py-3 pr-4 font-medium'>Gender</th>
                        <th className='py-3 pr-4 font-medium'>Edit</th>
                        <th className='py-3 font-medium'>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((s, index) => (
                        <tr
                          key={s.id}
                          className='border-b border-gray-100 hover:bg-gray-50 transition-all duration-300 animate-fadeIn'
                          style={{ animationDelay: `${index * 35}ms` }}
                        >
                          <td className='py-3 pr-4'>
                            <img
                              src={s.imageUrl}
                              alt={s.name}
                              className='w-14 h-14 rounded-xl object-cover'
                            />
                          </td>
                          <td className='py-3 pr-4 whitespace-nowrap font-medium text-gray-900'>
                            {s.name}
                          </td>
                          <td className='py-3 pr-4 whitespace-nowrap'>₹ {s.price}</td>
                          <td className='py-3 pr-4 whitespace-nowrap'>{s.time} min</td>
                          <td className='py-3 pr-4 whitespace-nowrap capitalize'>
                            {s.genderCategory}
                          </td>
                          <td className='py-3 pr-4'>
                            <button
                              onClick={() => {
                                setEditingService(s)
                                setFormData({
                                  name: s.name,
                                  description: s.description,
                                  genderCategory: s.genderCategory,
                                  price: s.price,
                                  time: s.time,
                                  image: null,
                                })
                                setShowServiceModal(true)
                              }}
                              className='p-2 rounded-xl hover:bg-gray-100 transition'
                            >
                              <FiEdit className='cursor-pointer' />
                            </button>
                          </td>
                          <td className='py-3'>
                            <button
                              onClick={() => {
                                setDeleteType('service')
                                setDeleteId(s.id)
                                setShowDeleteModal(true)
                              }}
                              className='p-2 rounded-xl hover:bg-red-50 transition'
                            >
                              <FiTrash2 className='cursor-pointer text-red-500' />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className='lg:hidden space-y-3'>
                  {services.map((s, index) => (
                    <div
                      key={s.id}
                      className='border border-gray-200 rounded-2xl p-3 flex gap-3 items-start bg-gray-50 hover:bg-gray-100 transition-all duration-300 animate-fadeIn'
                      style={{ animationDelay: `${index * 35}ms` }}
                    >
                      <img
                        src={s.imageUrl}
                        alt={s.name}
                        className='w-16 h-16 rounded-xl object-cover shrink-0'
                      />

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between gap-2'>
                          <h3 className='font-semibold text-sm truncate text-gray-900'>{s.name}</h3>
                          <div className='flex items-center gap-2 shrink-0'>
                            <button
                              onClick={() => {
                                setEditingService(s)
                                setFormData({
                                  name: s.name,
                                  description: s.description,
                                  genderCategory: s.genderCategory,
                                  price: s.price,
                                  time: s.time,
                                  image: null,
                                })
                                setShowServiceModal(true)
                              }}
                              className='p-2 rounded-xl bg-white border border-gray-200'
                            >
                              <FiEdit />
                            </button>

                            <button
                              onClick={() => {
                                setDeleteType('service')
                                setDeleteId(s.id)
                                setShowDeleteModal(true)
                              }}
                              className='p-2 rounded-xl bg-red-50'
                            >
                              <FiTrash2 className='text-red-500' />
                            </button>
                          </div>
                        </div>

                        <div className='mt-2 grid grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600'>
                          <div>
                            <span className='font-medium text-gray-800'>Price:</span> ₹ {s.price}
                          </div>
                          <div>
                            <span className='font-medium text-gray-800'>Time:</span> {s.time} min
                          </div>
                          <div className='col-span-2 capitalize'>
                            <span className='font-medium text-gray-800'>Gender:</span> {s.genderCategory}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {showCategoryModal && (
          <Modal
            title='Add Category to Salon'
            onClose={() => setShowCategoryModal(false)}
            onSubmit={handleCategorySubmit}
          >
            <label className='block mb-2 text-sm font-medium text-gray-800'>
              Select Category
            </label>
            <select
              className='w-full border border-gray-200 px-4 py-3 rounded-2xl text-sm outline-none focus:border-gray-400 transition-all duration-300 bg-white'
              value={selectedMasterCategoryId}
              onChange={(e) => setSelectedMasterCategoryId(e.target.value)}
            >
              {masterCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Modal>
        )}

        {showServiceModal && (
          <Modal
            title={editingService ? 'Edit Service' : 'Add Service'}
            onClose={() => setShowServiceModal(false)}
            onSubmit={handleServiceSubmit}
            isSubmitting={isSavingService}
            submitText={editingService ? 'Save Changes' : 'Add Service'}
            loadingText={editingService ? 'Saving Changes...' : 'Adding Service...'}
          >
            <Input
              label='Name'
              value={formData.name}
              onChange={(v) => setFormData({ ...formData, name: v })}
            />
            <div>
              <label className='block mb-2 text-sm font-medium text-gray-800'>
                Description
              </label>
              <textarea
                rows='3'
                className='w-full border border-gray-200 px-4 py-3 rounded-2xl text-sm outline-none focus:border-gray-400 transition-all duration-300 resize-none'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <Input
              label='Price'
              type='number'
              value={formData.price}
              onChange={(v) => setFormData({ ...formData, price: v })}
            />

            <div>
              <label className='block mb-2 text-sm font-medium text-gray-800'>
                Time (minutes)
              </label>
              <select
                className='w-full border border-gray-200 px-4 py-3 rounded-2xl text-sm sm:text-base outline-none focus:border-gray-400 transition-all duration-300'
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              >
                <option value=''>Select time</option>
                <option value='15'>15 min</option>
                <option value='30'>30 min</option>
                <option value='45'>45 min</option>
                <option value='60'>60 min</option>
                <option value='75'>75 min</option>
                <option value='90'>90 min</option>
                <option value='105'>105 min</option>
                <option value='120'>120 min</option>
              </select>
            </div>

            <div>
              <label className='block mb-2 text-sm font-medium text-gray-800'>
                Gender
              </label>
              <select
                className='w-full border border-gray-200 px-4 py-3 rounded-2xl text-sm sm:text-base outline-none focus:border-gray-400 transition-all duration-300'
                value={formData.genderCategory}
                onChange={(e) =>
                  setFormData({ ...formData, genderCategory: e.target.value })
                }
              >
                <option value='men'>Men</option>
                <option value='women'>Women</option>
                <option value='child'>Child</option>
              </select>
            </div>

            <div>
              <label className='block mb-2 text-sm font-medium text-gray-800'>
                Service Image
              </label>
              <input
                type='file'
                className='w-full text-sm border border-gray-200 px-3 py-2.5 rounded-2xl bg-white file:mr-3 file:px-4 file:py-2 file:border-0 file:rounded-xl file:bg-black file:text-white'
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.files[0] })
                }
              />
            </div>
          </Modal>
        )}

        {showDeleteModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn'>
            <div
              className='absolute inset-0 bg-black/40 backdrop-blur-sm'
              onClick={() => setShowDeleteModal(false)}
            ></div>

            <div className='relative bg-white w-[92%] sm:w-full max-w-[420px] p-5 sm:p-6 rounded-3xl shadow-2xl animate-scaleIn'>
              <h2 className='text-lg font-semibold mb-4 text-black'>
                Confirm Delete
              </h2>

              <p className='text-sm sm:text-base text-gray-600 mb-6 leading-7'>
                Are you sure you want to delete this{' '}
                {deleteType === 'category' ? 'category' : 'service'}?
                <br />
                This action cannot be undone.
              </p>

              <div className='flex flex-col-reverse sm:flex-row justify-end gap-3'>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className='px-4 py-2.5 border border-gray-200 rounded-2xl w-full sm:w-auto hover:bg-gray-50 transition'
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className={`px-4 py-2.5 rounded-2xl text-white w-full sm:w-auto transition ${isDeleting
                    ? 'bg-red-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
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
      </div>
    </OwnerLayout>
  )
}

function Modal({
  title,
  children,
  onClose,
  onSubmit,
  submitText = 'Save',
  loadingText = 'Saving...',
  isSubmitting = false,
}) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center px-3 py-6 sm:px-4 sm:py-8 animate-fadeIn'>
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm'
        onClick={onClose}
      ></div>

      <div className='relative w-full max-w-md sm:max-w-lg max-h-[80vh] bg-white rounded-[28px] shadow-2xl animate-scaleIn flex flex-col'>
        <div className='flex justify-between items-center px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-100'>
          <h2 className='text-xl sm:text-2xl font-semibold text-gray-950'>
            {title}
          </h2>

          <button
            onClick={onClose}
            className='w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 text-2xl flex items-center justify-center transition shrink-0'
          >
            ✕
          </button>
        </div>

        <div className='flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4'>
          {children}
        </div>

        <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 px-5 sm:px-6 py-4 border-t border-gray-100 bg-white rounded-b-[28px]'>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className='px-5 py-3 border border-gray-200 rounded-2xl w-full sm:w-auto hover:bg-gray-50 transition'
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`px-5 py-3 rounded-2xl text-white w-full sm:w-auto transition-all duration-300 ${isSubmitting
                ? 'bg-green-300 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800 hover:-translate-y-0.5 shadow-sm hover:shadow-md'
              }`}
          >
            {isSubmitting ? loadingText : submitText}
          </button>
        </div>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className='block mb-2 text-sm font-medium text-gray-800'>
        {label}
      </label>
      <input
        type={type}
        className='w-full border border-gray-200 px-4 py-3 rounded-2xl text-sm outline-none focus:border-gray-400 transition-all duration-300'
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}