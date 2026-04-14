// Layout.jsx
import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/layout/Footer';
import BottomNav from './components/BottomNav';
import EmergencyButton from './components/EmergencyButton';
import { Toaster } from './components/ui/toaster';
import { Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();
  const isEmployeePage = location.pathname.startsWith('/employee');

  return (
    <div className="min-h-screen bg-white">
      {!isEmployeePage && <Navbar />}
      <main className={!isEmployeePage ? 'pt-[72px] pb-[76px] lg:pb-0' : ''}>
        <Outlet />
      </main>
      {!isEmployeePage && <Footer />}
      {!isEmployeePage && <BottomNav />}
      {!isEmployeePage && <EmergencyButton />}
      <Toaster />
    </div>
  );
}
