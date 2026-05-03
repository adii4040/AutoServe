
import React, { useMemo, useState } from 'react';
import Layout from '../components/Layout'
import '../styles/profile.css'
import { useAuth } from '../context/AuthContext'


function Profile() {
  const { profile: vendor, isLoading, refreshAuth } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const SERVICE_CATEGORIES = [
    "Mechanical Service",
    "Electrical Service",
    "Car Wash and Detailing",
    "Battery Service",
    "Tyre Service",
  ];

  const initialDraft = useMemo(() => ({
    fullname: vendor?.fullname || '',
    shopName: vendor?.shopName || '',
    phone: vendor?.phone || '',
    personalAddress: vendor?.address?.personalAddress || '',
    shopAddress: vendor?.address?.shopAddress || '',
    serviceCategories: vendor?.serviceCategories || [],
  }), [vendor]);

  const handleEdit = () => {
    setDraft(initialDraft)
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/vendor/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
        credentials: 'include'
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      await refreshAuth();
      setEditing(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  const toggleCategory = (category) => {
    setDraft(prev => {
      const current = prev.serviceCategories || [];
      if (current.includes(category)) {
        return { ...prev, serviceCategories: current.filter(c => c !== category) };
      } else {
        return { ...prev, serviceCategories: [...current, category] };
      }
    });
  };

  return (
    <Layout>
      <div className="page-shell">
        <div className="app-hero">
          <div className="z-10">
            <span className="inline-block mb-4 px-3 py-1 bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-md">
              Business Profile
            </span>
            <h1 className="page-title">Shop Settings</h1>
            <p className="page-subtitle">Configure your business details, contact information, and service categories.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="state-panel" data-variant="loading">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <div>
              <div className="state-title">Loading profile...</div>
              <div className="state-copy">Fetching your business details.</div>
            </div>
          </div>
        ) : vendor ? (
          <div className="surface-panel">
            <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-100">
               <div className="w-24 h-24 rounded-3xl bg-blue-50 border-4 border-white shadow-md overflow-hidden flex items-center justify-center flex-shrink-0">
                {vendor.avatar?.url ? (
                  <img src={vendor.avatar.url} alt={vendor.shopName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">🏢</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-black text-gray-900">{vendor.shopName}</h2>
                <div className="flex items-center gap-3">
                   <p className="text-gray-500 font-medium">{vendor.email}</p>
                   <span className={`chip ${vendor.isVerified ? 'chip-success' : 'chip-warning'}`}>
                    {vendor.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {!editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="field">
                  <label className="field-label">Full Name</label>
                  <p className="helper-text font-semibold text-gray-800">{vendor.fullname}</p>
                </div>
                <div className="field">
                  <label className="field-label">Phone Number</label>
                  <p className="helper-text font-semibold text-gray-800">{vendor.phone}</p>
                </div>
                <div className="field">
                  <label className="field-label">Personal Address</label>
                  <p className="helper-text font-semibold text-gray-800">{vendor.address?.personalAddress || 'Not set'}</p>
                </div>
                <div className="field">
                  <label className="field-label">Shop Address</label>
                  <p className="helper-text font-semibold text-gray-800">{vendor.address?.shopAddress || 'Not set'}</p>
                </div>
                <div className="field col-span-full">
                  <label className="field-label">Services Provided</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {vendor.serviceCategories?.map(cat => (
                      <span key={cat} className="chip-primary">{cat}</span>
                    ))}
                  </div>
                </div>

                <div className="col-span-full pt-6 border-t border-gray-100 mt-4">
                  <button className="btn-primary" onClick={handleEdit}>
                    Edit Profile Details
                  </button>
                </div>
              </div>
            ) : (
              <div className="form-grid">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="field">
                    <label className="field-label">Full Name</label>
                    <input 
                      type="text" 
                      value={draft?.fullname || ''}
                      onChange={(e) => setDraft((prev) => ({ ...prev, fullname: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Shop Name</label>
                    <input 
                      type="text" 
                      value={draft?.shopName || ''}
                      onChange={(e) => setDraft((prev) => ({ ...prev, shopName: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Phone Number</label>
                    <input 
                      type="tel" 
                      value={draft?.phone || ''}
                      onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Personal Address</label>
                    <input 
                      type="text" 
                      value={draft?.personalAddress || ''}
                      onChange={(e) => setDraft((prev) => ({ ...prev, personalAddress: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div className="field col-span-full">
                    <label className="field-label">Shop Address</label>
                    <input 
                      type="text" 
                      value={draft?.shopAddress || ''}
                      onChange={(e) => setDraft((prev) => ({ ...prev, shopAddress: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="field mt-4">
                  <label className="field-label">Services Provided</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    {SERVICE_CATEGORIES.map(cat => (
                      <label key={cat} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={draft?.serviceCategories?.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-8 border-t border-gray-100 mt-6">
                  <button className="btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                  <button className="btn-ghost" onClick={() => setEditing(false)} disabled={saving}>
                    Discard Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="state-panel" data-variant="error">
            <div>
              <div className="state-title">Profile Unavailable</div>
              <div className="state-copy">There was an issue loading your profile details.</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Profile
