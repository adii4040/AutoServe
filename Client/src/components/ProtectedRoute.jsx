import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ allowedActor = 'ANY', children }) {
  const { actor, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    if (allowedActor === 'VENDOR') {
      return <Navigate to="/vendor-login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (allowedActor !== 'ANY' && actor !== allowedActor) {
    if (actor === 'VENDOR') {
      return <Navigate to="/vendor/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
