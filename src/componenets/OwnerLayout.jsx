import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  FiBell,
  FiUser,
  FiMenu,
  FiRepeat,
  FiChevronDown,
  FiTrash2,
  FiCheck,
  FiClock,
} from 'react-icons/fi'

const BASE_URL = 'http://localhost:8080' // Change this to your actual backend URL

export default function OwnerLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const dropdownRef = useRef(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userId = user?.userId || ''
  const ownerName = user?.name || 'Yashraj Parmar'
  const ownerRole = 'Owner'

  const menuItems = [
    { name: 'Dashboard', path: '/owner-dashboard' },
    { name: 'Salons', path: '/add-salon' },
    { name: 'Barbers', path: '/manage-barbers' },
    { name: 'Services', path: '/services' },
    { name: 'Bookings', path: '/manage-bookings' },
    { name: '', path: '/reviews' },
  ]

  const fetchNotifications = async () => {
    if (!userId) return

    try {
      const res = await fetch(
        `${BASE_URL}/api/notifications/user/${userId}?audience=OWNER`
      )
      if (!res.ok) return

      const data = await res.json()
      const safe = Array.isArray(data) ? data : []

      setNotifications(safe)
      setUnreadCount(safe.filter((item) => item.isRead !== true).length)
    } catch (e) {
      console.error('Owner notification fetch error:', e)
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleOutside = () => {
      setShowNotificationDropdown(false)
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
      const res = await fetch(
        `${BASE_URL}/api/notifications/read-all/${userId}?audience=OWNER`,
        {
          method: 'PUT',
        }
      )

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

  return (
    <div className='min-h-screen bg-[#f5f7fb] overflow-x-hidden'>
      {mobileMenuOpen && (
        <div
          className='fixed inset-0 bg-black/40 z-30 md:hidden'
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 z-40 h-screen w-64
          bg-gradient-to-b from-[#07153A] via-[#091842] to-[#0C1D4E]
          text-white px-6 py-6
          transform transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className='flex items-center justify-between mb-10'>
          <div className='flex items-center gap-3'>
            <div className='w-7 h-7 rounded-md bg-black shadow-sm'></div>
            <h2 className='text-[17px] font-semibold tracking-[0.2px]'>
              SlotMyStyle
            </h2>
          </div>

          <button
            className='md:hidden text-xl'
            onClick={() => setMobileMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        <ul className='space-y-3'>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path

            return (
              <li
                key={item.name}
                onClick={() => {
                  navigate(item.path)
                  setMobileMenuOpen(false)
                }}
                className={`cursor-pointer px-5 py-3 rounded-xl transition-all text-[15px] ${
                  isActive
                    ? 'bg-white text-[#111827] font-semibold shadow-[0_10px_25px_rgba(255,255,255,0.10)]'
                    : 'text-gray-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.name}
              </li>
            )
          })}
        </ul>
      </div>

      <div className='min-w-0 md:pl-64'>
        <div className='sticky top-0 h-[76px] bg-white border-b border-[#e7eaf0] px-5 md:px-10 flex items-center justify-between shadow-[0_1px_2px_rgba(16,24,40,0.04)] z-20'>
          <div className='flex items-center gap-3'>
            <FiMenu
              className='text-2xl cursor-pointer md:hidden text-[#344054]'
              onClick={() => setMobileMenuOpen(true)}
            />
            <h1 className='text-[18px] md:text-[20px] font-semibold text-[#243B63] tracking-[0.2px]'>
              Owner Panel
            </h1>
          </div>

          <div className='flex items-center gap-4 md:gap-5'>
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
                className={`absolute right-0 top-12 w-[380px] origin-top-right rounded-3xl border border-[#e5e7eb] bg-white/95 backdrop-blur-xl shadow-[0_24px_60px_rgba(15,23,42,0.18)] z-50 overflow-hidden transition-all duration-300 ${
                  showNotificationDropdown
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
                        New salon verification updates and owner alerts will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      {notifications.map((item, index) => (
                        <div
                          key={item.id}
                          onClick={() => markNotificationAsRead(item.id)}
                          className={`group relative cursor-pointer overflow-hidden rounded-2xl border px-4 py-3 transition-all duration-200 ${
                            item.isRead
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
                                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                  item.isRead
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

            <div className='relative' ref={dropdownRef}>
              <button
                type='button'
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className={`group flex items-center gap-3 h-[50px] pl-4 pr-3 rounded-xl border transition-all bg-white ${
                  profileDropdownOpen
                    ? 'border-[#cfd6e4] shadow-[0_12px_30px_rgba(17,24,39,0.10)]'
                    : 'border-[#d8dee8] shadow-[0_4px_14px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.10)]'
                }`}
              >
                <div className='flex items-center justify-center w-8 h-8 rounded-full bg-[#f3f6fb] text-[#344054] border border-[#e4e7ec]'>
                  <FiUser className='text-[16px]' />
                </div>

                <div className='flex items-center gap-3'>
                  <span className='text-[15px] font-medium text-[#1f2937]'>
                    {ownerRole}
                  </span>
                  <span className='text-[15px] font-semibold text-[#243B63] max-w-[160px] truncate'>
                    {ownerName}
                  </span>
                </div>

                <FiChevronDown
                  className={`text-[18px] text-[#667085] transition-transform duration-200 ${
                    profileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`absolute right-0 top-[58px] w-[290px] origin-top-right transition-all duration-200 ${
                  profileDropdownOpen
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
                      {ownerName}
                    </div>
                    <div className='text-[13px] text-[#667085]'>{ownerRole}</div>
                  </div>

                  <button
                    type='button'
                    onClick={() => {
                      setProfileDropdownOpen(false)
                      navigate('/')
                    }}
                    className='w-full flex items-center gap-3 rounded-xl px-4 py-3 border border-[#3c3c3c] bg-gradient-to-r from-[#242424] via-[#343434] to-[#464646] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:brightness-110 hover:shadow-[0_10px_24px_rgba(0,0,0,0.24)] transition-all'
                  >
                    <div className='flex items-center justify-center w-8 h-8 rounded-full bg-white/10'>
                      <FiRepeat className='text-[17px]' />
                    </div>
                    <div className='text-left'>
                      <div className='text-[15px] font-semibold leading-none'>
                        Switch to User
                      </div>
                      <div className='text-[12px] text-white/70 mt-1'>
                        Go back to customer side
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex-1 p-6 md:p-8 flex justify-center overflow-x-hidden'>
          <div className='w-full max-w-6xl'>{children}</div>
        </div>
      </div>
    </div>
  )
}