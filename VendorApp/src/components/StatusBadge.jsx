const statusClasses = {
  COMPLETED: 'chip-success',
  SERVICE_IN_PROGRESS: 'chip-primary',
  INSPECTION_IN_PROGRESS: 'chip-warning',
  WAITING_FOR_USER_APPROVAL: 'chip-warning',
  CANCELLED: 'chip-error',
  VENDOR_ASSIGNED: 'chip-primary',
  VENDOR_EN_ROUTE: 'chip-primary',
  DISPATCHING: 'chip-primary',
  CREATED: 'chip-primary',
};

export default function StatusBadge({ status }) {
  if (!status || typeof status !== 'string') {
    return <span className="chip chip-primary">Unknown</span>;
  }

  const className = statusClasses[status] || 'chip-primary';
  const label = status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  
  return (
    <span className={`chip ${className}`}>
      {label}
    </span>
  );
}
