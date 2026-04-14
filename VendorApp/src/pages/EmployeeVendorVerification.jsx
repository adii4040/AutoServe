import { useEffect, useMemo, useState } from 'react'
import { fetchAllUnverifiedVendors, physicalVerifyVendor } from '../services/auth'
import '../styles/employee-vendor.css'

function EmployeeVendorVerification() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [remark, setRemark] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadVendors = async () => {
    try {
      setLoading(true)
      const data = await fetchAllUnverifiedVendors()
      setVendors(data?.data?.vendors || [])
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVendors()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return vendors

    return vendors.filter((vendor) => {
      return (
        vendor?.shopName?.toLowerCase().includes(q) ||
        vendor?.fullname?.toLowerCase().includes(q) ||
        vendor?.phone?.toLowerCase().includes(q) ||
        vendor?.address?.shopAddress?.toLowerCase().includes(q)
      )
    })
  }, [vendors, search])

  const handleVerify = async (status) => {
    if (!selected?._id) return
    if (status === 'REJECTED' && !remark.trim()) {
      alert('Remark is required for rejection')
      return
    }

    try {
      setActionLoading(true)
      await physicalVerifyVendor({
        vendorId: selected._id,
        status,
        remark: remark.trim(),
      })

      setSelected(null)
      setRemark('')
      await loadVendors()
    } catch (err) {
      alert(err.message || 'Verification failed')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="employee-page">
      <div className="employee-header">
        <h1>Vendor Verification</h1>
        <p>Review online verified vendors waiting for physical verification</p>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by shop, owner, phone, address"
        />
      </div>

      {loading && <p className="panel">Loading vendors...</p>}
      {error && <p className="panel error">{error}</p>}

      {!loading && !error && (
        <div className="employee-grid">
          <div className="list-panel">
            <h3>Pending Vendors ({filtered.length})</h3>
            {filtered.length === 0 ? (
              <p>No pending vendors found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Shop</th>
                    <th>Owner</th>
                    <th>Phone</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((vendor) => (
                    <tr key={vendor._id}>
                      <td>{vendor.shopName}</td>
                      <td>{vendor.fullname}</td>
                      <td>{vendor.phone}</td>
                      <td>
                        <button onClick={() => setSelected(vendor)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="detail-panel">
            {!selected ? (
              <p>Select a vendor to review details.</p>
            ) : (
              <>
                <h3>{selected.shopName}</h3>
                <p><strong>Owner:</strong> {selected.fullname}</p>
                <p><strong>Email:</strong> {selected.email}</p>
                <p><strong>Phone:</strong> {selected.phone}</p>
                <p><strong>Personal Address:</strong> {selected?.address?.personalAddress || '-'}</p>
                <p><strong>Shop Address:</strong> {selected?.address?.shopAddress || '-'}</p>

                <div className="doc-links">
                  {selected?.documents?.panCard?.url && (
                    <a href={selected.documents.panCard.url} target="_blank" rel="noreferrer">View PAN Card</a>
                  )}
                  {selected?.documents?.aadhaarCard?.url && (
                    <a href={selected.documents.aadhaarCard.url} target="_blank" rel="noreferrer">View Aadhar Card</a>
                  )}
                </div>

                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Remark (required for rejection)"
                  rows={4}
                />

                <div className="actions">
                  <button disabled={actionLoading} className="approve" onClick={() => handleVerify('APPROVED')}>
                    Approve
                  </button>
                  <button disabled={actionLoading} className="reject" onClick={() => handleVerify('REJECTED')}>
                    Reject
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeVendorVerification
