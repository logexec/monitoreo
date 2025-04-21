/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Trip } from "../types/database";
import { SortConfig } from "../types/sorting";

export function sortTrips(
  trips: Trip[],
  { field, direction }: SortConfig,
  tripUpdates?: Record<string, any[]> // Hacerlo opcional y no usarlo
): Trip[] {
  if (!field) return trips;

  return [...trips].sort((a, b) => {
    if (field === "status_category") {
      const categoryA = a.updates?.[0]?.category || "";
      const categoryB = b.updates?.[0]?.category || "";
      return direction === "asc"
        ? categoryA.localeCompare(categoryB)
        : categoryB.localeCompare(categoryA);
    }

    if (field === "current_status_update") {
      const categoryA = a.updates?.[0]?.category || "";
      const categoryB = b.updates?.[0]?.category || "";
      return direction === "asc"
        ? categoryA.localeCompare(categoryB)
        : categoryB.localeCompare(categoryA);
    }

    if (field === "last_update") {
      const lastUpdateA = a.updates?.[0]?.created_at || "";
      const lastUpdateB = b.updates?.[0]?.created_at || "";
      return direction === "asc"
        ? lastUpdateA.localeCompare(lastUpdateB)
        : lastUpdateB.localeCompare(lastUpdateA);
    }

    let valueA = a[field as keyof Trip];
    let valueB = b[field as keyof Trip];

    // Handle null values
    if (valueA === null) valueA = "";
    if (valueB === null) valueB = "";

    // Convert to strings for comparison
    const strA = String(valueA).toLowerCase();
    const strB = String(valueB).toLowerCase();

    return direction === "asc"
      ? strA.localeCompare(strB)
      : strB.localeCompare(strA);
  });
}
