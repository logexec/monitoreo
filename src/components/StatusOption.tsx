import { statusColors } from '@/constants/statusMappings';
import { TripStatus } from '../types/database';


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