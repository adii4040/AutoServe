import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, AlertCircle, CheckCircle, Clock, Shield } from 'lucide-react';
import { useRefreshVendor } from '../../hooks/useRefreshVendor';

export default function Documents() {
  const [vendorInfo, setVendorInfo] = useState(null);
  const [documents, setDocuments] = useState({
    panCard: null,
    aadhaarCard: null,
    businessProof: null
  });

  const [verificationStatus, setVerificationStatus] = useState({
    status: 'Pending Review',
    message: 'Your documents are under review',
    stage: 'Pending' // Pending, Online, Physical, Approved
  });

  // Refresh vendor data periodically
  const { data: refreshedVendorData } = useRefreshVendor();

  useEffect(() => {
    // Get vendor data from localStorage
    const storedVendor = localStorage.getItem('pendingVendor');
    if (storedVendor) {
      const vendor = JSON.parse(storedVendor);
      setVendorInfo(vendor);
      
      // Set verification status based on vendor data
      if (vendor.isVerified) {
        setVerificationStatus({
          status: 'Account Verified',
          message: 'Congratulations! Your account has been verified and approved.',
          stage: 'Approved'
        });
      } else {
        // After registration, vendor is at "Online" stage (documents submitted)
        setVerificationStatus({
          status: 'Online Verification Complete',
          message: 'Your documents are under review. Physical verification is pending.',
          stage: 'Online'
        });
      }
    }
  }, []);

  // Update vendorInfo and verification status when refreshed data arrives
  useEffect(() => {
    if (refreshedVendorData?.data?.vendor) {
      const vendor = refreshedVendorData.data.vendor;
      setVendorInfo(vendor);
      
      // Update verification status
      if (vendor.isVerified) {
        setVerificationStatus({
          status: 'Account Verified',
          message: 'Congratulations! Your account has been verified and approved.',
          stage: 'Approved'
        });
      } else {
        setVerificationStatus({
          status: 'Online Verification Complete',
          message: 'Your documents are under review. Physical verification is pending.',
          stage: 'Online'
        });
      }
    }
  }, [refreshedVendorData]);

  // Create refs for file inputs
  const fileInputRefs = {
    panCard: React.useRef(null),
    aadhaarCard: React.useRef(null),
    businessProof: React.useRef(null)
  };

  const handleFileUpload = (documentType, event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload JPG, PNG, or PDF files only');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setDocuments(prev => ({
        ...prev,
        [documentType]: file
      }));
    }
  };

  const triggerFileInput = (documentType) => {
    fileInputRefs[documentType].current?.click();
  };

  const getStatusColor = (stage) => {
    switch (stage) {
      case 'Pending':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Online':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Physical':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Approved':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const documentTypes = [
    {
      id: 'panCard',
      title: 'PAN Card',
      description: 'No document uploaded',
      icon: FileText
    },
    {
      id: 'aadhaarCard',
      title: 'Aadhaar Card',
      description: 'No document uploaded',
      icon: FileText
    },
    {
      id: 'businessProof',
      title: 'Business Proof',
      description: 'No document uploaded',
      icon: FileText
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents & Verification</h1>
        <p className="text-gray-600">Upload your documents to complete the verification process</p>
      </div>

      {/* Verification Status Card */}
      <Card className={`border-l-4 ${verificationStatus.stage === 'Approved' ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50' : 'border-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50'}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${verificationStatus.stage === 'Approved' ? 'bg-green-100' : 'bg-orange-100'}`}>
              {verificationStatus.stage === 'Approved' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-orange-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Shield className={`w-5 h-5 ${verificationStatus.stage === 'Approved' ? 'text-green-600' : 'text-orange-600'}`} />
                <h3 className={`font-bold ${verificationStatus.stage === 'Approved' ? 'text-green-900' : 'text-orange-900'}`}>Verification Status</h3>
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${verificationStatus.stage === 'Approved' ? 'text-green-600' : 'text-orange-600'}`}>{verificationStatus.status}</h2>
              <p className="text-gray-700">{verificationStatus.message}</p>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Pending</span>
                  <span className="text-sm font-medium text-gray-600">Online</span>
                  <span className="text-sm font-medium text-gray-600">Physical</span>
                  <span className="text-sm font-medium text-gray-600">Approved</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${verificationStatus.stage === 'Approved' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-orange-500 to-yellow-500'}`} 
                    style={{ width: verificationStatus.stage === 'Approved' ? '100%' : '50%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {documentTypes.map((docType) => (
          <Card key={docType.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <docType.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{docType.title}</h3>
                  <p className="text-sm text-gray-500">
                    {documents[docType.id] ? documents[docType.id].name : docType.description}
                  </p>
                </div>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRefs[docType.id]}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={(e) => handleFileUpload(docType.id, e)}
                  className="hidden"
                />
                
                {/* Upload button */}
                <Button 
                  variant="outline" 
                  className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                  onClick={() => triggerFileInput(docType.id)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                
                {documents[docType.id] && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">File uploaded</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Document Guidelines */}
      <Card className="border-none shadow-md bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <FileText className="w-5 h-5 text-blue-600" />
            Document Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-blue-900">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Upload clear, readable copies of your documents</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Accepted formats: JPG, PNG, PDF</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Maximum file size: 5MB per document</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>All documents must be valid and not expired</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" className="px-8">
          Cancel
        </Button>
        <Button 
          className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          disabled={!documents.panCard || !documents.aadhaarCard || !documents.businessProof}
        >
          Submit for Verification
        </Button>
      </div>
    </div>
  );
}
