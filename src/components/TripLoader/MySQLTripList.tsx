import React, { useState } from "react";
import { MySQLTrip } from "../../types/mysql";
import { format } from "date-fns";

interface MySQLTripListProps {
  trips: MySQLTrip[];
  selectedTrips: Set<string>;
  onTripSelect: (tripId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

export function MySQLTripList({
  trips,
  selectedTrips,
  onTripSelect,
  onSelectAll,
}: MySQLTripListProps) {
  const [sortField, setSortField] = useState<keyof MySQLTrip>("trip_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: keyof MySQLTrip) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTrips = [...trips].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === "asc" ? 1 : -1;
    return aValue < bValue ? -direction : direction;
  });

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedTrips.size === trips.length}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th
                onClick={() => handleSort("trip_id")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              >
                ID Viaje
              </th>
              <th
                onClick={() => handleSort("delivery_date")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              >
                Fecha
              </th>
              <th
                onClick={() => handleSort("driver_name")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              >
                Conductor
              </th>
              <th
                onClick={() => handleSort("destination")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              >
                Destino
              </th>
              <th
                onClick={() => handleSort("project")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              >
                Proyecto
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTrips.map((trip) => (
              <tr key={trip.trip_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedTrips.has(trip.trip_id)}
                    onChange={(e) =>
                      onTripSelect(trip.trip_id, e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {trip.trip_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(trip.delivery_date), "dd/MM/yyyy")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {trip.driver_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {trip.destination}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {trip.project}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
