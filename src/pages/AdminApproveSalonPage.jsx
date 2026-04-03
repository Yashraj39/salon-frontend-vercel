import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import {
  FiCheck,
  FiExternalLink,
  FiFileText,
  FiImage,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiX,
} from 'react-icons/fi'
import AdminLayout from '../componenets/AdminLayout'

const BASE_URL = 'http://localhost:8080' // Change this to your actual backend URL

export default function AdminApproveSalonPage() {
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

  const [salons, setSalons] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [selectedSalon, setSelectedSalon] = useState(null)
  const [adminNote, setAdminNote] = useState('')
  const [previewImage, setPreviewImage] = useState(null)
  const [actionType, setActionType] = useState('verify')

  useEffect(() => {
    fetchUnverifiedSalons()
  }, [])

  useEffect(() => {
    const shouldLock = verifyModalOpen || !!previewImage
    document.body.style.overflow = shouldLock ? 'hidden' : 'auto'

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [verifyModalOpen, previewImage])

  const fetchUnverifiedSalons = async () => {
    try {
      setLoading(true)

      const res = await fetch(`${BASE_URL}/api/admin/owner/unverified-salons`)
      if (!res.ok) throw new Error('Failed to load salons')

      const data = await res.json()
      setSalons(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load salons')
      setSalons([])
    } finally {
      setLoading(false)
    }
  }

  const getSalonId = (salon) => salon?.id || salon?._id || ''

  const getAssetItems = (salon) => [
    {
      key: 'cover',
      label: 'Cover Image',
      url: salon?.imageUrl || '',
      type: 'image',
    },
    {
      key: 'interior',
      label: 'Interior Image',
      url: salon?.interiorImageUrl || '',
      type: 'image',
    },
    {
      key: 'exterior',
      label: 'Exterior Image',
      url: salon?.exteriorImageUrl || '',
      type: 'image',
    },
    {
      key: 'owner',
      label: 'Owner Photo',
      url: salon?.ownerPhotoUrl || '',
      type: 'image',
    },
    {
      key: 'document',
      label: salon?.documentType ? `${formatDocumentType(salon.documentType)}` : 'Submitted Document',
      url: salon?.documentUrl || '',
      type: 'document',
    },
  ].filter((item) => String(item.url || '').trim())

  const openVerifyModal = (salon, type = 'verify') => {
    setSelectedSalon(salon)
    setAdminNote('')
    setActionType(type)
    setVerifyModalOpen(true)
  }

  const closeVerifyModal = () => {
    if (actionLoadingId) return
    setVerifyModalOpen(false)
    setSelectedSalon(null)
    setAdminNote('')
    setActionType('verify')
  }

  const openPreviewImage = (title, url) => {
    setPreviewImage({ title, url })
  }

  const closePreviewImage = () => {
    setPreviewImage(null)
  }

  const handleSalonAction = async () => {
    const salonId = getSalonId(selectedSalon)
    if (!salonId) return

    if (!adminId) {
      toast.error('Admin not found, please login again')
      return
    }

    if (actionType === 'reject' && !adminNote.trim()) {
      toast.error('Disapprove reason is required')
      return
    }

    try {
      setActionLoadingId(salonId)

      let url = ''

      if (actionType === 'verify') {
        const query = new URLSearchParams({ adminId })

        if (adminNote.trim()) {
          query.append('note', adminNote.trim())
        }

        url = `${BASE_URL}/api/admin/owner/verify-salon/${salonId}?${query.toString()}`
      } else {
        const query = new URLSearchParams({
          adminId,
          reason: adminNote.trim(),
        })

        url = `${BASE_URL}/api/admin/owner/reject-salon/${salonId}?${query.toString()}`
      }

      const res = await fetch(url, {
        method: 'PATCH',
      })

      const contentType = res.headers.get('content-type') || ''
      const data = contentType.includes('application/json')
        ? await res.json()
        : await res.text()

      if (!res.ok) {
        throw new Error(typeof data === 'string' ? data : 'Failed to process salon')
      }

      toast.success(
        actionType === 'verify'
          ? 'Salon verified successfully'
          : 'Salon disapproved successfully'
      )

      setVerifyModalOpen(false)
      setSelectedSalon(null)
      setAdminNote('')
      setActionType('verify')
      fetchUnverifiedSalons()
    } catch (err) {
      console.error(err)
      const msg = err.message || ''

      if (msg.toLowerCase().includes('admin not found')) {
        toast.error('Admin session invalid, please login again')
      } else if (msg.toLowerCase().includes('user is not admin')) {
        toast.error('Only admin can perform this action')
      } else if (msg.toLowerCase().includes('salon not found')) {
        toast.error('Salon not found')
      } else if (msg.toLowerCase().includes('reason')) {
        toast.error(msg || 'Disapprove reason is required')
      } else {
        toast.error(msg || 'Failed to process salon')
      }
    } finally {
      setActionLoadingId('')
    }
  }

  const filteredSalons = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return salons

    return salons.filter((salon) => {
      const name = String(salon?.name || '').toLowerCase()
      const city = String(salon?.city || '').toLowerCase()
      const address = String(salon?.address || '').toLowerCase()
      const ownerId = String(salon?.salonOwnerId || '').toLowerCase()
      const contact = String(salon?.contact || '').toLowerCase()
      const documentType = String(salon?.documentType || '').toLowerCase()

      return (
        name.includes(term) ||
        city.includes(term) ||
        address.includes(term) ||
        ownerId.includes(term) ||
        contact.includes(term) ||
        documentType.includes(term)
      )
    })
  }, [salons, searchTerm])

  const totalSalons = salons.length
  const withMapLink = salons.filter((item) => String(item?.mapLink || '').trim()).length
  const withContact = salons.filter((item) => String(item?.contact || '').trim()).length
  const withAssets = salons.filter((item) => getAssetItems(item).length > 0).length

  return (
    <AdminLayout>
      <div className='max-w-7xl mx-auto py-2 animate-fadeIn'>
        <div className='mb-6'>
          <h1 className='text-2xl sm:text-[30px] font-bold text-gray-950 tracking-tight'>
            Approve Salons
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Review salon details, uploaded images and owner documents before approving.
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5'>
          <StatsCard title='Pending Salons' value={totalSalons} />
          <StatsCard title='With Contact' value={withContact} />
          <StatsCard title='With Map Link' value={withMapLink} />
          <StatsCard title='With Uploaded Files' value={withAssets} />
        </div>

        <div className='bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden animate-slideUp'>
          <div className='p-5 border-b border-gray-100'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3'>
              <div>
                <h2 className='text-lg font-semibold text-gray-950'>
                  Unverified Salons
                </h2>
                <p className='text-sm text-gray-500 mt-1'>
                  Open any salon to inspect photos, map link and verification document.
                </p>
              </div>

              <div className='flex flex-col sm:flex-row gap-3'>
                <div className='relative min-w-0 sm:min-w-[300px]'>
                  <input
                    type='text'
                    placeholder='Search by salon, city, owner, contact or document...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full h-[46px] rounded-2xl border border-gray-200 bg-white px-4 pr-11 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition'
                  />
                  <div className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400'>
                    <FiSearch size={16} />
                  </div>
                </div>

                <button
                  onClick={fetchUnverifiedSalons}
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
                  <div className='h-32 rounded-2xl bg-gray-100' />
                </div>
              ))
            ) : filteredSalons.length === 0 ? (
              <EmptyState />
            ) : (
              filteredSalons.map((salon, index) => {
                const salonId = getSalonId(salon)
                const assets = getAssetItems(salon)

                return (
                  <div
                    key={salonId}
                    className='border border-gray-200 rounded-2xl p-4 bg-gray-50 animate-fadeIn'
                    style={{ animationDelay: `${index * 35}ms` }}
                  >
                    <div className='flex items-start gap-3'>
                      <div className='w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 shrink-0'>
                        <FiMapPin />
                      </div>

                      <div className='min-w-0 flex-1'>
                        <p className='text-base font-semibold text-gray-950 break-words'>
                          {salon.name || '-'}
                        </p>
                        <p className='text-sm text-gray-500 mt-1 break-words'>
                          {salon.city || '-'}
                        </p>
                      </div>
                    </div>

                    <div className='mt-4 grid grid-cols-1 gap-3 text-sm'>
                      <InfoBox label='Owner ID' value={salon.salonOwnerId || '-'} icon={<FiUser size={14} />} />
                      <InfoBox label='Contact' value={salon.contact || '-'} icon={<FiPhone size={14} />} />
                      <InfoBox label='Address' value={salon.address || '-'} icon={<FiMapPin size={14} />} />
                      <InfoBox
                        label='Document Type'
                        value={formatDocumentType(salon.documentType) || '-'}
                        icon={<FiFileText size={14} />}
                      />
                    </div>

                    {assets.length > 0 && (
                      <div className='mt-4'>
                        <div className='flex items-center gap-2 mb-3'>
                          <div className='w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700'>
                            <FiImage size={16} />
                          </div>
                          <p className='text-sm font-semibold text-gray-900'>
                            Uploaded Files
                          </p>
                        </div>

                        <div className='grid grid-cols-2 gap-3'>
                          {assets.map((item) => (
                            <AssetThumbCard
                              key={item.key}
                              item={item}
                              onPreview={openPreviewImage}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className='mt-4 flex flex-col gap-2'>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                        <button
                          onClick={() => openVerifyModal(salon, 'verify')}
                          disabled={actionLoadingId === salonId}
                          className='h-11 rounded-2xl bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-2'
                        >
                          <FiCheck size={16} />
                          Verify
                        </button>

                        <button
                          onClick={() => openVerifyModal(salon, 'reject')}
                          disabled={actionLoadingId === salonId}
                          className='h-11 rounded-2xl bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2'
                        >
                          <FiX size={16} />
                          Disapprove
                        </button>
                      </div>

                      {salon.mapLink && (
                        <a
                          href={salon.mapLink}
                          target='_blank'
                          rel='noreferrer'
                          className='h-11 rounded-2xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2'
                        >
                          <FiMapPin size={16} />
                          View Location
                        </a>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className='hidden lg:block overflow-x-auto'>
            <table className='w-full min-w-[980px]'>
              <thead>
                <tr className='bg-white border-b border-gray-100'>
                  <th className='text-left px-5 py-4 text-sm font-semibold text-gray-600'>
                    Salon
                  </th>
                  <th className='text-left px-5 py-4 text-sm font-semibold text-gray-600'>
                    City
                  </th>
                  <th className='text-left px-5 py-4 text-sm font-semibold text-gray-600'>
                    Contact
                  </th>
                  <th className='text-left px-5 py-4 text-sm font-semibold text-gray-600'>
                    Owner
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
                      <td className='px-5 py-5'><div className='h-12 rounded-xl bg-gray-100 animate-pulse' /></td>
                      <td className='px-5 py-5'><div className='h-12 rounded-xl bg-gray-100 animate-pulse' /></td>
                      <td className='px-5 py-5'><div className='h-12 rounded-xl bg-gray-100 animate-pulse' /></td>
                      <td className='px-5 py-5'><div className='h-12 rounded-xl bg-gray-100 animate-pulse' /></td>
                      <td className='px-5 py-5'><div className='h-12 rounded-xl bg-gray-100 animate-pulse' /></td>
                      <td className='px-5 py-5'><div className='h-20 rounded-xl bg-gray-100 animate-pulse' /></td>
                      <td className='px-5 py-5'><div className='h-10 rounded-xl bg-gray-100 animate-pulse' /></td>
                    </tr>
                  ))
                ) : filteredSalons.length === 0 ? (
                  <tr>
                    <td colSpan='7' className='px-5 py-16'>
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  filteredSalons.map((salon, index) => {
                    const salonId = getSalonId(salon)
                    const assets = getAssetItems(salon)

                    return (
                      <tr
                        key={salonId}
                        className='border-b border-gray-100 hover:bg-gray-50/70 transition animate-fadeIn'
                        style={{ animationDelay: `${index * 35}ms` }}
                      >
                        <td className='px-5 py-5 align-top'>
                          <div className='flex items-start gap-3'>
                            <div className='w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 shrink-0'>
                              <FiMapPin />
                            </div>

                            <div className='min-w-0'>
                              <p className='text-[15px] font-semibold text-gray-950 break-words'>
                                {salon.name || '-'}
                              </p>
                              <p className='text-sm text-gray-500 mt-1 break-words'>
                                {salon.salonEmail || '-'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className='px-5 py-5 align-top'>
                          <p className='text-sm text-gray-700 break-words'>
                            {salon.city || '-'}
                          </p>
                        </td>

                        <td className='px-5 py-5 align-top'>
                          <p className='text-sm text-gray-700 break-words'>
                            {salon.contact || '-'}
                          </p>
                        </td>

                        <td className='px-5 py-5 align-top'>
                          <p className='text-sm text-gray-700 break-all'>
                            {salon.salonOwnerId || '-'}
                          </p>
                        </td>

                        <td className='px-5 py-5 align-top'>
                          <div className='flex items-center gap-3'>
                            <button
                              onClick={() => openVerifyModal(salon, 'verify')}
                              disabled={actionLoadingId === salonId}
                              className='h-11 px-4 rounded-2xl bg-green-600 text-white hover:bg-green-700 font-medium transition disabled:opacity-60 flex items-center gap-2'
                            >
                              <FiCheck size={16} />
                              Verify
                            </button>

                            <button
                              onClick={() => openVerifyModal(salon, 'reject')}
                              disabled={actionLoadingId === salonId}
                              className='h-11 px-4 rounded-2xl bg-red-600 text-white hover:bg-red-700 font-medium transition disabled:opacity-60 flex items-center gap-2'
                            >
                              <FiX size={16} />
                              Disapprove
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {verifyModalOpen && selectedSalon && (
          <ModalPortal>
            <div className='fixed inset-0 z-[9999] flex items-center justify-center px-3 py-6 sm:px-4 sm:py-8 animate-fadeIn'>
              <div
                className='absolute inset-0 bg-black/55 backdrop-blur-[2px]'
                onClick={closeVerifyModal}
              ></div>

              <div className='relative w-full max-w-6xl bg-white rounded-[28px] shadow-2xl animate-scaleIn flex flex-col max-h-[92vh] overflow-hidden'>
                <div className='flex justify-between items-center px-5 sm:px-6 py-4 border-b border-gray-100'>
                  <div>
                    <h2 className='text-xl font-semibold text-gray-950'>
                      {actionType === 'verify' ? 'Verify Salon' : 'Disapprove Salon'}
                    </h2>
                    <p className='text-sm text-gray-500 mt-1'>
                      {actionType === 'verify'
                        ? 'Check all uploaded files and verify the salon if everything looks correct.'
                        : 'Check all uploaded files and provide the reason for disapproving this salon.'}
                    </p>
                  </div>

                  <button
                    onClick={closeVerifyModal}
                    disabled={!!actionLoadingId}
                    className='w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition'
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className='px-5 sm:px-6 py-5 overflow-y-auto'>
                  <div className='grid grid-cols-1 xl:grid-cols-[360px,1fr] gap-6'>
                    <div className='space-y-4'>
                      <div className='rounded-3xl border border-gray-200 bg-gray-50 p-5'>
                        <h3 className='text-base font-semibold text-gray-950 mb-4'>
                          Salon Details
                        </h3>

                        <div className='space-y-3'>
                          <DetailRow label='Salon Name' value={selectedSalon?.name || '-'} />
                          <DetailRow label='City' value={selectedSalon?.city || '-'} />
                          <DetailRow label='Owner ID' value={selectedSalon?.salonOwnerId || '-'} breakAll />
                          <DetailRow label='Contact' value={selectedSalon?.contact || '-'} />
                          <DetailRow label='Email' value={selectedSalon?.salonEmail || '-'} />
                          <DetailRow label='Address' value={selectedSalon?.address || '-'} />
                          <DetailRow
                            label='Document Type'
                            value={formatDocumentType(selectedSalon?.documentType) || '-'}
                          />
                        </div>

                        {selectedSalon?.mapLink && (
                          <a
                            href={selectedSalon.mapLink}
                            target='_blank'
                            rel='noreferrer'
                            className='mt-4 inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition'
                          >
                            <FiMapPin size={16} />
                            Open Map Location
                          </a>
                        )}
                      </div>

                      <div className='rounded-3xl border border-gray-200 bg-white p-5'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          {actionType === 'verify' ? 'Admin Note' : 'Reason for Disapproval'}
                        </label>
                        <textarea
                          rows='6'
                          placeholder={
                            actionType === 'verify'
                              ? 'Write note here...'
                              : 'Write reason for disapproval...'
                          }
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          className='w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none resize-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition'
                        />
                        <p className='text-xs text-gray-400 mt-2'>
                          {actionType === 'verify'
                            ? 'Example: All documents checked and salon verified.'
                            : 'Example: GST certificate image is unclear or salon details do not match submitted documents.'}
                        </p>
                      </div>
                    </div>

                    <div className='space-y-4'>
                      <div className='flex items-center justify-between gap-3'>
                        <div>
                          <h3 className='text-base font-semibold text-gray-950'>
                            Uploaded Files
                          </h3>
                          <p className='text-sm text-gray-500 mt-1'>
                            Click any card to open full image or document.
                          </p>
                        </div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                        {getAssetItems(selectedSalon).length > 0 ? (
                          getAssetItems(selectedSalon).map((item) => (
                            <LargeAssetCard
                              key={item.key}
                              item={item}
                              onPreview={openPreviewImage}
                            />
                          ))
                        ) : (
                          <div className='md:col-span-2 xl:col-span-3 rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center'>
                            <div className='w-14 h-14 mx-auto rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 mb-4'>
                              <FiFileText size={22} />
                            </div>
                            <h3 className='text-lg font-semibold text-gray-900'>
                              No uploaded files found
                            </h3>
                            <p className='text-sm text-gray-500 mt-2'>
                              This salon has no verification images or documents yet.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 px-5 sm:px-6 py-4 border-t border-gray-100'>
                  <button
                    onClick={closeVerifyModal}
                    disabled={!!actionLoadingId}
                    className='px-5 py-3 border border-gray-200 rounded-2xl w-full sm:w-auto hover:bg-gray-50 transition disabled:opacity-60'
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSalonAction}
                    disabled={!!actionLoadingId}
                    className={`px-5 py-3 rounded-2xl text-white w-full sm:w-auto transition ${actionLoadingId
                        ? actionType === 'verify'
                          ? 'bg-green-300 cursor-not-allowed'
                          : 'bg-red-300 cursor-not-allowed'
                        : actionType === 'verify'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                  >
                    {actionLoadingId
                      ? actionType === 'verify'
                        ? 'Verifying...'
                        : 'Disapproving...'
                      : actionType === 'verify'
                        ? 'Verify Salon'
                        : 'Disapprove Salon'}
                  </button>
                </div>
              </div>
            </div>
          </ModalPortal>
        )}

        {previewImage && (
          <ModalPortal>
            <div className='fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fadeIn'>
              <div
                className='absolute inset-0 bg-black/75 backdrop-blur-sm'
                onClick={closePreviewImage}
              ></div>

              <div className='relative w-full max-w-5xl max-h-[92vh] bg-white rounded-[28px] shadow-2xl overflow-hidden flex flex-col'>
                <div className='flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100'>
                  <div className='min-w-0'>
                    <h3 className='text-lg font-semibold text-gray-950 truncate'>
                      {previewImage.title}
                    </h3>
                    <p className='text-sm text-gray-500 mt-1'>
                      Preview uploaded file
                    </p>
                  </div>

                  <div className='flex items-center gap-2'>
                    <a
                      href={previewImage.url}
                      target='_blank'
                      rel='noreferrer'
                      className='inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition'
                    >
                      <FiExternalLink size={16} />
                      Open Original
                    </a>

                    <button
                      onClick={closePreviewImage}
                      className='w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition'
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                </div>

                <div className='flex-1 overflow-auto bg-gray-50 p-4 sm:p-6'>
                  <div className='w-full h-full min-h-[320px] rounded-[24px] border border-gray-200 bg-white flex items-center justify-center overflow-hidden'>
                    <img
                      src={previewImage.url}
                      alt={previewImage.title}
                      className='max-w-full max-h-[72vh] object-contain'
                    />
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

          .animate-scaleIn {
            animation: scaleIn 0.25s ease both;
          }
        `}</style>
      </div>
    </AdminLayout>
  )
}

function formatDocumentType(value) {
  if (!value) return ''
  return String(value)
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function StatsCard({ title, value }) {
  return (
    <div className='bg-white border border-gray-200 rounded-3xl shadow-sm p-5 animate-fadeIn'>
      <p className='text-sm text-gray-500'>{title}</p>
      <h3 className='text-3xl font-bold text-gray-950 mt-2'>{value}</h3>
    </div>
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

function DetailRow({ label, value, breakAll = false }) {
  return (
    <div className='rounded-2xl border border-gray-200 bg-white px-4 py-3'>
      <p className='text-xs font-medium uppercase tracking-wide text-gray-400 mb-1'>
        {label}
      </p>
      <p className={`text-sm text-gray-800 ${breakAll ? 'break-all' : 'break-words'}`}>
        {value}
      </p>
    </div>
  )
}

function AssetThumbCard({ item, onPreview }) {
  return (
    <button
      type='button'
      onClick={() => onPreview(item.label, item.url)}
      className='group rounded-2xl overflow-hidden border border-gray-200 bg-white text-left hover:shadow-md transition'
    >
      <div className='aspect-[4/3] bg-gray-100 overflow-hidden'>
        <img
          src={item.url}
          alt={item.label}
          className='w-full h-full object-cover group-hover:scale-[1.03] transition duration-300'
        />
      </div>

      <div className='p-3'>
        <div className='flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide'>
          {item.type === 'document' ? <FiFileText size={14} /> : <FiImage size={14} />}
          {item.type === 'document' ? 'Document' : 'Image'}
        </div>
        <p className='text-sm font-semibold text-gray-900 mt-2 line-clamp-2'>
          {item.label}
        </p>
      </div>
    </button>
  )
}

function LargeAssetCard({ item, onPreview }) {
  return (
    <div className='rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition'>
      <button
        type='button'
        onClick={() => onPreview(item.label, item.url)}
        className='w-full text-left'
      >
        <div className='aspect-[4/3] bg-gray-100 overflow-hidden'>
          <img
            src={item.url}
            alt={item.label}
            className='w-full h-full object-cover hover:scale-[1.02] transition duration-300'
          />
        </div>
      </button>

      <div className='p-4'>
        <div className='flex items-center justify-between gap-3'>
          <div className='min-w-0'>
            <div className='flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide'>
              {item.type === 'document' ? <FiFileText size={14} /> : <FiImage size={14} />}
              {item.type === 'document' ? 'Document' : 'Image'}
            </div>
            <p className='text-sm font-semibold text-gray-950 mt-2 break-words'>
              {item.label}
            </p>
          </div>
        </div>

        <div className='flex gap-2 mt-4'>
          <button
            type='button'
            onClick={() => onPreview(item.label, item.url)}
            className='flex-1 h-11 rounded-2xl bg-gray-950 text-white font-medium hover:opacity-90 transition'
          >
            Preview
          </button>

          <a
            href={item.url}
            target='_blank'
            rel='noreferrer'
            className='h-11 px-4 rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium transition inline-flex items-center justify-center gap-2'
          >
            <FiExternalLink size={15} />
            Open
          </a>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className='text-center py-8'>
      <div className='w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mb-4'>
        🏪
      </div>
      <h3 className='text-lg font-semibold text-gray-900'>No salons pending</h3>
      <p className='text-sm text-gray-500 mt-2'>
        All salon verification requests have been processed.
      </p>
    </div>
  )
}

function ModalPortal({ children }) {
  if (typeof document === 'undefined') return null
  return createPortal(children, document.body)
}