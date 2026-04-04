import React, { useMemo, useState } from 'react'
import Navbar from '../componenets/Navbar'
import { motion } from 'framer-motion'
import {
  Mail,
  Phone,
  MapPin,
  Clock3,
  Send,
  MessageSquare,
  User,
  FileText,
  ArrowRight,
  CheckCircle2,
  Headphones,
} from 'lucide-react'
import { toast } from 'sonner'

const BASE_URL = 'https://render-qs89.onrender.com'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.55,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

const contactCards = [
  {
    icon: Mail,
    title: 'Email Us',
    value: 'support@slotmystyle.com',
    sub: 'We usually reply within 24 hours',
  },
  {
    icon: Phone,
    title: 'Call Support',
    value: '+91 98765 43210',
    sub: 'Mon - Sat, 10:00 AM to 7:00 PM',
  },
  {
    icon: MapPin,
    title: 'Location',
    value: 'Surat, Gujarat',
    sub: 'Serving salons and users across cities',
  },
]

const faqPoints = [
  'Booking issue or payment concern',
  'Salon partnership or owner support',
  'Technical problem in your account',
  'General inquiry or feature suggestion',
]

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const messageCount = useMemo(() => formData.message.trim().length, [formData.message])

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Enter a valid 10-digit phone number'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    } else if (formData.subject.trim().length < 4) {
      newErrors.subject = 'Subject must be at least 4 characters'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 15) {
      newErrors.message = 'Message must be at least 15 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Please fix the form errors')
      return
    }

    try {
      setLoading(true)

      const res = await fetch(`${BASE_URL}/api/contact/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const text = await res.text()

      if (!res.ok) {
        throw new Error(text || 'Failed to send message')
      }

      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })
      setErrors({})
      toast.success('Your message has been sent successfully')
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      <div className='min-h-screen bg-[#f6f8fc] text-slate-900 overflow-hidden'>
        <section className='relative border-b border-slate-200/80 bg-gradient-to-b from-white via-[#f8faff] to-[#f6f8fc]'>
          <div className='absolute inset-0 overflow-hidden pointer-events-none'>
            <div className='absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-100/60 blur-3xl' />
            <div className='absolute top-24 right-10 h-44 w-44 rounded-full bg-slate-200/50 blur-3xl' />
            <div className='absolute bottom-0 left-0 h-40 w-40 rounded-full bg-indigo-100/40 blur-3xl' />
          </div>

          <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-14 md:pt-24 md:pb-20'>
            <motion.div
              initial='hidden'
              animate='show'
              variants={fadeUp}
              custom={0}
              className='mx-auto max-w-4xl text-center'
            >
              <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm'>
                <Headphones className='h-4 w-4 text-slate-800' />
                Contact SlotMyStyle
              </div>

              <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 leading-tight'>
                We’d love to
                <span className='block bg-gradient-to-r from-slate-950 via-slate-800 to-slate-600 bg-clip-text text-transparent'>
                  hear from you
                </span>
              </h1>

              <p className='mt-6 text-base sm:text-lg lg:text-xl leading-8 text-slate-600 max-w-3xl mx-auto'>
                Have a question, feedback, booking issue, or partnership inquiry?
                Reach out to us and our team will get back to you as soon as possible.
              </p>
            </motion.div>

            <motion.div
              initial='hidden'
              animate='show'
              variants={fadeUp}
              custom={0.15}
              className='mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'
            >
              {contactCards.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className='rounded-[1.75rem] border border-slate-200/80 bg-white/90 backdrop-blur px-6 py-5 shadow-sm hover:shadow-md transition-all duration-300'
                  >
                    <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900'>
                      <Icon className='h-5 w-5' />
                    </div>

                    <h3 className='mt-4 text-lg font-semibold text-slate-950'>
                      {item.title}
                    </h3>

                    <p className='mt-1 text-base font-medium text-slate-700 break-all'>
                      {item.value}
                    </p>

                    <p className='mt-2 text-sm leading-6 text-slate-500'>
                      {item.sub}
                    </p>
                  </div>
                )
              })}
            </motion.div>
          </div>
        </section>

        <section className='relative'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20'>
            <div className='grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 xl:gap-12 items-start'>
              <motion.div
                initial='hidden'
                whileInView='show'
                viewport={{ once: true, amount: 0.2 }}
                variants={scaleIn}
                custom={0}
                className='rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]'
              >
                <div className='max-w-xl'>
                  <span className='inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600'>
                    Send us a message
                  </span>

                  <h2 className='mt-5 text-3xl sm:text-4xl font-bold tracking-tight text-slate-950'>
                    Contact our support team
                  </h2>

                  <p className='mt-4 text-base sm:text-lg leading-8 text-slate-600'>
                    Fill out the form below and we’ll send your message to the admin team.
                    A copy can also be sent to your email so you have your submitted query.
                  </p>
                </div>

                {submitted && (
                  <div className='mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-700 flex items-start gap-3'>
                    <CheckCircle2 className='h-5 w-5 mt-0.5 shrink-0' />
                    <div>
                      <p className='font-semibold'>Message submitted successfully</p>
                      <p className='mt-1 text-sm leading-6'>
                        Our team has received your query. Please check your email for a confirmation copy.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className='mt-8 space-y-5'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    <div>
                      <label className='mb-2 block text-sm font-semibold text-slate-700'>
                        Full Name
                      </label>
                      <div className='relative'>
                        <User className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
                        <input
                          type='text'
                          name='name'
                          value={formData.name}
                          onChange={handleChange}
                          placeholder='Enter your full name'
                          className={`w-full rounded-2xl border bg-white pl-11 pr-4 py-3.5 text-sm outline-none transition-all ${
                            errors.name
                              ? 'border-red-300 focus:border-red-400'
                              : 'border-slate-200 focus:border-slate-400'
                          }`}
                        />
                      </div>
                      {errors.name && (
                        <p className='mt-2 text-xs font-medium text-red-500'>{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className='mb-2 block text-sm font-semibold text-slate-700'>
                        Email Address
                      </label>
                      <div className='relative'>
                        <Mail className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
                        <input
                          type='email'
                          name='email'
                          value={formData.email}
                          onChange={handleChange}
                          placeholder='Enter your email'
                          className={`w-full rounded-2xl border bg-white pl-11 pr-4 py-3.5 text-sm outline-none transition-all ${
                            errors.email
                              ? 'border-red-300 focus:border-red-400'
                              : 'border-slate-200 focus:border-slate-400'
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className='mt-2 text-xs font-medium text-red-500'>{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    <div>
                      <label className='mb-2 block text-sm font-semibold text-slate-700'>
                        Phone Number
                      </label>
                      <div className='relative'>
                        <Phone className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
                        <input
                          type='text'
                          name='phone'
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder='Enter your phone number'
                          maxLength={10}
                          className={`w-full rounded-2xl border bg-white pl-11 pr-4 py-3.5 text-sm outline-none transition-all ${
                            errors.phone
                              ? 'border-red-300 focus:border-red-400'
                              : 'border-slate-200 focus:border-slate-400'
                          }`}
                        />
                      </div>
                      {errors.phone && (
                        <p className='mt-2 text-xs font-medium text-red-500'>{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className='mb-2 block text-sm font-semibold text-slate-700'>
                        Subject
                      </label>
                      <div className='relative'>
                        <FileText className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
                        <input
                          type='text'
                          name='subject'
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder='Enter subject'
                          className={`w-full rounded-2xl border bg-white pl-11 pr-4 py-3.5 text-sm outline-none transition-all ${
                            errors.subject
                              ? 'border-red-300 focus:border-red-400'
                              : 'border-slate-200 focus:border-slate-400'
                          }`}
                        />
                      </div>
                      {errors.subject && (
                        <p className='mt-2 text-xs font-medium text-red-500'>{errors.subject}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className='mb-2 block text-sm font-semibold text-slate-700'>
                      Message
                    </label>
                    <div className='relative'>
                      <MessageSquare className='pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400' />
                      <textarea
                        name='message'
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        placeholder='Write your message here...'
                        className={`w-full resize-none rounded-2xl border bg-white pl-11 pr-4 py-3.5 text-sm outline-none transition-all ${
                          errors.message
                            ? 'border-red-300 focus:border-red-400'
                            : 'border-slate-200 focus:border-slate-400'
                        }`}
                      />
                    </div>

                    <div className='mt-2 flex items-center justify-between'>
                      {errors.message ? (
                        <p className='text-xs font-medium text-red-500'>{errors.message}</p>
                      ) : (
                        <p className='text-xs text-slate-400'>
                          Please share enough details so we can help you properly.
                        </p>
                      )}

                      <span className='text-xs font-medium text-slate-400'>
                        {messageCount} chars
                      </span>
                    </div>
                  </div>

                  <button
                    type='submit'
                    disabled={loading}
                    className='inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70'
                  >
                    {loading ? 'Sending Message...' : 'Submit Message'}
                    {!loading && <Send className='h-4 w-4' />}
                  </button>
                </form>
              </motion.div>

              <div className='space-y-6'>
                <motion.div
                  initial='hidden'
                  whileInView='show'
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUp}
                  custom={0}
                  className='rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm'
                >
                  <span className='inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600'>
                    Support Information
                  </span>

                  <h3 className='mt-5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-950'>
                    How can we help you?
                  </h3>

                  <p className='mt-4 text-base leading-8 text-slate-600'>
                    Contact us for platform issues, booking support, owner-related questions,
                    or general feedback. We’re here to improve your SlotMyStyle experience.
                  </p>

                  <div className='mt-6 space-y-4'>
                    {faqPoints.map((point, index) => (
                      <div
                        key={point}
                        className='flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4'
                      >
                        <div className='mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold'>
                          {index + 1}
                        </div>
                        <p className='text-sm leading-6 text-slate-700'>{point}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial='hidden'
                  whileInView='show'
                  viewport={{ once: true, amount: 0.2 }}
                  variants={scaleIn}
                  custom={0.1}
                  className='relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 sm:p-8 shadow-[0_20px_60px_rgba(15,23,42,0.18)]'
                >
                  <div className='absolute inset-0 overflow-hidden'>
                    <div className='absolute -left-10 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-white/10 blur-3xl' />
                    <div className='absolute right-0 top-0 h-44 w-44 rounded-full bg-blue-300/10 blur-3xl' />
                  </div>

                  <div className='relative'>
                    <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur'>
                      <Clock3 className='h-4 w-4' />
                      Support Hours
                    </div>

                    <h3 className='mt-5 text-2xl sm:text-3xl font-bold text-white'>
                      Fast, friendly response
                    </h3>

                    <p className='mt-4 text-base leading-8 text-slate-300'>
                      Our team reviews contact requests carefully and tries to respond as quickly as possible.
                    </p>

                    <div className='mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200'>
                      Monday - Saturday: 10:00 AM to 7:00 PM
                    </div>

                    <div className='mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white'>
                      We value every message
                      <ArrowRight className='h-4 w-4' />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}