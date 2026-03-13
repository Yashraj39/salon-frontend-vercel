import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import OwnerLayout from '../componenets/OwnerLayout'
import { Trash2, Plus, Plane } from 'lucide-react'

const BASE_URL = 'http://localhost:8080'

const weekDays = [
  { label: 'Sun', value: 'SUNDAY' },
  { label: 'Mon', value: 'MONDAY' },
  { label: 'Tue', value: 'TUESDAY' },
  { label: 'Wed', value: 'WEDNESDAY' },
  { label: 'Thu', value: 'THURSDAY' },
  { label: 'Fri', value: 'FRIDAY' },
  { label: 'Sat', value: 'SATURDAY' },
]

const normalizeTime = (value) => (value ? value.slice(0, 5) : '')

const normalizeLeaves = (leaves = []) => {
  const cleaned = leaves
    .map((d) => (typeof d === 'string' ? d.trim() : d))
    .filter(Boolean)

  return [...new Set(cleaned)].sort()
}

const normalizeTemporaryInactiveSlots = (slots = []) => {
  return (Array.isArray(slots) ? slots : [])
    .map((slot) => ({
      ...slot,
      date: typeof slot?.date === 'string' ? slot.date.slice(0, 10) : '',
      startTime:
        typeof slot?.startTime === 'string' ? slot.startTime.slice(0, 5) : '',
      endTime:
        typeof slot?.endTime === 'string' ? slot.endTime.slice(0, 5) : '',
      reason: slot?.reason || '',
    }))
    .filter((slot) => slot.date && slot.startTime && slot.endTime)
}

