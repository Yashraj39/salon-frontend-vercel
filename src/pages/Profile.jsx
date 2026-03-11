import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaCamera,
  FaTrashAlt,
} from 'react-icons/fa'
import {
  FiArrowRight,
  FiEdit3,
  FiHome,
  FiLogOut,
  FiX,
  FiAlertTriangle,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import Navbar from '../componenets/Navbar'

const BASE_URL = 'https://render-qs89.onrender.com'

export default function Profile() {
  const navigate = useNavigate()

  const [editMode, setEditMode] = useState(false)
  const [backup, setBackup] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const [userData, setUserData] = useState({
    userId: '',
    name: '',
    email: '',
    avatar: '',
  })

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) return

    const user = JSON.parse(stored)

    setUserData({
      userId: user.userId || '',
      name: user.name || '',
      email: user.email || '',
      avatar: '',
    })

    fetch(`${BASE_URL}/api/v1.0/get-profile-image/${user.userId}`)
      .then((res) => (res.ok ? res.text() : ''))
      .then((url) => {
        if (url) {
          setUserData((prev) => ({
            ...prev,
            avatar: url.trim(),
          }))
        }
      })
      .catch(() => { })
  }, [])

  const initials = useMemo(() => {
    const text = (userData.name || 'U').trim()
    if (!text) return 'U'
    const parts = text.split(' ').filter(Boolean)
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U'
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
  }, [userData.name])

  const handleChange = (e) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !userData.userId) return

    try {
      const formData = new FormData()
      formData.append('userId', userData.userId)
      formData.append('image', file)

      const res = await fetch(`${BASE_URL}/api/v1.0/add-profile-image`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        toast.error('Image upload not allowed')
        return
      }

      let imageUrl = ''
      try {
        imageUrl = (await res.text()).trim()
      } catch { }

      if (imageUrl) {
        setUserData((prev) => ({ ...prev, avatar: imageUrl }))
      }

      toast.success('Profile image updated')
    } catch {
      toast.error('Image upload failed')
    }
  }

  const handleRemovePhoto = () => {
    setUserData((prev) => ({ ...prev, avatar: '' }))
  }

  const handleSave = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/v1.0/update-profile/${userData.userId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: userData.name,
          }),
        }
      )

      if (!res.ok) {
        const errorText = await res.text()
        toast.error(errorText || 'Profile update failed')
        return
      }

      const updatedUser = await res.json()

      localStorage.setItem(
        'user',
        JSON.stringify({
          userId: updatedUser.userId,
          name: updatedUser.name,
          email: updatedUser.email,
        })
      )

      setUserData((prev) => ({
        ...prev,
        name: updatedUser.name,
        email: updatedUser.email,
      }))

      toast.success('Profile updated')
      setEditMode(false)
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const handleCancel = () => {
    if (backup) setUserData(backup)
    setEditMode(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    toast.success('Logout successfully')
    navigate('/home')
  }

  const handleChangePasswordClick = () => {
    setShowPasswordModal(true)
  }

  const handlePasswordSubmit = async (formData) => {
    try {
      if (
        !formData.currentPassword ||
        !formData.newPassword ||
        !formData.confirmPassword
      ) {
        toast.error('Please fill all fields')
        return
      }

      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('New password and confirm password do not match')
        return
      }

      const res = await fetch(`${BASE_URL}/api/v1.0/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.userId,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      const message = await res.text()

      if (!res.ok) {
        toast.error(message || 'Password change failed')
        return
      }

      toast.success(message || 'Password updated successfully')
      setShowPasswordModal(false)
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const handleConfirmDelete = async (password) => {
    try {
      if (!password) {
        toast.error('Password is required')
        return
      }

      const res = await fetch(`${BASE_URL}/api/v1.0/delete-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.userId,
          password,
        }),
      })

      const message = await res.text()

      if (!res.ok) {
        toast.error(message || 'Delete account failed')
        return
      }

      localStorage.removeItem('user')
      toast.success(message || 'Account deleted successfully')
      navigate('/home')
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  return (
    <div className='min-h-screen bg-[#f8fafc] text-slate-900 animate-[fadeIn_.35s_ease]'>
      <Navbar />

      <section className='relative overflow-hidden border-b border-slate-200 bg-white'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.06),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_30%)]' />

        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8 sm:pb-10'>
          <div className='flex justify-center sm:justify-end'>
            <div className='grid w-full max-w-md grid-cols-1 sm:flex sm:w-auto sm:max-w-none sm:flex-wrap sm:justify-end gap-3 animate-[fadeIn_.55s_ease]'>
              <button
                onClick={() => navigate('/home')}
                className='inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50'
              >
                <FiHome />
                Home
              </button>

              <button
                onClick={() => navigate('/bookings')}
                className='inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50'
              >
                My Bookings
                <FiArrowRight />
              </button>

              <button
                onClick={handleLogout}
                className='inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98]'
              >
                <FiLogOut />
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10'>
        <div className='grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-6 xl:gap-8'>
          <aside className='xl:sticky xl:top-24 h-fit animate-[fadeIn_.45s_ease]'>
            <div className='overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]'>
              <div className='relative h-32 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700'>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.14),_transparent_30%)]' />
              </div>

              <div className='relative px-6 pb-6'>
                <div className='-mt-16 flex flex-col items-center text-center'>
                  <div className='relative'>
                    <div className='h-32 w-32 rounded-full border-4 border-white bg-slate-100 shadow-xl overflow-hidden flex items-center justify-center'>
                      {userData.avatar ? (
                        <img
                          src={userData.avatar}
                          alt='profile'
                          className='h-full w-full object-cover'
                        />
                      ) : (
                        <span className='text-4xl font-bold text-slate-700'>
                          {initials}
                        </span>
                      )}
                    </div>

                    {editMode && (
                      <label className='absolute -bottom-1 -right-1 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition hover:scale-105 hover:bg-slate-800'>
                        <FaCamera className='text-sm' />
                        <input
                          type='file'
                          accept='image/*'
                          hidden
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>

                  <h2 className='mt-5 text-2xl font-semibold text-slate-900'>
                    {userData.name || 'Your Name'}
                  </h2>

                  <p className='mt-1 text-sm text-slate-500 break-all'>
                    {userData.email || 'your@email.com'}
                  </p>

                  <div className='mt-4 flex flex-wrap justify-center gap-2'>
                    <span className='rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700'>
                      Member
                    </span>

                  </div>
                </div>

                {editMode && userData.avatar && (
                  <button
                    onClick={handleRemovePhoto}
                    className='mt-6 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50'
                  >
                    Remove current photo
                  </button>
                )}

                <div className='mt-6 grid grid-cols-2 gap-3'>
                  <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left'>
                    <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>
                      Status
                    </p>
                    <p className='mt-2 text-sm font-semibold text-slate-900'>
                      Active
                    </p>
                  </div>

                  <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left'>
                    <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>
                      Account
                    </p>
                    <p className='mt-2 text-sm font-semibold text-slate-900'>
                      Customer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className='min-w-0 animate-[fadeIn_.5s_ease]'>
            <div className='rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 md:p-8 shadow-[0_8px_24px_rgba(15,23,42,0.05)]'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div>
                  <h3 className='text-xl sm:text-2xl font-semibold text-slate-900'>
                    Personal Information
                  </h3>
                  <p className='mt-1 text-sm sm:text-base text-slate-500'>
                    Update the information linked to your account.
                  </p>
                </div>

                {!editMode ? (
                  <button
                    onClick={() => {
                      setBackup({ ...userData })
                      setEditMode(true)
                    }}
                    className='inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98]'
                  >
                    <FiEdit3 />
                    Edit Profile
                  </button>
                ) : (
                  <div className='flex flex-wrap gap-3'>
                    <button
                      onClick={handleSave}
                      className='rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98]'
                    >
                      Save Changes
                    </button>

                    <button
                      onClick={handleCancel}
                      className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                    >
                      <FiX />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className='mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6'>
                <Input
                  label='Username'
                  icon={<FaUser />}
                  name='name'
                  value={userData.name}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder='Enter your full name'
                />

                <Input
                  label='Email Address'
                  icon={<FaEnvelope />}
                  value={userData.email}
                  disabled
                  placeholder='Email address'
                />

                <div className='lg:col-span-2'>
                  <PasswordField
                    label='Password'
                    value='********'
                    onChangePassword={handleChangePasswordClick}
                  />
                </div>
              </div>

              <div className='mt-8 border-t border-slate-200 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div>
                  <h4 className='text-sm font-semibold text-slate-900'>
                    Delete Account
                  </h4>
                  <p className='mt-1 text-sm text-slate-500'>
                    Permanently remove your account and related data.
                  </p>
                </div>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className='inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 active:scale-[0.98]'
                >
                  <FaTrashAlt className='text-sm' />
                  Delete Account
                </button>
              </div>
            </div>
          </main>
        </div>
      </section>

      <footer className='mt-14 border-t border-slate-200 bg-white'>
        <div className='max-w-[1600px] mx-auto px-6 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='h-8 w-8 rounded-xl bg-slate-900' />
            <span className='font-semibold text-slate-900'>SlotMyStyle</span>
          </div>

          <p className='text-sm text-slate-500 text-center'>
            © 2025 SlotMyStyle Inc. All rights reserved.
          </p>

          <div className='flex gap-6 text-sm text-slate-500'>
            <a href='#' className='transition hover:text-slate-900'>
              Terms
            </a>
            <a href='#' className='transition hover:text-slate-900'>
              Privacy
            </a>
          </div>
        </div>
      </footer>

      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          userName={userData.name}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSubmit={handlePasswordSubmit}
        />
      )}
    </div>
  )
}

