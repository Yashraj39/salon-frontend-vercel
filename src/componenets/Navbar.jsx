import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiBell, FiUser, FiMenu } from 'react-icons/fi'
import { FaShoppingCart } from 'react-icons/fa'
import React, { useEffect, useState, useRef } from 'react'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isLoggedIn = !!localStorage.getItem('user')

  const [totalPending, setTotalPending] = useState(0)
  const [navbarCart, setNavbarCart] = useState([])
  const [mobileMenu, setMobileMenu] = useState(false)
  const [showCartDropdown, setShowCartDropdown] = useState(false)

  const [showOwnerModal, setShowOwnerModal] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const user = JSON.parse(localStorage.getItem('user')) || {}
  const userId = user.userId

  const [showOwnerForm, setShowOwnerForm] = useState(false)

  const [uploadedUrl, setUploadedUrl] = useState(null)

  const [aadharFile, setAadharFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  const [showModal, setShowModal] = useState(false)

  const [ownerStatus, setOwnerStatus] = useState(null)

   const fetchNavbarCart = async () => {
     try {
       if (!userId) return

       const res = await fetch(
         `https://render-qs89.onrender.com/api/cart/navbar-cart?userId=${userId}`
       )

       if (!res.ok) return

       const cartData = await res.json()

       setNavbarCart(cartData)

       const total = cartData.reduce(
         (sum, item) => sum + (item.pendingCount || 0),
         0
       )

       setTotalPending(total)
     } catch (error) {
       console.error('Navbar cart error:', error)
     }
   }

   useEffect(() => {
     fetchNavbarCart()
   }, [userId])

  useEffect(() => {
  const interval = setInterval(async () => {
    if (!userId) return

    try {
      const res = await fetch(
        `https://render-qs89.onrender.com/api/owner/application?userId=${userId}`
      )
      if (!res.ok) return
      const data = await res.json()
      if (data?.status && data.status !== ownerStatus) {
        setOwnerStatus(data.status)
      }
    } catch (e) {
      console.error(e)
    }
  }, 5000) // every 5 seconds

  return () => clearInterval(interval)
}, [userId, ownerStatus])

   // Close dropdown when clicking outside (mobile)
   useEffect(() => {
     const handleClickOutside = () => {
       setShowCartDropdown(false)
     }

     if (showCartDropdown) {
       document.addEventListener('click', handleClickOutside)
     }

     return () => {
       document.removeEventListener('click', handleClickOutside)
     }
   }, [showCartDropdown])

const BASE_URL = 'https://render-qs89.onrender.com'
  
const handleOwnerApply = async () => {
  const storedUser = JSON.parse(localStorage.getItem('user'))
  const userId = storedUser?.userId // 👈 proper way

  if (!userId) {
    alert('User not logged in')
    return
  }

  if (!phone || !email || !aadharFile) {
    alert('Please fill all fields')
    return
  }

  try {
    setLoading(true)

    // 1️⃣ Upload Image
    const formData = new FormData()
    formData.append('file', aadharFile)

    const uploadRes = await fetch(`${BASE_URL}/api/upload/image`, {
      method: 'POST',
      body: formData,
    })

    if (!uploadRes.ok) {
      const err = await uploadRes.text()
      console.log('Upload Error:', err)
      alert('Image upload failed')
      return
    }

    const uploadData = await uploadRes.json()
    const imageUrl = uploadData.imageUrl

    // 2️⃣ Apply Owner
    const applyRes = await fetch(`${BASE_URL}/api/owner/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        phone,
        email,
        aadhaarUrl: imageUrl,
        termsAccepted: true,
      }),
    })

    if (!applyRes.ok) {
      const err = await applyRes.text()
      console.log('Apply API Error:', err)
      alert('Application failed')
      return
    }

    const applyData = await applyRes.json()
    console.log('Success:', applyData)

  alert('Application submitted successfully!')

    // Reset form
    setShowOwnerForm(false)
    setShowModal(true)  
    setPhone('')
    setEmail('')
    setAadharFile(null)
  } catch (error) {
    console.error('Unexpected Error:', error)
    alert('Something went wrong')
  } finally {
    setLoading(false)
  }
}
  return (
    <>
      <header className='w-full bg-white border-b  top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-14 py-4 flex items-center justify-between'>
          {/* LOGO */}
          <div
            onClick={() => navigate('/success')}
            className='flex items-center gap-2 font-semibold cursor-pointer'
          >
            <div className='h-7 w-7 bg-black rounded-md' />
            SlotMyStyle
          </div>

          {!isLoggedIn ? (
            <div className='flex items-center gap-4'>
              <Link
                to='/login'
                className='text-gray-700 hover:text-black text-sm sm:text-base'
              >
                Log in
              </Link>

              <Link
                to='/register'
                className='bg-black text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base'
              >
                Sign up
              </Link>
            </div>
          ) : (
            <>
              {/* DESKTOP MENU */}
              <div className='hidden md:flex items-center gap-8 text-sm'>
                <span
                  onClick={() => navigate('/success')}
                  className='border-b-2 border-black cursor-pointer'
                >
                  Home
                </span>

                <span
                  onClick={() => navigate('/bookings')}
                  className='cursor-pointer'
                >
                  My Bookings
                </span>
              </div>

              {/* RIGHT SIDE ICONS */}
              <div className='flex items-center gap-4 md:gap-6 relative'>
                <FiBell className='text-xl cursor-pointer hidden sm:block' />

                {/* CART */}
                <div
                  className='relative group cursor-pointer'
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaShoppingCart
                    className='text-xl cursor-pointer'
                    onClick={() => setShowCartDropdown(!showCartDropdown)}
                  />

                  {totalPending > 0 && (
                    <div className='absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce'>
                      {totalPending}
                    </div>
                  )}

                  {/* DROPDOWN */}
                  <div
                    className={`
    fixed md:absolute
    top-20 md:top-10
    left-1/2 md:left-auto
    -translate-x-1/2 md:translate-x-0
    md:right-0
    w-[95%] max-w-sm md:w-80
    bg-white shadow-2xl rounded-2xl p-5 z-50
    transition-all duration-300 ease-in-out
    ${
      showCartDropdown
        ? 'opacity-100 visible translate-y-0'
        : 'opacity-0 invisible translate-y-3'
    }
    md:opacity-0 md:invisible md:translate-y-3
    md:group-hover:opacity-100 md:group-hover:visible md:group-hover:translate-y-0
  `}
                  >
                    <h3 className='font-semibold text-lg mb-4'>
                      Pending Bookings
                    </h3>

                    {navbarCart.length === 0 ? (
                      <p className='text-gray-500 text-sm'>
                        No Pending Services
                      </p>
                    ) : (
                      navbarCart.map((item, idx) => (
                        <div
                          key={`${item.salonId}-${item.customerName}`}
                          onClick={() =>
                            navigate(`/add-services/${item.salonId}`, {
                              state: {
                                customerName: item.customerName || '',
                                bookedBy: user?.name || '',
                              },
                            })
                          }
                          className='flex justify-between items-center py-3 border-b hover:bg-gray-50 rounded-lg px-2 transition cursor-pointer'
                        >
                          <div>
                            <p className='text-lg font-medium '>
                              {item.customerName}
                            </p>

                            <p className='text-xs text-gray-500'>
                              {item.salonName}
                            </p>
                          </div>

                          <div className='bg-red-500 text-white text-xs w-7 h-7 rounded-full flex items-center justify-center'>
                            {item.pendingCount}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <FiUser
                  className='text-xl cursor-pointer'
                  onClick={() => navigate('/profile')}
                />

                {/* Become Owner Button + Hover Popup */}
                <div className='relative group hidden md:block'>
                  {ownerStatus === 'PENDING' ? (
                    <button className='border px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-200 text-red-600 cursor-not-allowed'>
                      Owner Pending
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowOwnerModal(true)}
                      className='border px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition'
                    >
                      Become an Owner!
                    </button>
                  )}

                  {/* HOVER POPUP (SAME AS BEFORE) */}
                  <div
                    className='
                      absolute right-0 mt-3 w-80
                      bg-white shadow-2xl rounded-2xl p-5 border
                      opacity-0 invisible translate-y-3
                      transition-all duration-300 ease-in-out
                      group-hover:opacity-100
                      group-hover:visible
                      group-hover:translate-y-0
                      z-50
                    '
                  >
                    <div className='flex items-start gap-3'>
                      <img
                        src='/lamp.png'
                        alt='Lamp'
                        className='w-20 h-20 object-contain'
                      />

                      <div>
                        <h3 className='font-semibold text-lg'>
                          Become an Owner!
                        </h3>

                        <p className='text-sm text-gray-500 mt-1'>
                          Own a salon? Switch to an owner account to manage your
                          salon easily!
                        </p>

                        <button
                          onClick={() => setShowOwnerModal(true)}
                          className='mt-4 w-full bg-[#0B132B] text-white py-2 rounded-lg font-medium hover:opacity-90 transition'
                        >
                          Become an Owner
                        </button>

                        <button
                          type='button'
                          onClick={() => {
                            setShowOwnerModal(false)
                            setAgreed(false) // checkbox reset karva mate (optional but better)
                          }}
                          className='text-center text-sm text-gray-500 mt-3  cursor-pointer hover:underline'
                        >
                          Maybe later
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <FiMenu
                  className='text-2xl md:hidden cursor-pointer'
                  onClick={() => setMobileMenu(!mobileMenu)}
                />

                <FiMenu
                  className='text-2xl md:hidden cursor-pointer'
                  onClick={() => setMobileMenu(!mobileMenu)}
                />
              </div>
            </>
          )}
        </div>

        {/* MOBILE MENU */}
        {mobileMenu && isLoggedIn && (
          <div className='md:hidden bg-white border-t px-6 py-4 space-y-4'>
            <div
              onClick={() => navigate('/success')}
              className='cursor-pointer'
            >
              Home
            </div>
            <div
              onClick={() => navigate('/bookings')}
              className='cursor-pointer'
            >
              My Bookings
            </div>
          </div>
        )}
      </header>

      {/* OWNER CONFIRMATION MODAL */}
      {showOwnerModal && (
        <div className='fixed inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-100 px-4'>
          <div className='bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative'>
            <button
              onClick={() => {
                setShowOwnerModal(false)
                setAgreed(false)
              }}
              className='absolute top-4 right-4 text-gray-500 hover:text-black text-xl'
            >
              ✕
            </button>

            <h2 className='text-2xl font-semibold text-center'>
              Become an Owner
            </h2>

            <p className='text-center text-gray-600 mt-2'>
              Please read and agree to the rules before applying.
            </p>

            <div className='mt-5 h-72 overflow-y-auto border rounded-lg p-4 text-sm text-gray-700 space-y-3'>
              <p>
                <strong>1. Eligibility:</strong> You must be the legal owner or
                authorized representative of the salon/business you are
                registering.
              </p>

              <p>
                <strong>2. Business Verification:</strong> You agree to provide
                valid government-issued ID proof and business registration
                documents for verification purposes.
              </p>

              <p>
                <strong>3. Accurate Information:</strong> All information
                submitted including salon name, address, contact details, and
                services must be accurate and up to date.
              </p>

              <p>
                <strong>4. Document Authenticity:</strong> Any fake, misleading,
                or altered documents may result in permanent account suspension.
              </p>

              <p>
                <strong>5. Service Responsibility:</strong> You are solely
                responsible for the services, pricing, staff behavior, and
                customer experience provided at your salon.
              </p>

              <p>
                <strong>6. Booking Management:</strong> You agree to manage
                bookings responsibly and avoid unnecessary cancellations.
              </p>

              <p>
                <strong>7. Payment Compliance:</strong> Any commissions or
                platform charges (if applicable) must be honored as per platform
                policy.
              </p>

              <p>
                <strong>8. Privacy Protection:</strong> Customer data must be
                handled securely and must not be misused or shared without
                consent.
              </p>

              <p>
                <strong>9. Content Guidelines:</strong> Uploaded salon images,
                descriptions, and promotions must not contain inappropriate,
                offensive, or misleading content.
              </p>

              <p>
                <strong>10. Approval Timeline:</strong> Verification may take up
                to 24–72 hours. During this period, your account may remain
                under review.
              </p>

              <p>
                <strong>11. Account Security:</strong> You are responsible for
                maintaining the confidentiality of your login credentials.
              </p>

              <p>
                <strong>12. Platform Rights:</strong> The platform reserves the
                right to suspend or terminate accounts violating policies.
              </p>

              <p>
                <strong>13. Refund & Dispute Policy:</strong> Any disputes with
                customers must be handled professionally and in accordance with
                platform guidelines.
              </p>

              <p>
                <strong>14. Compliance with Laws:</strong> You agree to operate
                your business in compliance with local, state, and national
                regulations.
              </p>

              <p>
                <strong>15. Updates to Terms:</strong> The platform may update
                these terms periodically. Continued use implies acceptance of
                updated policies.
              </p>
            </div>

            <div className='flex items-center gap-2 mt-4'>
              <input
                type='checkbox'
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
                className='w-4 h-4 accent-black'
              />
              <label className='text-sm'>
                I have read and agree to the rules
              </label>
            </div>

            <div className='flex justify-between mt-6 gap-4'>
              <button
                disabled={!agreed}
                onClick={() => {
                  if (agreed) {
                    setShowOwnerModal(false) // close terms
                    setShowOwnerForm(true) // open owner form
                    setAgreed(false)
                  }
                }}
                className={`w-full py-3 rounded-lg font-medium transition ${
                  agreed
                    ? 'bg-black text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue
              </button>

              <button
                onClick={() => {
                  setShowOwnerModal(false)
                  setAgreed(false)
                }}
                className='w-full py-3 rounded-lg bg-black text-white'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showOwnerForm && (
        <div className='fixed inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-200 px-4'>
          <div className='bg-white w-full max-w-xl max-h-[90vh] rounded-3xl shadow-2xl relative'>
            {/* Scrollable Area */}
            <div className='max-h-[90vh] overflow-y-auto pr-4 pl-8 py-8'>
              {/* Close Button */}
              <button
                onClick={() => setShowOwnerForm(false)}
                className='absolute top-5 right-5 text-gray-400 hover:text-black text-xl'
              >
                ✕
              </button>

              <h2 className='text-2xl font-semibold text-center'>
                Become an Owner
              </h2>

              <p className='text-center text-gray-500 mt-2'>
                Submit your details and Aadhaar document to apply
              </p>

              {/* Phone */}
              <div className='mt-6'>
                <label className='block text-sm font-medium mb-2'>
                  Phone Number
                </label>
                <input
                  type='text'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className='w-full border rounded-lg px-3 py-2'
                />
              </div>

              {/* Email */}
              <div className='mt-4'>
                <label className='block text-sm font-medium mb-2'>Email</label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full border rounded-lg px-3 py-2'
                />
              </div>

              {/* Aadhaar Upload */}
              <div className='mt-6'>
                <label className='block text-sm font-medium mb-3'>
                  Aadhaar Card
                </label>

                <input
                  type='file'
                  accept='image/*'
                  ref={fileInputRef}
                  onChange={(e) => setAadharFile(e.target.files[0])}
                  className='hidden'
                />

                <div
                  onClick={() => fileInputRef.current.click()}
                  className='border-2 border-dashed rounded-2xl h-56 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer'
                >
                  {aadharFile ? (
                    <img
                      src={URL.createObjectURL(aadharFile)}
                      alt='Preview'
                      className='h-full object-contain rounded-xl'
                    />
                  ) : (
                    <div className='text-center'>
                      <div className='text-4xl mb-3'>⬆</div>
                      <p className='text-sm text-gray-500'>
                        Click to upload Aadhaar card
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleOwnerApply}
                disabled={loading}
                className='mt-8 w-full bg-black text-white py-3 rounded-xl font-medium'
              >
                {loading ? 'Uploading...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className='fixed inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-50'>
          <div className='bg-white w-[90%] max-w-md rounded-2xl shadow-xl p-8 text-center relative'>
            <h2 className='text-2xl font-semibold mb-4'>
              Application Submitted
            </h2>

            {/* Icon */}
            <div className='text-6xl flex justify-center mb-6'>
              <img
                src='/time.png'
                alt='time'
                className='w-20 h-20 object-contain'
              />
            </div>

            <p className='text-gray-600 mb-6'>
              Thank you for submitting your documents! Your application is under
              review by our admin.
            </p>

            <div className='bg-gray-100 p-4 rounded-lg text-sm text-gray-600 mb-6'>
              Our team will review your application and verify the submitted
              information. This process may take up to 72 hours.
              <div>
                You will receive a notification once a decision has been
                made.Please be patient as we carefully review your details
              </div>
            </div>

            <button
              onClick={() => {
                setShowModal(false)
                navigate('/success') // or '/' based on your router
              }}
              className='bg-black text-white px-6 py-2 rounded-lg w-full'
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}
