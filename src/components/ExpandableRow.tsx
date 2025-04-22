import React from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Trip, TripUpdate } from "../types/database";
import { StatusBadge } from "./StatusBadge";
import { TripUpdatesList } from "./TripUpdatesList";
import { LastUpdateCell } from "./LastUpdateCell";
import { StatusOption } from "./StatusOption";
import { statusLabels } from "@/constants/statusMappings";

interface ExpandableRowProps {
  trip: Trip;
  index: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onToggleSelect: (checked: boolean, event?: React.MouseEvent) => void;
  onTripSelect: (trip: Trip) => void;
  updates: TripUpdate[];
}

export function ExpandableRow({
  trip,
  isExpanded,
  isSelected,
  onToggleExpand,
  onToggleSelect,
  onTripSelect,
  updates,
}: ExpandableRowProps) {
  // Sort updates by created_at in descending order
  const sortedUpdates = [...updates].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Get the latest update
  const latestUpdate = sortedUpdates[0];

  return (
    <>
      <tr className="hover:bg-gray-50 dark:bg-black dark:hover:bg-gray-950">
        <td className="px-2">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={isSelected}
            onChange={(e) =>
              onToggleSelect(
                e.target.checked,
                e.nativeEvent as unknown as React.MouseEvent
              )
            }
            onClick={(e) => e.stopPropagation()}
          />
        </td>
        <td className="px-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-900 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </td>
        <td
          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
          onClick={() => onTripSelect(trip)}
        >
          {trip.system_trip_id}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
          {format(new Date(trip.delivery_date), "dd/MM/yyyy")}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
          {trip.plate_number}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
          {trip.vehicle_id}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 min-w-[140px]">
          {trip.driver_name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
          {trip.origin || "—"}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
          {trip.destination}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
          {trip.project}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          {latestUpdate?.category ? (
            <StatusOption
              status={trip.current_status}
              label={statusLabels[trip.current_status]}
            />
          ) : (
            <span className="text-gray-400 dark:text-gray-600">—</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          {latestUpdate?.category ? (
            <StatusBadge category={latestUpdate.category} />
          ) : (
            <span className="text-gray-400 dark:text-gray-600">—</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm min-w-[180px]">
          {(trip.gps_devices.length && (
            <ul>
              {trip.gps_devices.map((devices) => (
                <li key={devices.id}>
                  {devices.uri_gps ? (
                    <div className="flex flex-col">
                      <a
                        href={devices.uri_gps}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 visited:text-red-400 dark:visited:text-red-600 dark:text-red-400 underline underline-offset-2 text-sm text-center"
                      >
                        {devices.gps_provider}
                      </a>
                      <div className="grid grid-cols-[auto_auto] gap-2 text-xs">
                        <span>Usuario:</span>
                        <span>{devices.user || "N/A"}</span>
                      </div>
                      <div className="grid grid-cols-[auto_auto] gap-6 text-xs">
                        <span>Clave: </span>
                        <span>{devices.password || "N/A"}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600 text-center">
                      {devices.gps_provider || "No provisto"}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )) || (
            <span className="text-gray-400 dark:text-gray-600 flex flex-col text-center mx-auto">
              —
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <LastUpdateCell updates={sortedUpdates} />
        </td>
      </tr>
      {sortedUpdates.length > 0 && isExpanded && (
        <tr>
          <td colSpan={11} className="px-6 py-4 bg-gray-50 dark:bg-gray-950">
            <TripUpdatesList updates={sortedUpdates} />
          </td>
        </tr>
      )}
      {isExpanded && sortedUpdates.length === 0 && (
        <tr>
          <td
            colSpan={11}
            className="px-6 py-4 bg-gray-50 dark:bg-black/90 text-gray-400 dark:text-gray-500 select-none text-center"
          >
            No hay actualizaciones
          </td>
        </tr>
      )}
    </>
  );
}
