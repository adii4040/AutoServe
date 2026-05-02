import { useQuery } from "@tanstack/react-query";
import { getVendorOngoingBookings, getVendorRequestedBookings } from "../services/auth";

export function useFetchVendorOngoingBookings() {
  return useQuery({
    queryKey: ["vendorOngoingBookings"],
    queryFn: getVendorOngoingBookings,
  });
}

export function useFetchVendorRequestedBookings() {
  return useQuery({
    queryKey: ["vendorRequestedBookings"],
    queryFn: getVendorRequestedBookings,
  });
}

