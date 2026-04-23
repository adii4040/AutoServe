import { NavLink, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { logoutVendor } from '../services/auth'
import '../styles/layout.css'

function Layout({ children }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { vendor } = useAuth()

  const handleLogout = async () => {
    try {
      await logoutVendor()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear query cache and redirect
      queryClient.clear()
      navigate('/vendor-login')
    }
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h1>AutoServe Vendor</h1>
          </div>

          <nav className="nav">
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Dashboard
            </NavLink>
            <NavLink to="/bookings" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Bookings
            </NavLink>
            <NavLink to="/requested-bookings" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Requested
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Profile
            </NavLink>
          </nav>

          <div className="user-menu">
            <span className="user-name">{vendor?.shopName || 'Vendor'}</span>
            <button className="btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2026 AutoServe. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Layout
