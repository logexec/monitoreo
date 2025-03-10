import { getTimeElapsed } from "../utils/timeUtils";
import { TripUpdate } from "../types/database";

interface LastUpdateCellProps {
  updates: TripUpdate[];
}

export function LastUpdateCell({ updates }: LastUpdateCellProps) {
  const lastUpdate = updates[0]?.created_at;
  const timeElapsed = getTimeElapsed(lastUpdate);

  return (
    <div className="min-w-[140px] truncate">
      <span
        className={`${
          lastUpdate
            ? "text-gray-900 dark:text-gray-100"
            : "text-gray-400 dark:text-gray-600"
        }`}
      >
        {timeElapsed}
      </span>
    </div>
  );
}
