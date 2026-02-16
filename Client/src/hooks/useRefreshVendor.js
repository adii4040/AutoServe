import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getVendorById } from "../Services/auth/Vendor.services";

const useRefreshVendor = () => {
  // Get vendor ID from localStorage
  const storedVendor = localStorage.getItem('pendingVendor');
  const vendorId = storedVendor ? JSON.parse(storedVendor)._id : null;

  const query = useQuery({
    queryKey: ["refreshVendor", vendorId],
    queryFn: () => getVendorById(vendorId),
    enabled: !!vendorId, // Only run if vendorId exists
    retry: false,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Update localStorage when data changes
  useEffect(() => {
    if (query.data?.data?.vendor) {
      localStorage.setItem('pendingVendor', JSON.stringify(query.data.data.vendor));
    }
  }, [query.data]);

  return query;
};

export { useRefreshVendor };
