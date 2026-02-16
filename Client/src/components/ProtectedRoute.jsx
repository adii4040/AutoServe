import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Protects routes based on user type/role
 * 
 * @param {string} allowedFor - 'user', 'vendor', or 'employee'
 * @param {ReactNode} children - Child components to render if authorized
 */
export default function ProtectedRoute({ allowedFor, children }) {
  const { user } = useContext(AuthContext);

  // Not authenticated at all
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the correct role/type
  const userType = getUserType(user);

  if (userType !== allowedFor) {
    // Redirect to appropriate dashboard based on their actual role
    const redirectPath = getRedirectPath(userType);
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated and has correct role
  return children;
}

/**
 * Determine user type based on user object structure
 * Users and Vendors are stored in different collections
 */
function getUserType(user) {
  // Check if it's an employee (assuming employee has a specific field or role)
  if (user.role === 'employee' || user.isEmployee) {
    return 'employee';
  }
  
  // Check if it's a vendor (vendors have shopName, services, etc.)
  if (user.shopName || user.services || user.isVendor) {
    return 'vendor';
  }
  
  // Default to regular user
  return 'user';
}

/**
 * Get redirect path based on user type
 */
function getRedirectPath(userType) {
  switch (userType) {
    case 'vendor':
      return '/vendor/dashboard';
    case 'employee':
      return '/employee/vendor-verification';
    case 'user':
    default:
      return '/dashboard';
  }
}
