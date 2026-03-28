import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import {
    FiMapPin,
    FiPlus,
    FiSearch,
    FiRefreshCw,
    FiTrash2,
    FiToggleLeft,
    FiToggleRight,
    FiX,
} from 'react-icons/fi'
import AdminLayout from '../componenets/AdminLayout'

const BASE_URL = 'http://localhost:8080'

export default function AdminCityPage() {
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
        admin?.user?.userId ||
        admin?.user?.userid ||
        admin?.user?.id ||
        ''

    console.log('admin raw localStorage:', localStorage.getItem('admin'))
    console.log('admin parsed:', JSON.stringify(admin, null, 2))
    console.log('resolved adminId:', adminId)

    const [cities, setCities] = useState([])
    const [loading, setLoading] = useState(true)
    const [addLoading, setAddLoading] = useState(false)
    const [actionLoadingId, setActionLoadingId] = useState('')
    const [cityName, setCityName] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [toggleModalOpen, setToggleModalOpen] = useState(false)
    const [selectedCity, setSelectedCity] = useState(null)

    useEffect(() => {
        if (deleteModalOpen || toggleModalOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }

        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [deleteModalOpen, toggleModalOpen])

    useEffect(() => {
        fetchCities()
    }, [])

    const fetchCities = async () => {
        try {
            setLoading(true)

            const res = await fetch(`${BASE_URL}/api/city/admin/all`)
            if (!res.ok) throw new Error('Failed to fetch cities')

            const data = await res.json()
            setCities(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error(err)
            toast.error('Failed to load cities')
            setCities([])
        } finally {
            setLoading(false)
        }
    }

    const handleAddCity = async (e) => {
        e.preventDefault()

        if (!adminId) {
            toast.error('Admin not found, please login again')
            return
        }

        if (!cityName.trim()) {
            toast.error('Please enter city name')
            return
        }

        try {
            setAddLoading(true)

            const res = await fetch(`${BASE_URL}/api/city/admin/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: cityName.trim(),
                    adminId,
                }),
            })

            const contentType = res.headers.get('content-type') || ''
            const data = contentType.includes('application/json')
                ? await res.json()
                : await res.text()

            if (!res.ok) {
                throw new Error(typeof data === 'string' ? data : 'Failed to add city')
            }

            toast.success('City added successfully')
            setCityName('')
            fetchCities()
        } catch (err) {
            console.error(err)
            toast.error(err.message || 'Failed to add city')
        } finally {
            setAddLoading(false)
        }
    }

    const openDeleteModal = (city) => {
        setSelectedCity(city)
        setDeleteModalOpen(true)
    }

    const closeDeleteModal = () => {
        if (actionLoadingId) return
        setDeleteModalOpen(false)
        setSelectedCity(null)
    }

    const openToggleModal = (city) => {
        setSelectedCity(city)
        setToggleModalOpen(true)
    }

    const closeToggleModal = () => {
        if (actionLoadingId) return
        setToggleModalOpen(false)
        setSelectedCity(null)
    }

    const handleDeleteCity = async () => {
        if (!selectedCity?.id || !adminId) return

        try {
            setActionLoadingId(selectedCity.id)

            const res = await fetch(
                `${BASE_URL}/api/city/admin/delete/${selectedCity.id}?adminId=${adminId}`,
                {
                    method: 'DELETE',
                }
            )

            const contentType = res.headers.get('content-type') || ''
            const data = contentType.includes('application/json')
                ? await res.json()
                : await res.text()

            if (!res.ok) {
                throw new Error(typeof data === 'string' ? data : 'Failed to delete city')
            }

            toast.success('City deleted successfully')
            setDeleteModalOpen(false)
            setSelectedCity(null)
            fetchCities()
        } catch (err) {
            console.error(err)
            toast.error(err.message || 'Failed to delete city')
        } finally {
            setActionLoadingId('')
        }
    }

    const handleToggleCity = async () => {
        if (!selectedCity?.id || !adminId) return

        try {
            setActionLoadingId(selectedCity.id)

            const res = await fetch(
                `${BASE_URL}/api/city/admin/toggle/${selectedCity.id}?adminId=${adminId}`,
                {
                    method: 'PATCH',
                }
            )

            const contentType = res.headers.get('content-type') || ''
            const data = contentType.includes('application/json')
                ? await res.json()
                : await res.text()

            if (!res.ok) {
                throw new Error(typeof data === 'string' ? data : 'Failed to update city')
            }

            toast.success(
                `City ${selectedCity.active ? 'deactivated' : 'activated'} successfully`
            )
            setToggleModalOpen(false)
            setSelectedCity(null)
            fetchCities()
        } catch (err) {
            console.error(err)
            toast.error(err.message || 'Failed to update city')
        } finally {
            setActionLoadingId('')
        }
    }

    const filteredCities = useMemo(() => {
        const term = searchTerm.trim().toLowerCase()
        if (!term) return cities

        return cities.filter((city) =>
            String(city?.name || '')
                .toLowerCase()
                .includes(term)
        )
    }, [cities, searchTerm])

    const totalCities = cities.length
    const activeCities = cities.filter((city) => city.active).length
    const inactiveCities = totalCities - activeCities

    return (
        <AdminLayout>
            <div className='max-w-7xl mx-auto py-2 animate-fadeIn'>
                <div className='mb-6'>
                    <h1 className='text-2xl sm:text-[30px] font-bold text-gray-950 tracking-tight'>
                        City Management
                    </h1>
                    <p className='text-sm text-gray-500 mt-1'>
                        Add, manage, activate or deactivate cities available in the platform.
                    </p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-5'>
                    <StatsCard title='Total Cities' value={totalCities} />
                    <StatsCard title='Active Cities' value={activeCities} />
                    <StatsCard title='Inactive Cities' value={inactiveCities} />
                </div>

                <div className='grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-5'>
                    <div className='bg-white border border-gray-200 rounded-3xl shadow-sm p-5 animate-slideUp'>
                        <div className='flex items-center gap-3 mb-5'>
                            <div className='w-11 h-11 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center text-lg'>
                                <FiPlus />
                            </div>
                            <div>
                                <h2 className='text-lg font-semibold text-gray-950'>Add New City</h2>
                                <p className='text-sm text-gray-500'>
                                    Create a city that owners can select.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleAddCity} className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    City Name
                                </label>
                                <div className='relative'>
                                    <input
                                        type='text'
                                        placeholder='Enter city name'
                                        value={cityName}
                                        onChange={(e) => setCityName(e.target.value)}
                                        className='w-full h-[54px] rounded-2xl border border-gray-200 bg-white px-4 pr-11 text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition'
                                    />
                                    <div className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400'>
                                        <FiMapPin size={18} />
                                    </div>
                                </div>
                            </div>

                            <button
                                type='submit'
                                disabled={addLoading}
                                className={`w-full h-[52px] rounded-2xl text-white font-semibold transition-all duration-300 ${addLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-[#0f172a] hover:bg-black hover:-translate-y-0.5 shadow-sm hover:shadow-md'
                                    }`}
                            >
                                {addLoading ? 'Adding City...' : 'Add City'}
                            </button>
                        </form>
                    </div>

                    <div className='bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden animate-slideUp-delayed'>
                        <div className='p-5 border-b border-gray-100'>
                            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3'>
                                <div>
                                    <h2 className='text-lg font-semibold text-gray-950'>All Cities</h2>
                                    <p className='text-sm text-gray-500 mt-1'>
                                        Search and manage city availability.
                                    </p>
                                </div>

                                <div className='flex flex-col sm:flex-row gap-3'>
                                    <div className='relative min-w-0 sm:min-w-[260px]'>
                                        <input
                                            type='text'
                                            placeholder='Search city...'
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className='w-full h-[46px] rounded-2xl border border-gray-200 bg-white px-4 pr-11 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition'
                                        />
                                        <div className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400'>
                                            <FiSearch size={16} />
                                        </div>
                                    </div>

                                    <button
                                        onClick={fetchCities}
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
                                        <div className='h-20 rounded-2xl bg-gray-100' />
                                    </div>
                                ))
                            ) : filteredCities.length === 0 ? (
                                <EmptyState />
                            ) : (
                                filteredCities.map((city, index) => (
                                    <div
                                        key={city.id}
                                        className='border border-gray-200 rounded-2xl p-4 bg-gray-50 animate-fadeIn'
                                        style={{ animationDelay: `${index * 35}ms` }}
                                    >
                                        <div className='flex items-start justify-between gap-3'>
                                            <div className='min-w-0'>
                                                <p className='text-base font-semibold text-gray-950 break-words'>
                                                    {city.name}
                                                </p>
                                                <div className='mt-2'>
                                                    <StatusBadge active={city.active} />
                                                </div>
                                            </div>

                                            <div className='flex items-center gap-2 shrink-0'>
                                                <button
                                                    onClick={() => openToggleModal(city)}
                                                    disabled={actionLoadingId === city.id}
                                                    className='w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-60'
                                                >
                                                    {city.active ? (
                                                        <FiToggleRight size={18} className='text-green-600' />
                                                    ) : (
                                                        <FiToggleLeft size={18} className='text-gray-500' />
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() => openDeleteModal(city)}
                                                    disabled={actionLoadingId === city.id}
                                                    className='w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center hover:bg-red-100 transition disabled:opacity-60'
                                                >
                                                    <FiTrash2 size={16} className='text-red-600' />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className='hidden lg:block overflow-x-auto'>
                            <table className='w-full min-w-[720px]'>
                                <thead>
                                    <tr className='bg-white border-b border-gray-100'>
                                        <th className='text-left px-5 py-4 text-sm font-semibold text-gray-600'>
                                            City Name
                                        </th>
                                        <th className='text-left px-5 py-4 text-sm font-semibold text-gray-600'>
                                            Status
                                        </th>
                                        <th className='text-left px-5 py-4 text-sm font-semibold text-gray-600'>
                                            Created By
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
                                    ) : filteredCities.length === 0 ? (
                                        <tr>
                                            <td colSpan='4' className='px-5 py-16'>
                                                <EmptyState />
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCities.map((city, index) => (
                                            <tr
                                                key={city.id}
                                                className='border-b border-gray-100 hover:bg-gray-50/70 transition animate-fadeIn'
                                                style={{ animationDelay: `${index * 35}ms` }}
                                            >
                                                <td className='px-5 py-5'>
                                                    <div className='flex items-center gap-3'>
                                                        <div className='w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-700'>
                                                            <FiMapPin />
                                                        </div>
                                                        <div>
                                                            <p className='text-[15px] font-semibold text-gray-950'>
                                                                {city.name || '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className='px-5 py-5'>
                                                    <StatusBadge active={city.active} />
                                                </td>

                                                <td className='px-5 py-5'>
                                                    <p className='text-sm text-gray-600 break-all'>
                                                        {city.createdBy || '-'}
                                                    </p>
                                                </td>

                                                <td className='px-5 py-5'>
                                                    <div className='flex items-center gap-3'>
                                                        <button
                                                            onClick={() => openToggleModal(city)}
                                                            disabled={actionLoadingId === city.id}
                                                            className='h-11 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition disabled:opacity-60 flex items-center gap-2'
                                                        >
                                                            {city.active ? (
                                                                <FiToggleRight className='text-green-600' size={18} />
                                                            ) : (
                                                                <FiToggleLeft className='text-gray-500' size={18} />
                                                            )}
                                                            {city.active ? 'Deactivate' : 'Activate'}
                                                        </button>

                                                        <button
                                                            onClick={() => openDeleteModal(city)}
                                                            disabled={actionLoadingId === city.id}
                                                            className='h-11 px-4 rounded-2xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 font-medium transition disabled:opacity-60 flex items-center gap-2'
                                                        >
                                                            <FiTrash2 size={16} />
                                                            Delete
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
                </div>

                {toggleModalOpen && (
                    <ModalPortal>
                        <div className='fixed inset-0 z-[9999] flex items-center justify-center px-3 py-6 sm:px-4 sm:py-8 animate-fadeIn'>
                            <div
                                className='absolute inset-0 bg-black/55 backdrop-blur-[2px]'
                                onClick={closeToggleModal}
                            ></div>

                            <div className='relative w-full max-w-md bg-white rounded-[28px] shadow-2xl animate-scaleIn flex flex-col'>
                                <div className='flex justify-between items-center px-5 sm:px-6 py-4 border-b border-gray-100'>
                                    <h2 className='text-xl font-semibold text-gray-950'>
                                        {selectedCity?.active ? 'Deactivate City' : 'Activate City'}
                                    </h2>

                                    <button
                                        onClick={closeToggleModal}
                                        disabled={!!actionLoadingId}
                                        className='w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition'
                                    >
                                        <FiX size={20} />
                                    </button>
                                </div>

                                <div className='px-5 sm:px-6 py-5'>
                                    <p className='text-sm sm:text-base text-gray-600 leading-7'>
                                        Are you sure you want to{' '}
                                        <span className='font-semibold text-gray-900'>
                                            {selectedCity?.active ? 'deactivate' : 'activate'}
                                        </span>{' '}
                                        <span className='font-semibold text-gray-900'>
                                            {selectedCity?.name || 'this city'}
                                        </span>
                                        ?
                                    </p>
                                </div>

                                <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 px-5 sm:px-6 py-4 border-t border-gray-100'>
                                    <button
                                        onClick={closeToggleModal}
                                        disabled={!!actionLoadingId}
                                        className='px-5 py-3 border border-gray-200 rounded-2xl w-full sm:w-auto hover:bg-gray-50 transition disabled:opacity-60'
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleToggleCity}
                                        disabled={!!actionLoadingId}
                                        className={`px-5 py-3 rounded-2xl text-white w-full sm:w-auto transition ${actionLoadingId
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-[#0f172a] hover:bg-black'
                                            }`}
                                    >
                                        {actionLoadingId ? 'Updating...' : 'Confirm'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </ModalPortal>
                )}

                {deleteModalOpen && (
                    <ModalPortal>
                        <div className='fixed inset-0 z-[9999] flex items-center justify-center px-3 py-6 sm:px-4 sm:py-8 animate-fadeIn'>
                            <div
                                className='absolute inset-0 bg-black/55 backdrop-blur-[2px]'
                                onClick={closeDeleteModal}
                            ></div>

                            <div className='relative w-full max-w-md bg-white rounded-[28px] shadow-2xl animate-scaleIn flex flex-col'>
                                <div className='flex justify-between items-center px-5 sm:px-6 py-4 border-b border-gray-100'>
                                    <h2 className='text-xl font-semibold text-gray-950'>Delete City</h2>

                                    <button
                                        onClick={closeDeleteModal}
                                        disabled={!!actionLoadingId}
                                        className='w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition'
                                    >
                                        <FiX size={20} />
                                    </button>
                                </div>

                                <div className='px-5 sm:px-6 py-5 space-y-4'>
                                    <p className='text-sm sm:text-base text-gray-600 leading-7'>
                                        Are you sure you want to delete{' '}
                                        <span className='font-semibold text-gray-900'>
                                            {selectedCity?.name || 'this city'}
                                        </span>
                                        ?
                                    </p>

                                    <div className='rounded-2xl border border-red-100 bg-red-50 px-4 py-3'>
                                        <p className='text-sm text-red-700 leading-6'>
                                            This action cannot be undone.
                                        </p>
                                    </div>
                                </div>

                                <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 px-5 sm:px-6 py-4 border-t border-gray-100'>
                                    <button
                                        onClick={closeDeleteModal}
                                        disabled={!!actionLoadingId}
                                        className='px-5 py-3 border border-gray-200 rounded-2xl w-full sm:w-auto hover:bg-gray-50 transition disabled:opacity-60'
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleDeleteCity}
                                        disabled={!!actionLoadingId}
                                        className={`px-5 py-3 rounded-2xl text-white w-full sm:w-auto transition ${actionLoadingId
                                            ? 'bg-red-300 cursor-not-allowed'
                                            : 'bg-red-600 hover:bg-red-700'
                                            }`}
                                    >
                                        {actionLoadingId ? 'Deleting...' : 'Delete City'}
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

          .animate-slideUp-delayed {
            animation: slideUp 0.6s ease 0.08s both;
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

function StatusBadge({ active }) {
    return (
        <span
            className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border ${active
                ? 'bg-green-100 text-green-700 border-green-200'
                : 'bg-red-100 text-red-700 border-red-200'
                }`}
        >
            {active ? 'Active' : 'Inactive'}
        </span>
    )
}

function EmptyState() {
    return (
        <div className='text-center py-8'>
            <div className='w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mb-4'>
                📍
            </div>
            <h3 className='text-lg font-semibold text-gray-900'>No cities found</h3>
            <p className='text-sm text-gray-500 mt-2'>
                Add a city or try changing the search.
            </p>
        </div>
    )
}

function ModalPortal({ children }) {
    if (typeof document === 'undefined') return null
    return createPortal(children, document.body)
}