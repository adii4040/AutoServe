import { useQuery } from "@tanstack/react-query"
import { getCurrentVendor } from "../services/auth"

const useFetchCurrentVendor = ({ enabled = true } = {}) => {
  return useQuery({
    queryKey: ["currentVendor"],
    queryFn: getCurrentVendor,
    enabled,
    retry: false,
    staleTime: 0,
  })
}

export { useFetchCurrentVendor }
