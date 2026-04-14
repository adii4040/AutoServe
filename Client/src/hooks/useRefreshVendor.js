import { useQuery } from "@tanstack/react-query";
// import removed: Vendor.services.js deleted

const useRefreshVendor = () => {
  return useQuery({
    queryKey: ["currentVendor", "refresh"],
    // queryFn removed: vendor fetching not needed
    enabled: true,
    retry: false,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

export { useRefreshVendor };
