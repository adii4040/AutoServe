import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ allowedActor = 'VENDOR' }) {
  const { actor, isLoading } = useAuth()

  if (isLoading) {
    return <div className="loading-screen">Loading...</div>
  }

  if (!actor || actor !== allowedActor) {
    return <Navigate to="/vendor-login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
