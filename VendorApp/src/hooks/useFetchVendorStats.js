import { useQuery } from "@tanstack/react-query";
import { getVendorOngoingBookings, getVendorRequestedBookings } from "../services/auth";

export function useFetchVendorStats() {
  return useQuery({
    queryKey: ["vendorStats"],
    queryFn: async () => {
      // Fetch both ongoing and requested bookings for stats
      const [ongoingRes, requestedRes] = await Promise.all([
        getVendorOngoingBookings(),
        getVendorRequestedBookings(),
      ]);
      const ongoing = ongoingRes?.data?.bookings || [];
      const requested = requestedRes?.data?.bookings || [];
      
      // Merge bookings arrays
      const allBookings = [...ongoing, ...requested];
      const uniqueBookings = Array.from(new Map(allBookings.map(b => [b.bookingId, b])).values());
      
      const totalBookings = uniqueBookings.length;
      const completedBookings = uniqueBookings.filter(b => b.bookingState === 'COMPLETED').length;
      const activeBookings = uniqueBookings.filter(b => ['ACTIVE', 'SERVICE_IN_PROGRESS', 'INSPECTION_IN_PROGRESS', 'VENDOR_EN_ROUTE'].includes(b.bookingState)).length;
      const revenue = uniqueBookings.reduce((sum, b) => {
        const inspectionAmt = b.payments?.inspection?.status === 'PAID' ? (b.payments.inspection.amount || 0) : 0;
        const serviceAmt = b.payments?.service?.status === 'PAID' ? (b.payments.service.amount || 0) : 0;
        return sum + inspectionAmt + serviceAmt;
      }, 0);
      
      return { totalBookings, completedBookings, activeBookings, revenue };
    },
  });
}
