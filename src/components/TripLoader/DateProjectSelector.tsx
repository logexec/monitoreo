import React from "react";
import { format } from "date-fns";

interface DateProjectSelectorProps {
  date: string;
  projects: string[];
  selectedProjects: string[];
  onDateChange: (date: string) => void;
  onProjectChange: (projects: string[]) => void;
  availableProjects: string[];
}

export function DateProjectSelector({
  date,
  selectedProjects,
  onDateChange,
  onProjectChange,
  availableProjects,
}: DateProjectSelectorProps) {
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    onProjectChange(options);
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de Entrega
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Proyectos
        </label>
        <select
          multiple
          value={selectedProjects}
          onChange={handleProjectChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          size={5}
        >
          <option value="all">Todos los Proyectos</option>
          {availableProjects.map((project) => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-500">
        {selectedProjects.includes("all")
          ? "Todos los proyectos seleccionados"
          : `${selectedProjects.length} proyecto(s) seleccionado(s)`}{" "}
        para {format(new Date(date), "dd/MM/yyyy")}
      </p>
    </div>
  );
}
