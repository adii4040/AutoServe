
import Layout from '../components/Layout'
import '../styles/dashboard.css'
import { useFetchVendorStats } from '../hooks/useFetchVendorStats'


function Dashboard() {
  const { data: stats = {}, isLoading, isError, error } = useFetchVendorStats();

  return (
    <Layout>
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : isError ? (
          <p className="error">{error?.message || "Failed to load stats."}</p>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Bookings</h3>
              <p className="stat-value">{stats.totalBookings}</p>
            </div>
            <div className="stat-card">
              <h3>Active Bookings</h3>
              <p className="stat-value">{stats.activeBookings}</p>
            </div>
            <div className="stat-card">
              <h3>Completed</h3>
              <p className="stat-value">{stats.completedBookings}</p>
            </div>
            <div className="stat-card">
              <h3>Revenue</h3>
              <p className="stat-value">₹{(stats.revenue || 0).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Dashboard
