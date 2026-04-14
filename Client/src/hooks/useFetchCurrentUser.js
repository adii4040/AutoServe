import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "../Services/auth/User.services";

const useFetchCurrentUser = ({ enabled = true } = {}) => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    enabled,
    retry: false,
    staleTime: 0,
    refetchInterval: (data) => {
      if (data?.data?.user && data?.data?.user?.isEmailVerified) {
        return 5000;
      }
      return false;
    },
  });
};

export { useFetchCurrentUser };
