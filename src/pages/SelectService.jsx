import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { IoArrowBack } from 'react-icons/io5'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import toast from 'react-hot-toast'
import { FaShoppingCart } from 'react-icons/fa'
import { FiClock } from 'react-icons/fi'
import { IoSparklesOutline } from 'react-icons/io5'
import Navbar from '../componenets/Navbar'

export default function SelectService() {
  const { salonId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userId = user?.userId

  const bookingMeta = JSON.parse(sessionStorage.getItem('bookingMeta') || '{}')

  const bookingFor = bookingMeta?.bookingFor || 'myself'
  const bookedBy = bookingMeta?.bookedBy || user?.name || ''
  const customerName = bookingMeta?.customerName || user?.name || ''

  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)

  const [categoryOpen, setCategoryOpen] = useState(false)

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  const [genderOpen, setGenderOpen] = useState(false)
  const [gender, setGender] = useState('all')

  const [aiImage, setAiImage] = useState(null)
  const [aiGender, setAiGender] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [aiServices, setAiServices] = useState([])
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  const [navbarCart, setNavbarCart] = useState([])
  const [navbarOpen, setNavbarOpen] = useState(false)
  const [totalPending, setTotalPending] = useState(0)

  const categoryRef = useRef(null)
  const genderRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setCategoryOpen(false)
      }
      if (genderRef.current && !genderRef.current.contains(e.target)) {
        setGenderOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!salonId) return

    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `https://render-qs89.onrender.com/api/service-category/get-service-categories/${salonId}`
        )
        const list = await res.json()

        setCategories(Array.isArray(list) ? list : [])

        if (Array.isArray(list) && list.length > 0) {
          setSelectedCategory({
            id: list[0].id,
            name: list[0].name,
          })
        }
      } catch (err) {
        console.error('Category Error:', err)
        setCategories([])
      }
    }

    fetchCategories()
  }, [salonId])

  useEffect(() => {
    if (!salonId || !selectedCategory?.id) return

    const fetchServices = async () => {
      try {
        setLoading(true)

        const url = `https://render-qs89.onrender.com/api/service/get-services?salonId=${salonId}&categoryId=${selectedCategory.id}`
        const res = await fetch(url)
        const json = await res.json()

        const list = Array.isArray(json) ? json : json?.data || []

        let filteredData = list

        if (gender !== 'all') {
          filteredData = list.filter((s) => {
            const backendGender =
              s.genderCategory?.toLowerCase() || s.gender?.toLowerCase()

            if (gender === 'men') return backendGender === 'men'
            if (gender === 'women') return backendGender === 'women'
            if (gender === 'kid') return backendGender === 'kid'

            return true
          })
        }

        setServices(filteredData)
      } catch (err) {
        console.error('Service Error:', err)
        setServices([])
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [salonId, selectedCategory, gender])

  useEffect(() => {
    if (!salonId || !selectedCategory?.id) return

    const fetchAiServices = async () => {
      try {
        const res = await fetch(
          `https://render-qs89.onrender.com/api/service/get-services-for-ai?salonId=${salonId}&categoryId=${selectedCategory.id}`
        )
        const json = await res.json()
        setAiServices(Array.isArray(json) ? json : [])
      } catch (err) {
        console.error('AI Service Error:', err)
        setAiServices([])
      }
    }

    fetchAiServices()
  }, [salonId, selectedCategory])

  const handleAddService = async (service) => {
    try {
      if (!userId) {
        toast.error('User not logged in!')
        navigate('/login')
        return
      }

      const serviceId = service._id || service.id

      const params = new URLSearchParams({
        userId,
        salonId,
        serviceId,
        customerName: customerName.trim(),
      })

      const res = await fetch(
        `https://render-qs89.onrender.com/api/cart/add?${params.toString()}`,
        {
          method: 'POST',
        }
      )

      if (!res.ok) {
        toast.error('Cannot add service')
        return
      }

      toast.success('Service added to cart Successfully!')
      fetchCartCount()

      sessionStorage.setItem(
        'bookingMeta',
        JSON.stringify({
          bookingFor,
          bookedBy,
          customerName: customerName.trim(),
        })
      )

      navigate(`/add-services/${salonId}`)
    } catch (err) {
      console.error(err)
      toast.error('Server error')
    }
  }

  const fetchNavbarCart = async () => {
    try {
      if (!userId) return

      const res = await fetch(
        `https://render-qs89.onrender.com/api/cart/navbar-cart?userId=${userId}`
      )

      if (!res.ok) return

      const cartData = await res.json()

      setNavbarCart(cartData)

      const total = cartData.reduce(
        (sum, item) => sum + (item.pendingCount || 0),
        0
      )

      setTotalPending(total)
    } catch (error) {
      console.error('Navbar cart error:', error)
    }
  }

  useEffect(() => {
    fetchNavbarCart()
  }, [userId])

  const fetchCartCount = async () => {
    try {
      if (!userId) return

      const res = await fetch(
        `https://render-qs89.onrender.com/api/cart/cart-count?userId=${userId}&salonId=${salonId}&customerName=${customerName}`
      )

      if (!res.ok) {
        setCartCount(0)
        return
      }

      const count = await res.json()
      setCartCount(count)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchCartCount()
  }, [salonId, customerName])

  const isHaircutCategory = selectedCategory?.name
    ?.toLowerCase()
    .includes('haircut')

  const handleAiSuggest = async () => {
    if (!aiImage) {
      toast.error('Please upload your photo')
      return
    }

    if (!aiGender) {
      toast.error('Please select gender for AI suggestion')
      return
    }

    if (!Array.isArray(aiServices) || aiServices.length === 0) {
      toast.error('No services available for AI suggestion')
      return
    }

    try {
      setAiLoading(true)
      setAiSuggestions([])

      const fd = new FormData()
      fd.append('file', aiImage)

      const uploadRes = await fetch(
        'https://render-qs89.onrender.com/api/upload/image',
        {
          method: 'POST',
          body: fd,
        }
      )

      if (!uploadRes.ok) {
        toast.error('Image upload failed')
        return
      }

      const uploadJson = await uploadRes.json()

      if (
        !uploadJson ||
        typeof uploadJson.imageUrl !== 'string' ||
        !uploadJson.imageUrl.startsWith('http')
      ) {
        toast.error('Invalid image upload response')
        return
      }

      const filteredHairstyles = aiServices.filter(
        (s) => s.genderCategory?.toLowerCase() === aiGender.toLowerCase()
      )

      const res = await fetch(
        'https://render-qs89.onrender.com/api/gemini/suggest-with-images',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: uploadJson.imageUrl,
            gender: aiGender,
            hairstyles: filteredHairstyles,
          }),
        }
      )

      const data = await res.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      if (!res.ok || data.error) {
        toast.error(data.error || 'AI could not suggest hairstyle')
        setAiSuggestions([])
        return
      }

      if (
        !Array.isArray(data.geminiResponse) ||
        data.geminiResponse.length === 0
      ) {
        toast.error('No suitable hairstyle found')
        setAiSuggestions([])
        return
      }

      setAiSuggestions(data.geminiResponse)
    } catch (err) {
      console.error(err)
      toast.error('AI suggestion failed')
    } finally {
      setAiLoading(false)
    }
  }

  const genderLabel = useMemo(() => {
    if (gender === 'all') return 'All'
    if (gender === 'men') return 'Men'
    if (gender === 'women') return 'Women'
    return 'Kid'
  }, [gender])

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-white via-gray-50/40 to-white'>
      <Navbar />

      <div className='flex-1 overflow-y-auto'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 pt-6 sm:pt-8 pb-28'>
          <button
            onClick={() => navigate(-1)}
            className='mb-5 w-11 h-11 border border-gray-200 bg-white shadow-sm rounded-full cursor-pointer flex items-center justify-center hover:shadow-md hover:-translate-x-0.5 transition-all duration-300'
          >
            <IoArrowBack className='text-lg' />
          </button>

          <div className='mb-6 sm:mb-7'>
            <h2 className='text-2xl sm:text-[28px] font-bold text-gray-950 tracking-tight'>
              Select Service
            </h2>
            <p className='text-sm text-gray-500 mt-1'>
              Choose a category and add the services you want to your booking.
            </p>
          </div>

          <div className='flex flex-col sm:flex-row gap-4 sm:gap-5 mb-8'>
            <div ref={categoryRef} className='relative w-full sm:w-72'>
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className='w-full bg-white border border-gray-200 shadow-sm px-4 py-3 rounded-2xl flex justify-between items-center text-sm font-medium text-gray-800 hover:shadow-md transition-all duration-300'
              >
                <span className='truncate'>
                  {selectedCategory?.name || 'Select Category'}
                </span>
                {categoryOpen ? (
                  <IoIosArrowUp className='shrink-0 text-lg' />
                ) : (
                  <IoIosArrowDown className='shrink-0 text-lg' />
                )}
              </button>

              {categoryOpen && (
                <div className='absolute top-full left-0 w-full bg-white border border-gray-200 shadow-xl rounded-2xl mt-2 z-20 max-h-64 overflow-y-auto animate-[fadeIn_.18s_ease]'>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory({
                          id: cat.id,
                          name: cat.name,
                        })
                        setCategoryOpen(false)
                      }}
                      className='w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition cursor-pointer'
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div ref={genderRef} className='relative w-full sm:w-56'>
              <button
                onClick={() => setGenderOpen(!genderOpen)}
                className='w-full bg-white border border-gray-200 shadow-sm px-4 py-3 rounded-2xl flex justify-between items-center text-sm font-medium text-gray-800 hover:shadow-md transition-all duration-300'
              >
                <span>{genderLabel}</span>
                {genderOpen ? (
                  <IoIosArrowUp className='shrink-0 text-lg' />
                ) : (
                  <IoIosArrowDown className='shrink-0 text-lg' />
                )}
              </button>

              {genderOpen && (
                <div className='absolute top-full left-0 w-full bg-white border border-gray-200 shadow-xl rounded-2xl mt-2 z-20 overflow-hidden animate-[fadeIn_.18s_ease]'>
                  {['all', 'men', 'women', 'kid'].map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setGender(g)
                        setGenderOpen(false)
                      }}
                      className='w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition cursor-pointer'
                    >
                      {g === 'all'
                        ? 'All'
                        : g === 'men'
                          ? 'Men'
                          : g === 'women'
                            ? 'Women'
                            : 'Kid'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {isHaircutCategory && (
            <div className='mb-7 flex justify-center sm:justify-start'>
              <button
                onClick={() => setAiModalOpen(true)}
                className='inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 cursor-pointer rounded-2xl text-sm shadow-md shadow-black/10 hover:bg-gray-800 hover:-translate-y-0.5 transition-all duration-300'
              >
                <IoSparklesOutline />
                Open AI Hairstyle Suggestion
              </button>
            </div>
          )}

          {loading ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className='rounded-3xl bg-white border border-gray-200 shadow-sm p-4 animate-pulse'
                >
                  <div className='h-40 w-full rounded-2xl bg-gray-200' />
                  <div className='h-4 w-24 bg-gray-200 rounded mt-4' />
                  <div className='h-3 w-full bg-gray-100 rounded mt-3' />
                  <div className='h-3 w-4/5 bg-gray-100 rounded mt-2' />
                  <div className='h-3 w-20 bg-gray-100 rounded mt-4' />
                  <div className='h-4 w-16 bg-gray-200 rounded mt-3' />
                  <div className='h-10 w-full bg-gray-200 rounded-2xl mt-5' />
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className='rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                No services found
              </h3>
              <p className='text-sm text-gray-500'>
                Try changing the category or gender filter.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
              {services.map((s, index) => (
                <div
                  key={s._id || s.id}
                  className='group bg-white border border-gray-200 rounded-3xl p-4 shadow-sm hover:shadow-[0_14px_35px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col animate-[fadeUp_.35s_ease]'
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className='relative overflow-hidden rounded-2xl bg-gray-100'>
                    {s.imageUrl ? (
                      <img
                        src={s.imageUrl}
                        alt={s.name}
                        className='h-40 w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]'
                      />
                    ) : (
                      <div className='h-40 w-full bg-gray-100 flex items-center justify-center text-sm text-gray-400'>
                        No Image
                      </div>
                    )}
                  </div>

                  <div className='mt-4 flex-1 flex flex-col'>
                    <div className='flex items-start justify-between gap-3'>
                      <h3 className='font-semibold text-[15px] text-gray-900 leading-5 line-clamp-1'>
                        {s.name}
                      </h3>
                      {s.genderCategory && (
                        <span className='shrink-0 text-[10px] uppercase tracking-wide rounded-full bg-gray-100 border border-gray-200 px-2 py-1 text-gray-600'>
                          {s.genderCategory}
                        </span>
                      )}
                    </div>

                    <p className='text-sm text-gray-500 mt-2 leading-6 line-clamp-2 min-h-[48px]'>
                      {s.description}
                    </p>

                    <div className='flex items-center gap-1.5 text-xs text-gray-500 mt-3'>
                      <FiClock className='text-sm' />
                      <span>{s.time} Min</span>
                    </div>

                    <p className='mt-3 font-semibold text-base text-gray-950'>
                      ₹ {s.price}
                    </p>

                    <button
                      className='mt-5 bg-black text-white text-sm cursor-pointer py-2.5 rounded-2xl shadow-md shadow-black/10 hover:bg-gray-800 transition-all duration-300'
                      onClick={() => handleAddService(s)}
                    >
                      Add Service
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {aiModalOpen && (
        <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 animate-[fadeIn_.2s_ease]'>
          <div className='bg-white w-full max-w-4xl rounded-3xl p-5 sm:p-6 relative shadow-2xl border border-white/50 max-h-[90vh] overflow-y-auto animate-[scaleIn_.2s_ease]'>
            <button
              onClick={() => setAiModalOpen(false)}
              className='absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-lg transition cursor-pointer flex items-center justify-center'
            >
              ✕
            </button>

            <h3 className='text-xl font-semibold text-gray-950 mb-5'>
              Suggest Hairstyle with AI
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 mb-6'>
              <input
                type='file'
                accept='image/*'
                onChange={(e) => setAiImage(e.target.files[0])}
                className='w-full text-sm border border-gray-200 rounded-2xl px-4 py-3 file:mr-4 file:rounded-xl file:border-0 file:bg-black file:text-white file:px-4 file:py-2 file:text-sm'
              />

              <select
                value={aiGender}
                onChange={(e) => setAiGender(e.target.value)}
                className='bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl text-sm outline-none'
              >
                <option value=''>Select Gender</option>
                <option value='men'>Men</option>
                <option value='women'>Women</option>
                <option value='kid'>Kid</option>
              </select>

              <button
                onClick={handleAiSuggest}
                className='bg-black text-white px-5 cursor-pointer py-3 rounded-2xl text-sm hover:bg-gray-800 transition-all duration-300'
              >
                {aiLoading ? 'Analyzing...' : 'Suggest with AI'}
              </button>
            </div>

            {aiSuggestions.length > 0 && (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5'>
                {aiSuggestions.map((s, i) => (
                  <div
                    key={i}
                    className='bg-gray-50 border border-gray-200 p-4 rounded-2xl'
                  >
                    <img
                      src={s.imageUrl}
                      alt={s.name}
                      className='h-40 w-full rounded-xl object-cover'
                    />
                    <h4 className='mt-3 font-semibold text-sm text-gray-900'>
                      {s.name}
                    </h4>
                    <p className='text-xs text-gray-500 mt-1 leading-5'>
                      {s.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {cartCount > 0 && (
        <div
          onClick={() =>
            navigate(`/add-services/${salonId}`, {
              state: { customerName, bookedBy },
            })
          }
          className='fixed bottom-6 right-5 sm:bottom-8 sm:right-8 cursor-pointer z-40'
        >
          <div className='relative'>
            <div className='w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform duration-300'>
              <FaShoppingCart className='text-xl' />
            </div>

            <div className='absolute -top-1 -right-1 bg-red-500 text-white text-[11px] min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center font-medium'>
              {cartCount}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
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
      `}</style>
    </div>
  )
}