import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { resetForgotPassword } from '../Services/auth/forgotPassword.services.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function ResetForgotPassword() {
  const navigate = useNavigate()
  const { token } = useParams()
  const [form, setForm] = useState({
    password: '',
    confirmPassword: ''
  })
  const [passwordStrength, setPasswordStrength] = useState('')

  const resetMutation = useMutation({
    mutationFn: async (password) => {
      const data = await resetForgotPassword(token, password)
      return data
    },
    onSuccess: () => {
      alert('Password reset successfully! Please login with your new password.')
      navigate('/login')
    },
    onError: (error) => {
      alert(error.message || 'Failed to reset password')
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    
    if (name === 'password') {
      const hasUpper = /[A-Z]/.test(value)
      const hasLower = /[a-z]/.test(value)
      const hasNumber = /[0-9]/.test(value)
      const hasSpecial = /[!@#$%^&*]/.test(value)
      const isLongEnough = value.length >= 8

      if (isLongEnough && hasUpper && hasLower && hasNumber && hasSpecial) {
        setPasswordStrength('strong')
      } else if (isLongEnough && hasUpper && hasLower && (hasNumber || hasSpecial)) {
        setPasswordStrength('medium')
      } else {
        setPasswordStrength('weak')
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.password.trim()) {
      alert('Please enter a password')
      return
    }

    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (form.password.length < 8) {
      alert('Password must be at least 8 characters')
      return
    }

    resetMutation.mutate(form.password)
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="py-12 text-center">
            <div className="text-red-600 text-lg font-semibold mb-4">Invalid Reset Link</div>
            <p className="text-gray-600 mb-6">The password reset link is invalid or has expired. Please request a new one.</p>
            <Button
              onClick={() => navigate('/user/request-forgot-password')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Request New Link
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-full p-4 shadow-lg">
              <svg 
                className="h-12 w-12 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Create New Password
          </CardTitle>
          <p className="text-gray-600 text-sm">Enter a strong password to secure your account</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    className="h-5 w-5 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                    />
                  </svg>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              {form.password && (
                <div className={`text-xs font-semibold ${
                  passwordStrength === 'strong' ? 'text-green-600' :
                  passwordStrength === 'medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  Password Strength: {passwordStrength?.toUpperCase()}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Must include uppercase, lowercase, number and special character (@, !, #, $, %)
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 block">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    className="h-5 w-5 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                    />
                  </svg>
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              {form.confirmPassword && form.password === form.confirmPassword && (
                <div className="text-xs text-green-600 font-semibold">✓ Passwords match</div>
              )}
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <div className="text-xs text-red-600 font-semibold">✗ Passwords do not match</div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <svg 
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Resetting...
                </div>
              ) : (
                'Reset Password'
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
              >
                Back to Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResetForgotPassword
