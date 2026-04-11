import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  FiBell,
  FiUser,
  FiMenu,
  FiChevronRight,
  FiChevronDown,
  FiTrash2,
  FiCheck,
  FiClock,
} from 'react-icons/fi'
import { FaShoppingCart } from 'react-icons/fa'
import React, { useEffect, useState, useRef } from 'react'
import { toast, Toaster } from 'sonner'

const BASE_URL = 'https://render-qs89.onrender.com' // Change this to your actual backend URL

const saveOwnerApplication = (userId, data) => {
  const allApps = JSON.parse(localStorage.getItem('allOwnerApplications')) || {}
  allApps[userId] = data
  localStorage.setItem('allOwnerApplications', JSON.stringify(allApps))
}

const getOwnerApplication = (userId) => {
  const allApps = JSON.parse(localStorage.getItem('allOwnerApplications')) || {}
  return allApps[userId] || null
}

const removeOwnerApplication = (userId) => {
  const allApps = JSON.parse(localStorage.getItem('allOwnerApplications')) || {}
  delete allApps[userId]
  localStorage.setItem('allOwnerApplications', JSON.stringify(allApps))
}

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isOwnerPanel = location.pathname.startsWith('/owner')
  const isLoggedIn = !!localStorage.getItem('user')

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userId = user.userId
  const isOwner = user?.role === 'OWNER'
