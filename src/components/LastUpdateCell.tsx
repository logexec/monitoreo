import { useEffect, useState } from "react";
import { TripUpdate } from "../types/database";

interface LastUpdateCellProps {
  updates: TripUpdate[];
}

function formatElapsedTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

export function LastUpdateCell({ updates }: LastUpdateCellProps) {
  const lastUpdate = updates[0]?.created_at;

  const [elapsed, setElapsed] = useState(() => {
    if (!lastUpdate) return 0;
    return Math.floor((Date.now() - new Date(lastUpdate).getTime()) / 1000);
  });

  useEffect(() => {
    if (!lastUpdate) return;

    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <div className="min-w-[140px] truncate">
      <span
        className={`${
          lastUpdate
            ? "text-gray-900 dark:text-gray-100 group-[.bg-alert]:text-white"
            : "text-gray-400 dark:text-gray-600"
        }`}
      >
        {lastUpdate ? formatElapsedTime(elapsed) : "—"}
      </span>
    </div>
  );
}
