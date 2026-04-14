import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import './App.css'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VendorOnboardingStatus from './pages/VendorOnboardingStatus'
import EmployeeVendorVerification from './pages/EmployeeVendorVerification'
import Dashboard from './pages/Dashboard'
import BookingList from './pages/BookingList'
import BookingDetails from './pages/BookingDetails'
import RequestedBookings from './pages/RequestedBookings'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/vendor-login" element={<Login />} />
            <Route path="/vendor-signup" element={<Signup />} />
            <Route path="/vendor-onboarding/:vendorId" element={<VendorOnboardingStatus />} />
            <Route path="/employee/vendor-verification" element={<EmployeeVendorVerification />} />
            
            {/* Vendor Protected Routes */}
            <Route element={<ProtectedRoute allowedActor="VENDOR" />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/bookings" element={<BookingList />} />
              <Route path="/bookings/:bookingId" element={<BookingDetails />} />
              <Route path="/requested-bookings" element={<RequestedBookings />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/vendor-login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
