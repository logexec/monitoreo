import { TripUpdate, User } from "../types/database";
import { SortConfig } from "../types/sorting";

type UpdateWithTrip = TripUpdate & {
  trip: {
    trip_id: string;
    plate_number: string;
    project: string;
    driver_name: string;
    driver_phone: string;
    user?: User;
  };
};

export function sortUpdates(
  updates: UpdateWithTrip[],
  { field, direction }: SortConfig
): UpdateWithTrip[] {
  if (!field) return updates;

  return [...updates].sort((a, b) => {
    let valueA: string;
    let valueB: string;

    if (
      field === "trip_id" ||
      field === "plate_number" ||
      field === "driver_name" ||
      field === "project"
    ) {
      valueA = a.trip[field] || "";
      valueB = b.trip[field] || "";
    } else {
      valueA = String(a[field as keyof TripUpdate] || "");
      valueB = String(b[field as keyof TripUpdate] || "");
    }

    return direction === "asc"
      ? valueA.localeCompare(valueB)
      : valueB.localeCompare(valueA);
  });
}
