import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { activateVendorAccount, getVendorById } from '../services/auth'
import '../styles/onboarding.css'

function VendorOnboardingStatus() {
  const { vendorId } = useParams()
  const navigate = useNavigate()
  const [activationError, setActivationError] = useState('')
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  })

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['vendor-onboarding-status', vendorId],
    queryFn: () => getVendorById(vendorId),
    enabled: Boolean(vendorId),
    retry: false,
    refetchOnWindowFocus: true,
  })

  const vendor = data?.data?.vendor || null
  const isApproved = Boolean(vendor?.isPhysicalVerified || vendor?.isVerified || vendor?.verificationStatus === 'APPROVED')

  const activateMutation = useMutation({
    mutationFn: activateVendorAccount,
    onSuccess: () => {
      alert('Password set successfully. You can now login.')
      navigate('/vendor-login')
    },
    onError: (err) => {
      setActivationError(err.message || 'Failed to set password')
    },
  })

  const passwordHint = useMemo(() => {
    return 'Password must be 8-12 characters and include uppercase, lowercase, number and special character.'
  }, [])

  useEffect(() => {
    if (!isApproved) return
    setActivationError('')
  }, [isApproved])

  const handleSetPassword = async (e) => {
    e.preventDefault()
    if (!vendor) return

    setActivationError('')

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setActivationError('Password and confirm password do not match')
      return
    }

    await activateMutation.mutateAsync({
      email: vendor.email,
      phone: vendor.phone,
      password: passwordForm.password,
      confirmPassword: passwordForm.confirmPassword,
    })
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <h1>Vendor Onboarding Dashboard</h1>
        <p className="subtitle">Track your onboarding status in real time</p>

        {isLoading && <p>Loading onboarding status...</p>}
        {isError && <p className="error-text">{error?.message || 'Failed to load onboarding status'}</p>}

        {!isLoading && vendor && (
          <>
            <div className="status-box online-verified">
              <h3>Online Verification</h3>
              <p>Completed</p>
            </div>

            <div className="status-box pending">
              <h3>Physical Verification</h3>
              <p>
                {isApproved
                  ? 'Completed'
                  : 'Waiting for physical verification by AutoServe employee'}
              </p>
            </div>

            <div className="meta-grid">
              <div>
                <span>Vendor</span>
                <strong>{vendor.shopName || '-'}</strong>
              </div>
              <div>
                <span>Owner</span>
                <strong>{vendor.fullname || '-'}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{vendor.verificationStatus || '-'}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{vendor.email || '-'}</strong>
              </div>
            </div>

            {!isApproved && (
              <p className="helper-text">
                This page refreshes when you refocus the tab. Once approved, you can set a password below and login.
              </p>
            )}

            {isApproved && (
              <form className="activation-form" onSubmit={handleSetPassword}>
                <h3>Set Password to Activate Login</h3>
                <p className="small-note">{passwordHint}</p>

                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />

                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />

                {activationError && <p className="error-text">{activationError}</p>}

                <button className="activate-btn" type="submit" disabled={activateMutation.isPending}>
                  {activateMutation.isPending ? 'Setting password...' : 'Set Password & Go to Login'}
                </button>
              </form>
            )}
          </>
        )}

        <div className="footer-links">
          <Link to="/vendor-login">Go to Login</Link>
        </div>
      </div>
    </div>
  )
}

export default VendorOnboardingStatus
