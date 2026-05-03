import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { logoutVendor } from '../services/auth'

function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { profile: vendor, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logoutVendor()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      queryClient.clear()
      navigate('/vendor-login')
    }
  }

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Bookings', path: '/bookings' },
    { name: 'Requested', path: '/requested-bookings' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-10">
            <NavLink to="/dashboard" className="text-xl font-black tracking-tighter text-blue-600 flex items-center gap-2">
              AutoServe <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Vendor</span>
            </NavLink>
            <div className="hidden md:flex gap-1 items-center">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) => `px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                {vendor?.shopName?.[0] || 'V'}
              </div>
              <span className="text-xs font-bold text-gray-700">{vendor?.shopName || 'Vendor'}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-full hover:bg-red-600 hover:text-white transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow py-8">
        <div className="container">
          {children}
        </div>
      </main>

      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-400 text-sm font-medium">
            &copy; 2026 AutoServe Vendor Ecosystem. All rights reserved.
          </div>
          <div className="flex gap-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Support</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
