import React from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Trip } from '../types/database';
import { StatusBadge } from './StatusBadge';
import { TripUpdatesList } from './TripUpdatesList';
import { LastUpdateCell } from './LastUpdateCell';

interface ExpandableRowProps {
  trip: Trip;
  index: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onToggleSelect: (checked: boolean, event?: React.MouseEvent) => void;
  onTripSelect: (trip: Trip) => void;
  updates: any[];
}

export function ExpandableRow({
  trip,
  isExpanded,
  isSelected,
  onToggleExpand,
  onToggleSelect,
  onTripSelect,
  updates
}: ExpandableRowProps) {
  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-2">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={isSelected}
            onChange={(e) => onToggleSelect(e.target.checked, e.nativeEvent as unknown as React.MouseEvent)}
            onClick={(e) => e.stopPropagation()}
          />
        </td>
        <td className="px-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </td>
        <td 
          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer"
          onClick={() => onTripSelect(trip)}
        >
          {trip.system_trip_id}
          {trip.external_trip_id && (
            <span className="ml-2 text-xs text-gray-500">
              ({trip.external_trip_id})
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {format(new Date(trip.delivery_date), 'dd/MM/yyyy')}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {trip.plate_number}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 min-w-[140px]">
          {trip.driver_name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {trip.origin || '—'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {trip.destination}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {trip.project}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          {updates[0]?.category ? (
            <StatusBadge category={updates[0].category} />
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <LastUpdateCell updates={updates} />
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={11} className="px-6 py-4 bg-gray-50">
            <TripUpdatesList updates={updates} />
          </td>
        </tr>
      )}
    </>
  );
}