import { ProjectMultiSelect } from "./ProjectMultiSelect";
import { useGlobalFilters } from "@/contexts/GlobalFilterContext";

export function DestinationFilterSelect() {
  const { filters, setFilters, filterOptions } = useGlobalFilters();

  const handleDestinationChange = (selected: string[]) => {
    setFilters((prev) => ({ ...prev, destinations: selected }));
  };

  return (
    <ProjectMultiSelect
      placeholder="Filtrar destinos"
      options={filterOptions.destinationOptions}
      selected={filters.destinations}
      onChange={handleDestinationChange}
    />
  );
}
