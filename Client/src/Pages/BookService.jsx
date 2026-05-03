import React, { useState, useContext, useEffect } from 'react';
import { FiTool, FiDroplet, FiBattery, FiCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';

const serviceCardMap = {
  'Mechanical':   'Mechanical Service',
  'Car Wash':     'Car Wash and Detailing',
  'Battery':      'Battery Service',
  'Tyre / Wheel': 'Tyre Service',
};

const serviceCards = [
  { icon: <FiTool size={28} className="text-orange-500" />, title: 'Mechanical', desc: 'Engine, brakes, suspension & general repairs', color: 'border-orange-200 bg-orange-50' },
  { icon: <FiDroplet size={28} className="text-cyan-500" />, title: 'Car Wash', desc: 'Exterior wash, interior cleaning & detailing', color: 'border-cyan-200 bg-cyan-50' },
  { icon: <FiBattery size={28} className="text-yellow-500" />, title: 'Battery', desc: 'Battery testing, jump-start & replacement', color: 'border-yellow-200 bg-yellow-50' },
  { icon: <FiCircle size={28} className="text-purple-500" />, title: 'Tyre / Wheel', desc: 'Flat tyre, wheel balancing, rotation & alignment', color: 'border-purple-200 bg-purple-50' },
];

const vehicleTypes = ['Car', 'Motorcycle', 'Truck', 'SUV', 'Van', 'Other'];

const initialState = {
  serviceCategory: [],
  vehicleType: '',
  brand: '',
  model: '',
  problemDescription: '',
  coordinates: [0, 0],
  formattedAddress: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
};

// ─── ReviewAndConfirm — extracted outside BookService ──────────────────────────
function ReviewAndConfirm({ form, setForm, loading, error, onBack, onSubmit }) {
  const [editingField, setEditingField] = useState(null);
  const [fieldDraft, setFieldDraft] = useState('');

  const requiredFields = [
    form.formattedAddress,
    form.city,
    form.state,
    form.pincode,
    form.vehicleType,
    form.brand,
    form.model,
  ];
  const canConfirm = requiredFields.every(f => f && f.trim().length > 0);

  const startEdit = (field, value) => {
    setEditingField(field);
    setFieldDraft(value || '');
  };

  const confirmEdit = (field) => {
    setForm(prev => ({ ...prev, [field]: fieldDraft }));
    setEditingField(null);
  };

  function renderEditableField(label, field, required = true, options = null) {
    const value = form[field] || '';
    const isEmpty = required && !value.trim();

    return (
      <div className="mb-3" key={field}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-gray-600 min-w-[130px]">{label}</span>
          {editingField === field ? (
            <div className="flex items-center gap-2">
              {options ? (
                <select
                  value={fieldDraft}
                  onChange={e => setFieldDraft(e.target.value)}
                  className="border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  autoFocus
                >
                  <option value="">Select</option>
                  {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input
                  value={fieldDraft}
                  onChange={e => setFieldDraft(e.target.value)}
                  className="border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  autoFocus
                />
              )}
              <button type="button" onClick={() => confirmEdit(field)} className="text-green-600 font-medium text-sm">✓</button>
              <button type="button" onClick={() => setEditingField(null)} className="text-gray-400 text-sm">✕</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isEmpty ? 'text-red-400 italic' : 'text-gray-700'}`}>
                {value || (required ? 'Not detected — required' : 'Optional')}
              </span>
              <button type="button" onClick={() => startEdit(field, value)} className="text-gray-400 hover:text-gray-600">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          )}
        </div>
        {isEmpty && (
          <p className="text-xs text-red-500 mt-1 ml-[138px]">This field is required before confirming</p>
        )}
      </div>
    );
  }

  return (
    <form className="bg-white rounded-xl shadow p-6 border border-gray-100" onSubmit={onSubmit}>
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Review & Confirm</h3>

      {!canConfirm && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-700">
          Some required fields are missing. Please edit them before confirming.
        </div>
      )}

      {/* Service — not editable */}
      <div className="mb-3 flex items-center gap-2">
        <span className="font-medium text-sm text-gray-600 min-w-[130px]">Service</span>
        <span className="text-sm text-gray-700">{form.serviceCategory[0]}</span>
      </div>

      {renderEditableField('Vehicle Type', 'vehicleType', true, vehicleTypes)}
      {renderEditableField('Brand', 'brand')}
      {renderEditableField('Model', 'model')}
      {renderEditableField('Problem', 'problemDescription', false)}

      <div className="border-t border-gray-100 my-4" />

      {renderEditableField('Address', 'formattedAddress')}
      {renderEditableField('Landmark', 'landmark', false)}
      {renderEditableField('City', 'city')}
      {renderEditableField('State', 'state')}
      {renderEditableField('Pincode', 'pincode')}

      {/* Coordinates — read only */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-medium text-sm text-gray-600 min-w-[130px]">Coordinates</span>
        <span className="text-xs text-gray-400 font-mono">
          {form.coordinates[1]?.toFixed(6)}, {form.coordinates[0]?.toFixed(6)}
        </span>
        <span className="text-xs text-gray-300">🔒</span>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <div className="flex justify-between items-center mt-6">
        <button type="button" onClick={onBack} className="text-gray-500 hover:underline text-sm">
          ← Back
        </button>
        <button
          type="submit"
          disabled={!canConfirm || loading}
          className={`px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-all
            ${canConfirm && !loading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          {loading ? 'Booking…' : 'Confirm Booking'}
        </button>
      </div>
    </form>
  );
}

// ─── Stepper ───────────────────────────────────────────────────────────────────
function Stepper({ step }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {[1, 2, 3, 4].map(n => (
        <div
          key={n}
          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm
            ${step >= n ? 'bg-blue-600' : 'bg-gray-300'}`}
        >
          {n}
        </div>
      ))}
    </div>
  );
}

// ─── BookService ───────────────────────────────────────────────────────────────
export default function BookService() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialState);
  const [locationTab, setLocationTab] = useState('gps');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  function handleServiceSelect(title) {
    setForm(f => ({ ...f, serviceCategory: [serviceCardMap[title]] }));
    setStep(2);
  }

  function handleVehicleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleLocationChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleGetLocation() {
    setAddressLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setAddressLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setForm(f => ({ ...f, coordinates: [lng, lat] }));
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          setForm(f => ({
            ...f,
            formattedAddress: data.display_name || '',
            landmark: data.address?.neighbourhood || data.address?.suburb || '',
            city: data.address?.city || data.address?.town || data.address?.village || '',
            state: data.address?.state || '',
            pincode: data.address?.postcode || '',
          }));
        } catch {
          setError('Could not fetch address. Please enter manually.');
        }
        setAddressLoading(false);
      },
      () => {
        setError('Location access denied. Please allow location or enter manually.');
        setAddressLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }


  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      console.log('serviceCategory value:', JSON.stringify(form.serviceCategory));
      const res = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');
      navigate(`/booking/${data.data.booking._id}`);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] pb-10">
      <div className="max-w-2xl mx-auto pt-10 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Book a Service</h2>
        <p className="text-center text-gray-500 mb-8">At your home, office, or on the road — we come to you</p>
        <Stepper step={step} />

        {/* Step 1 — Select Service */}
        {step === 1 && (
          <>
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">What type of service do you need?</h3>
            <p className="text-center text-gray-500 mb-8">Choose a category to get started</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {serviceCards.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  className={`rounded-2xl border ${s.color} p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition-shadow cursor-pointer focus:outline-none
                    ${form.serviceCategory[0] === serviceCardMap[s.title] ? 'ring-2 ring-blue-500 border-blue-300' : ''}`}
                  onClick={() => handleServiceSelect(s.title)}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-white rounded-xl p-3 shadow-md flex items-center justify-center">{s.icon}</div>
                    <div>
                      <div className="font-bold text-lg text-gray-900">{s.title}</div>
                      <div className="text-gray-500 text-sm">{s.desc}</div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2 — Vehicle Details */}
        {step === 2 && (
          <form
            className="bg-white rounded-xl shadow p-6 border border-gray-100"
            onSubmit={e => { e.preventDefault(); setStep(3); }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Vehicle Details</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <select
                name="vehicleType"
                value={form.vehicleType}
                onChange={handleVehicleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select vehicle type</option>
                {vehicleTypes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleVehicleChange}
                placeholder="e.g. Maruti, Honda, Hyundai"
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                name="model"
                value={form.model}
                onChange={handleVehicleChange}
                placeholder="e.g. Swift, City, Creta"
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Problem Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                name="problemDescription"
                value={form.problemDescription}
                onChange={handleVehicleChange}
                placeholder="Describe the issue..."
                rows={3}
                maxLength={500}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{form.problemDescription.length} / 500</p>
            </div>
            <div className="flex justify-between items-center mt-6">
              <button type="button" onClick={() => setStep(1)} className="text-gray-500 hover:underline text-sm">← Back</button>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700">Next</button>
            </div>
          </form>
        )}

        {/* Step 3 — Location */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Your Location</h3>
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${locationTab === 'gps' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setLocationTab('gps')}
              >
                Use GPS
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${locationTab === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setLocationTab('manual')}
              >
                Enter Manually
              </button>
            </div>

            {locationTab === 'gps' && (
              <div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700 mb-4">
                  Your browser will ask for location permission. Please click "Allow" to continue.
                </div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={addressLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow hover:bg-blue-700 disabled:opacity-50 mb-4"
                >
                  {addressLoading ? 'Detecting…' : 'Detect My Location'}
                </button>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
                    {error}
                    <button type="button" onClick={() => setLocationTab('manual')} className="underline ml-1">
                      Enter manually instead
                    </button>
                  </div>
                )}
                {form.formattedAddress && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 mb-4">
                    <p className="font-medium">Location detected</p>
                    <p className="text-green-600 mt-0.5">{form.formattedAddress}</p>
                    {form.city && <p className="text-green-600">{form.city}, {form.state} {form.pincode}</p>}
                  </div>
                )}
                <div className="flex justify-between items-center mt-6">
                  <button type="button" onClick={() => setStep(2)} className="text-gray-500 hover:underline text-sm">← Back</button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    disabled={!form.formattedAddress}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {locationTab === 'manual' && (
              <form onSubmit={e => { e.preventDefault(); setStep(4); }}>
                {[
                  { label: 'Formatted Address', name: 'formattedAddress', required: true, placeholder: 'House/Flat no., Street, Area' },
                  { label: 'Landmark', name: 'landmark', required: false, placeholder: 'Near landmark (optional)' },
                  { label: 'City', name: 'city', required: true, placeholder: 'City' },
                  { label: 'State', name: 'state', required: true, placeholder: 'State' },
                  { label: 'Pincode', name: 'pincode', required: true, placeholder: '6-digit pincode' },
                ].map(field => (
                  <div className="mb-4" key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} {!field.required && <span className="text-gray-400 font-normal">(optional)</span>}
                    </label>
                    <input
                      type={field.name === 'pincode' ? 'tel' : 'text'}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleLocationChange}
                      placeholder={field.placeholder}
                      maxLength={field.name === 'pincode' ? 6 : undefined}
                      required={field.required}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                ))}
                <div className="flex justify-between items-center mt-6">
                  <button type="button" onClick={() => setStep(2)} className="text-gray-500 hover:underline text-sm">← Back</button>
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow hover:bg-blue-700">Next</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Step 4 — Review & Confirm */}
        {step === 4 && (
          <ReviewAndConfirm
            form={form}
            setForm={setForm}
            loading={loading}
            error={error}
            onBack={() => setStep(3)}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {/* Emergency button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm transition-all">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.13 1.05.37 2.07.72 3.06a2 2 0 0 1-.45 2.11l-.27.27a16 16 0 0 0 6.29 6.29l.27-.27a2 2 0 0 1 2.11-.45c.99.35 2.01.59 3.06.72A2 2 0 0 1 21 16.91z"/></svg>
          + Emergency
        </button>
      </div>
    </div>
  );
}