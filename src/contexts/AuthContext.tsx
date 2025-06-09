/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { getUser } from "@/lib/auth";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "@/components/Loading";
import Cookies from "js-cookie";
import { setLogoutCallback } from "@/lib/authHanlder";

interface AuthContextType {
  user: { name: string; email: string; isAdmin: boolean } | null;
  isLoading: boolean;
  setUser: (
    user: { name: string; email: string; isAdmin: boolean } | null
  ) => void; // Añadir para actualizar manualmente
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
  const [user, setUser] = useState<{
    name: string;
    email: string;
    isAdmin: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario inicial
  useEffect(() => {
    const token = Cookies.get("XSRF-TOKEN"); // Token de autenticación
    if (!token) {
      setIsLoading(false);
      return;
    }
    async function fetchUser() {
      const authenticatedUser = await getUser();
      const isAdmin =
        authenticatedUser.email === "jk@logex.ec" ||
        authenticatedUser.email === "juan.jara@logex.ec" ||
        authenticatedUser.email === "jhony.vallejo@logex.ec" ||
        authenticatedUser.email === "ricardo.estrella@logex.ec";
      authenticatedUser["isAdmin"] = isAdmin;

      setUser(authenticatedUser);
      setIsLoading(false);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    setLogoutCallback(() => {
      setUser(null);
    });
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
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [user, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return <Loading text="Cargando..." />;
  }

  return <>{children}</>;
}
