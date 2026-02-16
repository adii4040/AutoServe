import { useQuery } from "@tanstack/react-query";
import {fetchAllUnverifiedVendors} from '../Services/employee/fetchAllUnverifiedVendor.employee.services'

const useFetchUnverifiedVendors = () => {
  return useQuery({
    queryKey: ["unverifiedVendors"],
    queryFn: fetchAllUnverifiedVendors,
    retry: false,
    staleTime: 0,
  });
};

export { useFetchUnverifiedVendors };