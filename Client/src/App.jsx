

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './Pages/Home';
import MyJobs from './Pages/MyJobs';
import UserDashboard from './Pages/UserDashboard';
import UpdateProfile from './Pages/UpdateProfile';
import MyBookings from './Pages/MyBookings';
import InspectionDetail from './Pages/InspectionDetail';
import Login from './components/Authentication/login';
import Signup from './components/Authentication/signup';
import ProtectedRoute from './components/ProtectedRoute';
import BookService from './Pages/BookService';
import BookingDetail from './Pages/BookingDetail';

function App() {

  return (
    <Routes>
      {/* Customer Routes */}
      <Route path='/' element={<Layout />}>
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Home />} />
        
        {/* Book Service Route */}
        <Route path="/bookservice" element={<BookService />} />
        {/* Booking Detail Route */}
        <Route path="/booking/:bookingId" element={<BookingDetail />} />
        {/* Protected User Routes - Require Login */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedActor="USER">
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/user-dashboard" element={
          <ProtectedRoute allowedActor="USER">
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/update-profile" element={
          <ProtectedRoute allowedActor="USER">
            <UpdateProfile />
          </ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute allowedActor="USER">
            <MyBookings />
          </ProtectedRoute>
        } />
        <Route path="/my-jobs" element={
          <ProtectedRoute allowedActor="USER">
            <MyJobs />
          </ProtectedRoute>
        } />
        <Route path="/inspection-detail" element={
          <ProtectedRoute allowedActor="USER">
            <InspectionDetail />
          </ProtectedRoute>
        } />
        
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Vendor signup/login routes removed */}
        
        {/* Employee routes removed */}
      </Route>

      {/* Vendor dashboard routes removed */}
    </Routes>
  );
}

export default App;
