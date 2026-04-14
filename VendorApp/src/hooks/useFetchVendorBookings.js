import { useQuery } from "@tanstack/react-query";
import { getVendorBookings } from "../services/auth";

export function useFetchVendorBookings() {
  return useQuery({
    queryKey: ["vendorBookings"],
    queryFn: getVendorBookings,
  });
}
