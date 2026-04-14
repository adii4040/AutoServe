import React, { useState } from 'react';


const DEFAULT_SERVICES = [
  { customServiceName: 'Mechanical Service', quotedPrice: '' },
  { customServiceName: 'Electrical Service', quotedPrice: '' },
  { customServiceName: 'Wash & Detailing', quotedPrice: '' },
  { customServiceName: 'Battery Service', quotedPrice: '' },
];

const InspectionForm = ({ onSubmit, loading, initialFee = '', initialIssues = '', initialServices = [] }) => {
  const [services, setServices] = useState(initialServices.length ? initialServices : DEFAULT_SERVICES);
  const [inspectionFee, setInspectionFee] = useState(initialFee);
  const [issues, setIssues] = useState(initialIssues);

  const handleServiceChange = (idx, field, value) => {
    setServices((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const handleAddService = () => {
    setServices((prev) => [...prev, { customServiceName: '', quotedPrice: '' }]);
  };

  const handleRemoveService = (idx) => {
    setServices((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      services: services.filter(s => s.customServiceName && s.quotedPrice),
      inspectionFee: Number(inspectionFee),
      issues: issues.split(',').map((i) => i.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 className="text-lg font-bold mb-4">Inspection / Diagnosis</h3>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Suggested Services & Quoted Fees:</label>
        <div className="flex flex-col gap-3">
          {services.map((service, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Service Name"
                value={service.customServiceName}
                onChange={e => handleServiceChange(idx, 'customServiceName', e.target.value)}
                className="border rounded px-2 py-1 flex-1"
                required
              />
              <input
                type="number"
                placeholder="Quoted Fee (₹)"
                min="0"
                value={service.quotedPrice}
                onChange={e => handleServiceChange(idx, 'quotedPrice', e.target.value)}
                className="border rounded px-2 py-1 w-32"
                required
              />
              {services.length > 1 && (
                <button type="button" onClick={() => handleRemoveService(idx)} className="text-red-500 text-xs">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddService} className="text-blue-600 text-xs mt-2">+ Add Service</button>
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Inspection Fee (₹):</label>
        <input
          type="number"
          min="0"
          value={inspectionFee}
          onChange={(e) => setInspectionFee(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Issues (comma separated):</label>
        <input
          type="text"
          value={issues}
          onChange={(e) => setIssues(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="e.g. Engine noise, Battery low"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Diagnosis'}
      </button>
    </form>
  );
};

export default InspectionForm;
