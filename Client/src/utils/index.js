// Utility functions
export const createPageUrl = (pageName) => {
  const routes = {
    'Home': '/',
    'Dashboard': '/dashboard',
    'UserDashboard': '/dashboard',
    'Profile': '/profile',
    'MyBookings': '/my-bookings',
    'MyJobs': '/my-jobs',
    'InspectionDetail': '/inspection-detail',
    // Vendor Dashboard Routes
    'VendorDashboard': '/vendor/dashboard',
    'VendorBookings': '/vendor/bookings',
    'VendorBookService': '/vendor/book-service',
    'VendorProfile': '/vendor/profile',
  };
  return routes[pageName] || '/';
};

export default {
  createPageUrl,
};
