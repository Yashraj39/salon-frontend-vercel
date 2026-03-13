import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  FiBell,
  FiUser,
  FiMenu,
  FiChevronRight,
  FiChevronDown,
} from 'react-icons/fi'
import { FaShoppingCart } from 'react-icons/fa'
import React, { useEffect, useState, useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast'

const BASE_URL = 'https://render-qs89.onrender.com'

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

  useEffect(() => {
    if (!currentUserId) return
    const currentUserApp = getOwnerApplication(currentUserId)
    if (currentUserApp) {
      setOwnerStatus(currentUserApp.status || null)
      setPhone(currentUserApp.phone || '')
      setEmail(currentUserApp.email || '')
      setAadharFile(currentUserApp.aadhaarUrl || null)
    } else {
      setOwnerStatus(null)
      setPhone('')
      setEmail('')
      setAadharFile(null)
    }
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
      const res = await fetch(`${BASE_URL}/api/notifications/user/${userId}`)
      if (!res.ok) return

      const data = await res.json()
      const safe = Array.isArray(data) ? data : []

      setNotifications(safe)
      setUnreadCount(
        safe.filter((item) => !(item.isRead === true || item.read === true)).length
      )
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
    const interval = setInterval(async () => {
      if (!currentUserId) return

      try {
        const res = await fetch(
          `${BASE_URL}/api/owner/application?userId=${currentUserId}`
        )

        if (!res.ok) {
          removeOwnerApplication(currentUserId)
          setOwnerStatus(null)
          return
        }

        const data = await res.json()

        saveOwnerApplication(currentUserId, data)

        if (data?.id) {
          localStorage.setItem('ownerId', data.id)
        }

        if (data?.status && data.status !== ownerStatus) {
          setOwnerStatus(data.status)

          toast.success(
            data.status === 'APPROVED'
              ? 'Your owner application has been approved!'
              : 'Your application is pending.'
          )
        }
      } catch (e) {
        console.error(e)
      }
    }, 2000)

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

  const handleOwnerApply = async () => {
    if (!currentUserId) {
      toast.error('User not logged in')
      return
    }
    if (!phone || !email || !aadharFile) {
      toast.error('Please fill all fields')
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
      if (!uploadRes.ok) throw new Error('Image upload failed')
      const uploadData = await uploadRes.json()
      const imageUrl = uploadData.imageUrl

      const applyRes = await fetch(`${BASE_URL}/api/owner/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          phone,
          email,
          aadhaarUrl: imageUrl,
          termsAccepted: true,
        }),
      })
      if (!applyRes.ok) throw new Error('Application failed')
      const applyData = await applyRes.json()

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
    setCurrentUserId(null)
    navigate('/login')
  }

  const ownerButton = () => {
    if (ownerStatus === 'PENDING') {
      return (
        <button className='h-[42px] rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-700 shadow-sm cursor-not-allowed'>
          Owner Pending
        </button>
      )
    }

    if (ownerStatus === 'APPROVED') {
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
            className={`group flex items-center justify-between min-w-[235px] h-[50px] pl-4 pr-3 rounded-xl border transition-all bg-white ${
              ownerDropdownOpen
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
              className={`text-[18px] text-[#667085] transition-transform duration-200 ${
                ownerDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <div
            className={`absolute right-0 top-[58px] w-[290px] origin-top-right transition-all duration-200 z-50 ${
              ownerDropdownOpen
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
        <div className='mx-auto relative max-w-7xl px-4 py-4 sm:px-6 md:px-2'>
          <div className='flex items-center justify-between'>
            <div
              onClick={() => navigate('/success')}
              className='flex items-center gap-3 cursor-pointer'
            >
              <div className='h-9 w-9 rounded-xl bg-black shadow-sm' />
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
                  <div className='hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8'>
                    <button
                      type='button'
                      onClick={() => navigate('/success')}
                      className='group relative w-[110px] pb-2 text-center'
                    >
                      <span
                        className={`text-[15px] font-semibold transition-colors duration-300 ${
                          location.pathname === '/success'
                            ? 'text-[#111827]'
                            : 'text-[#667085] group-hover:text-[#111827]'
                        }`}
                      >
                        Home
                      </span>

                      <span
                        className={`absolute left-1/2 bottom-0 h-[2px] w-[42px] -translate-x-1/2 rounded-full bg-[#111827] transition-all duration-300 ${
                          location.pathname === '/success'
                            ? 'opacity-100 scale-x-100'
                            : 'opacity-0 scale-x-0'
                        }`}
                      />
                    </button>

                    <button
                      type='button'
                      onClick={() => navigate('/bookings')}
                      className='group relative w-[110px] pb-2 text-center'
                    >
                      <span
                        className={`text-[15px] font-semibold transition-colors duration-300 ${
                          location.pathname === '/bookings'
                            ? 'text-[#111827]'
                            : 'text-[#667085] group-hover:text-[#111827]'
                        }`}
                      >
                        My Bookings
                      </span>

                      <span
                        className={`absolute left-1/2 bottom-0 h-[2px] w-[42px] -translate-x-1/2 rounded-full bg-[#111827] transition-all duration-300 ${
                          location.pathname === '/bookings'
                            ? 'opacity-100 scale-x-100'
                            : 'opacity-0 scale-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )}

                <div className='flex items-center gap-4 md:gap-4 relative shrink-0'>
                  <div className='relative' onClick={(e) => e.stopPropagation()}>
                    <button
                      type='button'
                      onClick={() => setShowNotificationDropdown((prev) => !prev)}
                      className='hidden sm:flex relative h-10 w-10 items-center justify-center rounded-full border border-[#e6eaf0] bg-white text-[#344054] hover:bg-[#f8fafc] transition'
                    >
                      <FiBell className='text-[19px]' />
                      {unreadCount > 0 && (
                        <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white'>
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {showNotificationDropdown && (
                      <div className='absolute right-0 top-12 w-[360px] rounded-2xl border border-[#dde3ec] bg-white p-4 shadow-[0_20px_45px_rgba(15,23,42,0.14)] z-50'>
                        <h3 className='mb-4 text-[16px] font-semibold text-[#243B63]'>
                          Notifications
                        </h3>

                        {notifications.length === 0 ? (
                          <div className='rounded-xl border border-dashed border-[#d8dee8] bg-[#f8fafc] px-4 py-6 text-center text-sm text-[#667085]'>
                            No notifications
                          </div>
                        ) : (
                          <div className='space-y-2 max-h-[320px] overflow-y-auto pr-1'>
                            {notifications.map((item) => (
                              <div
                                key={item.id}
                                className='rounded-xl border border-[#eef1f5] px-3 py-3 bg-white'
                              >
                                <p className='text-sm font-semibold text-[#111827]'>
                                  {item.title}
                                </p>
                                <p className='text-xs text-[#667085] mt-1 leading-5'>
                                  {item.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
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
                      ${
                        showCartDropdown
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

                  <div className='hidden md:block'>{ownerButton()}</div>

                  <button
                    type='button'
                    className='md:hidden flex h-10 w-10 items-center justify-center rounded-full border border-[#e6eaf0] bg-white text-[#344054]'
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
          <div className='md:hidden border-t border-[#eef1f5] bg-white px-5 py-5 space-y-4 shadow-sm'>
            <div
              onClick={() => navigate('/success')}
              className='flex items-center gap-3 cursor-pointer shrink-0 min-w-[190px]'
            >
              Home
            </div>

            <div
              onClick={() => navigate('/bookings')}
              className='rounded-xl px-3 py-2.5 text-[15px] font-medium text-[#243B63] hover:bg-[#f8fafc] cursor-pointer'
            >
              My Bookings
            </div>

            <div className='pt-3 border-t border-[#eef1f5]'>
              {ownerStatus === 'PENDING' ? (
                <div className='rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700'>
                  Owner Application Pending
                </div>
              ) : ownerStatus === 'APPROVED' ? (
                isOwnerPanel ? (
                  <div
                    onClick={() => navigate('/success')}
                    className='rounded-xl border border-[#3c3c3c] bg-gradient-to-r from-[#242424] via-[#343434] to-[#464646] px-4 py-3 text-sm font-semibold text-white cursor-pointer'
                  >
                    Switch to User
                  </div>
                ) : (
                  <div
                    onClick={() => navigate('/owner-dashboard')}
                    className='rounded-xl border border-[#159947] bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-4 py-3 text-sm font-semibold text-white cursor-pointer'
                  >
                    Switch to Owner
                  </div>
                )
              ) : (
                <div
                  onClick={() => setShowOwnerModal(true)}
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
                className={`w-full rounded-xl py-3 font-semibold transition ${
                  agreed
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

              <div className='mt-6'>
                <label className='mb-2 block text-sm font-semibold text-[#344054]'>
                  Phone Number
                </label>
                <input
                  type='text'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className='w-full rounded-xl border border-[#d8dee8] px-4 py-3 outline-none focus:border-[#243B63]'
                />
              </div>

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
                      src={URL.createObjectURL(aadharFile)}
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