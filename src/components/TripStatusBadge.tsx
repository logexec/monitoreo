import { TripStatus } from "../types/database";
import { statusColors, statusLabels } from "../constants/statusMappings";

interface TripStatusBadgeProps {
  status: TripStatus;
}

export function TripStatusBadge({ status }: TripStatusBadgeProps) {
  const { bg, text } = statusColors[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}
    >
      {statusLabels[status]}
    </span>
  );
}
