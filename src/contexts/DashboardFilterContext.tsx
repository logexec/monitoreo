import { createContext, useContext, useState } from "react";

type Filters = {
  period: string;
  projects: string[];
  destinations: string[];
};

type DashboardFilterContextType = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
};

const DashboardFilterContext = createContext<DashboardFilterContextType | null>(
  null
);

export const useDashboardFilters = () => {
  const context = useContext(DashboardFilterContext);
  if (!context)
    throw new Error(
      "useDashboardFilters must be used within a DashboardFilterProvider"
    );
  return context;
};

export const DashboardFilterProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [filters, setFilters] = useState<Filters>({
    period: "last_3_months",
    projects: [],
    destinations: [],
  });

  return (
    <DashboardFilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </DashboardFilterContext.Provider>
  );
};
