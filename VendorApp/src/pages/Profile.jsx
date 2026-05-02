
import React, { useMemo, useState } from 'react';
import Layout from '../components/Layout'
import '../styles/profile.css'
import { useAuth } from '../context/AuthContext'


function Profile() {
  const { profile: vendor, isLoading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);

  const initialDraft = useMemo(() => ({
    shopName: vendor?.shopName || '',
    phone: vendor?.phone || '',
    city: vendor?.city || '',
    description: vendor?.description || '',
  }), [vendor]);

  const handleEdit = () => {
    setDraft(initialDraft)
    setEditing(true)
  }

  const handleSave = async () => {
    setEditing(false)
  }

  return (
    <Layout>
      <div className="page-shell profile-container">
        <div className="page-header app-hero">
          <div>
            <div className="chip" data-tone="primary">Account profile</div>
            <h1 className="page-title" style={{ marginTop: 12 }}>Vendor profile</h1>
            <p className="page-subtitle">Review your business identity, contact details, and verification status in one place.</p>
          </div>
        </div>
        {isLoading ? (
          <div className="state-panel" data-variant="loading">
            <div>
              <div className="state-title">Loading profile</div>
              <div className="state-copy">Fetching the latest vendor account details.</div>
            </div>
          </div>
        ) : vendor ? (
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-image">
                {vendor.profileImage ? (
                  <img src={vendor.profileImage} alt={vendor.shopName || vendor.fullname || vendor.name} />
                ) : (
                  <div className="placeholder">📱</div>
                )}
              </div>
              <div className="profile-info">
                <h2>{vendor.shopName || vendor.fullname || vendor.name}</h2>
                <p className="email">{vendor.email}</p>
                <span className={`badge ${vendor.verified ? 'verified' : 'unverified'}`}>
                  {vendor.verified ? '✓ Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>

            {!editing ? (
              <div className="profile-details">
                <div className="detail-row">
                  <label>Phone:</label>
                  <span>{vendor.phone}</span>
                </div>
                <div className="detail-row">
                  <label>City:</label>
                  <span>{vendor.city}</span>
                </div>
                <div className="detail-row">
                  <label>Description:</label>
                  <span>{vendor.description}</span>
                </div>

                <button className="btn-primary" onClick={handleEdit} style={{ marginTop: '20px' }}>
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="profile-form">
                <div className="form-group">
                  <label>Shop Name</label>
                  <input 
                    type="text" 
                    value={draft?.shopName || ''}
                    onChange={(e) => setDraft((prev) => ({ ...(prev || initialDraft), shopName: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    type="tel" 
                    value={draft?.phone || ''}
                    onChange={(e) => setDraft((prev) => ({ ...(prev || initialDraft), phone: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    value={draft?.city || ''}
                    onChange={(e) => setDraft((prev) => ({ ...(prev || initialDraft), city: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    value={draft?.description || ''}
                    onChange={(e) => setDraft((prev) => ({ ...(prev || initialDraft), description: e.target.value }))}
                    rows="4"
                  />
                </div>

                <div className="form-actions">
                  <button className="btn-primary" onClick={handleSave}>
                    Save Changes
                  </button>
                  <button className="btn-secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </div>
                <p className="helper-text" style={{ marginTop: 12 }}>
                  Profile saving is still connected to the current backend flow. This edit view now keeps changes local instead of breaking the form.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="state-panel" data-variant="error">
            <div>
              <div className="state-title">Error loading profile</div>
              <div className="state-copy">Unable to load vendor account details.</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Profile
