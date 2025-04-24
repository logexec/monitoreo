import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router";

type Filters = {
  period: string;
  projects: string[];
  destinations: string[];
};

type GlobalFilterContextType = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  resetFilters: () => void;
};

const defaultFilters: Filters = {
  period: "last_3_months",
  projects: [],
  destinations: [],
};

const GlobalFilterContext = createContext<GlobalFilterContextType | null>(null);

export const useGlobalFilters = () => {
  const context = useContext(GlobalFilterContext);
  if (!context)
    throw new Error(
      "useGlobalFilters must be used within a GlobalFilterProvider"
    );
  return context;
};

export const GlobalFilterProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const location = useLocation();

  // Resetea los filtros al cambiar de ruta si no hay filtros explícitos
  useEffect(() => {
    if (location.state?.preserveFilters !== true) {
      setFilters(defaultFilters);
    }
  }, [location.pathname]);

  const resetFilters = () => setFilters(defaultFilters);

  return (
    <GlobalFilterContext.Provider value={{ filters, setFilters, resetFilters }}>
      {children}
    </GlobalFilterContext.Provider>
  );
};
