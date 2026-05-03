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
      inspectionFee: 200,
      issues: issues.split(',').map((i) => i.trim()).filter(Boolean),
    });
  };

  return (
    <div className="surface-panel !bg-white">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Diagnostic Report</h3>
        </div>

        <div className="mb-8">
          <label className="field-label mb-4">Suggested Services & Quoted Fees</label>
          <div className="space-y-3">
            {services.map((service, idx) => (
              <div key={idx} className="flex gap-3 items-center group">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Service name (e.g. Oil Change)"
                    value={service.customServiceName}
                    onChange={e => handleServiceChange(idx, 'customServiceName', e.target.value)}
                    className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white transition-all"
                    required
                  />
                </div>
                <div className="relative w-40">
                  <span className="absolute left-3 top-3.5 text-gray-400 font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="Fee"
                    min="0"
                    value={service.quotedPrice}
                    onChange={e => handleServiceChange(idx, 'quotedPrice', e.target.value)}
                    className="w-full pl-7 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white transition-all text-right font-bold"
                    required
                  />
                </div>
                {services.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => handleRemoveService(idx)} 
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={handleAddService} 
              className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 mt-4 px-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Service Item
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="field">
            <label className="field-label">Inspection Fee (Fixed)</label>
            <div className="relative">
               <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₹</span>
              <input
                type="number"
                value="200"
                readOnly
                className="w-full pl-8 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-500 cursor-not-allowed"
                required
              />
            </div>
            <p className="field-help italic text-blue-600 font-semibold">Standard platform inspection fee.</p>
          </div>
          <div className="field">
            <label className="field-label">Identified Issues</label>
            <input
              type="text"
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white transition-all"
              placeholder="e.g. Engine noise, worn pads"
              required
            />
            <p className="field-help">Comma separated list of findings.</p>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting Report...
            </div>
          ) : 'Submit Diagnostic Report'}
        </button>
      </form>
    </div>
  );
};

export default InspectionForm;
