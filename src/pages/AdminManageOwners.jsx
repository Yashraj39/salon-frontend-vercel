import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import {
  FiLock,
  FiMail,
  FiMessageSquare,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUnlock,
  FiUser,
  FiX,
} from 'react-icons/fi'
import AdminLayout from '../componenets/AdminLayout'

const BASE_URL = 'https://render-qs89.onrender.com'

export default function AdminManageOwners() {
  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}')
    } catch {
      return {}
    }
  }, [])

  const adminId =
    admin?.adminId ||
    admin?.userId ||
    admin?.userid ||
    admin?.id ||
    admin?._id ||
    ''

  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedOwner, setSelectedOwner] = useState(null)
  const [note, setNote] = useState('')
  const [messageTitle, setMessageTitle] = useState('')
  const [messageBody, setMessageBody] = useState('')

  useEffect(() => {
    fetchOwners()
  }, [])

  const fetchOwners = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${BASE_URL}/api/admin/owner/manage`)
      if (!res.ok) throw new Error('Failed to load owners')

      const data = await res.json()
      setOwners(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load owners')
      setOwners([])
    } finally {
      setLoading(false)
    }
  }

  const openModal = (owner, type) => {
    setSelectedOwner(owner)
    setModalType(type)
    setNote('')
    setMessageTitle('')
    setMessageBody('')
    setModalOpen(true)
  }

  const closeModal = () => {
    if (actionLoadingId) return
    setModalOpen(false)
    setSelectedOwner(null)
    setModalType('')
    setNote('')
    setMessageTitle('')
    setMessageBody('')
  }

  const filteredOwners = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return owners

    return owners.filter((owner) => {
      const name = String(owner?.name || '').toLowerCase()
      const email = String(owner?.email || '').toLowerCase()
      const userId = String(owner?.userId || '').toLowerCase()
      return name.includes(term) || email.includes(term) || userId.includes(term)
    })
  }, [owners, searchTerm])

  const handleAction = async () => {
    if (!selectedOwner?.userId || !modalType) return

    if (!adminId) {
      toast.error('Admin not found, please login again')
      return
    }

    try {
      setActionLoadingId(selectedOwner.userId)

      let endpoint = ''
      let method = 'PATCH'
      let payload = { adminId, note: note.trim() }

      if (modalType === 'freeze') {
        endpoint = `${BASE_URL}/api/admin/owner/freeze/${selectedOwner.userId}`
      } else if (modalType === 'unfreeze') {
        endpoint = `${BASE_URL}/api/admin/owner/unfreeze/${selectedOwner.userId}`
      } else if (modalType === 'remove') {
        endpoint = `${BASE_URL}/api/admin/owner/remove/${selectedOwner.userId}`
        method = 'DELETE'
      } else if (modalType === 'message') {
        endpoint = `${BASE_URL}/api/admin/owner/notify/${selectedOwner.userId}`
        method = 'POST'
        payload = {
          adminId,
          title: messageTitle.trim(),
          message: messageBody.trim(),
        }
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const contentType = res.headers.get('content-type') || ''
      const data = contentType.includes('application/json')
        ? await res.json()
        : await res.text()

      if (!res.ok) {
        throw new Error(typeof data === 'string' ? data : 'Action failed')
      }

      if (modalType === 'freeze') toast.success('Owner frozen successfully')
      if (modalType === 'unfreeze') toast.success('Owner unfrozen successfully')
      if (modalType === 'remove') toast.success('Owner removed successfully')
      if (modalType === 'message') toast.success('Message sent to owner')

      closeModal()
      fetchOwners()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Something went wrong')
    } finally {
      setActionLoadingId('')
    }
  }

  return (
    <AdminLayout>
      <div className='max-w-7xl mx-auto py-2'>
        <div className='mb-6'>
          <h1 className='text-2xl sm:text-[30px] font-bold text-gray-950 tracking-tight'>
            Manage Owners
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Freeze, unfreeze, remove owners and send notifications.
          </p>
        </div>

        <div className='bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden'>
          <div className='p-5 border-b border-gray-100'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3'>
              <div>
                <h2 className='text-lg font-semibold text-gray-950'>Owners</h2>
                <p className='text-sm text-gray-500 mt-1'>
                  Search and manage all owner accounts.
                </p>
              </div>

              <div className='flex flex-col sm:flex-row gap-3'>
                <div className='relative min-w-0 sm:min-w-[260px]'>
                  <input
                    type='text'
                    placeholder='Search by name, email or user id...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full h-[46px] rounded-2xl border border-gray-200 bg-white px-4 pr-11 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition'
                  />
                  <div className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400'>
                    <FiSearch size={16} />
                  </div>
                </div>

                <button
                  onClick={fetchOwners}
                  disabled={loading}
                  className='h-[46px] px-4 rounded-2xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-60 flex items-center justify-center gap-2'
                >
                  <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className='hidden lg:block overflow-x-auto'>
            <table className='w-full min-w-[1100px]'>
              <thead>
                <tr className='bg-white border-b border-gray-100'>
                  <th className='text-left px-5 py-4 text-sm font-semibold text-gray-600'>Owner</th>
                  <th className='text-left px-5 py-4 text-sm font-semibold text-gray-600'>Email</th>
                  <th className='text-left px-5 py-4 text-sm font-semibold text-gray-600'>Status</th>
                  <th className='text-left px-5 py-4 text-sm font-semibold text-gray-600'>Freeze Reason</th>
                  <th className='text-left px-5 py-4 text-sm font-semibold text-gray-600'>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className='border-b border-gray-100'>
                      <td className='px-5 py-5'><div className='h-12 rounded-xl bg-gray-100 animate-pulse' /></td>
                      <td className='px-5 py-5'><div className='h-12 rounded-xl bg-gray-100 animate-pulse' /></td>
                      <td className='px-5 py-5'><div className='h-10 rounded-xl bg-gray-100 animate-pulse' /></td>
                      <td className='px-5 py-5'><div className='h-10 rounded-xl bg-gray-100 animate-pulse' /></td>
                      <td className='px-5 py-5'><div className='h-12 rounded-xl bg-gray-100 animate-pulse' /></td>
                    </tr>
                  ))
                ) : filteredOwners.length === 0 ? (
                  <tr>
                    <td colSpan='5' className='px-5 py-16 text-center text-gray-500'>
                      No owners found
                    </td>
                  </tr>
                ) : (
                  filteredOwners.map((owner) => (
                    <tr key={owner.userId} className='border-b border-gray-100 hover:bg-gray-50/70 transition'>
                      <td className='px-5 py-5'>
                        <div className='flex items-start gap-3'>
                          <div className='w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 shrink-0'>
                            <FiUser />
                          </div>
                          <div>
                            <p className='text-[15px] font-semibold text-gray-950'>{owner.name || '-'}</p>
                            <p className='text-sm text-gray-500 mt-1'>User ID: {owner.userId || '-'}</p>
                          </div>
                        </div>
                      </td>

                      <td className='px-5 py-5 text-sm text-gray-700'>{owner.email || '-'}</td>

                      <td className='px-5 py-5'>
                        {owner.ownerFrozen ? (
                          <span className='inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border bg-red-100 text-red-700 border-red-200'>
                            Frozen
                          </span>
                        ) : (
                          <span className='inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border bg-green-100 text-green-700 border-green-200'>
                            Active
                          </span>
                        )}
                      </td>

                      <td className='px-5 py-5 text-sm text-gray-700 max-w-[260px]'>
                        {owner.freezeReason || '-'}
                      </td>

                      <td className='px-5 py-5'>
                        <div className='flex flex-wrap gap-2'>
                          {!owner.ownerFrozen ? (
                            <button
                              onClick={() => openModal(owner, 'freeze')}
                              className='h-10 px-4 rounded-2xl bg-yellow-500 text-white hover:bg-yellow-600 font-medium transition flex items-center gap-2'
                            >
                              <FiLock size={15} />
                              Freeze
                            </button>
                          ) : (
                            <button
                              onClick={() => openModal(owner, 'unfreeze')}
                              className='h-10 px-4 rounded-2xl bg-green-600 text-white hover:bg-green-700 font-medium transition flex items-center gap-2'
                            >
                              <FiUnlock size={15} />
                              Unfreeze
                            </button>
                          )}

                          <button
                            onClick={() => openModal(owner, 'message')}
                            className='h-10 px-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-medium transition flex items-center gap-2'
                          >
                            <FiMessageSquare size={15} />
                            Notify
                          </button>

                          <button
                            onClick={() => openModal(owner, 'remove')}
                            className='h-10 px-4 rounded-2xl bg-red-600 text-white hover:bg-red-700 font-medium transition flex items-center gap-2'
                          >
                            <FiTrash2 size={15} />
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className='lg:hidden p-4 space-y-3'>
            {filteredOwners.map((owner) => (
              <div key={owner.userId} className='border border-gray-200 rounded-2xl p-4 bg-gray-50'>
                <p className='font-semibold text-gray-950'>{owner.name}</p>
                <p className='text-sm text-gray-500 mt-1 break-all'>{owner.email}</p>
                <p className='text-sm text-gray-500 mt-1 break-all'>User ID: {owner.userId}</p>
                <p className='text-sm mt-2'>
                  Status: {owner.ownerFrozen ? 'Frozen' : 'Active'}
                </p>
                <p className='text-sm text-gray-500 mt-1'>
                  Reason: {owner.freezeReason || '-'}
                </p>

                <div className='mt-4 flex flex-col gap-2'>
                  {!owner.ownerFrozen ? (
                    <button
                      onClick={() => openModal(owner, 'freeze')}
                      className='h-11 rounded-2xl bg-yellow-500 text-white font-medium'
                    >
                      Freeze
                    </button>
                  ) : (
                    <button
                      onClick={() => openModal(owner, 'unfreeze')}
                      className='h-11 rounded-2xl bg-green-600 text-white font-medium'
                    >
                      Unfreeze
                    </button>
                  )}

                  <button
                    onClick={() => openModal(owner, 'message')}
                    className='h-11 rounded-2xl bg-blue-600 text-white font-medium'
                  >
                    Notify
                  </button>

                  <button
                    onClick={() => openModal(owner, 'remove')}
                    className='h-11 rounded-2xl bg-red-600 text-white font-medium'
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {modalOpen && (
          <ModalPortal>
            <div className='fixed inset-0 z-[9999] flex items-center justify-center px-4 py-8'>
              <div className='absolute inset-0 bg-black/55 backdrop-blur-[2px]' onClick={closeModal}></div>

              <div className='relative w-full max-w-lg bg-white rounded-[28px] shadow-2xl flex flex-col'>
                <div className='flex justify-between items-center px-6 py-4 border-b border-gray-100'>
                  <h2 className='text-xl font-semibold text-gray-950'>
                    {modalType === 'freeze' && 'Freeze Owner'}
                    {modalType === 'unfreeze' && 'Unfreeze Owner'}
                    {modalType === 'remove' && 'Remove Owner'}
                    {modalType === 'message' && 'Send Message to Owner'}
                  </h2>

                  <button
                    onClick={closeModal}
                    disabled={!!actionLoadingId}
                    className='w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition'
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className='px-6 py-5 space-y-4'>
                  <div className='rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-2'>
                    <p className='text-sm text-gray-700'><span className='font-medium text-gray-900'>Name:</span> {selectedOwner?.name || '-'}</p>
                    <p className='text-sm text-gray-700 break-all'><span className='font-medium text-gray-900'>Email:</span> {selectedOwner?.email || '-'}</p>
                    <p className='text-sm text-gray-700 break-all'><span className='font-medium text-gray-900'>User ID:</span> {selectedOwner?.userId || '-'}</p>
                  </div>

                  {modalType === 'message' ? (
                    <>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Title</label>
                        <input
                          type='text'
                          value={messageTitle}
                          onChange={(e) => setMessageTitle(e.target.value)}
                          className='w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition'
                          placeholder='Enter notification title'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Message</label>
                        <textarea
                          rows='5'
                          value={messageBody}
                          onChange={(e) => setMessageBody(e.target.value)}
                          className='w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none resize-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition'
                          placeholder='Write your message'
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>Admin Note / Reason</label>
                      <textarea
                        rows='4'
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className='w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none resize-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition'
                        placeholder='Write reason here...'
                      />
                    </div>
                  )}
                </div>

                <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 px-6 py-4 border-t border-gray-100'>
                  <button
                    onClick={closeModal}
                    disabled={!!actionLoadingId}
                    className='px-5 py-3 border border-gray-200 rounded-2xl w-full sm:w-auto hover:bg-gray-50 transition disabled:opacity-60'
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleAction}
                    disabled={!!actionLoadingId}
                    className='px-5 py-3 rounded-2xl text-white w-full sm:w-auto transition bg-slate-900 hover:bg-black disabled:opacity-60'
                  >
                    {actionLoadingId ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          </ModalPortal>
        )}
      </div>
    </AdminLayout>
  )
}

function ModalPortal({ children }) {
  if (typeof document === 'undefined') return null
  return createPortal(children, document.body)
}