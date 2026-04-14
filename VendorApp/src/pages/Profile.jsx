
import React, { useState } from 'react';
import Layout from '../components/Layout'
import '../styles/profile.css'
import { useAuth } from '../context/AuthContext'


function Profile() {
  const { profile: vendor, isLoading } = useAuth();
  const [editing, setEditing] = useState(false);

  const handleSave = async () => {
    // TODO: Update vendor profile on backend
    // PATCH /api/v1/vendor/profile
    setEditing(false);
  }

  return (
    <Layout>
      <div className="profile-container">
        <h1>Vendor Profile</h1>
        {isLoading ? (
          <p>Loading...</p>
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

                <button 
                  className="btn-primary" 
                  onClick={() => setEditing(true)}
                  style={{ marginTop: '20px' }}
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="profile-form">
                <div className="form-group">
                  <label>Shop Name</label>
                  <input 
                    type="text" 
                    value={vendor.shopName}
                    onChange={(e) => setVendor({ ...vendor, shopName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    type="tel" 
                    value={vendor.phone}
                    onChange={(e) => setVendor({ ...vendor, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    value={vendor.city}
                    onChange={(e) => setVendor({ ...vendor, city: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    value={vendor.description}
                    onChange={(e) => setVendor({ ...vendor, description: e.target.value })}
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
              </div>
            )}
          </div>
        ) : (
          <p>Error loading profile</p>
        )}
      </div>
    </Layout>
  )
}

export default Profile
