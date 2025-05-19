import { TripStatus } from '../types/database';

export const statusLabels: Record<TripStatus, string> = {
  SCHEDULED: 'Programado',
  IN_TRANSIT: 'En Tránsito',
  DELAYED: 'Retrasado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado'
};

export const statusColors: Record<TripStatus, { bg: string; text: string }> = {
  SCHEDULED: {
    bg: 'bg-blue-100 group-[.bg-alert]:bg-white/20',
    text: 'text-blue-800 group-[.bg-alert]:text-white'
  },
  IN_TRANSIT: {
    bg: 'bg-yellow-100 group-[.bg-alert]:bg-white/20',
    text: 'text-yellow-800 group-[.bg-alert]:text-white'
  },
  DELAYED: {
    bg: 'bg-red-100 group-[.bg-alert]:bg-white/20',
    text: 'text-red-800 group-[.bg-alert]:text-white'
  },
  DELIVERED: {
    bg: 'bg-green-100 group-[.bg-alert]:bg-white/20',
    text: 'text-green-800 group-[.bg-alert]:text-white'
  },
  CANCELLED: {
    bg: 'bg-gray-100 group-[.bg-alert]:bg-white/20',
    text: 'text-gray-800 group-[.bg-alert]:text-white'
  }
};
