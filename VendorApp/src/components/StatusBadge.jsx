const statusColors = {
  COMPLETED: 'bg-green-500',
  SERVICE_IN_PROGRESS: 'bg-blue-500',
  INSPECTION_IN_PROGRESS: 'bg-blue-400',
  WAITING_FOR_USER_APPROVAL: 'bg-yellow-400',
  CANCELLED: 'bg-red-500',
  VENDOR_ASSIGNED: 'bg-gray-400',
  VENDOR_EN_ROUTE: 'bg-blue-300',
  DISPATCHING: 'bg-gray-300',
  CREATED: 'bg-gray-300',
};

export default function StatusBadge({ status }) {
  if (!status || typeof status !== 'string') {
    return (
      <span className="px-3 py-1 rounded-full text-white text-xs font-semibold bg-gray-400">
        Unknown
      </span>
    );
  }
  return (
    <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${statusColors[status] || 'bg-gray-400'}`}>
      {status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
    </span>
  );
}
