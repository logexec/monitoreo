import { ProjectMultiSelect } from "./ProjectMultiSelect";
import { useGlobalFilters } from "@/contexts/GlobalFilterContext";

export function ProjectFilterSelect() {
  const { filters, setFilters, filterOptions } = useGlobalFilters();

  const handleProjectChange = (selected: string[]) => {
    setFilters((prev) => ({ ...prev, projects: selected }));
  };

  return (
    <ProjectMultiSelect
      placeholder="Filtrar proyectos"
      options={filterOptions.projectOptions}
      selected={filters.projects}
      onChange={handleProjectChange}
    />
  );
}
