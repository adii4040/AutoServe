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
      <div className="auth-card surface-panel">
        <div className="auth-badge chip" data-tone="primary">Vendor access</div>
        <h1>Welcome back</h1>
        <p className="subtitle">Log in to manage bookings, inspections, and vendor status from one place.</p>

        {error && (
          <div className="state-panel" data-variant="error" role="alert">
            <div>
              <div className="state-title">Unable to sign in</div>
              <div className="state-copy">{error}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="you@yourshop.com"
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary login-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="register-link">
          Don't have an account?{' '}
          <Link to="/vendor-signup">Register as vendor</Link>
        </div>
      </div>
    </div>
  )
}

export default Login