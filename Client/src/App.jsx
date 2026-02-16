import React, { use, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Home from './Pages/Home';
import MyJobs from './Pages/MyJobs';
import UserDashboard from './Pages/UserDashboard';
import UpdateProfile from './Pages/UpdateProfile';
import MyBookings from './Pages/MyBookings';
import InspectionDetail from './Pages/InspectionDetail';
import Login from './components/Authentication/login';
import Signup from './components/Authentication/signup';
import VendorSignup from './components/Authentication/Vendorsignup';
import VendorDashboardLayout from './Vendordashboard/layout';
import VendorUserDashboard from './Vendordashboard/pages/Dashboard';
import VendorBookings from './Vendordashboard/pages/Bookings';
import VendorProfile from './Vendordashboard/pages/Profile';
import VendorDocuments from './Vendordashboard/pages/document';
import EmployeeVendorVerification from './Employee/Employee/pages/employee_vendor_verification';
import { AuthContext } from './context/AuthContext';

// Simple Protected Route for authenticated users only
function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {

  return (
    <Routes>
      {/* Customer Routes */}
      <Route path='/' element={<Layout />}>
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Home />} />
        
        {/* Protected User Routes - Require Login */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/user-dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/update-profile" element={
          <ProtectedRoute>
            <UpdateProfile />
          </ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        } />
        <Route path="/my-jobs" element={
          <ProtectedRoute>
            <MyJobs />
          </ProtectedRoute>
        } />
        <Route path="/inspection-detail" element={
          <ProtectedRoute>
            <InspectionDetail />
          </ProtectedRoute>
        } />
        
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/vendor-signup" element={<VendorSignup />} />
        
        {/* Employee Routes */}
        <Route path="/employee/vendor-verification" element={<EmployeeVendorVerification />} />
      </Route>

      {/* Vendor Dashboard Routes */}
      <Route path='/vendor' element={<VendorDashboardLayout />}>
        <Route path='dashboard' element={<VendorUserDashboard />} />
        <Route path='bookings' element={<VendorBookings />} />
        <Route path='documents' element={<VendorDocuments />} />
        <Route path='profile' element={<VendorProfile />} />
      </Route>
    </Routes>
  );
}

export default App;
