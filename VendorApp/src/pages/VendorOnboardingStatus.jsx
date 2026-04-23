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
    <div className="page-shell">
      <div className="page-header app-hero">
        <div>
          <div className="chip" data-tone="warning">Onboarding status</div>
          <h1 className="page-title" style={{ marginTop: 12 }}>Vendor onboarding dashboard</h1>
          <p className="page-subtitle">Track your verification progress and activate your account once the physical check is complete.</p>
        </div>
      </div>

      {isLoading && (
        <div className="state-panel" data-variant="loading">
          <div>
            <div className="state-title">Loading onboarding status</div>
            <div className="state-copy">Fetching the latest verification information for your vendor account.</div>
          </div>
        </div>
      )}
      {isError && (
        <div className="state-panel" data-variant="error" role="alert">
          <div>
            <div className="state-title">Could not load onboarding status</div>
            <div className="state-copy">{error?.message || 'Failed to load onboarding status'}</div>
          </div>
        </div>
      )}

      {!isLoading && vendor && (
        <div className="card surface-panel" style={{ display: 'grid', gap: 18 }}>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Online verification</div>
              <p className="metric-value" style={{ fontSize: '1.4rem' }}>Completed</p>
              <p className="metric-note">Documents have been accepted for the account.</p>
            </div>
            <div className="metric-card">
              <div className="metric-label">Physical verification</div>
              <p className="metric-value" style={{ fontSize: '1.4rem' }}>{isApproved ? 'Completed' : 'Pending'}</p>
              <p className="metric-note">{isApproved ? 'Your workshop verification is approved.' : 'Waiting for an AutoServe employee to verify your workshop.'}</p>
            </div>
            <div className="metric-card">
              <div className="metric-label">Account status</div>
              <p className="metric-value" style={{ fontSize: '1.4rem' }}>{vendor.verificationStatus || 'Pending'}</p>
              <p className="metric-note">Keep this page open to refresh the latest state when the tab regains focus.</p>
            </div>
          </div>

          <div className="form-grid two-col">
            <div className="field">
              <div className="field-label">Vendor</div>
              <div className="helper-text">{vendor.shopName || '-'}</div>
            </div>
            <div className="field">
              <div className="field-label">Owner</div>
              <div className="helper-text">{vendor.fullname || '-'}</div>
            </div>
            <div className="field">
              <div className="field-label">Email</div>
              <div className="helper-text">{vendor.email || '-'}</div>
            </div>
            <div className="field">
              <div className="field-label">Status</div>
              <div className="helper-text">{vendor.verificationStatus || '-'}</div>
            </div>
          </div>

          {!isApproved && (
            <div className="state-panel" data-variant="loading">
              <div>
                <div className="state-title">Waiting for approval</div>
                <div className="state-copy">This page refreshes when you refocus the tab. Once approved, you can set a password below and log in.</div>
              </div>
            </div>
          )}

          {isApproved && (
            <form className="form-grid" onSubmit={handleSetPassword}>
              <div className="section-title">Activate your account</div>
              <p className="field-help">{passwordHint}</p>

              <div className="form-grid two-col">
                <div className="field">
                  <label className="field-label" htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {activationError && <p className="field-error">{activationError}</p>}

              <button className="btn-primary" type="submit" disabled={activateMutation.isPending}>
                {activateMutation.isPending ? 'Setting password...' : 'Set password and go to login'}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="footer-links" style={{ textAlign: 'center' }}>
        <Link to="/vendor-login">Go to login</Link>
      </div>
    </div>
  )
}

export default VendorOnboardingStatus
