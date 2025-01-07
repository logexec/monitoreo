import { TripStatus } from '../types/database';

export const statusColors: Record<TripStatus, { bg: string; text: string }> = {
  SCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-800' },
  IN_TRANSIT: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  DELAYED: { bg: 'bg-red-100', text: 'text-red-800' },
  DELIVERED: { bg: 'bg-green-100', text: 'text-green-800' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800' }
};

export const statusLabels: Record<TripStatus, string> = {
  SCHEDULED: 'Programado',
  IN_TRANSIT: 'En Tránsito',
  DELAYED: 'Retrasado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado'
};