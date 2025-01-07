import React from 'react';
import { UpdateCategory } from '../types/database';
import { updateCategoryLabels, updateCategoryColors } from '../constants/updateCategories';

interface StatusBadgeProps {
  category: UpdateCategory;
}

export function StatusBadge({ category }: StatusBadgeProps) {
  const { bg, text } = updateCategoryColors[category];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {updateCategoryLabels[category]}
    </span>
  );
}