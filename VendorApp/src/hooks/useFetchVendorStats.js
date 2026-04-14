import { useQuery } from "@tanstack/react-query";
import { getVendorOngoingBookings, getVendorRequestedBookings } from "../services/auth";

export function useFetchVendorStats() {
  return useQuery({
    queryKey: ["vendorStats"],
    queryFn: async () => {
      // Fetch both ongoing and requested bookings for stats
      const [ongoing, requested] = await Promise.all([
        getVendorOngoingBookings(),
        getVendorRequestedBookings(),
      ]);
      // Merge bookings arrays (remove duplicates by _id if needed)
      const allBookings = [...(ongoing.bookings || []), ...(requested.bookings || [])];
      const uniqueBookings = Array.from(new Map(allBookings.map(b => [b._id, b])).values());
      const totalBookings = uniqueBookings.length;
      const completedBookings = uniqueBookings.filter(b => b.state === 'COMPLETED' || b.bookingState === 'COMPLETED').length;
      const activeBookings = uniqueBookings.filter(b => ['ACTIVE', 'SERVICE_IN_PROGRESS', 'INSPECTION_IN_PROGRESS', 'VENDOR_EN_ROUTE'].includes(b.state) || ['ACTIVE', 'SERVICE_IN_PROGRESS', 'INSPECTION_IN_PROGRESS', 'VENDOR_EN_ROUTE'].includes(b.bookingState)).length;
      const revenue = uniqueBookings.reduce((sum, b) => sum + (b.amount || (b.payments?.service?.amount || 0) + (b.payments?.inspection?.amount || 0) || 0), 0);
      return { totalBookings, completedBookings, activeBookings, revenue };
    },
  });
}
