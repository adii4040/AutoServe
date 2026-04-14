import Layout from '../components/Layout';
import InspectionDiagnosisForm from '../components/InspectionDiagnosisForm';
import { useFetchVendorOngoingBookings } from '../hooks/useFetchVendorTabs';
import { useState } from 'react';
import { updateVendorBookingState } from '../services/vendorBookingState';
import { Link } from 'react-router-dom';
import OngoingBookingsList from '../components/OngoingBookingsList';

const allowedVendorTransitions = {
  VENDOR_ASSIGNED: ['VENDOR_EN_ROUTE'],
  VENDOR_EN_ROUTE: ['INSPECTION_IN_PROGRESS'],
  INSPECTION_IN_PROGRESS: ['WAITING_FOR_USER_APPROVAL'],
  WAITING_FOR_USER_APPROVAL: [],
  SERVICE_IN_PROGRESS: ['COMPLETED'],
};

function Bookings() {
  const [processing, setProcessing] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const { data: ongoingData, isLoading, isError, error } = useFetchVendorOngoingBookings();
  const bookings = ongoingData?.data?.bookings || [];

  const filteredBookings = bookings.filter((booking) => {
    const customer = booking.user?.fullname || booking.user?.email || '';
    const service = booking.requestedServiceCategories?.join(', ') || '';
    if (!searchQuery) return true;
    return (
      customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getAllowedNextStates = (currentState) =>
    allowedVendorTransitions[currentState] || [];

  const handleStateChange = async (bookingId, newState) => {
    setProcessing((prev) => ({ ...prev, [bookingId]: true }));
    try {
      await updateVendorBookingState(bookingId, newState);
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Failed to update booking state');
    } finally {
      setProcessing((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Bookings</h1>
          <Link
            to="/requested-bookings"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View requested bookings →
          </Link>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by customer or service..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full mb-6 px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
        />

        {/* States */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-gray-400">Loading bookings...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-red-400">
              {error?.message || 'Failed to load bookings.'}
            </p>
          </div>
        ) : (
          <>
            <OngoingBookingsList
              bookings={filteredBookings}
              processing={processing}
              getAllowedNextStates={getAllowedNextStates}
              onStateChange={handleStateChange}
            />
          </>
        )}
      </div>
    </Layout>
  );
}

export default Bookings;