import { useState } from 'react';

const SERVICES = [
  { id: 'mechanical', name: 'Mechanical Service' },
  { id: 'electrical', name: 'Electrical Service' },
  { id: 'carwash', name: 'Wash & Detailing' },
  { id: 'battery', name: 'Battery Service' },
];

export default function ServiceSelector({ bookingId, onSubmitted }) {
  const [selected, setSelected] = useState([]);
  const [fee, setFee] = useState('');
  const [loading, setLoading] = useState(false);

  const toggle = id => setSelected(s =>
    s.includes(id) ? s.filter(x => x !== id) : [...s, id]
  );

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/v1/vendor/booking/${bookingId}/diagnosis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        issues: [],
        services: selected.map(id => ({ serviceId: id, quotedPrice: 0 })),
        inspectionFeeFinal: Number(fee),
      }),
    });
    setLoading(false);
    onSubmitted && onSubmitted();
  };

  return (
    <form className="bg-gray-50 rounded-lg p-4 shadow-inner mt-4" onSubmit={submit}>
      <div className="mb-2 font-semibold">Select Services:</div>
      <div className="flex flex-wrap gap-4 mb-2">
        {SERVICES.map(s => (
          <label key={s.id} className="flex items-center gap-2">
            <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} />
            {s.name}
          </label>
        ))}
      </div>
      <input
        type="number"
        className="border rounded px-2 py-1 mr-2"
        placeholder="Inspection Fee"
        value={fee}
        onChange={e => setFee(e.target.value)}
        required
        min="0"
      />
      <button
        className="bg-blue-500 text-white px-4 py-1 rounded shadow hover:bg-blue-600"
        type="submit"
        disabled={loading || !selected.length || !fee}
      >
        {loading ? 'Adding...' : 'Add Services'}
      </button>
    </form>
  );
}
