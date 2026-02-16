import { useQuery } from "@tanstack/react-query";
import { getCurrentVendor } from "../Services/auth/Vendor.services";

const useFetchCurrentVendor = ({vendorId}) => {
  return useQuery({
    queryKey: ["currentVendor"],
    queryFn: () => getCurrentVendor({vendorId}),
    retry: false,
    staleTime: 0,
  });
};

export { useFetchCurrentVendor };