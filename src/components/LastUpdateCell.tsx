import { useEffect, useState } from "react";
import { getTimeElapsed } from "../utils/timeUtils";
import { TripUpdate } from "../types/database";

interface LastUpdateCellProps {
  updates: TripUpdate[];
}

export function LastUpdateCell({ updates }: LastUpdateCellProps) {
  const lastUpdate = updates[0]?.created_at;

  const [elapsed, setElapsed] = useState(() =>
    getTimeElapsed(lastUpdate)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(getTimeElapsed(lastUpdate));
    }, 1000); // actualiza cada segundo

    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <div className="min-w-[140px] truncate">
      <span
        className={`${
          lastUpdate
            ? "text-gray-900 dark:text-gray-100 group-[.bg-alert]:text-white"
            : "text-gray-400 dark:text-gray-600"
        } ${parseInt(elapsed) >= 15 && "text-red-500"}`}
      >
        {elapsed}
      </span>
    </div>
  );
}
