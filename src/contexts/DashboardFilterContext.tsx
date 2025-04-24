// src/contexts/GlobalFilterContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router";

export type GlobalFilters = {
  // Para el dashboard
  period: string;
  projects: string[];
  destinations: string[];
  // Para TripList
  search: string;
  status: string;
  project: string;
  selectedValue: string;
};

type GlobalFilterContextType = {
  filters: GlobalFilters;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>;
  resetFilters: (overrides?: Partial<GlobalFilters>) => void;
};

const defaultFilters: GlobalFilters = {
  period: "last_3_months",
  projects: [],
  destinations: [],
  search: "",
  status: "all",
  project: "all",
  selectedValue: "on",
};

const GlobalFilterContext = createContext<GlobalFilterContextType | null>(null);

export const useGlobalFilters = () => {
  const ctx = useContext(GlobalFilterContext);
  if (!ctx)
    throw new Error("useGlobalFilters must be inside GlobalFilterProvider");
  return ctx;
};

export const GlobalFilterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const [filters, setFilters] = useState<GlobalFilters>(defaultFilters);

  // Cada vez que cambie de ruta, resetea filtros
  useEffect(() => {
    // Si la navegación trae preserveFilters, no resetees
    if (!location.state?.preserveFilters) {
      setFilters(defaultFilters);
    }
  }, [location.pathname]);

  const resetFilters = (overrides: Partial<GlobalFilters> = {}) => {
    setFilters({ ...defaultFilters, ...overrides });
  };

  return (
    <GlobalFilterContext.Provider value={{ filters, setFilters, resetFilters }}>
      {children}
    </GlobalFilterContext.Provider>
  );
};
