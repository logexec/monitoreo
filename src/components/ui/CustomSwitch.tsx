"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useId } from "react";

interface CustomSwitchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CustomSwitch({ value, onChange }: CustomSwitchProps) {
  const id = useId();

  return (
    <div className="bg-input/50 inline-flex h-10 rounded-md p-0.5">
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="group after:bg-background has-focus-visible:after:border-ring has-focus-visible:after:ring-ring/50 relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-sm after:shadow-xs after:transition-[translate,box-shadow] after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-focus-visible:after:ring-[3px] data-[state=off]:after:translate-x-0 data-[state=on]:after:translate-x-full"
        data-state={value}
      >
        <label className="group-data-[state=on]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
          Todos los viajes
          <RadioGroupItem id={`${id}-1`} value="off" className="sr-only" />
        </label>
        <label className="group-data-[state=off]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
          <span>Viajes de hoy</span>
          <RadioGroupItem id={`${id}-2`} value="on" className="sr-only" />
        </label>
      </RadioGroup>
    </div>
  );
}
