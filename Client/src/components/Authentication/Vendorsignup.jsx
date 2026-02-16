import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'


import {registerVendor} from '../../Services/auth/Vendor.services'
import { useMutation } from '@tanstack/react-query'

function VendorSignup() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    shopName: "",
    personalAddress: "",
    shopAddress: "",
    panCard: null,
    aadharCard: null
  })

  const registerVendorMutation = useMutation({
    mutationFn: async (formData) => {
      const data = await registerVendor(formData)
      return data
    },

    onSuccess: (data) => {
      console.log('Registration response:', data)
      
      // Store vendor data in localStorage for onboarding flow
      // Try different possible response structures
      const vendorData = data?.data?.vendor || data?.vendor || data?.data
      if (vendorData) {
        console.log('Storing vendor data:', vendorData)
        localStorage.setItem('pendingVendor', JSON.stringify(vendorData))
      } else {
        console.warn('Could not find vendor data in response')
      }
      
      alert("Vendor registration successful! Online verification completed. Redirecting to your dashboard...")
      setTimeout(() => {
        navigate('/vendor/documents')
      }, 2000)
    },

    onError: (error) => {
      console.error("Vendor registration failed: ", error.message.message)
      console.log(error)
      alert(error.message)
    }
  })

  const handleChange = (e) => {
    const { name, value, files } = e.target

    if (name === "panCard" || name === "aadharCard") {
      setForm({ ...form, [name]: files[0] || null })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate that both documents are uploaded
    if (!form.panCard || !form.aadharCard) {
      alert("Please upload both PAN Card and Aadhar Card")
      return
    }

    const formDataObj = new FormData()
    formDataObj.append("fullname", form.fullname)
    formDataObj.append("email", form.email)
    formDataObj.append("phone", form.phone)
    formDataObj.append("shopName", form.shopName)
    formDataObj.append("personalAddress", form.personalAddress)
    formDataObj.append("shopAddress", form.shopAddress)
    formDataObj.append("panCard", form.panCard)
    formDataObj.append("aadharCard", form.aadharCard)

    registerVendorMutation.mutate(formDataObj)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full p-4 shadow-lg">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Register as Service Provider
          </CardTitle>
          <p className="text-gray-600 text-sm">Join AutoServe's network of trusted vendors</p>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
              
              <div className="space-y-2">
                <label htmlFor="fullname" className="text-sm font-medium text-gray-700 block">
                  Full Name <span className="text-red-500">*</span>
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                      />
                    </svg>
                  </div>
                  <Input
                    id="fullname"
                    name="fullname"
                    type="text"
                    value={form.fullname}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="pl-10 h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                    Email Address <span className="text-red-500">*</span>
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
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" 
                        />
                      </svg>
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="vendor@example.com"
                      className="pl-10 h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"

                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700 block">
                    Phone Number <span className="text-red-500">*</span>
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
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                        />
                      </svg>
                    </div>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="pl-10 h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"

                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="personalAddress" className="text-sm font-medium text-gray-700 block">
                  Personal Address <span className="text-red-500">*</span>
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
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                      />
                    </svg>
                  </div>
                  <Input
                    id="personalAddress"
                    name="personalAddress"
                    type="text"
                    value={form.personalAddress}
                    onChange={handleChange}
                    placeholder="Ahmedabad, Gujarat"
                    className="pl-10 h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Business Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Information</h3>
              
              <div className="space-y-2">
                <label htmlFor="shopName" className="text-sm font-medium text-gray-700 block">
                  Shop/Business Name <span className="text-red-500">*</span>
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                      />
                    </svg>
                  </div>
                  <Input
                    id="shopName"
                    name="shopName"
                    type="text"
                    value={form.shopName}
                    onChange={handleChange}
                    placeholder="AutoServe Workshop"
                    className="pl-10 h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="shopAddress" className="text-sm font-medium text-gray-700 block">
                  Shop/Business Address <span className="text-red-500">*</span>
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                      />
                    </svg>
                  </div>
                  <Input
                    id="shopAddress"
                    name="shopAddress"
                    type="text"
                    value={form.shopAddress}
                    onChange={handleChange}
                    placeholder="456 Ahmedabad, Gujarat"
                    className="pl-10 h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Verification Documents</h3>
              <p className="text-sm text-gray-600">Please upload clear images of your documents for verification</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="panCard" className="text-sm font-medium text-gray-700 block">
                    PAN Card <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <label 
                      htmlFor="panCard" 
                      className={`flex items-center justify-center w-full h-24 px-4 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                        form.panCard 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2 text-gray-600">
                        <svg 
                          className="h-8 w-8" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                          />
                        </svg>
                        <span className="text-xs text-center">
                          {form.panCard ? form.panCard.name : 'Upload PAN Card'}
                        </span>
                      </div>
                    </label>
                    <input
                      type="file"
                      name="panCard"
                      id="panCard"
                      onChange={handleChange}
                      className="hidden"
                      accept="image/*"

                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="aadharCard" className="text-sm font-medium text-gray-700 block">
                    Aadhar Card <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <label 
                      htmlFor="aadharCard" 
                      className={`flex items-center justify-center w-full h-24 px-4 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                        form.aadharCard 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2 text-gray-600">
                        <svg 
                          className="h-8 w-8" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                          />
                        </svg>
                        <span className="text-xs text-center">
                          {form.aadharCard ? form.aadharCard.name : 'Upload Aadhar Card'}
                        </span>
                      </div>
                    </label>
                    <input
                      type="file"
                      name="aadharCard"
                      id="aadharCard"
                      onChange={handleChange}
                      className="hidden"
                      accept="image/*"

                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg 
                  className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Verification Process</p>
                  <p className="mt-1">Your documents will undergo online verification. Once approved, our team will contact you for physical verification of your workshop.</p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={registerVendorMutation.isPending}
            >
              {registerVendorMutation.isPending ? (
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
                  Processing registration...
                </div>
              ) : (
                'Register as Service Provider'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Already registered?</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Already have a vendor account?{' '}
              <Link 
                to="/login" 
                className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              Want to register as a customer?{' '}
              <Link 
                to="/signup" 
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
              >
                Customer Sign Up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VendorSignup
