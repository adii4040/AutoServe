import { createContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchCurrentUser } from "../hooks/useFetchCurrentUser";
// import removed: useFetchCurrentVendor deleted

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const userQuery = useFetchCurrentUser();
  // vendor logic removed: vendor fetching not needed

  const user = userQuery.data?.data?.user ?? null;
  const actor = user ? "USER" : null;
  const profile = user || null;
  const initialized = userQuery.isSuccess || userQuery.isError;

  const refreshAuth = async () => {
    await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        actor,
        profile,
        user,
        isAuthenticated: Boolean(profile),
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
