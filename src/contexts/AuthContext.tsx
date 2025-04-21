/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { getUser } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import Loading from "@/components/Loading";
import Cookies from "js-cookie";

interface AuthContextType {
  user: { name: string; email: string } | null;
  isLoading: boolean;
  setUser: (user: { name: string; email: string } | null) => void; // Añadir para actualizar manualmente
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario inicial
  useEffect(() => {
    const token = Cookies.get("jwt-token"); // o js-cookie
    if (!token) {
      setIsLoading(false);
      return;
    }
    async function fetchUser() {
      const authenticatedUser = await getUser();
      setUser(authenticatedUser);
      setIsLoading(false);
    }
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <Loading text="Cargando..." />;
  }

  return <>{children}</>;
}
