import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "./Loading";

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loading text={"Cargando..."} />;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
