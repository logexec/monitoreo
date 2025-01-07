import { Trip } from '../types/database';
import { SortConfig } from '../types/sorting';

export function sortTrips(
  trips: Trip[],
  { field, direction }: SortConfig,
  tripUpdates: Record<string, any[]>
): Trip[] {
  if (!field) return trips;

  return [...trips].sort((a, b) => {
    if (field === 'status_category') {
      const categoryA = tripUpdates[a.id]?.[0]?.category || '';
      const categoryB = tripUpdates[b.id]?.[0]?.category || '';
      return direction === 'asc'
        ? categoryA.localeCompare(categoryB)
        : categoryB.localeCompare(categoryA);
    }

    if (field === 'last_update') {
      const lastUpdateA = tripUpdates[a.id]?.[0]?.created_at || '';
      const lastUpdateB = tripUpdates[b.id]?.[0]?.created_at || '';
      return direction === 'asc'
        ? lastUpdateA.localeCompare(lastUpdateB)
        : lastUpdateB.localeCompare(lastUpdateA);
    }

    let valueA = a[field as keyof Trip];
    let valueB = b[field as keyof Trip];

    // Handle null values
    if (valueA === null) valueA = '';
    if (valueB === null) valueB = '';

    // Convert to strings for comparison
    const strA = String(valueA).toLowerCase();
    const strB = String(valueB).toLowerCase();

    return direction === 'asc'
      ? strA.localeCompare(strB)
      : strB.localeCompare(strA);
  });
}