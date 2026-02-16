import { createContext, useEffect, useState } from "react";
import { useFetchCurrentUser } from "../hooks/useFetchCurrentUser";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data, isLoading } = useFetchCurrentUser();

  // User object normalized
  const user = data?.data?.user ?? null;

  // Prevent UI flicker until first auth check completes
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setInitialized(true);
    }
  }, [isLoading]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}
