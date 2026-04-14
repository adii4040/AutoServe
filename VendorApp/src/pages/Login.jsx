import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { loginVendor } from '../services/auth'
import '../styles/auth.css'

function Login() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await loginVendor(formData)

      // Reset form
      setFormData({ email: '', password: '' })

      // Refresh vendor data
      await queryClient.invalidateQueries({ queryKey: ['currentVendor'] })

      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)

      let msg = err.message || 'Login failed. Please try again.'

      if (msg.includes('not activated'))
        msg = 'Your account is not activated yet. Please check your email.'
      else if (msg.includes('not approved'))
        msg = 'Your account is pending approval.'
      else if (msg.includes('Invalid email or password'))
        msg = 'Invalid email or password.'
      else if (msg.includes('not found'))
        msg = 'No vendor found with this email.'

      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Vendor Portal</h1>
        <p className="subtitle">Login to manage your bookings</p>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="login-btn flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            )}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="register-link">
          Don't have an account?{' '}
          <Link to="/vendor-register">Register as vendor</Link>
        </div>
      </div>
    </div>
  )
}

export default Login