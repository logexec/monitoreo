import React from 'react';
import { UpdateCategory } from '../types/database';
import { updateCategoryLabels, updateCategoryColors } from '../constants/updateCategories';

interface BulkStatusUpdateProps {
  selectedCount: number;
  onStatusChange: (category: UpdateCategory) => void;
}

export function BulkStatusUpdate({ selectedCount, onStatusChange }: BulkStatusUpdateProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-blue-700">
        {selectedCount} viajes seleccionados
      </span>
      <select
        onChange={(e) => onStatusChange(e.target.value as UpdateCategory)}
        className="pl-3 pr-8 py-1 text-sm border rounded-md bg-white"
        defaultValue=""
      >
        <option value="" disabled>Cambiar estado</option>
        {Object.entries(updateCategoryLabels).map(([value, label]) => (
          <option 
            key={value} 
            value={value}
            className={`${updateCategoryColors[value as UpdateCategory].text}`}
          >
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}