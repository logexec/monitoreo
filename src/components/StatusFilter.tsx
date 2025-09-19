import React from "react";
import { Filter } from "lucide-react";
import { updateCategoryLabels } from "../constants/updateCategories";

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="relative">
      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-600 h-4 w-4" />
      <select
        className="pl-10 pr-3 py-2 border rounded-lg appearance-none bg-white dark:bg-black w-max"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="all">Novedades</option>
        {Object.entries(updateCategoryLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
