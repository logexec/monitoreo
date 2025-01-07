import React from 'react';
import { TripStatus } from '../types/database';

const statusColors: Record<TripStatus, { text: string }> = {
  SCHEDULED: { text: 'text-blue-600' },
  IN_TRANSIT: { text: 'text-yellow-600' },
  DELAYED: { text: 'text-red-600' },
  DELIVERED: { text: 'text-green-600' },
  CANCELLED: { text: 'text-gray-600' }
};

interface StatusOptionProps {
  status: TripStatus;
  label: string;
}

export function StatusOption({ status, label }: StatusOptionProps) {
  const { text } = statusColors[status];
  return (
    <span className={`font-medium ${text}`}>
      {label}
    </span>
  );
}