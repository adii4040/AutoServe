const statusStyles = {
  COMPLETED: 'chip' + " " + "" ,
  SERVICE_IN_PROGRESS: 'chip',
  INSPECTION_IN_PROGRESS: 'chip',
  WAITING_FOR_USER_APPROVAL: 'chip',
  CANCELLED: 'chip',
  VENDOR_ASSIGNED: 'chip',
  VENDOR_EN_ROUTE: 'chip',
  DISPATCHING: 'chip',
  CREATED: 'chip',
};

const statusTone = {
  COMPLETED: 'success',
  SERVICE_IN_PROGRESS: 'primary',
  INSPECTION_IN_PROGRESS: 'warning',
  WAITING_FOR_USER_APPROVAL: 'warning',
  CANCELLED: 'danger',
  VENDOR_ASSIGNED: 'primary',
  VENDOR_EN_ROUTE: 'primary',
  DISPATCHING: 'primary',
  CREATED: 'primary',
};

export default function StatusBadge({ status }) {
  if (!status || typeof status !== 'string') {
    return <span className="chip" data-tone="primary">Unknown</span>;
  }

  const tone = statusTone[status] || 'primary';
  return (
    <span className="chip" data-tone={tone}>
      {status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
    </span>
  );
}
