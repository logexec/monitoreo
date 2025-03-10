import { AlertCircleIcon } from "lucide-react";

export default function CustomAlert() {
  return (
    <div className="rounded-md border border-red-500/50 px-4 py-3 text-red-600">
      <div className="flex gap-3">
        <AlertCircleIcon
          className="mt-0.5 shrink-0 opacity-60"
          size={16}
          aria-hidden="true"
        />
        <div className="grow space-y-1">
          <p className="text-sm font-medium">Error:</p>
          <ul className="list-inside list-disc text-sm opacity-80">
            <li>Error 1</li>
            <li>Error 2</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
