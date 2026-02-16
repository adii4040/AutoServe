// Layout.jsx
import React from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { Toaster } from './components/ui/toaster';
import { Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();
  const isEmployeePage = location.pathname.startsWith('/employee');

  return (
    <div className="">
      {/* <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <Toaster /> */}

      {!isEmployeePage && (
        <div>
          <Navbar />
        </div>
      )}

      <div>
        <Outlet />
      </div>

      {!isEmployeePage && (
        <div>
          <Footer/>
        </div>
      )}
      
      <Toaster/>

    </div>
  );
}
