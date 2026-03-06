import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import OwnerLayout from '../componenets/OwnerLayout'
import { Trash2 } from 'lucide-react'

const BASE_URL = 'https://render-qs89.onrender.com'

const weekDays = [
  { label: 'Sun', value: 'SUNDAY' },
  { label: 'Mon', value: 'MONDAY' },
  { label: 'Tue', value: 'TUESDAY' },
  { label: 'Wed', value: 'WEDNESDAY' },
  { label: 'Thu', value: 'THURSDAY' },
  { label: 'Fri', value: 'FRIDAY' },
  { label: 'Sat', value: 'SATURDAY' },
]

export default function ManageBarbers() {
  const salonId = localStorage.getItem('salonId')

  const [barbers, setBarbers] = useState([])
  const [selectedBarber, setSelectedBarber] = useState(null)
  const [form, setForm] = useState(null)
  const [showPopup, setShowPopup] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const ownerId = user.userid || user.userId || ''

  const [originalForm, setOriginalForm] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [salons, setSalons] = useState([])
  const savedSalonId = localStorage.getItem('salonId')
  const [selectedSalonId, setSelectedSalonId] = useState(
    savedSalonId && savedSalonId !== 'undefined' ? savedSalonId : ''
  )

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [barberToDelete, setBarberToDelete] = useState(null)

  // ================= LOAD SALONS (FIXED) =================
  useEffect(() => {
    if (!ownerId) {
      toast.error('Owner not found, please login again')
      setSalons([])
      setSelectedSalonId('')
      localStorage.removeItem('salonId')
      return
    }

    fetch(`${BASE_URL}/api/salon/get-salon-by-owner/${ownerId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch salons')
        return res.json()
      })
      .then((data) => {
        const raw = Array.isArray(data) ? data : []

        // normalize salon id (handles id / _id / _id.$oid)
        const normalized = raw
          .map((s) => {
            const sid =
              s?.id ||
              s?._id?.$oid ||
              s?._id ||
              s?.salonId

            return sid ? { ...s, sid } : null
          })
          .filter(Boolean)

        // remove duplicates by sid
        const unique = Array.from(
          new Map(normalized.map((s) => [s.sid, s])).values()
        )

        setSalons(unique)

        if (unique.length === 0) {
          toast.error('No salons found')
          setSelectedSalonId('')
          localStorage.removeItem('salonId')
          return
        }

        const stored = localStorage.getItem('salonId')
        const storedValid = stored && stored !== 'undefined' && unique.some((s) => s.sid === stored)

        const initialSalonId = storedValid ? stored : unique[0].sid

        setSelectedSalonId(initialSalonId)
        localStorage.setItem('salonId', initialSalonId)
      })
      .catch(() => {
        toast.error('Failed to load salons')
        setSalons([])
        setSelectedSalonId('')
        localStorage.removeItem('salonId')
      })
  }, [ownerId])

  // ================= LOAD BARBERS =================
  useEffect(() => {
    if (!selectedSalonId) return

    setBarbers([])
    setSelectedBarber(null)
    setForm(null)

    fetch(`${BASE_URL}/api/barber/salon/${selectedSalonId}`)
      .then((res) => res.json())
      .then((data) => {
        setBarbers(data || [])
        if (data && data.length > 0) {
          setSelectedBarber(data[0])
          setForm(data[0])
          setOriginalForm(data[0])
        } else {
          setSelectedBarber(null)
          setForm(null)
          setOriginalForm(null)
        }
      })
      .catch(() => toast.error('Failed to load barbers'))
  }, [selectedSalonId])

  // ================= SELECT BARBER =================
  const handleSelect = (barber) => {
    setSelectedBarber(barber)
    setForm({ ...barber })
    setOriginalForm({ ...barber })
  }

  // ================= SAVE CHANGES =================
  const handleSave = async () => {
    if (!selectedBarber || !form) {
      toast.error('No barber selected')
      return
    }

    if (!hasChanges) return

    if (!form.workingStartTime || !form.workingEndTime) {
      toast.error('Please fill working hours')
      return
    }

    if (form.workingStartTime >= form.workingEndTime) {
      toast.error('Start time must be before end time')
      return
    }

    setIsSaving(true)

    try {
      const body = {
        active: form.active,
        workingStartTime: form.workingStartTime,
        workingEndTime: form.workingEndTime,
        lunchStart: form.lunchStart,
        lunchEnd: form.lunchEnd,
        weeklyOffDays: form.weeklyOffDays,
        leaves: form.leaves,
      }

      const res = await fetch(`${BASE_URL}/api/barber/${selectedBarber.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Update failed')
      }

      const updated = await res.json()

      const updatedList = barbers.map((b) =>
        b.id === updated.id ? updated : b
      )

      setBarbers(updatedList)
      setSelectedBarber(updated)
      setForm(updated)
      setOriginalForm(updated)
      toast.success('Barber updated successfully')
    } catch (error) {
      toast.error(error.message || 'Update failed')
    } finally {
      setIsSaving(false)
    }
  }

  // ================= ADD BARBER =================
  // ================= ADD BARBER (SELECTED SALON ONLY) =================
  const handleAddBarber = async () => {
    const salonToUse = selectedSalonId

    if (!salonToUse) {
      toast.error('Please select salon')
      return
    }

    if (!form.name || !form.workingStartTime || !form.workingEndTime) {
      toast.error('Please fill required fields')
      return
    }

    if (form.workingStartTime >= form.workingEndTime) {
      toast.error('Start time must be before end time')
      return
    }

    try {
      const payload = { ...form, salonId: salonToUse }

      const res = await fetch(`${BASE_URL}/api/barber/add/${salonToUse}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error()

      const newBarber = await res.json()

      // keep salon selection same
      localStorage.setItem('salonId', salonToUse)
      setSelectedSalonId(salonToUse)

      // update barber list immediately (no flow change)
      setBarbers((prev) => [...prev, newBarber])
      setSelectedBarber(newBarber)
      setForm(newBarber)
      setShowPopup(false)

      toast.success('Barber created successfully')
    } catch {
      toast.error('Failed to create barber')
    }
  }

  const handleDeleteClick = (barber) => {
    setBarberToDelete(barber)
    setDeleteModalOpen(true)
  }

  const cancelDelete = () => {
    setDeleteModalOpen(false)
    setBarberToDelete(null)
  }

  const confirmDelete = async () => {
    if (!barberToDelete?.id) return

    setIsDeleting(true)

    try {
      const res = await fetch(`${BASE_URL}/api/barber/${barberToDelete.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Delete failed')
      }

      const updatedBarbers = barbers.filter((b) => b.id !== barberToDelete.id)
      setBarbers(updatedBarbers)

      if (selectedBarber?.id === barberToDelete.id) {
        if (updatedBarbers.length > 0) {
          setSelectedBarber(updatedBarbers[0])
          setForm({ ...updatedBarbers[0] })
          setOriginalForm({ ...updatedBarbers[0] })
        } else {
          setSelectedBarber(null)
          setForm(null)
          setOriginalForm(null)
        }
      }

      toast.success('Barber deleted successfully')
    } catch (error) {
      toast.error(error.message || 'Delete failed')
    } finally {
      setIsDeleting(false)
      setDeleteModalOpen(false)
      setBarberToDelete(null)
    }
  }

  const hasChanges =
    form && originalForm
      ? JSON.stringify({
        active: form.active,
        workingStartTime: form.workingStartTime,
        workingEndTime: form.workingEndTime,
        lunchStart: form.lunchStart,
        lunchEnd: form.lunchEnd,
        weeklyOffDays: form.weeklyOffDays || [],
        leaves: form.leaves || [],
      }) !==
      JSON.stringify({
        active: originalForm.active,
        workingStartTime: originalForm.workingStartTime,
        workingEndTime: originalForm.workingEndTime,
        lunchStart: originalForm.lunchStart,
        lunchEnd: originalForm.lunchEnd,
        weeklyOffDays: originalForm.weeklyOffDays || [],
        leaves: originalForm.leaves || [],
      })
      : false

  // ================= UI =================
  return (
    <OwnerLayout>
      <div className='py-3 flex flex-col lg:flex-row gap-4 sm:gap-6'>
        {/* LEFT PANEL */}
        <div className='lg:w-1/3 bg-white rounded-xl shadow p-5'>
          <h2 className='text-lg font-semibold mb-4'>Barber List</h2>

          {/* SALON DROPDOWN */}
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-2'>
              Select Salon
            </label>

            <select
              value={selectedSalonId || ''}
              onChange={(e) => {
                const sid = e.target.value
                setSelectedSalonId(sid)
                localStorage.setItem('salonId', sid)
              }}
              className='w-full border p-3 rounded-lg bg-white'
            >
              {salons.length === 0 ? (
                <option value=''>No salons found</option>
              ) : (
                salons.map((s) => (
                  <option key={s.sid} value={s.sid}>
                    {s.name} ({s.city})
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={() => {
              setForm({
                salonId: selectedSalonId,
                name: '',
                workingStartTime: '',
                workingEndTime: '',
                lunchStart: '',
                lunchEnd: '',
                weeklyOffDays: [],
                leaves: [],
                active: true,
              })
              setShowPopup(true)
            }}
            disabled={!selectedSalonId}
            className={`w-full text-white py-2 rounded-lg mb-4 ${selectedSalonId ? 'bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
              }`}
          >
            + Add Barber
          </button>

          {barbers.map((barber) => (
            <div
              key={barber.id}
              onClick={() => handleSelect(barber)}
              className={`p-4 mb-3 rounded-lg border cursor-pointer transition ${selectedBarber?.id === barber.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-50 hover:bg-gray-100'
                }`}
            >
              <div className='flex justify-between items-start gap-3'>
                <div className='min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium truncate'>{barber.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(barber)
                      }}
                      disabled={isDeleting}
                      className={`p-1 rounded-md transition shrink-0 ${selectedBarber?.id === barber.id
                        ? 'hover:bg-white/20 text-white'
                        : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                        } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>

                  <p
                    className={`text-sm mt-1 ${selectedBarber?.id === barber.id ? 'text-white/90' : 'text-gray-600'
                      }`}
                  >
                    {barber.weeklyOffDays?.length || 0} Weekly Off | {barber.leaves?.length || 0} Leaves
                  </p>
                </div>

                <span className='text-sm shrink-0'>
                  {barber.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT PANEL */}
        {form && (
          <div className='lg:w-2/3 bg-white rounded-xl shadow p-6'>
            <h2 className='text-xl font-bold mb-6'>
              Barber Details & Schedule
            </h2>

            {/* Status */}
            <div className='mb-6'>
              <div className='flex items-center gap-4 mb-6'>
                <label className='font-medium text-lg'>Status</label>

                <button
                  type='button'
                  onClick={() => setForm({ ...form, active: !form.active })}
                  className={`relative inline-flex h-6 w-14 items-center rounded-full transition-colors duration-300 ${form.active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-5 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${form.active ? 'translate-x-7' : 'translate-x-1'
                      }`}
                  />
                </button>

                <span
                  className={`font-medium ${form.active ? 'text-green-600' : 'text-gray-500'
                    }`}
                >
                  {form.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Working Hours */}
            <div className='grid grid-cols-2 gap-6 mb-6'>
              <div>
                <label>Start Time</label>
                <input
                  type='time'
                  value={form.workingStartTime}
                  onChange={(e) =>
                    setForm({ ...form, workingStartTime: e.target.value })
                  }
                  className='border p-2 rounded w-full'
                />
              </div>
              <div>
                <label>End Time</label>
                <input
                  type='time'
                  value={form.workingEndTime}
                  onChange={(e) =>
                    setForm({ ...form, workingEndTime: e.target.value })
                  }
                  className='border p-2 rounded w-full'
                />
              </div>
            </div>

            {/* Lunch */}
            <div className='grid grid-cols-2 gap-6 mb-6'>
              <div>
                <label>Lunch Start</label>
                <input
                  type='time'
                  value={form.lunchStart}
                  onChange={(e) =>
                    setForm({ ...form, lunchStart: e.target.value })
                  }
                  className='border p-2 rounded w-full'
                />
              </div>
              <div>
                <label>Lunch End</label>
                <input
                  type='time'
                  value={form.lunchEnd}
                  onChange={(e) =>
                    setForm({ ...form, lunchEnd: e.target.value })
                  }
                  className='border p-2 rounded w-full'
                />
              </div>
            </div>

            {/* Weekly Off */}
            <div className='mb-6'>
              <label className='font-medium block mb-2'>Weekly Off Days</label>
              <div className='flex gap-4 flex-wrap'>
                {weekDays.map((day) => (
                  <label key={day.value} className='flex items-center gap-1'>
                    <input
                      type='checkbox'
                      checked={form.weeklyOffDays?.includes(day.value)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...form.weeklyOffDays, day.value]
                          : form.weeklyOffDays.filter((d) => d !== day.value)
                        setForm({ ...form, weeklyOffDays: updated })
                      }}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Leaves */}
            <div className='mb-6'>
              <label className='font-medium block mb-2'>Leave Dates</label>

              {form.leaves?.map((date, index) => (
                <div key={index} className='flex gap-2 mb-2'>
                  <input
                    type='date'
                    value={date}
                    onChange={(e) => {
                      const updated = [...form.leaves]
                      updated[index] = e.target.value
                      setForm({ ...form, leaves: updated })
                    }}
                    className='border p-2 rounded w-full'
                  />
                  <button
                    onClick={() => {
                      const updated = form.leaves.filter((_, i) => i !== index)
                      setForm({ ...form, leaves: updated })
                    }}
                    className='text-red-500'
                  >
                    🗑
                  </button>
                </div>
              ))}

              <button
                onClick={() =>
                  setForm({ ...form, leaves: [...form.leaves, ''] })
                }
                className='text-blue-600 text-sm'
              >
                + Add Date
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className={`px-6 py-2 rounded-lg transition ${isSaving || !hasChanges
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
            >
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        )}

        {deleteModalOpen && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
            <div className='bg-white p-6 rounded-2xl shadow-lg w-[420px]'>
              <h2 className='text-2xl font-bold mb-4'>Confirm Delete</h2>
              <p className='mb-6 text-lg'>
                Are you sure you want to delete{' '}
                <strong>{barberToDelete?.name}</strong>?
              </p>

              <div className='flex justify-end gap-4'>
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className='px-4 py-2 border rounded-lg'
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className={`px-4 py-2 text-white rounded-lg ${isDeleting
                      ? 'bg-red-300 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600'
                    }`}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POPUP (keep as you have it) */}
        {showPopup && (
          <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50'>
            <div className='bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative'>
              <h2 className='text-2xl font-bold mb-6'>Add New Barber</h2>

              {/* Name */}
              <div className='mb-4'>
                <label className='block mb-1 font-medium'>Barber Name *</label>
                <input
                  type='text'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className='w-full border p-3 rounded-lg'
                  placeholder='Enter barber name'
                />
              </div>

              {/* Working Hours */}
              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div>
                  <label className='block mb-1'>Start Time *</label>
                  <input
                    type='time'
                    value={form.workingStartTime}
                    onChange={(e) =>
                      setForm({ ...form, workingStartTime: e.target.value })
                    }
                    className='w-full border p-3 rounded-lg'
                  />
                </div>
                <div>
                  <label className='block mb-1'>End Time *</label>
                  <input
                    type='time'
                    value={form.workingEndTime}
                    onChange={(e) =>
                      setForm({ ...form, workingEndTime: e.target.value })
                    }
                    className='w-full border p-3 rounded-lg'
                  />
                </div>
              </div>

              {/* Lunch Time */}
              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div>
                  <label className='block mb-1'>Lunch Start</label>
                  <input
                    type='time'
                    value={form.lunchStart}
                    onChange={(e) =>
                      setForm({ ...form, lunchStart: e.target.value })
                    }
                    className='w-full border p-3 rounded-lg'
                  />
                </div>
                <div>
                  <label className='block mb-1'>Lunch End</label>
                  <input
                    type='time'
                    value={form.lunchEnd}
                    onChange={(e) =>
                      setForm({ ...form, lunchEnd: e.target.value })
                    }
                    className='w-full border p-3 rounded-lg'
                  />
                </div>
              </div>

              {/* Weekly Off */}
              <div className='mb-4'>
                <label className='block mb-2 font-medium'>
                  Weekly Off Days
                </label>
                <div className='flex gap-4 flex-wrap'>
                  {weekDays.map((day) => (
                    <label key={day.value} className='flex items-center gap-1'>
                      <input
                        type='checkbox'
                        checked={form.weeklyOffDays?.includes(day.value)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...form.weeklyOffDays, day.value]
                            : form.weeklyOffDays.filter((d) => d !== day.value)

                          setForm({ ...form, weeklyOffDays: updated })
                        }}
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Leaves */}
              <div className='mb-6'>
                <label className='block mb-2 font-medium'>Leave Dates</label>

                {form.leaves?.map((date, index) => (
                  <div key={index} className='flex gap-2 mb-2'>
                    <input
                      type='date'
                      value={date}
                      onChange={(e) => {
                        const updated = [...form.leaves]
                        updated[index] = e.target.value
                        setForm({ ...form, leaves: updated })
                      }}
                      className='border p-2 rounded w-full'
                    />
                    <button
                      onClick={() => {
                        const updated = form.leaves.filter(
                          (_, i) => i !== index
                        )
                        setForm({ ...form, leaves: updated })
                      }}
                      className='text-red-500'
                    >
                      🗑
                    </button>
                  </div>
                ))}

                <button
                  onClick={() =>
                    setForm({ ...form, leaves: [...form.leaves, ''] })
                  }
                  className='text-blue-600 text-sm'
                >
                  + Add Date
                </button>
              </div>

              {/* Buttons */}
              <div className='flex justify-end gap-3'>
                <button
                  onClick={() => setShowPopup(false)}
                  className='px-5 py-2 border rounded-lg'
                >
                  Cancel
                </button>

                <button
                  onClick={handleAddBarber}
                  className='px-5 py-2 bg-blue-600 text-white rounded-lg'
                >
                  Create Barber
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OwnerLayout>
  )
}
