import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm border-b mb-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
        <div className="text-2xl font-bold text-blue-700 tracking-tight">AutoServe</div>
        <div className="flex gap-8 text-base font-medium">
          <Link to="/dashboard" className="hover:text-blue-700 transition-colors">Dashboard</Link>
          <Link to="/bookings" className="hover:text-blue-700 transition-colors">Bookings</Link>
          <Link to="/profile" className="hover:text-blue-700 transition-colors">Profile</Link>
        </div>
        <button className="ml-8 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">Logout</button>
      </div>
    </nav>
  );
}
