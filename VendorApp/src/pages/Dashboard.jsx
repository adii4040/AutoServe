
import Layout from '../components/Layout'
import '../styles/dashboard.css'
import { useFetchVendorStats } from '../hooks/useFetchVendorStats'


function Dashboard() {
  const { data: stats = {}, isLoading, isError, error } = useFetchVendorStats();
  const revenue = Number(stats.revenue || 0);

  const metrics = [
    {
      label: 'Total bookings',
      value: stats.totalBookings ?? 0,
      note: 'All incoming and active jobs handled by your shop.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      bg: "bg-blue-50",
      color: "text-blue-600"
    },
    {
      label: 'Active bookings',
      value: stats.activeBookings ?? 0,
      note: 'Jobs currently in journey, inspection, or progress.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bg: "bg-amber-50",
      color: "text-amber-600"
    },
    {
      label: 'Completed',
      value: stats.completedBookings ?? 0,
      note: 'Successfully fulfilled and closed service visits.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      bg: "bg-emerald-50",
      color: "text-emerald-600"
    },
    {
      label: 'Total Revenue',
      value: `₹${revenue.toLocaleString()}`,
      note: 'Gross earnings from completed bookings.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM12 2a10 10 0 100 20 10 10 0 000-20z" />
        </svg>
      ),
      bg: "bg-indigo-50",
      color: "text-indigo-600"
    },
  ]

  return (
    <Layout>
      <div className="page-shell">
        <div className="app-hero">
          <div className="z-10">
            <span className="inline-block mb-4 px-3 py-1 bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-md">
              Business Intelligence
            </span>
            <h1 className="page-title">Performance Hub</h1>
            <p className="page-subtitle">Analyze your shop's efficiency and monitor live service operations at a glance.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="state-panel" data-variant="loading">
             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <div>
              <div className="state-title">Synchronizing Dashboard</div>
              <div className="state-copy">Retrieving your latest business performance metrics.</div>
            </div>
          </div>
        ) : isError ? (
          <div className="state-panel" data-variant="error" role="alert">
            <div>
              <div className="state-title">Data Fetch Failed</div>
              <div className="state-copy">{error?.message || 'Please check your connection and try again.'}</div>
            </div>
          </div>
        ) : (
          <div className="metrics-grid">
            {metrics.map((metric) => (
              <div key={metric.label} className="metric-card">
                <div>
                  <div className={`metric-icon-box ${metric.bg} ${metric.color}`}>
                    {metric.icon}
                  </div>
                  <span className="metric-label">{metric.label}</span>
                  <p className="metric-value">{metric.value}</p>
                </div>
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
