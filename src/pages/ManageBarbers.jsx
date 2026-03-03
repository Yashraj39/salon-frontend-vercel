import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

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
  const salonId = '69a670e8ce7c264014a7b456'

  const [barbers, setBarbers] = useState([])
  const [selectedBarber, setSelectedBarber] = useState(null)
  const [form, setForm] = useState(null)
  const [showPopup, setShowPopup] = useState(false)

  // ================= LOAD BARBERS =================
  useEffect(() => {
    fetch(`${BASE_URL}/api/barber/salon/${salonId}`)
      .then((res) => res.json())
      .then((data) => {
        setBarbers(data)
        if (data.length > 0) {
          setSelectedBarber(data[0])
          setForm(data[0])
        }
      })
      .catch(() => toast.error('Failed to load barbers'))
  }, [])

  // ================= SELECT BARBER =================
  const handleSelect = (barber) => {
    setSelectedBarber(barber)
    setForm({ ...barber })
  }

  // ================= SAVE CHANGES =================
  const handleSave = async () => {
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

      if (!res.ok) throw new Error()

      const updated = await res.json()

      const updatedList = barbers.map((b) =>
        b.id === updated.id ? updated : b
      )

      setBarbers(updatedList)
      setSelectedBarber(updated)
      setForm(updated)
      toast.success('Barber updated successfully')
    } catch {
      toast.error('Update failed')
    }
  }

  // ================= ADD BARBER =================
 const handleAddBarber = async () => {
   if (!form.name || !form.workingStartTime || !form.workingEndTime) {
     toast.error('Please fill required fields')
     return
   }

   if (form.workingStartTime >= form.workingEndTime) {
     toast.error('Start time must be before end time')
     return
   }

   try {
     const res = await fetch(`${BASE_URL}/api/barber/add/${salonId}`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(form),
     })

     if (!res.ok) throw new Error()

     const newBarber = await res.json()

     setBarbers([...barbers, newBarber])
     setSelectedBarber(newBarber)
     setForm(newBarber)
     setShowPopup(false)

     toast.success('Barber created successfully')
   } catch {
     toast.error('Failed to create barber')
   }
 }

  // ================= UI =================
  return (
    <div className='min-h-screen bg-gray-100 p-6 flex flex-col lg:flex-row gap-6'>
      {/* LEFT PANEL */}
      <div className='lg:w-1/3 bg-white rounded-xl shadow p-5'>
        <h2 className='text-lg font-semibold mb-4'>Barber List</h2>

        <button
          onClick={() => {
            setForm({
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
          className='w-full bg-blue-600 text-white py-2 rounded-lg mb-4'
        >
          + Add Barber
        </button>

        {barbers.map((barber) => (
          <div
            key={barber.id}
            onClick={() => handleSelect(barber)}
            className={`p-4 mb-3 rounded-lg border cursor-pointer ${
              selectedBarber?.id === barber.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-50'
            }`}
          >
            <div className='flex justify-between'>
              <span className='font-medium'>{barber.name}</span>
              <span className='text-sm'>
                {barber.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className='text-sm mt-1'>
              {barber.weeklyOffDays?.length || 0} Weekly Off |{' '}
              {barber.leaves?.length || 0} Leaves
            </p>
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      {form && (
        <div className='lg:w-2/3 bg-white rounded-xl shadow p-6'>
          <h2 className='text-xl font-bold mb-6'>Barber Details & Schedule</h2>

          {/* Status */}
          <div className='mb-6'>
           
            <div className='flex items-center gap-4 mb-6'>
              <label className='font-medium text-lg'>Status</label>

              <button
                type='button'
                onClick={() => setForm({ ...form, active: !form.active })}
                className={`relative inline-flex h-6 w-14 items-center rounded-full transition-colors duration-300 ${
                  form.active ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                    form.active ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>

              <span
                className={`font-medium ${
                  form.active ? 'text-green-600' : 'text-gray-500'
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
                onChange={(e) => setForm({ ...form, lunchEnd: e.target.value })}
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
              onClick={() => setForm({ ...form, leaves: [...form.leaves, ''] })}
              className='text-blue-600 text-sm'
            >
              + Add Date
            </button>
          </div>

          <button
            onClick={handleSave}
            className='bg-green-600 text-white px-6 py-2 rounded-lg'
          >
            Save Changes
          </button>
        </div>
      )}

      {/* POPUP */}
      {showPopup && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50'>
          <div className='bg-white w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl'>
            {/* HEADER */}
            <div className='flex justify-between items-center px-6 py-4 border-b bg-gray-50'>
              <h2 className='text-xl font-semibold'>✂ Add New Barber</h2>
              <button
                onClick={() => setShowPopup(false)}
                className='text-gray-500 hover:text-black text-xl'
              >
                ✕
              </button>
            </div>

            <div className='p-6 space-y-6'>
              {/* NAME */}
              <div>
                <label className='block mb-2 font-medium'>Name</label>
                <input
                  type='text'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className='w-full border p-3 rounded-lg'
                  placeholder='Enter barber name'
                />
              </div>

              {/* WORKING HOURS */}
              <div>
                <h3 className='font-semibold mb-3'>Working Hours</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block mb-1 text-sm'>Start Time</label>
                    <input
                      type='time'
                      value={form.workingStartTime}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          workingStartTime: e.target.value,
                        })
                      }
                      className='w-full border p-3 rounded-lg'
                    />
                  </div>
                  <div>
                    <label className='block mb-1 text-sm'>End Time</label>
                    <input
                      type='time'
                      value={form.workingEndTime}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          workingEndTime: e.target.value,
                        })
                      }
                      className='w-full border p-3 rounded-lg'
                    />
                  </div>
                </div>
              </div>

              {/* LUNCH BREAK */}
              <div>
                <h3 className='font-semibold mb-3'>Lunch Break</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <input
                    type='time'
                    value={form.lunchStart}
                    onChange={(e) =>
                      setForm({ ...form, lunchStart: e.target.value })
                    }
                    className='w-full border p-3 rounded-lg'
                  />
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

              {/* WEEKLY OFF */}
              <div>
                <h3 className='font-semibold mb-3'>Weekly Off Days</h3>
                <div className='flex flex-wrap gap-4'>
                  {weekDays.map((day) => (
                    <label key={day.value} className='flex items-center gap-2'>
                      <input
                        type='checkbox'
                        checked={form.weeklyOffDays.includes(day.value)}
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

              {/* LEAVES */}
              <div>
                <h3 className='font-semibold mb-3'>Leaves</h3>

                {form.leaves.map((date, index) => (
                  <div key={index} className='flex gap-2 mb-2'>
                    <input
                      type='date'
                      value={date}
                      onChange={(e) => {
                        const updated = [...form.leaves]
                        updated[index] = e.target.value
                        setForm({ ...form, leaves: updated })
                      }}
                      className='border p-2 rounded-lg w-full'
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
                    setForm({
                      ...form,
                      leaves: [...form.leaves, ''],
                    })
                  }
                  className='text-blue-600 text-sm mt-2'
                >
                  + Add Date
                </button>
              </div>

              {/* INFO MESSAGE */}
              <div className='bg-yellow-50 text-sm p-3 rounded-lg'>
                You can edit weekly offs and leave dates later from the Manage
                Barbers page.
              </div>

              {/* BUTTONS */}
              <div className='flex justify-end gap-4 pt-4 border-t'>
                <button
                  onClick={() => setShowPopup(false)}
                  className='px-5 py-2 border rounded-lg'
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBarber}
                  className='px-6 py-2 bg-blue-600 text-white rounded-lg'
                >
                  Create Barber
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
