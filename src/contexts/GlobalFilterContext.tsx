import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router";
import axios from "axios";

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

// Opciones disponibles para los filtros
type FilterOptions = {
  projectOptions: { label: string; value: string }[];
  destinationOptions: { label: string; value: string }[];
  isLoading: boolean;
};

type GlobalFilterContextType = {
  filters: GlobalFilters;
  filterOptions: FilterOptions;
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

const defaultOptions: FilterOptions = {
  projectOptions: [],
  destinationOptions: [],
  isLoading: false,
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
  const [filterOptions, setFilterOptions] =
    useState<FilterOptions>(defaultOptions);

  // Cada vez que cambie de ruta, resetea filtros
  useEffect(() => {
    // Si la navegación trae preserveFilters, no resetees
    if (!location.state?.preserveFilters) {
      setFilters(defaultFilters);
    }
  }, [location.pathname]);

  // Cargar las opciones de filtrado al iniciar
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setFilterOptions((prev) => ({ ...prev, isLoading: true }));
      try {
        // Cargar proyectos
        const projectsRes = await axios.get("/tripProjects");
        if (Array.isArray(projectsRes.data)) {
          const projectOptions = projectsRes.data.map((project: string) => ({
            label: project,
            value: project,
          }));
          setFilterOptions((prev) => ({ ...prev, projectOptions }));
        }

        // Cargar destinos
        const destinationsRes = await axios.get("/tripDestinations");
        if (Array.isArray(destinationsRes.data)) {
          const destinationOptions = destinationsRes.data.map(
            (destination: string) => ({
              label: destination,
              value: destination,
            })
          );
          setFilterOptions((prev) => ({ ...prev, destinationOptions }));
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
      } finally {
        setFilterOptions((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchFilterOptions();
  }, []);

  const resetFilters = (overrides: Partial<GlobalFilters> = {}) => {
    setFilters({ ...defaultFilters, ...overrides });
  };

  return (
    <GlobalFilterContext.Provider
      value={{ filters, filterOptions, setFilters, resetFilters }}
    >
      {children}
    </GlobalFilterContext.Provider>
  );
};
