import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import {
  FiCheck,
  FiClock,
  FiMail,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiX,
} from 'react-icons/fi'
import AdminLayout from '../componenets/AdminLayout'

const BASE_URL = 'https://render-qs89.onrender.com'

export default function AdminApproveOwnerPage() {
  const admin = useMemo(() => {
    try {
      const raw = localStorage.getItem('admin')
      if (!raw) return {}
      return JSON.parse(raw)
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

  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [decisionModalOpen, setDecisionModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [decisionType, setDecisionType] = useState('')
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    if (decisionModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [decisionModalOpen])

  const fetchApplications = async () => {
    try {
      setLoading(true)

      const res = await fetch(
        `${BASE_URL}/api/admin/owner/applications?status=PENDING`
      )
      if (!res.ok) throw new Error('Failed to load owner applications')

      const data = await res.json()
      const normalized = Array.isArray(data) ? data : []
      setApplications(
        normalized.filter(
          (item) => String(item?.status || '').toUpperCase() === 'PENDING'
        )
      )
    } catch (err) {
      console.error(err)
      toast.error('Failed to load owner applications')
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  const openDecisionModal = (application, type) => {
    setSelectedApplication(application)
    setDecisionType(type)
    setAdminNote('')
    setDecisionModalOpen(true)
  }

  const closeDecisionModal = () => {
    if (actionLoadingId) return
    setDecisionModalOpen(false)
    setSelectedApplication(null)
    setDecisionType('')
    setAdminNote('')
  }

  const handleDecision = async () => {
    if (!selectedApplication?.id || !decisionType) return

    if (!adminId) {
      toast.error('Admin not found, please login again')
      return
    }

    try {
      setActionLoadingId(selectedApplication.id)

      const endpoint =
        decisionType === 'approve'
          ? `${BASE_URL}/api/admin/owner/applications/${selectedApplication.id}/approve`
          : `${BASE_URL}/api/admin/owner/applications/${selectedApplication.id}/reject`

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId,
          note: adminNote.trim(),
        }),
      })

      const contentType = res.headers.get('content-type') || ''
      const data = contentType.includes('application/json')
        ? await res.json()
        : await res.text()

      if (!res.ok) {
        throw new Error(
          typeof data === 'string'
            ? data
            : `Failed to ${decisionType} application`
        )
      }

      toast.success(
        decisionType === 'approve'
          ? 'Owner application approved'
          : 'Owner application rejected'
      )

      setDecisionModalOpen(false)
      setSelectedApplication(null)
      setDecisionType('')
      setAdminNote('')
      fetchApplications()
    } catch (err) {
      console.error(err)
      const msg = err.message || ''

      if (msg.toLowerCase().includes('not pending')) {
        toast.error('This application is already processed')
      } else if (msg.toLowerCase().includes('user not found')) {
        toast.error('Linked user record was not found')
      } else if (msg.toLowerCase().includes('admin not found')) {
        toast.error('Admin session invalid, please login again')
      } else {
        toast.error(
          msg ||
          (decisionType === 'approve'
            ? 'Failed to approve application'
            : 'Failed to reject application')
        )
      }
    } finally {
      setActionLoadingId('')
    }
  }

  const filteredApplications = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return applications

    return applications.filter((item) => {
      const userId = String(item?.userId || '').toLowerCase()
      const email = String(item?.email || '').toLowerCase()
      const phone = String(item?.phone || '').toLowerCase()
      const status = String(item?.status || '').toLowerCase()

      return (
        userId.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        status.includes(term)
      )
    })
  }, [applications, searchTerm])

  const totalApplications = applications.length

  return (
    <AdminLayout>
      <div className='max-w-7xl mx-auto py-2 animate-fadeIn'>
        <div className='mb-6'>
          <h1 className='text-2xl sm:text-[30px] font-bold text-gray-950 tracking-tight'>
            Approve Owners
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Review pending owner applications and approve or reject them.
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-5'>
          <StatsCard title='Pending Applications' value={totalApplications} />
          <StatsCard
            title='With Aadhaar'
            value={
              applications.filter((item) => String(item?.aadhaarUrl || '').trim())
                .length
            }
          />
          <StatsCard
            title='Terms Accepted'
            value={applications.filter((item) => item?.termsAccepted).length}
          />
        </div>

        <div className='bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden animate-slideUp'>
          <div className='p-5 border-b border-gray-100'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3'>
              <div>
                <h2 className='text-lg font-semibold text-gray-950'>
                  Pending Owner Requests
                </h2>
                <p className='text-sm text-gray-500 mt-1'>
                  Search and process owner approval requests.
                </p>
              </div>

              <div className='flex flex-col sm:flex-row gap-3'>
                <div className='relative min-w-0 sm:min-w-[260px]'>
                  <input
                    type='text'
                    placeholder='Search by email, phone or user id...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full h-[46px] rounded-2xl border border-gray-200 bg-white px-4 pr-11 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition'
                  />
                  <div className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400'>
                    <FiSearch size={16} />
                  </div>
                </div>

                <button
                  onClick={fetchApplications}
                  disabled={loading}
                  className='h-[46px] px-4 rounded-2xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-60 flex items-center justify-center gap-2'
                >
                  <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className='lg:hidden p-4 space-y-3'>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className='border border-gray-200 rounded-2xl p-4 animate-pulse'
                >
                  <div className='h-28 rounded-2xl bg-gray-100' />
                </div>
              ))
            ) : filteredApplications.length === 0 ? (
              <EmptyState />
            ) : (
              filteredApplications.map((item, index) => (
                <div
                  key={item.id}
                  className='border border-gray-200 rounded-2xl p-4 bg-gray-50 animate-fadeIn'
                  style={{ animationDelay: `${index * 35}ms` }}
                >
                  <div className='flex items-start gap-3'>
                    <div className='w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 shrink-0'>
                      <FiUser />
                    </div>

                    <div className='min-w-0 flex-1'>
                      <p className='text-base font-semibold text-gray-950 break-all'>
                        {item.email || 'No email'}
                      </p>
                      <p className='text-sm text-gray-500 mt-1 break-all'>
                        User ID: {item.userId || '-'}
                      </p>
                    </div>
                  </div>

                  <div className='mt-4 grid grid-cols-1 gap-3 text-sm'>
                    <InfoBox
                      label='Phone'
                      value={item.phone || '-'}
                      icon={<FiPhone size={14} />}
                    />
                    <InfoBox
                      label='Status'
                      value={item.status || '-'}
                      icon={<FiClock size={14} />}
                    />
                    <InfoBox
                      label='Aadhaar'
                      value={item.aadhaarUrl ? 'Uploaded' : 'Not uploaded'}
                      icon={<FiMail size={14} />}
                    />
                  </div>

                  <div className='mt-4 flex flex-col gap-2'>
                    <button
                      onClick={() => openDecisionModal(item, 'approve')}
                      disabled={actionLoadingId === item.id}
                      className='h-11 rounded-2xl bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-2'
                    >
                      <FiCheck size={16} />
                      Approve
                    </button>

                    <button
                      onClick={() => openDecisionModal(item, 'reject')}
                      disabled={actionLoadingId === item.id}
                      className='h-11 rounded-2xl bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2'
                    >
                      <FiX size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className='hidden lg:block overflow-x-auto'>
            <table className='w-full min-w-[980px]'>
              <thead>
                <tr className='bg-white border-b border-gray-100'>
                  <th className='text-left px-5 py-4 text-sm font-semibold text-gray-600'>
                    Applicant
                  </th>
                  <th className='text-left px-5 py-4 text-sm font-semibold text-gray-600'>
                    Contact
                  </th>
                  <th className='text-left px-5 py-4 text-sm font-semibold text-gray-600'>
                    Status
                  </th>
                  <th className='text-left px-5 py-4 text-sm font-semibold text-gray-600'>
                    Aadhaar
                  </th>
                  <th className='text-left px-5 py-4 text-sm font-semibold text-gray-600'>
                    Terms
                  </th>
                  <th className='text-left px-5 py-4 text-sm font-semibold text-gray-600'>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className='border-b border-gray-100'>
                      <td className='px-5 py-5'>
                        <div className='h-12 rounded-xl bg-gray-100 animate-pulse' />
                      </td>
                      <td className='px-5 py-5'>
                        <div className='h-12 rounded-xl bg-gray-100 animate-pulse' />
                      </td>
                      <td className='px-5 py-5'>
                        <div className='h-10 rounded-xl bg-gray-100 animate-pulse' />
                      </td>
                      <td className='px-5 py-5'>
                        <div className='h-10 rounded-xl bg-gray-100 animate-pulse' />
                      </td>
                      <td className='px-5 py-5'>
                        <div className='h-10 rounded-xl bg-gray-100 animate-pulse' />
                      </td>
                      <td className='px-5 py-5'>
                        <div className='h-10 rounded-xl bg-gray-100 animate-pulse' />
                      </td>
                    </tr>
                  ))
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan='6' className='px-5 py-16'>
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((item, index) => (
                    <tr
                      key={item.id}
                      className='border-b border-gray-100 hover:bg-gray-50/70 transition animate-fadeIn'
                      style={{ animationDelay: `${index * 35}ms` }}
                    >
                      <td className='px-5 py-5 align-top'>
                        <div className='flex items-start gap-3'>
                          <div className='w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 shrink-0'>
                            <FiUser />
                          </div>

                          <div className='min-w-0'>
                            <p className='text-[15px] font-semibold text-gray-950 break-all'>
                              {item.email || 'No email'}
                            </p>
                            <p className='text-sm text-gray-500 mt-1 break-all'>
                              User ID: {item.userId || '-'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className='px-5 py-5 align-top'>
                        <p className='text-sm text-gray-700 break-all'>
                          {item.phone || '-'}
                        </p>
                      </td>

                      <td className='px-5 py-5 align-top'>
                        <StatusBadge status={item.status} />
                      </td>

                      <td className='px-5 py-5 align-top'>
                        {item.aadhaarUrl ? (
                          <a
                            href={item.aadhaarUrl}
                            target='_blank'
                            rel='noreferrer'
                            className='inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 transition'
                          >
                            View Document
                          </a>
                        ) : (
                          <span className='text-sm text-gray-400'>Not uploaded</span>
                        )}
                      </td>

                      <td className='px-5 py-5 align-top'>
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border ${item?.termsAccepted
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-red-100 text-red-700 border-red-200'
                            }`}
                        >
                          {item?.termsAccepted ? 'Accepted' : 'Not accepted'}
                        </span>
                      </td>

                      <td className='px-5 py-5 align-top'>
                        <div className='flex items-center gap-3'>
                          <button
                            onClick={() => openDecisionModal(item, 'approve')}
                            disabled={actionLoadingId === item.id}
                            className='h-11 px-4 rounded-2xl bg-green-600 text-white hover:bg-green-700 font-medium transition disabled:opacity-60 flex items-center gap-2'
                          >
                            <FiCheck size={16} />
                            Approve
                          </button>

                          <button
                            onClick={() => openDecisionModal(item, 'reject')}
                            disabled={actionLoadingId === item.id}
                            className='h-11 px-4 rounded-2xl bg-red-600 text-white hover:bg-red-700 font-medium transition disabled:opacity-60 flex items-center gap-2'
                          >
                            <FiX size={16} />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {decisionModalOpen && (
          <ModalPortal>
            <div className='fixed inset-0 z-[9999] flex items-center justify-center px-3 py-6 sm:px-4 sm:py-8 animate-fadeIn'>
              <div
                className='absolute inset-0 bg-black/55 backdrop-blur-[2px]'
                onClick={closeDecisionModal}
              ></div>

              <div className='relative w-full max-w-lg bg-white rounded-[28px] shadow-2xl animate-scaleIn flex flex-col'>
                <div className='flex justify-between items-center px-5 sm:px-6 py-4 border-b border-gray-100'>
                  <h2 className='text-xl font-semibold text-gray-950'>
                    {decisionType === 'approve'
                      ? 'Approve Owner Application'
                      : 'Reject Owner Application'}
                  </h2>

                  <button
                    onClick={closeDecisionModal}
                    disabled={!!actionLoadingId}
                    className='w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition'
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className='px-5 sm:px-6 py-5 space-y-4'>
                  <div className='rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-2'>
                    <p className='text-sm text-gray-700 break-all'>
                      <span className='font-medium text-gray-900'>User ID:</span>{' '}
                      {selectedApplication?.userId || '-'}
                    </p>
                    <p className='text-sm text-gray-700 break-all'>
                      <span className='font-medium text-gray-900'>Email:</span>{' '}
                      {selectedApplication?.email || '-'}
                    </p>
                    <p className='text-sm text-gray-700 break-all'>
                      <span className='font-medium text-gray-900'>Phone:</span>{' '}
                      {selectedApplication?.phone || '-'}
                    </p>
                  </div>

                  <p className='text-sm sm:text-base text-gray-600 leading-7'>
                    Are you sure you want to{' '}
                    <span className='font-semibold text-gray-900'>
                      {decisionType === 'approve' ? 'approve' : 'reject'}
                    </span>{' '}
                    this owner application?
                  </p>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Admin Note
                    </label>
                    <textarea
                      rows='4'
                      placeholder='Write note here...'
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      className='w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none resize-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition'
                    />
                  </div>
                </div>

                <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 px-5 sm:px-6 py-4 border-t border-gray-100'>
                  <button
                    onClick={closeDecisionModal}
                    disabled={!!actionLoadingId}
                    className='px-5 py-3 border border-gray-200 rounded-2xl w-full sm:w-auto hover:bg-gray-50 transition disabled:opacity-60'
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleDecision}
                    disabled={!!actionLoadingId}
                    className={`px-5 py-3 rounded-2xl text-white w-full sm:w-auto transition ${actionLoadingId
                        ? decisionType === 'approve'
                          ? 'bg-green-300 cursor-not-allowed'
                          : 'bg-red-300 cursor-not-allowed'
                        : decisionType === 'approve'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                  >
                    {actionLoadingId
                      ? decisionType === 'approve'
                        ? 'Approving...'
                        : 'Rejecting...'
                      : decisionType === 'approve'
                        ? 'Approve'
                        : 'Reject'}
                  </button>
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

          .animate-scaleIn {
            animation: scaleIn 0.25s ease both;
          }
        `}</style>
      </div>
    </AdminLayout>
  )
}

function StatsCard({ title, value }) {
  return (
    <div className='bg-white border border-gray-200 rounded-3xl shadow-sm p-5 animate-fadeIn'>
      <p className='text-sm text-gray-500'>{title}</p>
      <h3 className='text-3xl font-bold text-gray-950 mt-2'>{value}</h3>
    </div>
  )
}

function StatusBadge({ status }) {
  const normalized = String(status || '').toUpperCase()

  const classes =
    normalized === 'PENDING'
      ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
      : normalized === 'APPROVED'
        ? 'bg-green-100 text-green-700 border-green-200'
        : normalized === 'REJECTED'
          ? 'bg-red-100 text-red-700 border-red-200'
          : 'bg-gray-100 text-gray-700 border-gray-200'

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border ${classes}`}
    >
      {normalized || '-'}
    </span>
  )
}

function InfoBox({ label, value, icon }) {
  return (
    <div className='rounded-2xl border border-gray-200 bg-white px-3 py-2 min-w-0'>
      <p className='text-[11px] uppercase tracking-wide text-gray-400 flex items-center gap-1'>
        {icon}
        {label}
      </p>
      <p className='text-sm font-medium text-gray-800 mt-1 break-words'>{value}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className='text-center py-8'>
      <div className='w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mb-4'>
        👤
      </div>
      <h3 className='text-lg font-semibold text-gray-900'>
        No pending applications
      </h3>
      <p className='text-sm text-gray-500 mt-2'>
        All owner requests have been processed.
      </p>
    </div>
  )
}

function ModalPortal({ children }) {
  if (typeof document === 'undefined') return null
  return createPortal(children, document.body)
}