function Input({ label, icon, disabled, ...props }) {
  return (
    <div>
      <label className='text-sm font-medium text-slate-700'>{label}</label>

      <div
        className={`mt-2 flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${disabled
          ? 'border-slate-200 bg-slate-50'
          : 'border-slate-200 bg-white focus-within:border-slate-300 focus-within:shadow-[0_0_0_4px_rgba(15,23,42,0.04)]'
          }`}
      >
        <span className='text-slate-400'>{icon}</span>

        <input
          {...props}
          disabled={disabled}
          className='flex-1 bg-transparent text-sm sm:text-base text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed'
        />
      </div>
    </div>
  )
}

function PasswordField({ label, value, onChangePassword }) {
  return (
    <div>
      <div className='flex items-center justify-between gap-3'>
        <label className='text-sm font-medium text-slate-700'>{label}</label>
        <button
          type='button'
          onClick={onChangePassword}
          className='text-xs sm:text-sm font-semibold text-slate-700 transition hover:text-slate-900'
        >
          Change Password
        </button>
      </div>

      <div className='mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition'>
        <span className='text-slate-400'>
          <FaLock />
        </span>

        <input
          value={value}
          disabled
          className='flex-1 bg-transparent text-sm sm:text-base text-slate-700 outline-none disabled:cursor-not-allowed'
        />
      </div>
    </div>
  )
}

function ChangePasswordModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 backdrop-blur-[2px] px-4 animate-[fadeIn_.2s_ease]'>
      <div className='w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.22)] animate-[fadeIn_.25s_ease]'>
        <div className='flex items-center justify-between border-b border-slate-200 px-6 py-5'>
          <div>
            <h3 className='text-xl font-semibold text-slate-900'>
              Change Password
            </h3>
            <p className='mt-1 text-sm text-slate-500'>
              Update your account password.
            </p>
          </div>

          <button
            onClick={onClose}
            className='rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900'
          >
            <FiX className='text-lg' />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(formData)
          }}
          className='px-6 py-6 space-y-4'
        >
          <ModalInput
            label='Current Password'
            name='currentPassword'
            type='password'
            value={formData.currentPassword}
            onChange={handleChange}
          />

          <ModalInput
            label='New Password'
            name='newPassword'
            type='password'
            value={formData.newPassword}
            onChange={handleChange}
          />

          <ModalInput
            label='Confirm New Password'
            name='confirmPassword'
            type='password'
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <div className='flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
            >
              Cancel
            </button>

            <button
              type='submit'
              className='rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]'
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ModalInput({ label, ...props }) {
  return (
    <div>
      <label className='text-sm font-medium text-slate-700'>{label}</label>
      <input
        {...props}
        className='mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:shadow-[0_0_0_4px_rgba(15,23,42,0.04)]'
      />
    </div>
  )
}

function DeleteAccountModal({ onClose, onConfirm, userName }) {
  const [password, setPassword] = useState('')

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 backdrop-blur-[2px] px-4 animate-[fadeIn_.2s_ease]'>
      <div className='w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.22)] animate-[fadeIn_.25s_ease]'>
        <div className='flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5'>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600'>
              <FiAlertTriangle className='text-xl' />
            </div>

            <div>
              <h3 className='text-xl font-semibold text-slate-900'>
                Delete account?
              </h3>
              <p className='mt-1 text-sm text-slate-500'>
                Please confirm this action before continuing.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className='rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900'
          >
            <FiX className='text-lg' />
          </button>
        </div>

        <div className='px-6 py-6 space-y-4'>
          <div className='rounded-2xl border border-red-200 bg-red-50 px-4 py-4'>
            <p className='text-sm leading-6 text-slate-700'>
              You are about to delete{' '}
              <span className='font-semibold text-slate-900'>
                {userName || 'your account'}
              </span>
              . This action may permanently remove your profile, bookings, and
              related account data.
            </p>
          </div>

          <div>
            <label className='text-sm font-medium text-slate-700'>
              Enter password to confirm
            </label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:shadow-[0_0_0_4px_rgba(15,23,42,0.04)]'
              placeholder='Enter your password'
            />
          </div>
        </div>

        <div className='flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-200 px-6 py-5'>
          <button
            onClick={onClose}
            className='rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
          >
            Cancel
          </button>

          <button
            onClick={() => onConfirm(password)}
            className='inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.98]'
          >
            <FaTrashAlt className='text-sm' />
            Yes, Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}