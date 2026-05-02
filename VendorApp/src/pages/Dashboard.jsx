
import Layout from '../components/Layout'
import '../styles/dashboard.css'
import { useFetchVendorStats } from '../hooks/useFetchVendorStats'


function Dashboard() {
  const { data: stats = {}, isLoading, isError, error } = useFetchVendorStats();
  const revenue = Number(stats.revenue || 0)

  const metrics = [
    {
      label: 'Total bookings',
      value: stats.totalBookings ?? 0,
      note: 'Combined ongoing and requested jobs.',
    },
    {
      label: 'Active bookings',
      value: stats.activeBookings ?? 0,
      note: 'Jobs currently moving through the workflow.',
    },
    {
      label: 'Completed',
      value: stats.completedBookings ?? 0,
      note: 'Finished and closed service visits.',
    },
    {
      label: 'Revenue',
      value: `₹${revenue.toLocaleString()}`,
      note: 'Collected and recognized service value.',
    },
  ]

  return (
    <Layout>
      <div className="page-shell">
        <div className="page-header app-hero">
          <div>
            <div className="chip" data-tone="primary">Vendor dashboard</div>
            <h1 className="page-title" style={{ marginTop: 12 }}>Business at a glance</h1>
            <p className="page-subtitle">Track bookings, active work, and revenue from a clean overview designed for quick decisions on mobile or desktop.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="state-panel" data-variant="loading">
            <div>
              <div className="state-title">Loading dashboard</div>
              <div className="state-copy">Fetching your latest booking activity and revenue summary.</div>
            </div>
          </div>
        ) : isError ? (
          <div className="state-panel" data-variant="error" role="alert">
            <div>
              <div className="state-title">Dashboard unavailable</div>
              <div className="state-copy">{error?.message || 'Failed to load stats.'}</div>
            </div>
          </div>
        ) : (
          <div className="metrics-grid">
            {metrics.map((metric) => (
              <div key={metric.label} className="metric-card">
                <div className="metric-label">{metric.label}</div>
                <p className="metric-value">{metric.value}</p>
                <p className="metric-note">{metric.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Dashboard
