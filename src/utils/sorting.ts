/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Trip } from "../types/database";
import { SortConfig } from "../types/sorting";

interface FieldConfig {
  accessor: (trip: Trip) => string | number | null;
}

// Define sortable fields explicitly to avoid array types
type SortableTripField = keyof Omit<Trip, "updates" | "gps_devices">;

// Map special fields that require nested access
const fieldConfigs: Record<string, FieldConfig> = {
  status_category: {
    accessor: (trip) => trip.updates?.[0]?.category || "",
  },
  current_status_update: {
    accessor: (trip) => trip.updates?.[0]?.category || "",
  },
  last_update: {
    accessor: (trip) => trip.updates?.[0]?.created_at || "",
  },
};

export function sortTrips(
  trips: Trip[],
  { field, direction }: SortConfig,
  tripUpdates?: Record<string, any[]> // Optional, not used
): Trip[] {
  if (!field) return trips;

  return [...trips].sort((a, b) => {
    // Get the field configuration or default to direct property access
    const config = fieldConfigs[field];
    let valueA: string | number | null;
    let valueB: string | number | null;

    if (config) {
      valueA = config.accessor(a);
      valueB = config.accessor(b);
    } else {
      // Ensure field is a sortable field
      if (!(field in fieldConfigs) && !isSortableField(field)) {
        return 0; // Skip sorting for invalid fields
      }
      valueA = a[field as SortableTripField] ?? "";
      valueB = b[field as SortableTripField] ?? "";
    }

    // Handle null values
    valueA = valueA ?? "";
    valueB = valueB ?? "";

    // Check if values are dates
    const dateA = Date.parse(String(valueA));
    const dateB = Date.parse(String(valueB));
    const isDate = !isNaN(dateA) && !isNaN(dateB);

    if (isDate) {
      // Sort as dates
      return direction === "asc" ? dateA - dateB : dateB - dateA;
    }

    // Check if values are numbers
    const numA = Number(valueA);
    const numB = Number(valueB);
    const isNumeric = !isNaN(numA) && !isNaN(numB);

    if (isNumeric) {
      // Sort numerically
      return direction === "asc" ? numA - numB : numB - numA;
    }

    // Sort as strings
    const strA = String(valueA).toLowerCase();
    const strB = String(valueB).toLowerCase();
    return direction === "asc"
      ? strA.localeCompare(strB)
      : strB.localeCompare(strA);
  });
}

// Type guard to check if a field is sortable
function isSortableField(field: string): field is SortableTripField {
  const sortableFields: SortableTripField[] = [
    "id",
    "trip_id",
    "system_trip_id",
    "external_trip_id",
    "delivery_date",
    "driver_name",
    "driver_document",
    "driver_phone",
    "origin",
    "destination",
    "project",
    "plate_number",
    "property_type",
    "shift",
    "current_status",
    "current_status_update",
    "created_at",
    "updated_at",
    "vehicle_id",
  ];
  return sortableFields.includes(field as SortableTripField);
}
