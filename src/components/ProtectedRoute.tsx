import { Navigate, Outlet } from "react-router-dom";
import Loading from "./Loading";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loading text={"Cargando..."} />;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
