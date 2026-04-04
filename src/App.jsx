import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import AdminLogin from './pages/AdminLogin'

// Auth Pages
import AuthPage from './pages/AuthPage'
import Register from './pages/Register'
import OTPVerify from './pages/OTPVerify'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetOTP from './pages/ResetOTP'
import NewPassword from './pages/NewPassword'
import SelectService from './pages/SelectService'
// import ProtectedRoute from "./pages/ProtectedRoute";
import Profile from './pages/Profile'
import ConfirmBooking from './pages/ConfirmBooking'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'

import OwnerDashboard from './OwnerDashboard'

// Main Pages
import Home from './pages/Home'
import SalonDetails from './pages/SalonDetails'
import AddServices from './pages/AddServices'
import AddSalon from './pages/AddSalon'
import ManageBarbers from './pages/ManageBarbers'
import OwnerLayout from './componenets/OwnerLayout'
import ServicesPage from './pages/ServicesPage'
import Bookings from './pages/Bookings'
import ManageBookings from './pages/ManageBookings'

//AdminPages
import AdminCityPage from './pages/AdminCityPage'
import AdminCategoryServicePage from './pages/AdminCategoryServicePage'
import AdminApproveOwnerPage from './pages/AdminApproveOwnerPage'
import AdminApproveSalonPage from './pages/AdminApproveSalonPage'


export default function App() {
  return (
    <BrowserRouter>
      {/* Toast */}

      <Toaster
        position='top-center'
        closeButton
        expand={false}
        richColors={false}
        visibleToasts={3}
        duration={2400}
        offset={16}
        toastOptions={{
          classNames: {
            toast: 'slot-toast',
            title: 'slot-toast-title',
            description: 'slot-toast-description',
            closeButton: 'slot-toast-close',
            success: 'slot-toast-success',
            error: 'slot-toast-error',
            warning: 'slot-toast-warning',
            info: 'slot-toast-info',
            loading: 'slot-toast-loading',
          },
        }}
      />

      <Routes>
        {/* 🌟 DEFAULT HOME PAGE (Login પહેલા) */}
        <Route path='/' element={<Home />} />

        {/* Auth Flow */}
        <Route path='/login' element={<AuthPage defaultMode='login' />} />
        <Route path='/register' element={<AuthPage defaultMode='register' />} />
        <Route path='/otp' element={<OTPVerify />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-otp' element={<ResetOTP />} />
        <Route path='/new-password' element={<NewPassword />} />
        <Route path='/success' element={<Home />} />
        <Route path='/profile' element={<Profile />} />

        {/* Pages */}
        <Route path='/home' element={<Home />} />
        <Route path='/salon-details/:id' element={<SalonDetails />} />
        <Route path='/salon/:id' element={<SalonDetails />} />
        <Route path='/add-services/:salonId' element={<AddServices />} />
        <Route path='/book/:salonId' element={<SelectService />} />
        <Route path='/confirm-booking/:salonId' element={<ConfirmBooking />} />

        <Route path='/owner-dashboard' element={<OwnerDashboard />} />
        <Route path='/add-salon' element={<AddSalon />} />
        <Route path='/manage-barbers' element={<ManageBarbers />} />
        <Route path='/owner' element={<OwnerLayout />} />
        <Route path='/services' element={<ServicesPage />} />
        <Route path='/bookings' element={<Bookings />} />
        <Route path='/manage-bookings' element={<ManageBookings />} />
        <Route path='/about' element={<AboutUs />} />
        <Route path='/contact' element={<ContactUs />} />
        <Route path='/admin/login' element={<AdminLogin />} />


        <Route path='/admin/city' element={<AdminCityPage />} />
        <Route path='/admin/category-service' element={<AdminCategoryServicePage />} />
        <Route path='/admin/approve-owner' element={<AdminApproveOwnerPage />} />
        <Route path='/admin/approve-salon' element={<AdminApproveSalonPage />} />

        {/* 404 */}
        <Route
          path='*'
          element={
            <h1 className='text-center mt-10 text-2xl'>404 Page Not Found</h1>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
