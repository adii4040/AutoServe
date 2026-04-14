import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { registerVendor } from '../services/auth'
import '../styles/signup.css'

let signupDraft = {
  fullname: '',
  email: '',
  phone: '',
  shopName: '',
  personalAddress: '',
  shopAddress: '',
  latitude: null,
  longitude: null,
}

function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullname: signupDraft.fullname,
    email: signupDraft.email,
    phone: signupDraft.phone,
    shopName: signupDraft.shopName,
    personalAddress: signupDraft.personalAddress,
    shopAddress: signupDraft.shopAddress,
    panCard: null,
    aadharCard: null,
    latitude: signupDraft.latitude,
    longitude: signupDraft.longitude,
  })
  const [locationError, setLocationError] = useState('')

  useEffect(() => {
    signupDraft = {
      fullname: form.fullname,
      email: form.email,
      phone: form.phone,
      shopName: form.shopName,
      personalAddress: form.personalAddress,
      shopAddress: form.shopAddress,
      latitude: form.latitude,
      longitude: form.longitude,
    }
  }, [form])

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported on this device/browser')
      return
    }

    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }))
      },
      () => setLocationError('Unable to fetch current location. Please allow location access.'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const registerVendorMutation = useMutation({
    mutationFn: registerVendor,
    onSuccess: (response) => {
      signupDraft = {
        fullname: '',
        email: '',
        phone: '',
        shopName: '',
        personalAddress: '',
        shopAddress: '',
        latitude: null,
        longitude: null,
      }

      const vendorId = response?.data?.vendor?._id
      if (vendorId) {
        navigate(`/vendor-onboarding/${vendorId}`)
        return
      }

      alert('Vendor registration successful! Please check your email for onboarding dashboard link.')
    },
    onError: (error) => {
      alert(error.message || 'Vendor registration failed')
    },
  })

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'panCard' || name === 'aadharCard') {
      setForm((prev) => ({ ...prev, [name]: files?.[0] || null }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (form.latitude == null || form.longitude == null) {
      alert('Please capture current location before registration')
      return
    }

    if (!form.panCard || !form.aadharCard) {
      alert('Please upload both PAN Card and Aadhar Card')
      return
    }

    const formDataObj = new FormData()
    formDataObj.append('fullname', form.fullname)
    formDataObj.append('email', form.email)
    formDataObj.append('phone', form.phone)
    formDataObj.append('shopName', form.shopName)
    formDataObj.append('personalAddress', form.personalAddress)
    formDataObj.append('shopAddress', form.shopAddress)
    if (form.latitude != null && form.longitude != null) {
      formDataObj.append('latitude', String(form.latitude))
      formDataObj.append('longitude', String(form.longitude))
    }
    formDataObj.append('panCard', form.panCard)
    formDataObj.append('aadharCard', form.aadharCard)

    registerVendorMutation.mutate(formDataObj)
  }

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h1>Register as Service Provider</h1>
        <p className="subtitle">Join AutoServe's network of trusted vendors</p>

        <form onSubmit={handleSubmit} className="signup-form">
          <h3>Personal Information</h3>
          <div className="form-group">
            <label htmlFor="fullname">Full Name *</label>
            <input id="fullname" name="fullname" value={form.fullname} onChange={handleChange} required />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="personalAddress">Personal Address *</label>
            <input id="personalAddress" name="personalAddress" value={form.personalAddress} onChange={handleChange} required />
          </div>

          <h3>Business Information</h3>
          <div className="form-group">
            <label htmlFor="shopName">Shop/Business Name *</label>
            <input id="shopName" name="shopName" value={form.shopName} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="shopAddress">Shop/Business Address *</label>
            <input id="shopAddress" name="shopAddress" value={form.shopAddress} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Workshop Coordinates *</label>
            <button type="button" className="btn-secondary" onClick={captureLocation}>
              {form.latitude != null && form.longitude != null ? 'Location Captured' : 'Use Current Location'}
            </button>
            {form.latitude != null && form.longitude != null && (
              <p className="small-note">Latitude: {form.latitude.toFixed(6)}, Longitude: {form.longitude.toFixed(6)}</p>
            )}
            {locationError && <p className="error-inline">{locationError}</p>}
          </div>

          <h3>Verification Documents</h3>
          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="panCard">PAN Card *</label>
              <input id="panCard" name="panCard" type="file" accept="image/*" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="aadharCard">Aadhar Card *</label>
              <input id="aadharCard" name="aadharCard" type="file" accept="image/*" onChange={handleChange} required />
            </div>
          </div>

          <div className="info-box">
            Your documents will undergo online verification. Once approved, our team will contact you for physical verification of your workshop.
          </div>

          <button className="btn-primary" type="submit" disabled={registerVendorMutation.isPending}>
            {registerVendorMutation.isPending ? 'Processing registration...' : 'Register as Service Provider'}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have a vendor account? <Link to="/vendor-login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