const todayDateString = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const timeToMinutes = (time) => {
  if (!time) return null
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const formatTime12Hour = (time) => {
  if (!time) return ''
  const [hourStr, minuteStr] = time.split(':')
  let hour = Number(hourStr)
  const minute = minuteStr
  const ampm = hour >= 12 ? 'PM' : 'AM'

  hour = hour % 12
  if (hour === 0) hour = 12

  return `${String(hour).padStart(2, '0')}:${minute} ${ampm}`
}

const getShiftRange = (start, end) => {
  let startMin = timeToMinutes(start)
  let endMin = timeToMinutes(end)

  if (startMin == null || endMin == null) return null

  if (endMin <= startMin) {
    endMin += 24 * 60
  }

  return { startMin, endMin }
}

const normalizeTimeForRange = (time, rangeStart) => {
  let value = timeToMinutes(time)
  if (value == null) return null

  if (value < rangeStart) {
    value += 24 * 60
  }

  return value
}

const combineDateAndTime = (date, time) => {
  if (!date || !time) return null
  return new Date(`${date}T${time}:00`)
}

const hasScheduledTemporaryInactive = (barber, nowMs) => {
  if (!Array.isArray(barber?.temporaryInactiveSlots)) return false

  return barber.temporaryInactiveSlots.some((slot) => {
    const end = combineDateAndTime(slot.date, slot.endTime)
    if (!end) return false
    return end.getTime() >= nowMs
  })
}

const validateBarberForm = (data, salon) => {
  if (!data?.name?.trim()) return 'Barber name is required'
  if (!data.workingStartTime) return 'Start time is required'
  if (!data.workingEndTime) return 'End time is required'

  const workingStartTime = normalizeTime(data.workingStartTime)
  const workingEndTime = normalizeTime(data.workingEndTime)
  const lunchStart = normalizeTime(data.lunchStart)
  const lunchEnd = normalizeTime(data.lunchEnd)

  const barberRange = getShiftRange(workingStartTime, workingEndTime)
  if (!barberRange) return 'Invalid barber timing'

  const salonOpen = normalizeTime(salon?.opentime)
  const salonClose = normalizeTime(salon?.closetime)

  if (salonOpen && salonClose) {
    const salonRange = getShiftRange(salonOpen, salonClose)
    if (!salonRange) return 'Invalid salon timing'

    const barberStart = normalizeTimeForRange(workingStartTime, salonRange.startMin)
    const barberEnd = normalizeTimeForRange(workingEndTime, salonRange.startMin)

    if (barberStart < salonRange.startMin) {
      return `Barber start time cannot be before salon open time (${formatTime12Hour(salonOpen)})`
    }

    if (barberEnd > salonRange.endMin) {
      return `Barber end time cannot be after salon close time (${formatTime12Hour(salonClose)})`
    }
  }

  const hasLunchStart = !!lunchStart
  const hasLunchEnd = !!lunchEnd

  if ((hasLunchStart && !hasLunchEnd) || (!hasLunchStart && hasLunchEnd)) {
    return 'Lunch start and lunch end both are required'
  }

  if (hasLunchStart && hasLunchEnd) {
    const lunchStartMin = normalizeTimeForRange(lunchStart, barberRange.startMin)
    const lunchEndMin = normalizeTimeForRange(lunchEnd, barberRange.startMin)

    if (lunchEndMin <= lunchStartMin) {
      return 'Lunch start must be before lunch end'
    }

    if (lunchStartMin < barberRange.startMin || lunchEndMin > barberRange.endMin) {
      return 'Lunch must be between barber working time'
    }
  }

  const leaves = normalizeLeaves(data.leaves || [])
  const today = todayDateString()

  for (const date of leaves) {
    if (date < today) {
      return 'Past leave dates are not allowed'
    }
  }

  return null
}

const buildBarberPayload = (form) => ({
  name: form.name?.trim() || '',
  active: !!form.active,
  workingStartTime: normalizeTime(form.workingStartTime),
  workingEndTime: normalizeTime(form.workingEndTime),
  lunchStart: normalizeTime(form.lunchStart) || null,
  lunchEnd: normalizeTime(form.lunchEnd) || null,
  weeklyOffDays: [...new Set(form.weeklyOffDays || [])],
  leaves: normalizeLeaves(form.leaves || []),
})

export default function ManageBarbers() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const ownerId = user.userid || user.userId || ''

  const [barbers, setBarbers] = useState([])
  const [selectedBarber, setSelectedBarber] = useState(null)
  const [form, setForm] = useState(null)
  const [showPopup, setShowPopup] = useState(false)

  const [originalForm, setOriginalForm] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [salons, setSalons] = useState([])
  const savedSalonId = localStorage.getItem('salonId')
  const [selectedSalonId, setSelectedSalonId] = useState(
    savedSalonId && savedSalonId !== 'undefined' ? savedSalonId : ''
  )

  const [nowMs, setNowMs] = useState(Date.now())

  const selectedSalon = salons.find((s) => s.sid === selectedSalonId) || null

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [barberToDelete, setBarberToDelete] = useState(null)

  const [conflictModal, setConflictModal] = useState(null)
  const [tempInactiveModalOpen, setTempInactiveModalOpen] = useState(false)
  const [tempInactiveLoading, setTempInactiveLoading] = useState(false)
  const [tempInactiveForm, setTempInactiveForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
  })

  const [vacationModalOpen, setVacationModalOpen] = useState(false)
  const [vacationLoading, setVacationLoading] = useState(false)
  const [vacationForm, setVacationForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now())
    }, 30000)

    return () => clearInterval(timer)
  }, [])

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

        const normalized = raw
          .map((s) => {
            const sid = s?.id || s?._id?.$oid || s?._id || s?.salonId
            return sid ? { ...s, sid } : null
          })
          .filter(Boolean)

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
        const storedValid =
          stored && stored !== 'undefined' && unique.some((s) => s.sid === stored)

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

  useEffect(() => {
    if (!selectedSalonId) return

    setBarbers([])
    setSelectedBarber(null)
    setForm(null)

    fetch(`${BASE_URL}/api/barber/salon/${selectedSalonId}`)
      .then((res) => res.json())
      .then((data) => {
        const safe = Array.isArray(data)
          ? data.map((barber) => ({
              ...barber,
              workingStartTime: normalizeTime(barber.workingStartTime),
              workingEndTime: normalizeTime(barber.workingEndTime),
              lunchStart: normalizeTime(barber.lunchStart),
              lunchEnd: normalizeTime(barber.lunchEnd),
              weeklyOffDays: barber.weeklyOffDays || [],
              leaves: normalizeLeaves(barber.leaves || []),
              temporaryInactiveSlots: normalizeTemporaryInactiveSlots(
                barber.temporaryInactiveSlots || []
              ),
            }))
          : []

        setBarbers(safe)

        if (safe.length > 0) {
          setSelectedBarber(safe[0])
          setForm({ ...safe[0] })
          setOriginalForm({ ...safe[0] })
        } else {
          setSelectedBarber(null)
          setForm(null)
          setOriginalForm(null)
        }
      })
      .catch(() => toast.error('Failed to load barbers'))
  }, [selectedSalonId])

  const handleSelect = (barber) => {
    const normalized = {
      ...barber,
      workingStartTime: normalizeTime(barber.workingStartTime),
      workingEndTime: normalizeTime(barber.workingEndTime),
      lunchStart: normalizeTime(barber.lunchStart),
      lunchEnd: normalizeTime(barber.lunchEnd),
      weeklyOffDays: barber.weeklyOffDays || [],
      leaves: normalizeLeaves(barber.leaves || []),
      temporaryInactiveSlots: normalizeTemporaryInactiveSlots(
        barber.temporaryInactiveSlots || []
      ),
    }

    setSelectedBarber(normalized)
    setForm({ ...normalized })
    setOriginalForm({ ...normalized })
  }

  const handleSave = async (forceCancel = false, customReason = '') => {
    if (!selectedBarber || !form) {
      toast.error('No barber selected')
      return
    }

    if (!hasChanges && !forceCancel) return

    const validationError = validateBarberForm(form, selectedSalon)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setIsSaving(true)

    try {
      const body = {
        ...buildBarberPayload(form),
        autoCancelConflictingBookings: forceCancel,
        cancellationReason: customReason || 'Barber schedule updated by owner',
      }

      const res = await fetch(`${BASE_URL}/api/barber/${selectedBarber.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const contentType = res.headers.get('content-type') || ''
      const data = contentType.includes('application/json')
        ? await res.json()
        : await res.text()

      if (res.status === 409) {
        setConflictModal({
          title: 'Conflicting bookings found',
          reason: data?.reason || 'Barber schedule updated by owner',
          conflicts: data?.conflicts || [],
          onConfirm: async () => {
            setConflictModal(null)
            await handleSave(true, data?.reason || 'Barber schedule updated by owner')
          },
        })
        return
      }

      if (!res.ok) {
        throw new Error(typeof data === 'string' ? data : 'Update failed')
      }

      const updated = {
        ...data,
        workingStartTime: normalizeTime(data.workingStartTime),
        workingEndTime: normalizeTime(data.workingEndTime),
        lunchStart: normalizeTime(data.lunchStart),
        lunchEnd: normalizeTime(data.lunchEnd),
        weeklyOffDays: data.weeklyOffDays || [],
        leaves: normalizeLeaves(data.leaves || []),
        temporaryInactiveSlots: normalizeTemporaryInactiveSlots(
          data.temporaryInactiveSlots || []
        ),
      }

      setBarbers((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
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

  const handleTemporaryInactive = async (forceCancel = false, customReason = '') => {
    if (!selectedBarber?.id) {
      toast.error('No barber selected')
      return
    }

    if (!tempInactiveForm.date || !tempInactiveForm.startTime || !tempInactiveForm.endTime) {
      toast.error('Please fill date, start time and end time')
      return
    }

    const barberStartTime = normalizeTime(form?.workingStartTime)
    const barberEndTime = normalizeTime(form?.workingEndTime)
    const inactiveStart = normalizeTime(tempInactiveForm.startTime)
    const inactiveEnd = normalizeTime(tempInactiveForm.endTime)

    const barberRange = getShiftRange(barberStartTime, barberEndTime)
    const inactiveRange = getShiftRange(inactiveStart, inactiveEnd)

    if (!barberRange || !inactiveRange) {
      toast.error('Invalid inactive timing')
      return
    }

    const normalizedInactiveStart = normalizeTimeForRange(inactiveStart, barberRange.startMin)
    const normalizedInactiveEnd = normalizeTimeForRange(inactiveEnd, barberRange.startMin)

    if (normalizedInactiveStart < barberRange.startMin) {
      toast.error('Inactive start time cannot be before barber start time')
      return
    }

    if (normalizedInactiveEnd > barberRange.endMin) {
      toast.error('Inactive end time cannot be after barber end time')
      return
    }

    setTempInactiveLoading(true)

    try {
      const res = await fetch(
        `${BASE_URL}/api/barber/${selectedBarber.id}/temporary-inactive`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: tempInactiveForm.date,
            startTime: inactiveStart,
            endTime: inactiveEnd,
            autoCancelConflictingBookings: forceCancel,
            reason: customReason || tempInactiveForm.reason || 'Barber temporarily unavailable',
          }),
        }
      )

      const contentType = res.headers.get('content-type') || ''
      const data = contentType.includes('application/json')
        ? await res.json()
        : await res.text()

      if (res.status === 409) {
        setTempInactiveModalOpen(false)

        setConflictModal({
          title: 'This will cancel some bookings',
          reason: data?.reason || tempInactiveForm.reason || 'Barber temporarily unavailable',
          conflicts: data?.conflicts || [],
          onConfirm: async () => {
            setConflictModal(null)
            await handleTemporaryInactive(
              true,
              data?.reason || tempInactiveForm.reason || 'Barber temporarily unavailable'
            )
          },
        })
        return
      }

      if (!res.ok) {
        throw new Error(typeof data === 'string' ? data : 'Failed to update availability')
      }

      const updated = {
        ...data,
        workingStartTime: normalizeTime(data.workingStartTime),
        workingEndTime: normalizeTime(data.workingEndTime),
        lunchStart: normalizeTime(data.lunchStart),
        lunchEnd: normalizeTime(data.lunchEnd),
        weeklyOffDays: data.weeklyOffDays || [],
        leaves: normalizeLeaves(data.leaves || []),
        temporaryInactiveSlots: normalizeTemporaryInactiveSlots(
          data.temporaryInactiveSlots || []
        ),
      }

      setBarbers((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
      setSelectedBarber(updated)
      setForm(updated)
      setOriginalForm(updated)

      setTempInactiveModalOpen(false)
      setTempInactiveForm({
        date: '',
        startTime: '',
        endTime: '',
        reason: '',
      })

      toast.success('Barber marked unavailable successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to update availability')
    } finally {
      setTempInactiveLoading(false)
    }
  }

  const cancelTemporaryInactive = async () => {
    if (!selectedBarber?.id) return

    try {
      const res = await fetch(
        `${BASE_URL}/api/barber/${selectedBarber.id}/cancel-temporary-inactive`,
        { method: 'POST' }
      )

      if (!res.ok) {
        throw new Error('Failed to activate barber')
      }

      const data = await res.json()

      const updated = {
        ...data,
        workingStartTime: normalizeTime(data.workingStartTime),
        workingEndTime: normalizeTime(data.workingEndTime),
        lunchStart: normalizeTime(data.lunchStart),
        lunchEnd: normalizeTime(data.lunchEnd),
        weeklyOffDays: data.weeklyOffDays || [],
        leaves: normalizeLeaves(data.leaves || []),
        temporaryInactiveSlots: normalizeTemporaryInactiveSlots(
          data.temporaryInactiveSlots || []
        ),
      }

      setBarbers((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
      setSelectedBarber(updated)
      setForm(updated)
      setOriginalForm(updated)

      setTempInactiveModalOpen(false)
      setConflictModal(null)
      setTempInactiveForm({
        date: '',
        startTime: '',
        endTime: '',
        reason: '',
      })

      toast.success('Barber activated')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleVacationSubmit = async (forceCancel = false, customReason = '') => {
    if (!selectedBarber?.id) {
      toast.error('No barber selected')
      return
    }

    if (!vacationForm.startDate || !vacationForm.endDate) {
      toast.error('Please select vacation start and end date')
      return
    }

    if (vacationForm.endDate < vacationForm.startDate) {
      toast.error('Vacation end date cannot be before start date')
      return
    }

    setVacationLoading(true)

    try {
      const res = await fetch(`${BASE_URL}/api/barber/${selectedBarber.id}/vacation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: vacationForm.startDate,
          endDate: vacationForm.endDate,
          autoCancelConflictingBookings: forceCancel,
          cancellationReason:
            customReason || vacationForm.reason || 'Barber vacation added by owner',
        }),
      })

      const contentType = res.headers.get('content-type') || ''
      const data = contentType.includes('application/json')
        ? await res.json()
        : await res.text()

      if (res.status === 409) {
        setVacationModalOpen(false)

        setConflictModal({
          title: 'Vacation will cancel some bookings',
          reason: data?.reason || vacationForm.reason || 'Barber vacation added by owner',
          conflicts: data?.conflicts || [],
          onConfirm: async () => {
            setConflictModal(null)
            await handleVacationSubmit(
              true,
              data?.reason || vacationForm.reason || 'Barber vacation added by owner'
            )
          },
        })
        return
      }

      if (!res.ok) {
        throw new Error(typeof data === 'string' ? data : 'Failed to add vacation')
      }

      const updated = {
        ...data,
        workingStartTime: normalizeTime(data.workingStartTime),
        workingEndTime: normalizeTime(data.workingEndTime),
        lunchStart: normalizeTime(data.lunchStart),
        lunchEnd: normalizeTime(data.lunchEnd),
        weeklyOffDays: data.weeklyOffDays || [],
        leaves: normalizeLeaves(data.leaves || []),
        temporaryInactiveSlots: normalizeTemporaryInactiveSlots(
          data.temporaryInactiveSlots || []
        ),
      }

      setBarbers((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
      setSelectedBarber(updated)
      setForm(updated)
      setOriginalForm(updated)

      setVacationModalOpen(false)
      setVacationForm({
        startDate: '',
        endDate: '',
        reason: '',
      })

      toast.success('Vacation added successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to add vacation')
    } finally {
      setVacationLoading(false)
    }
  }

  const handleAddBarber = async () => {
    const salonToUse = selectedSalonId
    const salon = salons.find((s) => s.sid === salonToUse)

    if (!salonToUse) {
      toast.error('Please select salon')
      return
    }

    const validationError = validateBarberForm(form, salon)
    if (validationError) {
      toast.error(validationError)
      return
    }

    try {
      const payload = buildBarberPayload(form)

      const res = await fetch(`${BASE_URL}/api/barber/add/${salonToUse}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const contentType = res.headers.get('content-type') || ''
      const data = contentType.includes('application/json')
        ? await res.json()
        : await res.text()

      if (!res.ok) {
        throw new Error(typeof data === 'string' ? data : 'Failed to create barber')
      }

      const newBarber = {
        ...data,
        workingStartTime: normalizeTime(data.workingStartTime),
        workingEndTime: normalizeTime(data.workingEndTime),
        lunchStart: normalizeTime(data.lunchStart),
        lunchEnd: normalizeTime(data.lunchEnd),
        weeklyOffDays: data.weeklyOffDays || [],
        leaves: normalizeLeaves(data.leaves || []),
        temporaryInactiveSlots: normalizeTemporaryInactiveSlots(
          data.temporaryInactiveSlots || []
        ),
      }

      localStorage.setItem('salonId', salonToUse)
      setSelectedSalonId(salonToUse)

      setBarbers((prev) => [...prev, newBarber])
      setSelectedBarber(newBarber)
      setForm(newBarber)
      setOriginalForm(newBarber)
      setShowPopup(false)

      toast.success('Barber created successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to create barber')
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
          active: !!form.active,
          name: form.name || '',
          workingStartTime: normalizeTime(form.workingStartTime),
          workingEndTime: normalizeTime(form.workingEndTime),
          lunchStart: normalizeTime(form.lunchStart),
          lunchEnd: normalizeTime(form.lunchEnd),
          weeklyOffDays: [...(form.weeklyOffDays || [])].sort(),
          leaves: normalizeLeaves(form.leaves || []),
        }) !==
        JSON.stringify({
          active: !!originalForm.active,
          name: originalForm.name || '',
          workingStartTime: normalizeTime(originalForm.workingStartTime),
          workingEndTime: normalizeTime(originalForm.workingEndTime),
          lunchStart: normalizeTime(originalForm.lunchStart),
          lunchEnd: normalizeTime(originalForm.lunchEnd),
          weeklyOffDays: [...(originalForm.weeklyOffDays || [])].sort(),
          leaves: normalizeLeaves(originalForm.leaves || []),
        })
      : false

  const showInactive =
    !selectedBarber?.active || hasScheduledTemporaryInactive(selectedBarber, nowMs)

  return (
    <OwnerLayout>
      <div className='max-w-7xl mx-auto py-4 animate-fadeIn'>
        <div className='mb-6'>
          <h1 className='text-2xl sm:text-[28px] font-bold text-gray-950 tracking-tight'>
            Manage Barbers
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Manage barber schedules, weekly offs, leaves, working hours, and vacations.
          </p>
        </div>

        <div className='flex flex-col xl:flex-row gap-5 sm:gap-6'>
          <div className='xl:w-[360px] bg-white rounded-3xl border border-gray-200 shadow-sm p-5 animate-slideUp'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-gray-950'>Barber List</h2>
              <span className='text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600'>
                {barbers.length} Total
              </span>
            </div>

            <div className='mb-4'>
              <label className='block text-sm font-medium mb-2 text-gray-800'>
                Select Salon
              </label>

              <select
                value={selectedSalonId || ''}
                onChange={(e) => {
                  const sid = e.target.value
                  setSelectedSalonId(sid)
                  localStorage.setItem('salonId', sid)
                }}
                className='w-full border border-gray-200 px-4 py-3 rounded-2xl bg-white outline-none focus:border-gray-400 transition-all duration-300'
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
                  workingStartTime: normalizeTime(selectedSalon?.opentime) || '',
                  workingEndTime: normalizeTime(selectedSalon?.closetime) || '',
                  lunchStart: '',
                  lunchEnd: '',
                  weeklyOffDays: [],
                  leaves: [],
                  active: true,
                  temporaryInactiveSlots: [],
                })
                setShowPopup(true)
              }}
              disabled={!selectedSalonId}
              className={`w-full text-white py-3 rounded-2xl mb-4 transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-sm ${
                selectedSalonId
                  ? 'bg-black hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-md'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus size={18} />
              Add Barber
            </button>

            <div className='space-y-3 max-h-[620px] overflow-y-auto pr-1'>
              {barbers.length > 0 ? (
                barbers.map((barber, index) => {
                  const barberShowInactive =
                    !barber.active || hasScheduledTemporaryInactive(barber, nowMs)

                  return (
                    <div
                      key={barber.id}
                      onClick={() => handleSelect(barber)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                        selectedBarber?.id === barber.id
                          ? 'bg-black text-white border-black shadow-md'
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                      }`}
                      style={{ animationDelay: `${index * 40}ms` }}
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
                              className={`p-1 rounded-md transition shrink-0 ${
                                selectedBarber?.id === barber.id
                                  ? 'hover:bg-white/20 text-white'
                                  : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                              } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <Trash2 className='w-4 h-4' />
                            </button>
                          </div>

                          <p
                            className={`text-sm mt-1 ${
                              selectedBarber?.id === barber.id
                                ? 'text-white/90'
                                : 'text-gray-600'
                            }`}
                          >
                            {barber.weeklyOffDays?.length || 0} Weekly Off |{' '}
                            {barber.leaves?.length || 0} Leaves
                          </p>
                        </div>

                        <span className='text-sm shrink-0'>
                          {barberShowInactive ? 'Inactive' : 'Active'}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className='rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500'>
                  No barbers found for this salon
                </div>
              )}
            </div>
          </div>

          {form && (
            <div className='flex-1 bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-6 animate-slideUp-delayed'>
              <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6'>
                <div>
                  <h2 className='text-xl sm:text-2xl font-bold text-gray-950'>
                    Barber Details & Schedule
                  </h2>
                  <p className='text-sm text-gray-500 mt-1'>
                    Update status, schedule, weekly offs, leave dates, and vacations.
                  </p>
                </div>

                {selectedBarber?.name && (
                  <div className='inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600'>
                    Selected: <span className='font-semibold ml-1'>{selectedBarber.name}</span>
                  </div>
                )}
              </div>

              <div className='mb-6'>
                <div className='flex items-center gap-4 mb-4 flex-wrap'>
                  <label className='font-medium text-lg text-gray-900'>Status</label>

                  <button
                    type='button'
                    onClick={() => {
                      if (showInactive) {
                        cancelTemporaryInactive()
                        return
                      }

                      setTempInactiveForm({
                        date: '',
                        startTime: '',
                        endTime: '',
                        reason: '',
                      })
                      setTempInactiveModalOpen(true)
                    }}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ${
                      showInactive ? 'bg-gray-300' : 'bg-green-500'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                        showInactive ? 'translate-x-1' : 'translate-x-8'
                      }`}
                    />
                  </button>

                  <span
                    className={`font-medium ${showInactive ? 'text-gray-500' : 'text-green-600'}`}
                  >
                    {showInactive ? 'Inactive' : 'Active'}
                  </span>

                  {selectedBarber?.id && (
                    <button
                      type='button'
                      onClick={() => {
                        setVacationForm({
                          startDate: '',
                          endDate: '',
                          reason: '',
                        })
                        setVacationModalOpen(true)
                      }}
                      className='inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 text-sm hover:bg-gray-50'
                    >
                      <Plane size={16} />
                      Add Vacation
                    </button>
                  )}
                </div>
              </div>

              <div className='mb-6'>
                <label className='block mb-2 text-sm font-medium text-gray-800'>
                  Barber Name
                </label>
                <input
                  type='text'
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className='w-full border border-gray-200 px-4 py-3 rounded-2xl outline-none focus:border-gray-400 transition-all duration-300'
                  placeholder='Enter barber name'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mb-6'>
                <TimeField
                  label='Start Time'
                  value={form.workingStartTime}
                  onChange={(e) =>
                    setForm({ ...form, workingStartTime: e.target.value })
                  }
                />
                <TimeField
                  label='End Time'
                  value={form.workingEndTime}
                  onChange={(e) =>
                    setForm({ ...form, workingEndTime: e.target.value })
                  }
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mb-6'>
                <TimeField
                  label='Lunch Start'
                  value={form.lunchStart}
                  onChange={(e) =>
                    setForm({ ...form, lunchStart: e.target.value })
                  }
                />
                <TimeField
                  label='Lunch End'
                  value={form.lunchEnd}
                  onChange={(e) =>
                    setForm({ ...form, lunchEnd: e.target.value })
                  }
                />
              </div>

              <div className='mb-6'>
                <label className='font-medium block mb-3 text-gray-900'>
                  Weekly Off Days
                </label>
                <div className='flex gap-3 flex-wrap'>
                  {weekDays.map((day) => (
                    <label
                      key={day.value}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all duration-300 ${
                        form.weeklyOffDays?.includes(day.value)
                          ? 'bg-black text-white border-black'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type='checkbox'
                        checked={form.weeklyOffDays?.includes(day.value)}
                        onChange={(e) => {
                          const currentDays = form.weeklyOffDays || []
                          const updated = e.target.checked
                            ? [...currentDays, day.value]
                            : currentDays.filter((d) => d !== day.value)
                          setForm({ ...form, weeklyOffDays: updated })
                        }}
                        className='hidden'
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className='mb-6'>
                <label className='font-medium block mb-3 text-gray-900'>
                  Leave Dates
                </label>

                {form.leaves?.length > 0 ? (
                  <div className='space-y-3'>
                    {form.leaves.map((date, index) => (
                      <div
                        key={index}
                        className='flex gap-2 items-center rounded-2xl border border-gray-200 bg-gray-50 p-3 animate-fadeIn'
                      >
                        <input
                          type='date'
                          min={todayDateString()}
                          value={date}
                          onChange={(e) => {
                            const updated = [...(form.leaves || [])]
                            updated[index] = e.target.value
                            setForm({ ...form, leaves: updated })
                          }}
                          className='border border-gray-200 px-3 py-2 rounded-xl w-full bg-white outline-none focus:border-gray-400'
                        />
                        <button
                          onClick={() => {
                            const updated = (form.leaves || []).filter((_, i) => i !== index)
                            setForm({ ...form, leaves: updated })
                          }}
                          className='text-red-500 hover:text-red-600 px-2'
                        >
                          🗑
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500'>
                    No leave dates added
                  </div>
                )}

                <button
                  onClick={() =>
                    setForm({ ...form, leaves: [...(form.leaves || []), ''] })
                  }
                  className='mt-3 text-sm text-black font-medium hover:underline'
                >
                  + Add Date
                </button>
              </div>

              <button
                onClick={() => handleSave()}
                disabled={isSaving || !hasChanges}
                className={`px-6 py-3 rounded-2xl transition-all duration-300 text-white font-medium ${
                  isSaving || !hasChanges
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-black hover:bg-gray-800 hover:-translate-y-0.5 shadow-sm hover:shadow-md'
                }`}
              >
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {deleteModalOpen && (
          <div className='fixed inset-0 bg-black/25 backdrop-blur-[2px] flex items-center justify-center z-[60] p-4 animate-fadeIn'>
            <div className='bg-white p-6 rounded-3xl shadow-lg w-full max-w-md animate-scaleIn'>
              <h2 className='text-2xl font-bold mb-4 text-gray-950'>Confirm Delete</h2>
              <p className='mb-6 text-gray-600 leading-7'>
                Are you sure you want to delete <strong>{barberToDelete?.name}</strong>?
              </p>

              <div className='flex justify-end gap-3'>
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className='px-5 py-2.5 border border-gray-200 rounded-2xl hover:bg-gray-50 transition'
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className={`px-5 py-2.5 text-white rounded-2xl transition ${
                    isDeleting
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

        {conflictModal && (
          <div className='fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-[70] p-4 animate-fadeIn'>
            <div className='bg-white w-full max-w-2xl rounded-3xl p-6 shadow-xl animate-scaleIn'>
              <h2 className='text-2xl font-bold text-gray-950 mb-3'>{conflictModal.title}</h2>
              <p className='text-sm text-gray-600 mb-4'>
                These bookings will be cancelled if you continue.
              </p>

              <div className='rounded-2xl border border-gray-200 max-h-72 overflow-y-auto'>
                {conflictModal.conflicts?.length > 0 ? (
                  conflictModal.conflicts.map((item) => (
                    <div
                      key={item.bookingId}
                      className='p-4 border-b border-gray-100 last:border-b-0'
                    >
                      <div className='font-semibold text-gray-900'>
                        {item.customerName || 'Customer'}
                      </div>
                      <div className='text-sm text-gray-600 mt-1'>
                        {item.bookingDate} | {formatTime12Hour(item.startTime)} - {formatTime12Hour(item.endTime)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='p-4 text-sm text-gray-500'>No conflict details found</div>
                )}
              </div>

              <div className='flex justify-end gap-3 mt-5'>
                <button
                  onClick={() => setConflictModal(null)}
                  className='px-5 py-2.5 border border-gray-200 rounded-2xl hover:bg-gray-50 transition'
                >
                  Close
                </button>

                <button
                  onClick={conflictModal.onConfirm}
                  className='px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl transition'
                >
                  Cancel Bookings & Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {tempInactiveModalOpen && (
          <div className='fixed inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-[60] p-4 animate-fadeIn'>
            <div className='bg-white w-full max-w-lg rounded-3xl p-6 shadow-xl animate-scaleIn'>
              <h2 className='text-2xl font-bold text-gray-950 mb-2'>Temporary Inactive</h2>
              <p className='text-sm text-gray-600 mb-5'>
                Select the time range during which this barber will be unavailable.
              </p>

              <div className='space-y-4'>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-800'>Date</label>
                  <input
                    type='date'
                    min={todayDateString()}
                    value={tempInactiveForm.date}
                    onChange={(e) =>
                      setTempInactiveForm({ ...tempInactiveForm, date: e.target.value })
                    }
                    className='w-full border border-gray-200 px-4 py-3 rounded-2xl outline-none focus:border-gray-400'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block mb-2 text-sm font-medium text-gray-800'>Start Time</label>
                    <input
                      type='time'
                      value={tempInactiveForm.startTime}
                      onChange={(e) =>
                        setTempInactiveForm({ ...tempInactiveForm, startTime: e.target.value })
                      }
                      className='w-full border border-gray-200 px-4 py-3 rounded-2xl outline-none focus:border-gray-400'
                    />
                    {tempInactiveForm.startTime ? (
                      <p className='text-xs text-gray-500 mt-2'>
                        {formatTime12Hour(tempInactiveForm.startTime)}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className='block mb-2 text-sm font-medium text-gray-800'>End Time</label>
                    <input
                      type='time'
                      value={tempInactiveForm.endTime}
                      onChange={(e) =>
                        setTempInactiveForm({ ...tempInactiveForm, endTime: e.target.value })
                      }
                      className='w-full border border-gray-200 px-4 py-3 rounded-2xl outline-none focus:border-gray-400'
                    />
                    {tempInactiveForm.endTime ? (
                      <p className='text-xs text-gray-500 mt-2'>
                        {formatTime12Hour(tempInactiveForm.endTime)}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-800'>Reason</label>
                  <textarea
                    rows='3'
                    value={tempInactiveForm.reason}
                    onChange={(e) =>
                      setTempInactiveForm({ ...tempInactiveForm, reason: e.target.value })
                    }
                    placeholder='Reason for temporary inactivity'
                    className='w-full border border-gray-200 px-4 py-3 rounded-2xl resize-none outline-none focus:border-gray-400'
                  />
                </div>
              </div>

              <div className='flex justify-end gap-3 mt-6'>
                <button
                  onClick={() => {
                    setTempInactiveModalOpen(false)
                    setTempInactiveForm({
                      date: '',
                      startTime: '',
                      endTime: '',
                      reason: '',
                    })
                  }}
                  className='px-5 py-2.5 border border-gray-200 rounded-2xl hover:bg-gray-50 transition'
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleTemporaryInactive()}
                  disabled={tempInactiveLoading}
                  className={`px-5 py-2.5 text-white rounded-2xl transition ${
                    tempInactiveLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-black hover:bg-gray-800'
                  }`}
                >
                  {tempInactiveLoading ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {vacationModalOpen && (
          <div className='fixed inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-[60] p-4 animate-fadeIn'>
            <div className='bg-white w-full max-w-lg rounded-3xl p-6 shadow-xl animate-scaleIn'>
              <h2 className='text-2xl font-bold text-gray-950 mb-2'>Add Vacation</h2>
              <p className='text-sm text-gray-600 mb-5'>
                Select a date range for barber vacation.
              </p>

              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block mb-2 text-sm font-medium text-gray-800'>Start Date</label>
                    <input
                      type='date'
                      min={todayDateString()}
                      value={vacationForm.startDate}
                      onChange={(e) =>
                        setVacationForm({ ...vacationForm, startDate: e.target.value })
                      }
                      className='w-full border border-gray-200 px-4 py-3 rounded-2xl outline-none focus:border-gray-400'
                    />
                  </div>

                  <div>
                    <label className='block mb-2 text-sm font-medium text-gray-800'>End Date</label>
                    <input
                      type='date'
                      min={vacationForm.startDate || todayDateString()}
                      value={vacationForm.endDate}
                      onChange={(e) =>
                        setVacationForm({ ...vacationForm, endDate: e.target.value })
                      }
                      className='w-full border border-gray-200 px-4 py-3 rounded-2xl outline-none focus:border-gray-400'
                    />
                  </div>
                </div>

                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-800'>Reason</label>
                  <textarea
                    rows='3'
                    value={vacationForm.reason}
                    onChange={(e) =>
                      setVacationForm({ ...vacationForm, reason: e.target.value })
                    }
                    placeholder='Reason for vacation'
                    className='w-full border border-gray-200 px-4 py-3 rounded-2xl resize-none outline-none focus:border-gray-400'
                  />
                </div>
              </div>

              <div className='flex justify-end gap-3 mt-6'>
                <button
                  onClick={() => {
                    setVacationModalOpen(false)
                    setVacationForm({
                      startDate: '',
                      endDate: '',
                      reason: '',
                    })
                  }}
                  className='px-5 py-2.5 border border-gray-200 rounded-2xl hover:bg-gray-50 transition'
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleVacationSubmit()}
                  disabled={vacationLoading}
                  className={`px-5 py-2.5 text-white rounded-2xl transition ${
                    vacationLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-black hover:bg-gray-800'
                  }`}
                >
                  {vacationLoading ? 'Saving...' : 'Add Vacation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showPopup && (
          <div className='fixed inset-0 bg-black/25 backdrop-blur-[2px] flex items-center justify-center z-[60] p-4 animate-fadeIn'>
            <div className='bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 relative animate-scaleIn max-h-[92vh] overflow-y-auto'>
              <h2 className='text-2xl font-bold mb-1 text-gray-950'>Add New Barber</h2>
              <p className='text-sm text-gray-500 mb-6'>
                Fill barber details, working hours, weekly offs, and leave dates.
              </p>

              <div className='mb-4'>
                <label className='block mb-2 text-sm font-medium text-gray-800'>
                  Barber Name *
                </label>
                <input
                  type='text'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className='w-full border border-gray-200 px-4 py-3 rounded-2xl outline-none focus:border-gray-400 transition-all duration-300'
                  placeholder='Enter barber name'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                <TimeField
                  label='Start Time *'
                  value={form.workingStartTime}
                  onChange={(e) =>
                    setForm({ ...form, workingStartTime: e.target.value })
                  }
                />
                <TimeField
                  label='End Time *'
                  value={form.workingEndTime}
                  onChange={(e) =>
                    setForm({ ...form, workingEndTime: e.target.value })
                  }
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                <TimeField
                  label='Lunch Start'
                  value={form.lunchStart}
                  onChange={(e) =>
                    setForm({ ...form, lunchStart: e.target.value })
                  }
                />
                <TimeField
                  label='Lunch End'
                  value={form.lunchEnd}
                  onChange={(e) =>
                    setForm({ ...form, lunchEnd: e.target.value })
                  }
                />
              </div>

              <div className='mb-4'>
                <label className='block mb-3 text-sm font-medium text-gray-800'>
                  Weekly Off Days
                </label>
                <div className='flex gap-3 flex-wrap'>
                  {weekDays.map((day) => (
                    <label
                      key={day.value}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all duration-300 ${
                        form.weeklyOffDays?.includes(day.value)
                          ? 'bg-black text-white border-black'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type='checkbox'
                        checked={form.weeklyOffDays?.includes(day.value)}
                        onChange={(e) => {
                          const currentDays = form.weeklyOffDays || []
                          const updated = e.target.checked
                            ? [...currentDays, day.value]
                            : currentDays.filter((d) => d !== day.value)

                          setForm({ ...form, weeklyOffDays: updated })
                        }}
                        className='hidden'
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className='mb-6'>
                <label className='block mb-3 text-sm font-medium text-gray-800'>
                  Leave Dates
                </label>

                {form.leaves?.map((date, index) => (
                  <div
                    key={index}
                    className='flex gap-2 mb-3 items-center rounded-2xl border border-gray-200 bg-gray-50 p-3 animate-fadeIn'
                  >
                    <input
                      type='date'
                      min={todayDateString()}
                      value={date}
                      onChange={(e) => {
                        const updated = [...(form.leaves || [])]
                        updated[index] = e.target.value
                        setForm({ ...form, leaves: updated })
                      }}
                      className='border border-gray-200 px-3 py-2 rounded-xl w-full bg-white outline-none focus:border-gray-400'
                    />
                    <button
                      onClick={() => {
                        const updated = (form.leaves || []).filter((_, i) => i !== index)
                        setForm({ ...form, leaves: updated })
                      }}
                      className='text-red-500 px-2'
                    >
                      🗑
                    </button>
                  </div>
                ))}

                <button
                  onClick={() =>
                    setForm({ ...form, leaves: [...(form.leaves || []), ''] })
                  }
                  className='text-sm text-black font-medium hover:underline'
                >
                  + Add Date
                </button>
              </div>

              <div className='flex justify-end gap-3'>
                <button
                  onClick={() => {
                    setShowPopup(false)
                    setForm(selectedBarber ? { ...selectedBarber } : null)
                  }}
                  className='px-5 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 transition'
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleAddBarber()}
                  className='px-5 py-3 bg-black hover:bg-gray-800 hover:-translate-y-0.5 text-white rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md'
                >
                  Create Barber
                </button>
              </div>
            </div>
          </div>
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
    </OwnerLayout>
  )
}

function TimeField({ label, value, onChange }) {
  return (
    <div>
      <label className='block mb-2 text-sm font-medium text-gray-800'>{label}</label>
      <input
        type='time'
        value={value || ''}
        onChange={onChange}
        className='w-full border border-gray-200 px-4 py-3 rounded-2xl outline-none focus:border-gray-400 transition-all duration-300'
      />
      {value ? (
        <p className='text-xs text-gray-500 mt-2'>{formatTime12Hour(value)}</p>
      ) : null}
    </div>
  )
}