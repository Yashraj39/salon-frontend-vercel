import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast' // <-- ADD THIS
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi'
import OwnerLayout from '../componenets/OwnerLayout'

const BASE_URL = 'https://render-qs89.onrender.com'

export default function ServicesPage() {
  const salonData = JSON.parse(localStorage.getItem('salon'))
  const salonId = salonData?.id

  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)

  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  const [showServiceModal, setShowServiceModal] = useState(false)
  const [editingService, setEditingService] = useState(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteType, setDeleteType] = useState(null) // 'category' or 'service'
  const [deleteId, setDeleteId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    genderCategory: 'women',
    price: '',
    time: '',
    image: null,
  })

  // ================= LOAD CATEGORIES =================
  useEffect(() => {
    if (salonId) fetchCategories()
  }, [salonId])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await axios.get(
        `${BASE_URL}/api/service-category/get-service-categories/${salonId}`
      )
      const data = Array.isArray(res.data) ? res.data : []
      setCategories(data)

      if (data.length > 0) {
        setSelectedCategory(data[0])
        fetchServices(data[0].id)
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

  // ================= LOAD SERVICES =================
  const fetchServices = async (categoryId) => {
    try {
      setLoading(true)
      const res = await axios.get(`${BASE_URL}/api/service/get-services`, {
        params: { salonId, categoryId },
      })
      setServices(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  // ================= CATEGORY SUBMIT =================
  const handleCategorySubmit = async () => {
    try {
      if (editingCategory) {
        await axios.patch(
          `${BASE_URL}/api/service-category/update-service-category/${editingCategory.id}`,
          {
            name: formData.name,
            description: formData.description,
          }
        )
        toast.success('Category updated successfully') // <-- SUCCESS TOAST
      } else {
        await axios.post(
          `${BASE_URL}/api/service-category/add-service-category/${salonId}`,
          {
            name: formData.name,
            description: formData.description,
          }
        )
        toast.success('Category added successfully') // <-- SUCCESS TOAST
      }

      setShowCategoryModal(false)
      setEditingCategory(null)
      setFormData({ name: '', description: '' })
      fetchCategories()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save category') // <-- ERROR TOAST
    }
  }

  // ================= SERVICE SUBMIT =================
  const handleServiceSubmit = async () => {
    try {
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
        toast.success('Service updated successfully') // <-- SUCCESS TOAST
      } else {
        await axios.post(
          `${BASE_URL}/api/service/add-service/${selectedCategory.id}`,
          data
        )
        toast.success('Service added successfully') // <-- SUCCESS TOAST
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

      fetchServices(selectedCategory.id)
    } catch (err) {
      console.error(err)
      toast.error('Failed to save service') // <-- ERROR TOAST
    }
  }

  // ================= DELETE =================
  const handleConfirmDelete = async () => {
    try {
      if (deleteType === 'category') {
        await axios.delete(
          `${BASE_URL}/api/service-category/delete-service-category/${salonId}/${deleteId}`
        )
        toast.success('Category deleted successfully') // <-- SUCCESS TOAST
        fetchCategories()
      }

      if (deleteType === 'service') {
        await axios.delete(
          `${BASE_URL}/api/service/delete-service/${selectedCategory.id}/${deleteId}`
        )
        toast.success('Service deleted successfully') // <-- SUCCESS TOAST
        fetchServices(selectedCategory.id)
      }

      setShowDeleteModal(false)
      setDeleteId(null)
      setDeleteType(null)
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete') // <-- ERROR TOAST
    }
  }

  return (
    <OwnerLayout>
      <div className='flex gap-6'>
        {/* LEFT PANEL */}
        <div className='w-1/3 bg-white p-6 rounded-xl shadow'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-semibold'>Service Categories</h2>
            <button
              onClick={() => {
                setEditingCategory(null)
                setFormData({ name: '', description: '' })
                setShowCategoryModal(true)
              }}
              className='bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2'
            >
              <FiPlus /> Add
            </button>
          </div>

          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat)
                fetchServices(cat.id)
              }}
              className={`p-3 rounded-lg flex justify-between items-center mb-3 cursor-pointer ${
                selectedCategory?.id === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100'
              }`}
            >
              <span>{cat.name}</span>
              <div className='flex gap-2'>
                <FiEdit
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingCategory(cat)
                    setFormData({
                      name: cat.name,
                      description: cat.description,
                    })
                    setShowCategoryModal(true)
                  }}
                />
                <FiTrash2
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteType('category')
                    setDeleteId(cat.id)
                    setShowDeleteModal(true)
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT PANEL */}
        <div className='flex-1 bg-white p-6 rounded-xl shadow'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-semibold'>
              Services – {selectedCategory?.name}
            </h2>
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
                className='bg-green-600 text-white px-3 py-2 rounded flex items-center gap-2'
              >
                <FiPlus /> Add Service
              </button>
            )}
          </div>

          <table className='w-full'>
            <thead>
              <tr className='border-b text-left'>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Time</th>
                <th>Gender</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className='border-b '>
                  <td>
                    <img
                      src={s.imageUrl}
                      alt=''
                      className='w-14 h-14 rounded object-cover'
                    />
                  </td>
                  <td>{s.name}</td>
                  <td>₹ {s.price}</td>
                  <td>{s.time} min</td>
                  <td>{s.genderCategory}</td>
                  <td>
                    <FiEdit
                      className='cursor-pointer'
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
                    />
                  </td>
                  <td>
                    <FiTrash2
                      className='cursor-pointer text-red-500'
                      onClick={() => {
                        setDeleteType('service')
                        setDeleteId(s.id)
                        setShowDeleteModal(true)
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= CATEGORY MODAL ================= */}
      {showCategoryModal && (
        <Modal
          title={editingCategory ? 'Edit Category' : 'Add Category'}
          onClose={() => setShowCategoryModal(false)}
          onSubmit={handleCategorySubmit}
        >
          <Input
            label='Name'
            value={formData.name}
            onChange={(v) => setFormData({ ...formData, name: v })}
          />
          <Input
            label='Description'
            value={formData.description}
            onChange={(v) => setFormData({ ...formData, description: v })}
          />
        </Modal>
      )}

      {/* ================= SERVICE MODAL ================= */}
      {showServiceModal && (
        <Modal
          title={editingService ? 'Edit Service' : 'Add Service'}
          onClose={() => setShowServiceModal(false)}
          onSubmit={handleServiceSubmit}
        >
          <Input
            label='Name'
            value={formData.name}
            onChange={(v) => setFormData({ ...formData, name: v })}
          />
          <Input
            label='Description'
            value={formData.description}
            onChange={(v) => setFormData({ ...formData, description: v })}
          />
          <Input
            label='Price'
            value={formData.price}
            onChange={(v) => setFormData({ ...formData, price: v })}
          />
          <Input
            label='Time (minutes)'
            value={formData.time}
            onChange={(v) => setFormData({ ...formData, time: v })}
          />
          <select
            className='w-full border p-2 rounded'
            value={formData.genderCategory}
            onChange={(e) =>
              setFormData({ ...formData, genderCategory: e.target.value })
            }
          >
            <option value='men'>Men</option>
            <option value='women'>Women</option>
            <option value='child'>Child</option>
          </select>

          <input
            type='file'
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.files[0] })
            }
          />
        </Modal>
      )}

      {showDeleteModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          {/* Background Blur */}
          <div
            className='absolute inset-0 bg-black/40 backdrop-blur-sm'
            onClick={() => setShowDeleteModal(false)}
          ></div>

          {/* Modal Box */}
          <div className='relative bg-white w-[400px] p-6 rounded-2xl shadow-2xl'>
            <h2 className='text-lg font-semibold mb-4 text-black'>
              Confirm Delete
            </h2>

            <p className='text-gray-600 mb-6'>
              Are you sure you want to delete this{' '}
              {deleteType === 'category' ? 'category' : 'service'}?
              <br />
              This action cannot be undone.
            </p>

            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setShowDeleteModal(false)}
                className='px-4 py-2 border rounded-lg'
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                className='bg-red-600 text-white px-4 py-2 rounded-lg'
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  )
}

/* ================= REUSABLE COMPONENTS ================= */

function Modal({ title, children, onClose, onSubmit }) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* 🔹 Background Overlay */}
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm'
        onClick={onClose}
      ></div>

      {/* 🔹 Modal Box */}
      <div className='relative bg-white w-[420px] p-6 rounded-2xl shadow-2xl animate-fadeIn'>
        <div className='flex justify-between items-center mb-5'>
          <h2 className='text-lg font-semibold'>{title}</h2>
          <button onClick={onClose} className='text-gray-500 text-xl'>
            ✕
          </button>
        </div>

        <div className='space-y-4'>{children}</div>

        <div className='flex justify-end gap-3 mt-6'>
          <button onClick={onClose} className='px-4 py-2 border rounded-lg'>
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className='bg-green-600 text-white px-4 py-2 rounded-lg'
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className='block mb-1'>{label}</label>
      <input
        className='w-full border p-2 rounded'
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
