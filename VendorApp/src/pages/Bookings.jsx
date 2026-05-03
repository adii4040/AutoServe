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
      <div className="page-shell">
        <div className="app-hero">
          <div className="z-10">
            <span className="inline-block mb-4 px-3 py-1 bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-md">
              Operations Center
            </span>
            <h1 className="page-title">Active Bookings</h1>
            <p className="page-subtitle">Manage your current service pipeline and track ongoing customer assignments.</p>
          </div>
        </div>

        <div className="surface-panel mb-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Search bookings</label>
              <Link to="/requested-bookings" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                View Requests →
              </Link>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by customer or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
              <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-400 font-medium">Showing {filteredBookings.length} of {bookings.length} bookings.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="state-panel" data-variant="loading">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <div>
              <div className="state-title">Loading bookings</div>
              <div className="state-copy">Syncing your active service list.</div>
            </div>
          </div>
        ) : isError ? (
          <div className="state-panel" data-variant="error">
            <div>
              <div className="state-title">Unable to load</div>
              <div className="state-copy">{error?.message || 'Failed to fetch bookings.'}</div>
            </div>
          </div>
        ) : (
          <OngoingBookingsList
            bookings={filteredBookings}
            processing={processing}
            getAllowedNextStates={getAllowedNextStates}
            onStateChange={handleStateChange}
          />
        )}
      </div>
    </Layout>
  );
}

export default Bookings;