const isOwnerFrozen = user?.ownerFrozen === true

  const [currentUserId, setCurrentUserId] = useState(userId || null)

  const [totalPending, setTotalPending] = useState(0)
  const [navbarCart, setNavbarCart] = useState([])
  const [mobileMenu, setMobileMenu] = useState(false)
  const [showCartDropdown, setShowCartDropdown] = useState(false)
  const [ownerDropdownOpen, setOwnerDropdownOpen] = useState(false)

  const [showOwnerModal, setShowOwnerModal] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const [showOwnerForm, setShowOwnerForm] = useState(false)
  const [aadharFile, setAadharFile] = useState(null)
  const fileInputRef = useRef(null)
  const ownerDropdownRef = useRef(null)
  const [loading, setLoading] = useState(false)

  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [ownerStatus, setOwnerStatus] = useState(null)
  const [profileImage, setProfileImage] = useState('')

  const [notifications, setNotifications] = useState([])
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const [phoneError, setPhoneError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [fileError, setFileError] = useState('')

  useEffect(() => {
    if (!currentUserId) {
      setOwnerStatus(null)
      setPhone('')
      setEmail('')
      setAadharFile(null)
      return
    }

    const fetchOwnerApplication = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/owner/application?userId=${currentUserId}`)

        if (res.status === 404) {
          setOwnerStatus(null)
          setPhone('')
          setEmail('')
          setAadharFile(null)
          removeOwnerApplication(currentUserId)
          localStorage.removeItem('ownerId')
          return
        }

        if (!res.ok) {
          const text = await res.text().catch(() => '')
          console.error('Failed to fetch owner application:', res.status, text)
          return
        }

        const data = await res.json()

        setOwnerStatus(data?.status || null)
        setPhone(data?.phone || '')
        setEmail(data?.email || '')
        setAadharFile(data?.aadhaarUrl || null)

        saveOwnerApplication(currentUserId, data)

        if (data?.id) {
          localStorage.setItem('ownerId', data.id)
        }
      } catch (e) {
        console.error('Owner application fetch error:', e)
      }
    }

    fetchOwnerApplication()
  }, [currentUserId])

  useEffect(() => {
    if (!currentUserId) {
      setProfileImage('')
      return
    }

    fetch(`${BASE_URL}/api/v1.0/get-profile-image/${currentUserId}`)
      .then((res) => (res.ok ? res.text() : ''))
      .then((url) => {
        setProfileImage(url ? url.trim() : '')
      })
      .catch(() => {
        setProfileImage('')
      })
  }, [currentUserId])

  const fetchNotifications = async () => {
    if (!userId) return

    try {
      const res = await fetch(`${BASE_URL}/api/notifications/user/${userId}?audience=USER`)
      if (!res.ok) return

      const data = await res.json()
      const safe = Array.isArray(data) ? data : []

      setNotifications(safe)
      setUnreadCount(safe.filter((item) => item.isRead !== true).length)
    } catch (e) {
      console.error('Notification fetch error:', e)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [userId])

  useEffect(() => {
    if (!userId) return

    const interval = setInterval(() => {
      fetchNotifications()
    }, 5000)

    return () => clearInterval(interval)
  }, [userId])

  const fetchNavbarCart = async () => {
    if (!userId) return
    try {
      const res = await fetch(
        `${BASE_URL}/api/cart/navbar-cart?userId=${userId}`
      )
      if (!res.ok) return
      const cartData = await res.json()
      setNavbarCart(cartData)
      const total = cartData.reduce(
        (sum, item) => sum + (item.pendingCount || 0),
        0
      )
      setTotalPending(total)
    } catch (e) {
      console.error('Navbar cart error:', e)
    }
  }

  useEffect(() => {
    fetchNavbarCart()
  }, [userId])

  useEffect(() => {
    if (!currentUserId) return

    if (ownerStatus !== 'PENDING') return

    const checkOwnerApplication = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/owner/application?userId=${currentUserId}`
        )

        if (res.status === 404) {
          removeOwnerApplication(currentUserId)
          localStorage.removeItem('ownerId')
          setOwnerStatus(null)
          setPhone('')
          setEmail('')
          setAadharFile(null)
          return
        }

        if (!res.ok) {
          const text = await res.text().catch(() => '')
          console.error('Failed to fetch owner application:', res.status, text)
          return
        }

        const data = await res.json()

        saveOwnerApplication(currentUserId, data)

        if (data?.id) {
          localStorage.setItem('ownerId', data.id)
        }

        if (data?.status && data.status !== ownerStatus) {
          setOwnerStatus(data.status)

          if (data.status === 'APPROVED') {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}')

            localStorage.setItem(
              'user',
              JSON.stringify({
                ...storedUser,
                role: 'OWNER',
              })
            )

            toast.success('Your owner application has been approved!')
            window.location.reload()
          }
        }
      } catch (e) {
        console.error('Owner application polling error:', e)
      }
    }

    checkOwnerApplication()

    const interval = setInterval(checkOwnerApplication, 5000)

    return () => clearInterval(interval)
  }, [currentUserId, ownerStatus])

  useEffect(() => {
    const handleOwnerDropdownOutside = (event) => {
      if (
        ownerDropdownRef.current &&
        !ownerDropdownRef.current.contains(event.target)
      ) {
        setOwnerDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOwnerDropdownOutside)
    return () =>
      document.removeEventListener('mousedown', handleOwnerDropdownOutside)
  }, [])

  useEffect(() => {
    const handleOutside = () => {
      setShowNotificationDropdown(false)
      setShowCartDropdown(false)
    }

    document.addEventListener('click', handleOutside)
    return () => document.removeEventListener('click', handleOutside)
  }, [])

  const formatNotificationTime = (dateValue) => {
    if (!dateValue) return ''

    const now = new Date()
    const created = new Date(dateValue)
    const diffMs = now - created

    const seconds = Math.floor(diffMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return 'Just now'
    if (minutes < 60) return `${minutes} min ago`
    if (hours < 24) return `${hours} hr ago`
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`

    return created.toLocaleDateString()
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      const target = notifications.find((item) => item.id === notificationId)

      if (!target || target.isRead === true) return

      const res = await fetch(`${BASE_URL}/api/notifications/read/${notificationId}`, {
        method: 'PUT',
      })

      if (!res.ok) throw new Error('Failed to mark notification as read')

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item
        )
      )

      setUnreadCount((prev) => Math.max(prev - 1, 0))
    } catch (error) {
      console.error(error)
    }
  }

  const markAllNotificationsAsRead = async () => {
    if (!userId) return

    const hasUnread = notifications.some((item) => item.isRead !== true)
    if (!hasUnread) return

    try {
      const res = await fetch(`${BASE_URL}/api/notifications/read-all/${userId}?audience=USER`, {
        method: 'PUT',
      })

      if (!res.ok) throw new Error('Failed to mark all notifications as read')

      const data = await res.json()
      const safe = Array.isArray(data) ? data : []

      setNotifications(safe)
      setUnreadCount(0)
    } catch (error) {
      console.error(error)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      const notificationToDelete = notifications.find((item) => item.id === notificationId)

      const res = await fetch(`${BASE_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete notification')

      setNotifications((prev) => prev.filter((item) => item.id !== notificationId))

      if (notificationToDelete && notificationToDelete.isRead !== true) {
        setUnreadCount((prev) => Math.max(prev - 1, 0))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const validatePhone = (value) => {
    const cleanPhone = value.replace(/\D/g, '')
    const phoneRegex = /^[6-9]\d{9}$/
    return phoneRegex.test(cleanPhone)
  }

  const validateGmail = (value) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
    return gmailRegex.test(value.trim())
  }

  const handleOwnerApply = async () => {
    if (!currentUserId) {
      toast.error('User not logged in')
      return
    }

    let isValid = true

    setPhoneError('')
    setEmailError('')
    setFileError('')

    const cleanPhone = phone.replace(/\D/g, '')

    if (!cleanPhone) {
      setPhoneError('Mobile number is required')
      isValid = false
    } else if (!validatePhone(cleanPhone)) {
      setPhoneError('Enter valid 10 digit mobile number')
      isValid = false
    }

    if (!email.trim()) {
      setEmailError('Gmail is required')
      isValid = false
    } else if (!validateGmail(email)) {
      setEmailError('Enter valid Gmail address')
      isValid = false
    }

    if (!aadharFile) {
      setFileError('Document upload is required')
      isValid = false
    }

    if (!isValid) {
      toast.error('Please provide all required information in correct format')
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('file', aadharFile)

      const uploadRes = await fetch(`${BASE_URL}/api/upload/image`, {
        method: 'POST',
        body: formData,
      })

      let uploadData = null
      let uploadText = ''

      try {
        uploadData = await uploadRes.json()
      } catch (e) {
        try {
          uploadText = await uploadRes.text()
        } catch {
          uploadText = ''
        }
      }

      if (!uploadRes.ok) {
        throw new Error(
          uploadData?.message ||
          uploadData?.error ||
          uploadText ||
          `Image upload failed (${uploadRes.status})`
        )
      }

      const imageUrl = uploadData?.imageUrl

      if (!imageUrl) {
        throw new Error('Uploaded document URL not found')
      }

      const payload = {
        userId: currentUserId,
        phone: cleanPhone,
        email: email.trim(),
        aadhaarUrl: imageUrl,
        termsAccepted: true,
      }

      console.log('OWNER APPLY PAYLOAD:', payload)

      const applyRes = await fetch(`${BASE_URL}/api/owner/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      let applyData = null
      let applyText = ''

      try {
        applyData = await applyRes.json()
      } catch (e) {
        try {
          applyText = await applyRes.text()
        } catch {
          applyText = ''
        }
      }

      console.log('OWNER APPLY STATUS:', applyRes.status)
      console.log('OWNER APPLY RESPONSE JSON:', applyData)
      console.log('OWNER APPLY RESPONSE TEXT:', applyText)

      if (!applyRes.ok) {
        throw new Error(
          applyData?.message ||
          applyData?.error ||
          applyText ||
          `Application failed (${applyRes.status})`
        )
      }

      saveOwnerApplication(currentUserId, applyData)
      setOwnerStatus(applyData.status)

      toast.success('Application submitted successfully!')
      setShowOwnerForm(false)
      setShowModal(true)
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('allOwnerApplications')
    localStorage.removeItem('ownerId')
    setCurrentUserId(null)
    setOwnerStatus(null)
    setPhone('')
    setEmail('')
    setAadharFile(null)
    navigate('/login')
  }

  const ownerButton = () => {
    if (isOwner && isOwnerFrozen) {
      if (isOwnerPanel) {
        return (
          <button
            onClick={() => navigate('/success')}
            className='h-[42px] rounded-xl border border-[#3c3c3c] bg-gradient-to-r from-[#242424] via-[#343434] to-[#464646] px-5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:brightness-110 transition-all'
          >
            Switch to User
          </button>
        )
      }

      return (
        <div className='relative' ref={ownerDropdownRef}>
          <button
            type='button'
            onClick={() => setOwnerDropdownOpen((prev) => !prev)}
            className={`group flex items-center justify-between min-w-[235px] h-[50px] pl-4 pr-3 rounded-xl border transition-all bg-white ${ownerDropdownOpen
              ? 'border-[#cfd6e4] shadow-[0_12px_30px_rgba(17,24,39,0.10)]'
              : 'border-[#d8dee8] shadow-[0_4px_14px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.10)]'
              }`}
          >
            <div className='flex items-center justify-center w-8 h-8 rounded-full bg-[#f3f6fb] text-[#344054] border border-[#e4e7ec]'>
              <FiUser className='text-[16px]' />
            </div>

            <div className='flex items-center gap-3 flex-1 ml-3'>
              <span className='text-[15px] font-medium text-[#1f2937]'>User</span>
              <span className='text-[15px] font-semibold text-[#243B63] max-w-[120px] truncate'>
                {user?.name || 'User'}
              </span>
            </div>

            <FiChevronDown
              className={`text-[18px] text-[#667085] transition-transform duration-200 ${ownerDropdownOpen ? 'rotate-180' : ''
                }`}
            />
          </button>

          <div
            className={`absolute right-0 top-[58px] w-[290px] origin-top-right transition-all duration-200 z-50 ${ownerDropdownOpen
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
              }`}
          >
            <div className='rounded-2xl border border-[#dde3ec] bg-white shadow-[0_20px_45px_rgba(15,23,42,0.14)] p-3'>
              <div className='mb-3 rounded-xl border border-[#e6eaf0] bg-[#f8fafc] px-4 py-3'>
                <div className='text-[12px] font-medium uppercase tracking-[0.08em] text-[#667085]'>
                  Signed in as
                </div>
                <div className='mt-1 text-[15px] font-semibold text-[#243B63] truncate'>
                  {user?.name || 'User'}
                </div>
                <div className='text-[13px] text-[#667085]'>User</div>
              </div>

              <button
                type='button'
                onClick={() => {
                  setOwnerDropdownOpen(false)
                  navigate('/owner-dashboard')
                }}
                className='w-full flex items-center gap-3 rounded-xl px-4 py-3 border border-[#159947] bg-gradient-to-r from-[#16a34a] via-[#1db954] to-[#22c55e] text-white shadow-[0_10px_24px_rgba(34,197,94,0.22)] hover:brightness-105 hover:shadow-[0_14px_30px_rgba(34,197,94,0.28)] transition-all'
              >
                <div className='flex items-center justify-center w-8 h-8 rounded-full bg-white/12'>
                  <FiUser className='text-[17px]' />
                </div>

                <div className='text-left'>
                  <div className='text-[15px] font-semibold leading-none'>
                    Switch to Owner
                  </div>
                  <div className='text-[12px] text-white/80 mt-1'>
                    Open owner dashboard
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (ownerStatus === 'PENDING') {
      return (
        <button className='h-[42px] rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-700 shadow-sm cursor-not-allowed'>
          Owner Pending
        </button>
      )
    }

    return (
      <div className='group relative inline-block'>
        <button
          onClick={() => setShowOwnerModal(true)}
          className='h-[42px] rounded-xl border border-[#d8dee8] bg-white px-5 text-sm font-semibold text-[#243B63] shadow-[0_4px_14px_rgba(15,23,42,0.06)] hover:bg-[#f8fafc] hover:shadow-[0_8px_24px_rgba(15,23,42,0.10)] transition-all'
        >
          Become an Owner
        </button>

        <div className='absolute right-0 top-[54px] w-[330px] rounded-2xl border border-[#dde3ec] bg-white p-4 shadow-[0_20px_45px_rgba(15,23,42,0.14)] opacity-0 invisible translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 z-50'>
          <div className='flex items-start gap-4'>
            <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4f7fb] border border-[#e4e7ec] shrink-0'>
              <img
                src='/lamp.png'
                alt='Lamp'
                className='w-9 h-9 object-contain'
              />
            </div>

            <div className='flex-1'>
              <h3 className='text-[16px] font-semibold text-[#243B63]'>
                Become an Owner
              </h3>
              <p className='mt-1 text-sm leading-6 text-[#667085]'>
                Own a salon? Switch to owner mode and manage salons, services,
                barbers, and bookings in one place.
              </p>

              <button
                onClick={() => setShowOwnerModal(true)}
                className='mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#07153A] to-[#0C1D4E] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition'
              >
                Apply Now
                <FiChevronRight className='text-base' />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster
        position='top-center'
        reverseOrder={false}
        toastOptions={{
          style: {
            padding: '16px',
            color: 'black',
            fontWeight: 'bold',
            borderRadius: '12px',
          },
        }}
      />

      <header className='sticky top-0 z-50 w-full border-b border-[#e7eaf0] bg-white/95 backdrop-blur-md'>
        <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between gap-6'>
            <div
              onClick={() => navigate('/success')}
              className='flex items-center gap-3 cursor-pointer shrink-0'
            >
              <img
                src="/logo.png"   // 👈 put your logo file here
                alt="logo"
                className="h-9 w-9 rounded-xl object-contain"
              />

              <span className='text-[18px] font-semibold tracking-[0.2px] text-[#111827]'>
                SlotMyStyle
              </span>
            </div>

            {!isLoggedIn ? (
              <div className='flex items-center gap-3'>
                <Link
                  to='/login'
                  className='rounded-xl px-4 py-2 text-sm font-medium text-[#344054] hover:bg-[#f5f7fb] transition'
                >
                  Log in
                </Link>
                <Link
                  to='/register'
                  className='rounded-xl bg-gradient-to-r from-[#111827] to-[#1f2937] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 transition'
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <>
                {!isOwnerPanel && (
                  <div className='hidden lg:flex flex-1 items-center justify-center'>
                    <div className='flex items-center gap-8 xl:gap-10'>
                      <button
                        type='button'
                        onClick={() => navigate('/success')}
                        className='group relative pb-2 text-center'
                      >
                        <span
                          className={`text-[15px] font-semibold transition-colors duration-300 ${location.pathname === '/success' || location.pathname === '/home'
                            ? 'text-[#111827]'
                            : 'text-[#667085] group-hover:text-[#111827]'
                            }`}
                        >
                          Home
                        </span>

                        <span
                          className={`absolute left-1/2 bottom-0 h-[2px] w-[42px] -translate-x-1/2 rounded-full bg-[#111827] transition-all duration-300 ${location.pathname === '/success' || location.pathname === '/home'
                            ? 'opacity-100 scale-x-100'
                            : 'opacity-0 scale-x-0'
                            }`}
                        />
                      </button>

                      <button
                        type='button'
                        onClick={() => navigate('/about')}
                        className='group relative pb-2 text-center'
                      >
                        <span
                          className={`text-[15px] font-semibold transition-colors duration-300 ${location.pathname === '/about'
                            ? 'text-[#111827]'
                            : 'text-[#667085] group-hover:text-[#111827]'
                            }`}
                        >
                          About
                        </span>

                        <span
                          className={`absolute left-1/2 bottom-0 h-[2px] w-[42px] -translate-x-1/2 rounded-full bg-[#111827] transition-all duration-300 ${location.pathname === '/about'
                            ? 'opacity-100 scale-x-100'
                            : 'opacity-0 scale-x-0'
                            }`}
                        />
                      </button>

                      <button
                        type='button'
                        onClick={() => navigate('/contact')}
                        className='group relative pb-2 text-center'
                      >
                        <span
                          className={`text-[15px] font-semibold transition-colors duration-300 ${location.pathname === '/contact'
                            ? 'text-[#111827]'
                            : 'text-[#667085] group-hover:text-[#111827]'
                            }`}
                        >
                          Contact
                        </span>

                        <span
                          className={`absolute left-1/2 bottom-0 h-[2px] w-[42px] -translate-x-1/2 rounded-full bg-[#111827] transition-all duration-300 ${location.pathname === '/contact'
                            ? 'opacity-100 scale-x-100'
                            : 'opacity-0 scale-x-0'
                            }`}
                        />
                      </button>

                      <button
                        type='button'
                        onClick={() => navigate('/bookings')}
                        className='group relative pb-2 text-center'
                      >
                        <span
                          className={`text-[15px] font-semibold whitespace-nowrap transition-colors duration-300 ${location.pathname === '/bookings'
                            ? 'text-[#111827]'
                            : 'text-[#667085] group-hover:text-[#111827]'
                            }`}
                        >
                          My Bookings
                        </span>

                        <span
                          className={`absolute left-1/2 bottom-0 h-[2px] w-[42px] -translate-x-1/2 rounded-full bg-[#111827] transition-all duration-300 ${location.pathname === '/bookings'
                            ? 'opacity-100 scale-x-100'
                            : 'opacity-0 scale-x-0'
                            }`}
                        />
                      </button>
                    </div>
                  </div>
                )}

                <div className='flex items-center gap-3 md:gap-4 shrink-0'>
                  <div className='relative' onClick={(e) => e.stopPropagation()}>
                    <button
                      type='button'
                      onClick={() => {
                        setShowNotificationDropdown((prev) => {
                          const next = !prev

                          if (next && unreadCount > 0) {
                            markAllNotificationsAsRead()
                          }

                          return next
                        })
                      }}
                      className='hidden sm:flex relative h-10 w-10 items-center justify-center rounded-full border border-[#e6eaf0] bg-white text-[#344054] shadow-sm hover:bg-[#f8fafc] hover:shadow-md transition-all duration-200'
                    >
                      <FiBell className={`text-[19px] transition-transform duration-200 ${showNotificationDropdown ? 'scale-110' : ''}`} />

                      {unreadCount > 0 && (
                        <>
                          <span className='absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-md'>
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                          <span className='absolute inset-0 rounded-full animate-ping bg-red-400/20 pointer-events-none' />
                        </>
                      )}
                    </button>

                    <div
                      className={`absolute right-0 top-12 w-[380px] origin-top-right rounded-3xl border border-[#e5e7eb] bg-white/95 backdrop-blur-xl shadow-[0_24px_60px_rgba(15,23,42,0.18)] z-50 overflow-hidden transition-all duration-300 ${showNotificationDropdown
                        ? 'opacity-100 visible translate-y-0 scale-100'
                        : 'opacity-0 invisible -translate-y-2 scale-95 pointer-events-none'
                        }`}
                    >
                      <div className='border-b border-[#eef2f6] bg-gradient-to-r from-[#f8fafc] to-white px-5 py-4'>
                        <div className='flex items-center justify-between'>


                          {notifications.length > 0 && (
                            <div className='flex items-center gap-2'>
                              {unreadCount > 0 && (
                                <span className='rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 border border-red-100'>
                                  {unreadCount} new
                                </span>
                              )}

                              <button
                                type='button'
                                onClick={markAllNotificationsAsRead}
                                className='inline-flex items-center gap-1.5 rounded-full border border-[#dbe3ec] bg-white px-3 py-1.5 text-[12px] font-medium text-[#344054] hover:bg-[#f8fafc] transition'
                              >
                                <FiCheck className='text-[13px]' />
                                Mark all read
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='max-h-[420px] overflow-y-auto px-3 py-3'>
                        {notifications.length === 0 ? (
                          <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8dee8] bg-[#f8fafc] px-6 py-12 text-center'>
                            <div className='flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm border border-[#eef2f6]'>
                              <FiBell className='text-[22px] text-[#98a2b3]' />
                            </div>

                            <h4 className='mt-4 text-sm font-semibold text-[#111827]'>
                              No notifications yet
                            </h4>

                            <p className='mt-1 max-w-[240px] text-xs leading-5 text-[#667085]'>
                              New booking updates and important alerts will appear here.
                            </p>
                          </div>
                        ) : (
                          <div className='space-y-2'>
                            {notifications.map((item, index) => (
                              <div
                                key={item.id}
                                onClick={() => markNotificationAsRead(item.id)}
                                className={`group relative cursor-pointer overflow-hidden rounded-2xl border px-4 py-3 transition-all duration-200 ${item.isRead
                                  ? 'border-[#edf1f5] bg-white hover:bg-[#fafbfc] hover:shadow-sm'
                                  : 'border-blue-100 bg-gradient-to-r from-blue-50 to-white shadow-[0_6px_18px_rgba(59,130,246,0.08)] hover:shadow-[0_10px_24px_rgba(59,130,246,0.12)]'
                                  }`}
                                style={{
                                  animation: `fadeSlideIn 220ms ease ${index * 40}ms both`,
                                }}
                              >
                                {!item.isRead && (
                                  <div className='absolute left-0 top-0 h-full w-1 rounded-r-full bg-blue-500' />
                                )}

                                <div className='flex items-start justify-between gap-3'>
                                  <div className='flex min-w-0 flex-1 gap-3'>
                                    <div
                                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.isRead
                                        ? 'bg-[#f2f4f7] text-[#667085]'
                                        : 'bg-blue-100 text-blue-700'
                                        }`}
                                    >
                                      <FiBell className='text-[16px]' />
                                    </div>

                                    <div className='min-w-0 flex-1'>
                                      <div className='flex items-center gap-2'>
                                        <p className='truncate text-sm font-semibold text-[#111827]'>
                                          {item.title}
                                        </p>

                                        {!item.isRead && (
                                          <span className='h-2.5 w-2.5 shrink-0 rounded-full bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)]' />
                                        )}
                                      </div>

                                      <p className='mt-1 text-xs leading-5 text-[#667085] break-words'>
                                        {item.message}
                                      </p>

                                      <div className='mt-2 flex items-center gap-1.5 text-[11px] text-[#98a2b3]'>
                                        <FiClock className='text-[12px]' />
                                        <span>{formatNotificationTime(item.createdAt)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    type='button'
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteNotification(item.id)
                                    }}
                                    className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#98a2b3] opacity-0 transition-all duration-200 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100'
                                    title='Delete notification'
                                  >
                                    <FiTrash2 className='text-[15px]' />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <style>
                        {`
                          @keyframes fadeSlideIn {
                            from {
                              opacity: 0;
                              transform: translateY(8px);
                            }
                            to {
                              opacity: 1;
                              transform: translateY(0);
                            }
                          }
                        `}
                      </style>
                    </div>
                  </div>

                  <div
                    className='relative group'
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type='button'
                      onClick={() => setShowCartDropdown(!showCartDropdown)}
                      className='relative flex h-10 w-10 items-center justify-center rounded-full border border-[#e6eaf0] bg-white text-[#344054] hover:bg-[#f8fafc] transition'
                    >
                      <FaShoppingCart className='text-[18px]' />
                      {totalPending > 0 && (
                        <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white'>
                          {totalPending}
                        </span>
                      )}
                    </button>

                    <div
                      className={`
                      fixed md:absolute top-20 md:top-12 left-1/2 md:left-auto -translate-x-1/2 md:translate-x-0 md:right-0
                      w-[95%] max-w-sm md:w-[340px] rounded-2xl border border-[#dde3ec] bg-white p-4 shadow-[0_20px_45px_rgba(15,23,42,0.14)] z-50
                      transition-all duration-300 ease-in-out
                      ${showCartDropdown
                          ? 'opacity-100 visible translate-y-0'
                          : 'opacity-0 invisible translate-y-3'
                        }
                      md:opacity-0 md:invisible md:translate-y-3
                      md:group-hover:opacity-100 md:group-hover:visible md:group-hover:translate-y-0
                    `}
                    >
                      <h3 className='mb-4 text-[16px] font-semibold text-[#243B63]'>
                        Pending Bookings
                      </h3>

                      {navbarCart.length === 0 ? (
                        <div className='rounded-xl border border-dashed border-[#d8dee8] bg-[#f8fafc] px-4 py-6 text-center text-sm text-[#667085]'>
                          No Pending Services
                        </div>
                      ) : (
                        <div className='space-y-2 max-h-[320px] overflow-y-auto pr-1'>
                          {navbarCart.map((item) => (
                            <div
                              key={`${item.salonId}-${item.customerName}`}
                              onClick={() =>
                                navigate(`/add-services/${item.salonId}`, {
                                  state: {
                                    bookingFor:
                                      item.customerName === user?.name ? 'myself' : 'someone',
                                    customerName: item.customerName || '',
                                    bookedBy: user?.name || '',
                                  },
                                })
                              }
                              className='flex items-center justify-between rounded-xl border border-[#eef1f5] px-3 py-3 hover:bg-[#f8fafc] transition cursor-pointer'
                            >
                              <div>
                                <p className='text-sm font-semibold text-[#111827]'>
                                  {item.customerName}
                                </p>
                                <p className='text-xs text-[#667085] mt-1'>
                                  {item.salonName}
                                </p>
                              </div>

                              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white'>
                                {item.pendingCount}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type='button'
                    onClick={() => navigate('/profile')}
                    className='flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#e6eaf0] bg-white text-[#344054] hover:bg-[#f8fafc] transition'
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt='profile'
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <FiUser className='text-[19px]' />
                    )}
                  </button>

                  <div className='hidden lg:block'>{ownerButton()}</div>

                  <button
                    type='button'
                    className='lg:hidden flex h-10 w-10 items-center justify-center rounded-full border border-[#e6eaf0] bg-white text-[#344054]'
                    onClick={() => setMobileMenu(!mobileMenu)}
                  >
                    <FiMenu className='text-[22px]' />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {mobileMenu && isLoggedIn && (
          <div className='lg:hidden border-t border-[#eef1f5] bg-white px-5 py-5 space-y-3 shadow-sm'>
            <div
              onClick={() => {
                navigate('/success')
                setMobileMenu(false)
              }}
              className='rounded-xl px-3 py-2.5 text-[15px] font-medium text-[#243B63] hover:bg-[#f8fafc] cursor-pointer'
            >
              Home
            </div>

            <div
              onClick={() => {
                navigate('/about')
                setMobileMenu(false)
              }}
              className='rounded-xl px-3 py-2.5 text-[15px] font-medium text-[#243B63] hover:bg-[#f8fafc] cursor-pointer'
            >
              About
            </div>

            <div
              onClick={() => {
                navigate('/contact')
                setMobileMenu(false)
              }}
              className='rounded-xl px-3 py-2.5 text-[15px] font-medium text-[#243B63] hover:bg-[#f8fafc] cursor-pointer'
            >
              Contact
            </div>

            <div
              onClick={() => {
                navigate('/bookings')
                setMobileMenu(false)
              }}
              className='rounded-xl px-3 py-2.5 text-[15px] font-medium text-[#243B63] hover:bg-[#f8fafc] cursor-pointer'
            >
              My Bookings
            </div>

            <div className='pt-3 border-t border-[#eef1f5]'>
              {isOwner ? (
                isOwnerPanel ? (
                  <div
                    onClick={() => {
                      navigate('/success')
                      setMobileMenu(false)
                    }}
                    className='rounded-xl border border-[#3c3c3c] bg-gradient-to-r from-[#242424] via-[#343434] to-[#464646] px-4 py-3 text-sm font-semibold text-white cursor-pointer'
                  >
                    Switch to User
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      navigate('/owner-dashboard')
                      setMobileMenu(false)
                    }}
                    className='rounded-xl border border-[#159947] bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-4 py-3 text-sm font-semibold text-white cursor-pointer'
                  >
                    Switch to Owner
                  </div>
                )
              ) : ownerStatus === 'PENDING' ? (
                <div className='rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700'>
                  Owner Application Pending
                </div>
              ) : (
                <div
                  onClick={() => {
                    setShowOwnerModal(true)
                    setMobileMenu(false)
                  }}
                  className='rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-sm font-semibold text-[#243B63] cursor-pointer'
                >
                  Become an Owner
                </div>
              )}
            </div>

            <div
              onClick={handleLogout}
              className='rounded-xl px-3 py-2.5 text-[15px] font-medium text-red-600 hover:bg-red-50 cursor-pointer'
            >
              Logout
            </div>
          </div>
        )}
      </header>

      {showOwnerModal && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4'>
          <div className='relative w-full max-w-2xl rounded-3xl border border-[#e6eaf0] bg-white p-6 md:p-8 shadow-[0_30px_80px_rgba(15,23,42,0.24)]'>
            <button
              onClick={() => {
                setShowOwnerModal(false)
                setAgreed(false)
              }}
              className='absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#f8fafc] text-gray-500 hover:text-black'
            >
              ✕
            </button>

            <h2 className='text-center text-2xl font-semibold text-[#243B63]'>
              Become an Owner
            </h2>

            <p className='mt-2 text-center text-sm text-[#667085]'>
              Please read and agree to the rules before applying.
            </p>

            <div className='mt-6 h-72 overflow-y-auto rounded-2xl border border-[#e6eaf0] bg-[#fafbfd] p-5 text-sm leading-7 text-[#475467] space-y-3'>
              <p><strong>1. Eligibility:</strong> You must be the legal owner or authorized representative.</p>
              <p><strong>2. Business Verification:</strong> Provide valid ID and business documents.</p>
              <p><strong>3. Accurate Information:</strong> Information must be correct and up-to-date.</p>
              <p><strong>4. Document Authenticity:</strong> Fake or misleading docs may lead to suspension.</p>
              <p><strong>5. Service Responsibility:</strong> You are responsible for services and staff.</p>
              <p><strong>6. Booking Management:</strong> Manage bookings responsibly.</p>
              <p><strong>7. Payment Compliance:</strong> Honor any platform charges.</p>
              <p><strong>8. Privacy Protection:</strong> Customer data must be handled securely.</p>
              <p><strong>9. Content Guidelines:</strong> Uploaded content must be appropriate.</p>
              <p><strong>10. Approval Timeline:</strong> Verification may take 24–72 hours.</p>
              <p><strong>11. Account Security:</strong> Maintain login confidentiality.</p>
              <p><strong>12. Platform Rights:</strong> Platform may suspend accounts violating policies.</p>
              <p><strong>13. Refund & Dispute Policy:</strong> Handle disputes professionally.</p>
              <p><strong>14. Compliance with Laws:</strong> Operate in compliance with regulations.</p>
              <p><strong>15. Updates to Terms:</strong> Continued use implies acceptance of updates.</p>
            </div>

            <div className='mt-5 flex items-center gap-3 rounded-xl bg-[#f8fafc] px-4 py-3'>
              <input
                type='checkbox'
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
                className='h-4 w-4 accent-black'
              />
              <label className='text-sm text-[#344054]'>
                I have read and agree to the rules
              </label>
            </div>

            <div className='mt-6 flex gap-4'>
              <button
                disabled={!agreed}
                onClick={() => {
                  if (agreed) {
                    setShowOwnerModal(false)
                    setShowOwnerForm(true)
                    setAgreed(false)
                  }
                }}
                className={`w-full rounded-xl py-3 font-semibold transition ${agreed
                  ? 'bg-gradient-to-r from-[#111827] to-[#1f2937] text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
              >
                Continue
              </button>

              <button
                onClick={() => {
                  setShowOwnerModal(false)
                  setAgreed(false)
                }}
                className='w-full rounded-xl border border-[#d8dee8] bg-white py-3 font-semibold text-[#344054]'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showOwnerForm && (
        <div className='fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4'>
          <div className='relative w-full max-w-xl max-h-[90vh] overflow-hidden rounded-3xl border border-[#e6eaf0] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.24)]'>
            <div className='max-h-[90vh] overflow-y-auto px-6 py-8 md:px-8'>
              <button
                onClick={() => setShowOwnerForm(false)}
                className='absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#f8fafc] text-gray-500 hover:text-black'
              >
                ✕
              </button>

              <h2 className='text-center text-2xl font-semibold text-[#243B63]'>
                Become an Owner
              </h2>

              <p className='mt-2 text-center text-sm text-[#667085]'>
                Submit your details and Aadhaar document to apply
              </p>

              <input
                type="tel"
                value={phone}
                maxLength={10}
                onChange={(e) => {
                  let value = e.target.value

                  // allow only numbers
                  value = value.replace(/[^0-9]/g, '')

                  // limit to 10 digits
                  if (value.length > 10) return

                  setPhone(value)

                  // live validation
                  if (!value) {
                    setPhoneError('Mobile number is required')
                  } else if (value.length < 10) {
                    setPhoneError('Must be 10 digits')
                  } else if (!/^[6-9]\d{9}$/.test(value)) {
                    setPhoneError('Invalid Indian mobile number')
                  } else {
                    setPhoneError('')
                  }
                }}
                onKeyDown={(e) => {
                  // block non-numeric keys except control keys
                  if (
                    !/[0-9]/.test(e.key) &&
                    !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'].includes(e.key)
                  ) {
                    e.preventDefault()
                  }
                }}
                className={`w-full rounded-xl border px-4 py-3 outline-none focus:border-[#243B63] ${phoneError ? 'border-red-500' : 'border-[#d8dee8]'
                  }`}
                placeholder="Enter 10 digit mobile number"
              />

              <div className='mt-4'>
                <label className='mb-2 block text-sm font-semibold text-[#344054]'>
                  Email
                </label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full rounded-xl border border-[#d8dee8] px-4 py-3 outline-none focus:border-[#243B63]'
                />
              </div>

              <div className='mt-6'>
                <label className='mb-3 block text-sm font-semibold text-[#344054]'>
                  Aadhaar Card
                </label>

                <input
                  type='file'
                  accept='image/*'
                  ref={fileInputRef}
                  onChange={(e) => setAadharFile(e.target.files[0])}
                  className='hidden'
                />

                <div
                  onClick={() => fileInputRef.current.click()}
                  className='flex h-56 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-[#d8dee8] bg-[#fafbfd] hover:bg-[#f6f8fb] transition'
                >
                  {aadharFile ? (
                    <img
                      src={typeof aadharFile === 'string' ? aadharFile : URL.createObjectURL(aadharFile)}
                      alt='Preview'
                      className='h-full rounded-xl object-contain'
                    />
                  ) : (
                    <div className='text-center'>
                      <div className='mb-3 text-4xl text-[#667085]'>⬆</div>
                      <p className='text-sm text-[#667085]'>
                        Click to upload Aadhaar card
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleOwnerApply}
                disabled={loading}
                className='mt-8 w-full rounded-xl bg-gradient-to-r from-[#111827] to-[#1f2937] py-3 font-semibold text-white hover:brightness-110 transition'
              >
                {loading ? 'Uploading...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4'>
          <div className='w-[90%] max-w-md rounded-3xl border border-[#e6eaf0] bg-white p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.24)]'>
            <h2 className='mb-4 text-2xl font-semibold text-[#243B63]'>
              Application Submitted
            </h2>

            <div className='mb-6 flex justify-center'>
              <div className='flex h-24 w-24 items-center justify-center rounded-full bg-[#f8fafc]'>
                <img
                  src='/time.png'
                  alt='time'
                  className='h-16 w-16 object-contain'
                />
              </div>
            </div>

            <p className='mb-6 text-sm leading-6 text-[#667085]'>
              Thank you for submitting your documents. Your application is under
              review by our admin.
            </p>

            <div className='mb-6 rounded-2xl bg-[#f8fafc] p-4 text-sm leading-6 text-[#667085]'>
              Our team will review your application and verify the submitted
              information. This process may take up to 72 hours. You will
              receive a notification once a decision has been made.
            </div>

            <button
              onClick={() => {
                setShowModal(false)
                navigate('/success')
              }}
              className='w-full rounded-xl bg-gradient-to-r from-[#111827] to-[#1f2937] px-6 py-3 font-semibold text-white hover:brightness-110 transition'
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}