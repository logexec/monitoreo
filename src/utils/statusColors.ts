import { TripStatus } from '../types/database';

export function getStatusColor(status: TripStatus): string {
  const colors: Record<TripStatus, string> = {
    SCHEDULED: 'text-blue-600',
    IN_TRANSIT: 'text-yellow-600',
    DELAYED: 'text-red-600',
    DELIVERED: 'text-green-600',
    CANCELLED: 'text-gray-600'
  };
  
  return colors[status];
}