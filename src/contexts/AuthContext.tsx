/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getUser } from "@/lib/auth";
import { ensureCsrfReady } from "@/lib/axios";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "@/components/Loading";
import { setLogoutCallback } from "@/lib/authHanlder";

type AuthUser = { name: string; email: string; isAdmin: boolean } | null;

interface AuthContextType {
  user: AuthUser;
  isLoading: boolean; // true only while fetching /me
  ready: boolean; // true once CSRF primed AND we've either fetched /me or decided not to on public routes
  setUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return ctx;
}

const PUBLIC_ROUTES = new Set<string>(["/login"]);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);

  const location = useLocation();

  // StrictMode-safe: run bootstrap once, but only when we're on a protected route
  const didInitRef = useRef<boolean>(false);

  useEffect(() => {
    // Always prime CSRF once early; this is cheap and avoids first POST 419s.
    // Do it only once per page load.
    (async () => {
      if (!ready) {
        await ensureCsrfReady();
        // Note: we don't set `ready` here yet; we set it after deciding about /me below
      }
    })();
  }, [ready]);

  useEffect(() => {
    // If we already bootstrapped, nothing to do.
    if (didInitRef.current) return;

    const isPublic = PUBLIC_ROUTES.has(location.pathname);

    // On public pages (e.g., /login), don't call /me; just mark "ready"
    if (isPublic) {
      setIsLoading(false);
      setReady(true);
      return;
    }

    // First time we hit a protected route — bootstrap once
    didInitRef.current = true;
    setIsLoading(true);

    (async () => {
      try {
        const u = await getUser(); // must use the `api` instance internally
        const isAdmin =
          u.email === "jk@logex.ec" ||
          u.email === "juan.jara@logex.ec" ||
          u.email === "jhony.vallejo@logex.ec" ||
          u.email === "ricardo.estrella@logex.ec";
        setUser({ name: u.name, email: u.email, isAdmin });
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
        setReady(true);
      }
    })();
  }, [location.pathname, ready]);

  // Set a logout callback once
  useEffect(() => {
    setLogoutCallback(() => setUser(null));
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ user, isLoading, ready, setUser }),
    [user, isLoading, ready]
  );

  // Optional: if you want a global loader until ready, uncomment:
  if (!ready) return <Loading text="Cargando..." />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading, ready } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!ready) return; // wait until bootstrap decision is made
    if (isLoading) return; // avoid redirect while fetching /me
    if (!user && location.pathname !== "/login") {
      navigate("/login", { replace: true, state: { from: location } });
    }
    //eslint-disable-next-line
  }, [user, isLoading, ready, navigate, location.pathname]);

  if (!ready || isLoading) return <Loading />;
  return <>{children}</>;
}
