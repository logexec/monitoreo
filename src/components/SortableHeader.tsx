import React from 'react';
import { ArrowUp } from 'lucide-react';
import { SortDirection } from '../types/sorting';

interface SortableHeaderProps {
  label: string;
  field: string;
  currentField: string | null;
  direction: SortDirection;
  onSort: (field: string) => void;
}

export function SortableHeader({ label, field, currentField, direction, onSort }: SortableHeaderProps) {
  const isActive = currentField === field;
  
  return (
    <button
      onClick={() => onSort(field)}
      className="group flex items-center space-x-1 text-xs font-medium text-gray-300 uppercase tracking-wider hover:text-white"
    >
      <span>{label}</span>
      <ArrowUp 
        className={`h-4 w-4 transition-all ${
          isActive 
            ? 'text-white' 
            : 'text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-white'
        } ${
          isActive && direction === 'desc' ? 'rotate-180' : ''
        }`}
      />
    </button>
  );
}