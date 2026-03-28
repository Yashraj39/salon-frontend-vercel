import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IoIosArrowDown,
  IoIosSearch,
  IoMdPin,
  IoMdCut,
} from 'react-icons/io'
import { FiArrowRight } from 'react-icons/fi'
import Navbar from '../componenets/Navbar'

const BASE_URL = 'https://render-qs89.onrender.com'

export default function Home() {
  const navigate = useNavigate()

  const [salons, setSalons] = useState([])
  const [filteredSalons, setFilteredSalons] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const [selectedCity, setSelectedCity] = useState('')
  const [selectedService, setSelectedService] = useState('')

  const [openCity, setOpenCity] = useState(true)
  const [openService, setOpenService] = useState(true)
  const [cities, setCities] = useState([])

  const fetchCities = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/city/owner/active`)
      if (!res.ok) throw new Error()

      const data = await res.json()
      setCities(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setCities([])
    }
  }

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/salon/get-all-salon`)
        const data = await res.json()
        const salonsData = Array.isArray(data) ? data : []
        setSalons(salonsData)
        setFilteredSalons(salonsData)
      } catch (err) {
        console.error(err)
        setSalons([])
        setFilteredSalons([])
      } finally {
        setLoading(false)
      }
    }

    fetchSalons()
    fetchCities()
  }, [])

  useEffect(() => {
    let result = [...salons]

    if (search.trim()) {
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(search.toLowerCase()) ||
          s.city?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (selectedCity) {
      result = result.filter((s) => s.city === selectedCity)
    }

    if (selectedService) {
      result = result.filter((s) => s.services?.includes(selectedService))
    }

    setFilteredSalons(result)
  }, [search, selectedCity, selectedService, salons])

  const cityOptions = useMemo(() => {
    return cities.map((city) => city.name).filter(Boolean)
  }, [cities])

  const serviceOptions = useMemo(() => {
    const allServices = salons.flatMap((s) =>
      Array.isArray(s.services) ? s.services : []
    )

    const uniqueServices = allServices.filter(
      (service, index, arr) => arr.indexOf(service) === index
    )

    return uniqueServices.length > 0
      ? uniqueServices
      : ['Haircut', 'Hair Coloring', 'Pedicure', 'Facial', 'Massage']
  }, [salons])

  const clearFilters = () => {
    setSearch('')
    setSearchInput('')
    setSelectedCity('')
    setSelectedService('')
  }

  return (
    <div className='min-h-screen bg-[#f8fafc] text-slate-900 animate-[fadeIn_.35s_ease]'>
      <Navbar />

      <section className='relative overflow-hidden border-b border-slate-200 bg-white pb-6'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.06),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_30%)]' />

        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4'>
          <div className='max-w-3xl mx-auto text-center'>

            <h1 className=' text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight'>
              Discover top salons and book your next appointment instantly
            </h1>

            <p className='mt-5 text-sm sm:text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-7'>
              Explore trusted salons for hair, beauty, spa, and grooming
              services. Compare options, view services, and book in just a few
              clicks.
            </p>

            <div className='mt-6 max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_10px_30px_rgba(15,23,42,0.08)]'>
              <div className='flex flex-col sm:flex-row gap-2'>
                <div className='relative flex-1'>
                  <IoIosSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400' />
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setSearch(searchInput)
                    }}
                    placeholder='Search by salon name or city'
                    className='h-12 w-full rounded-xl border border-transparent bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white'
                  />
                </div>

                <button
                  onClick={() => setSearch(searchInput)}
                  className='h-12 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]'
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10'>
        <div className='flex flex-col lg:flex-row gap-6 xl:gap-8'>
          <aside className='w-full lg:w-[290px] shrink-0'>
            <div className='sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)]'>
              <div className='flex items-center justify-between mb-5'>
                <div>
                  <h2 className='text-lg font-semibold text-slate-900'>
                    Filters
                  </h2>
                  <p className='text-sm text-slate-500 mt-1'>
                    Refine salon results
                  </p>
                </div>

                <button
                  onClick={clearFilters}
                  className='text-sm font-medium text-slate-500 transition hover:text-slate-900'
                >
                  Clear
                </button>
              </div>

              <div>
                <button
                  onClick={() => setOpenCity(!openCity)}
                  className='flex w-full items-center justify-between rounded-xl px-1 py-2 text-left'
                >
                  <div className='flex items-center gap-2'>
                    <IoMdPin className='text-slate-500' />
                    <span className='font-semibold text-slate-900'>
                      Search by City
                    </span>
                  </div>

                  <IoIosArrowDown
                    className={`text-slate-500 transition-transform duration-300 ${openCity ? 'rotate-180' : 'rotate-0'
                      }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${openCity ? 'max-h-80 opacity-100 mt-3' : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className='space-y-2'>
                    {cityOptions.map((city) => (
                      <label
                        key={city}
                        className='flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50'
                      >
                        <input
                          type='checkbox'
                          checked={selectedCity === city}
                          onChange={() =>
                            setSelectedCity((prev) => (prev === city ? '' : city))
                          }
                          className='h-4 w-4 rounded border-slate-300 accent-black'
                        />
                        <span>{city}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className='my-5 border-t border-slate-200' />

              <div>
                <button
                  onClick={() => setOpenService(!openService)}
                  className='flex w-full items-center justify-between rounded-xl px-1 py-2 text-left'
                >
                  <div className='flex items-center gap-2'>
                    <IoMdCut className='text-slate-500' />
                    <span className='font-semibold text-slate-900'>
                      Search by Service
                    </span>
                  </div>

                  <IoIosArrowDown
                    className={`text-slate-500 transition-transform duration-300 ${openService ? 'rotate-180' : 'rotate-0'
                      }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${openService
                    ? 'max-h-[420px] opacity-100 mt-3'
                    : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className='space-y-2'>
                    {serviceOptions.map((service) => (
                      <label
                        key={service}
                        className='flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50'
                      >
                        <input
                          type='checkbox'
                          checked={selectedService === service}
                          onChange={() =>
                            setSelectedService((prev) =>
                              prev === service ? '' : service
                            )
                          }
                          className='h-4 w-4 rounded border-slate-300 accent-black'
                        />
                        <span>{service}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className='flex-1 min-w-0'>
            <div className='mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
              {!loading && (search || selectedCity || selectedService) && (
                <div className='flex flex-wrap gap-2'>
                  {search && (
                    <span className='rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700'>
                      Search: {search}
                    </span>
                  )}
                  {selectedCity && (
                    <span className='rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700'>
                      City: {selectedCity}
                    </span>
                  )}
                  {selectedService && (
                    <span className='rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700'>
                      Service: {selectedService}
                    </span>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className='overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm'
                  >
                    <div className='h-48 animate-pulse bg-slate-200' />
                    <div className='p-5'>
                      <div className='h-5 w-2/3 rounded bg-slate-200 animate-pulse' />
                      <div className='mt-3 h-4 w-1/3 rounded bg-slate-100 animate-pulse' />
                      <div className='mt-4 flex gap-2 flex-wrap'>
                        <div className='h-6 w-16 rounded-full bg-slate-100 animate-pulse' />
                        <div className='h-6 w-20 rounded-full bg-slate-100 animate-pulse' />
                        <div className='h-6 w-14 rounded-full bg-slate-100 animate-pulse' />
                      </div>
                      <div className='mt-6 h-11 rounded-xl bg-slate-200 animate-pulse' />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredSalons.length === 0 ? (
              <div className='rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm'>
                <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl'>
                  ✂️
                </div>
                <h3 className='mt-5 text-2xl font-semibold text-slate-900'>
                  No salons found
                </h3>
                <p className='mt-2 text-slate-500 max-w-md mx-auto'>
                  Try changing your search, city, or service filter to discover
                  more salons near you.
                </p>
                <button
                  onClick={clearFilters}
                  className='mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800'
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                {filteredSalons.map((salon, index) => (
                  <article
                    key={salon.salonId || index}
                    className='group rounded-3xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)] overflow-hidden'
                  >
                    <div className='relative overflow-hidden rounded-t-3xl'>
                      <img
                        src={
                          salon.imageUrl ||
                          'https://via.placeholder.com/600x400?text=Salon'
                        }
                        alt={salon.name || 'Salon'}
                        className='block h-52 w-full object-cover transform-gpu will-change-transform transition duration-500 group-hover:scale-105'
                        style={{ backfaceVisibility: 'hidden' }}
                      />

                      <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent pointer-events-none' />

                      <div className='absolute bottom-4 left-4'>
                        <span className='inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur-sm'>
                          {salon.city || 'City not available'}
                        </span>
                      </div>
                    </div>

                    <div className='p-5'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0'>
                          <h3 className='truncate text-lg font-semibold text-slate-900'>
                            {salon.name || 'Salon Name'}
                          </h3>
                          <p className='mt-1 text-sm text-slate-500 truncate'>
                            {salon.address || salon.city || 'Location unavailable'}
                          </p>
                        </div>
                      </div>

                      <div className='mt-4 min-h-[56px]'>
                        <div className='flex flex-wrap gap-2'>
                          {(salon.services || []).slice(0, 5).map((service, i) => (
                            <span
                              key={i}
                              className='rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700'
                            >
                              {service}
                            </span>
                          ))}

                          {(salon.services || []).length === 0 && (
                            <span className='text-sm text-slate-400'>
                              No services listed
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/salon-details/${salon.salonId}`)}
                        className='mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99]'
                      >
                        View Salon
                        <FiArrowRight className='text-base transition group-hover:translate-x-0.5' />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        </div>
      </section>

      <footer className='mt-14 border-t border-slate-200 bg-white'>
        <div className='max-w-[1600px] mx-auto px-6 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <img
              src="/logo.jpeg"
              alt="logo"
              className="h-8 w-8 rounded-xl object-cover"
            />
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
    </div>
  )
}