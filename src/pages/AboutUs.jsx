import React from 'react'
import Navbar from '../componenets/Navbar'
import { motion } from 'framer-motion'
import {
  Search,
  CalendarCheck2,
  Sparkles,
  Lightbulb,
  ShieldCheck,
  Users,
  ArrowRight,
  BadgeCheck,
  HeartHandshake,
  Scissors,
} from 'lucide-react'

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
  hidden: { opacity: 0, scale: 0.94 },
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

const features = [
  {
    icon: Search,
    title: 'Find Trusted Salons',
    description:
      'Browse verified salons near you and explore services, ratings, and styling options with confidence.',
  },
  {
    icon: CalendarCheck2,
    title: 'Book with Ease',
    description:
      'Schedule appointments in seconds with a clean, user-friendly booking experience built for convenience.',
  },
  {
    icon: Sparkles,
    title: 'Enjoy the Best Service',
    description:
      'Connect with skilled professionals for hair, beauty, grooming, and self-care experiences you can trust.',
  },
]

const values = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'We build modern salon booking experiences that feel fast, smooth, and genuinely helpful for users.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust',
    description:
      'We focus on verified listings, reliable bookings, and a transparent experience that users can depend on.',
  },
  {
    icon: Users,
    title: 'Customer First',
    description:
      'Every feature is designed to save time, reduce effort, and make appointments simpler for everyone.',
  },
]

const stats = [
  { value: '100+', label: 'Partner Salons' },
  { value: '1K+', label: 'Bookings Managed' },
  { value: '24/7', label: 'Easy Access' },
]

