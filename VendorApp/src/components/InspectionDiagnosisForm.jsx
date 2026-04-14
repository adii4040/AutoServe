import React, { useState } from 'react';

// Example static list of services (can be fetched from backend)
const SERVICE_OPTIONS = [
  { id: 'mechanical', name: 'Mechanical Service' },
  { id: 'electrical', name: 'Electrical Service' },
  { id: 'carwash', name: 'Car Wash & Detailing' },
  { id: 'battery', name: 'Battery Service' },
  { id: 'tyre', name: 'Tyre Service' },
];

export default function InspectionDiagnosisForm({ bookingId, onSubmitted }) {
  const [selectedServices, setSelectedServices] = useState([]);
  const [issues, setIssues] = useState('');
  const [inspectionFee, setInspectionFee] = useState('');
  const [loading, setLoading] = useState(false);

  const handleServiceToggle = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        issues: issues.split(',').map((i) => i.trim()).filter(Boolean),
        services: selectedServices.map((id) => ({ serviceId: id, quotedPrice: 0 })), // Add price input if needed
        inspectionFeeFinal: Number(inspectionFee),
      };
      const res = await fetch(`/api/v1/bookings/${bookingId}/diagnosis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to submit diagnosis');
      onSubmitted && onSubmitted();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '16px 0', padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
      <h3>Inspection Diagnosis</h3>
      <div>
        <label>Issues (comma separated):</label><br />
        <input value={issues} onChange={e => setIssues(e.target.value)} placeholder="e.g. Engine noise, Oil leak" style={{ width: '100%' }} />
      </div>
      <div style={{ margin: '12px 0' }}>
        <label>Select Services:</label><br />
        {SERVICE_OPTIONS.map((service) => (
          <label key={service.id} style={{ marginRight: 12 }}>
            <input
              type="checkbox"
              checked={selectedServices.includes(service.id)}
              onChange={() => handleServiceToggle(service.id)}
            />{' '}
            {service.name}
          </label>
        ))}
      </div>
      <div>
        <label>Inspection Fee (₹):</label><br />
        <input type="number" value={inspectionFee} onChange={e => setInspectionFee(e.target.value)} required min="0" />
      </div>
      <button type="submit" disabled={loading || !selectedServices.length || !inspectionFee} style={{ marginTop: 12 }}>
        {loading ? 'Submitting...' : 'Submit Diagnosis'}
      </button>
    </form>
  );
}