export default function AboutUs() {
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

        <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24'>
          <motion.div
            initial='hidden'
            animate='show'
            variants={fadeUp}
            custom={0}
            className='mx-auto max-w-4xl text-center'
          >
            <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm'>
              <Scissors className='h-4 w-4 text-slate-800' />
              About SlotMyStyle
            </div>

            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 leading-tight'>
              Your Ultimate Salon
              <span className='block bg-gradient-to-r from-slate-950 via-slate-800 to-slate-600 bg-clip-text text-transparent'>
                Booking Platform
              </span>
            </h1>

            <p className='mt-6 text-base sm:text-lg lg:text-xl leading-8 text-slate-600 max-w-3xl mx-auto'>
              Welcome to SlotMyStyle. We make discovering top salons and
              booking appointments simple, stylish, and stress-free. Our goal
              is to connect users with trusted salons and expert stylists in
              just a few clicks.
            </p>
          </motion.div>

          <motion.div
            initial='hidden'
            animate='show'
            variants={fadeUp}
            custom={0.15}
            className='mt-10 flex flex-wrap items-center justify-center gap-3'
          >
            <a
              href='/'
              className='inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800'
            >
              Explore Salons
              <ArrowRight className='h-4 w-4' />
            </a>

            <a
              href='/my-bookings'
              className='inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md'
            >
              View Bookings
            </a>
          </motion.div>

          <motion.div
            initial='hidden'
            animate='show'
            variants={fadeUp}
            custom={0.25}
            className='mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-3xl mx-auto'
          >
            {stats.map((item) => (
              <div
                key={item.label}
                className='rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur px-6 py-5 shadow-sm'
              >
                <div className='text-2xl sm:text-3xl font-bold text-slate-950'>
                  {item.value}
                </div>
                <div className='mt-1 text-sm text-slate-500'>{item.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className='relative'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center'>
            <motion.div
              initial='hidden'
              whileInView='show'
              viewport={{ once: true, amount: 0.2 }}
              variants={scaleIn}
              custom={0}
              className='relative'
            >
              <div className='absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-slate-200/60 via-white to-blue-100/50 blur-2xl' />
              <div className='relative overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]'>
                <img
                  src='https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80'
                  alt='Salon styling session'
                  className='h-[300px] sm:h-[420px] w-full object-cover'
                />
                <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 via-slate-950/25 to-transparent p-6'>
                  <div className='inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur'>
                    <BadgeCheck className='h-4 w-4 text-slate-900' />
                    Trusted beauty experiences, all in one place
                  </div>
                </div>
              </div>
            </motion.div>

            <div>
              <motion.div
                initial='hidden'
                whileInView='show'
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                custom={0}
              >
                <span className='inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm'>
                  Why SlotMyStyle
                </span>
                <h2 className='mt-5 text-3xl sm:text-4xl font-bold tracking-tight text-slate-950'>
                  Making salon discovery and booking effortless
                </h2>
                <p className='mt-5 text-base sm:text-lg leading-8 text-slate-600'>
                  SlotMyStyle is designed to remove the hassle from salon
                  appointments. From comparing salons to booking the perfect
                  service, we help users save time and discover better grooming
                  and beauty experiences.
                </p>
              </motion.div>

              <div className='mt-8 space-y-4'>
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <motion.div
                      key={feature.title}
                      initial='hidden'
                      whileInView='show'
                      viewport={{ once: true, amount: 0.2 }}
                      variants={fadeUp}
                      custom={0.1 + index * 0.08}
                      className='group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'
                    >
                      <div className='flex items-start gap-4'>
                        <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 transition-all duration-300 group-hover:bg-slate-900 group-hover:text-white'>
                          <Icon className='h-6 w-6' />
                        </div>

                        <div>
                          <h3 className='text-xl font-semibold text-slate-900'>
                            {feature.title}
                          </h3>
                          <p className='mt-2 text-sm sm:text-base leading-7 text-slate-600'>
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='relative'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 md:py-10'>
          <motion.div
            initial='hidden'
            whileInView='show'
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            custom={0}
            className='text-center max-w-3xl mx-auto'
          >
            <span className='inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm'>
              Our Vision & Values
            </span>
            <h2 className='mt-5 text-3xl sm:text-4xl font-bold tracking-tight text-slate-950'>
              Built on trust, quality, and customer-first thinking
            </h2>
            <p className='mt-5 text-base sm:text-lg leading-8 text-slate-600'>
              We believe salon booking should feel smooth, transparent, and
              premium. Our platform is shaped by values that help us create a
              better experience for users and salon partners alike.
            </p>
          </motion.div>

          <div className='mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
            {values.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  initial='hidden'
                  whileInView='show'
                  viewport={{ once: true, amount: 0.2 }}
                  variants={scaleIn}
                  custom={0.05 + index * 0.08}
                  className='group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.09)]'
                >
                  <div className='absolute right-0 top-0 h-24 w-24 rounded-full bg-slate-100/70 blur-2xl transition-all duration-300 group-hover:bg-blue-100/70' />
                  <div className='relative'>
                    <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 transition-all duration-300 group-hover:bg-slate-900 group-hover:text-white'>
                      <Icon className='h-7 w-7' />
                    </div>

                    <h3 className='mt-6 text-2xl font-semibold text-slate-950'>
                      {item.title}
                    </h3>

                    <p className='mt-3 text-sm sm:text-base leading-7 text-slate-600'>
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className='relative pb-20 pt-16'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <motion.div
            initial='hidden'
            whileInView='show'
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            custom={0}
            className='relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-10 sm:px-10 sm:py-14 shadow-[0_20px_60px_rgba(15,23,42,0.18)]'
          >
            <div className='absolute inset-0 overflow-hidden'>
              <div className='absolute -left-10 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full bg-white/10 blur-3xl' />
              <div className='absolute right-0 top-0 h-48 w-48 rounded-full bg-blue-300/10 blur-3xl' />
            </div>

            <div className='relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between'>
              <div className='max-w-2xl'>
                <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur'>
                  <HeartHandshake className='h-4 w-4' />
                  Ready to transform your salon experience?
                </div>

                <h2 className='mt-5 text-3xl sm:text-4xl font-bold tracking-tight text-white'>
                  Book your next appointment with confidence
                </h2>

                <p className='mt-4 text-base sm:text-lg leading-8 text-slate-300'>
                  Discover trusted salons, compare services, and reserve your
                  slot with ease through SlotMyStyle.
                </p>
              </div>

              <div className='flex flex-wrap gap-3'>
                <a
                  href='/'
                  className='inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100'
                >
                  Explore Salons
                  <ArrowRight className='h-4 w-4' />
                </a>

                <a
                  href='/contact'
                  className='inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15'
                >
                  Contact Us
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
    </>
  )
}