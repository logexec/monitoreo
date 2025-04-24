"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Option {
  value: string;
  label: string;
}

interface ProjectMultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  maxTagTextLength?: number; // For truncating labels
}

export function ProjectMultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Seleccionar proyectos...",
  maxTagTextLength = 16,
}: ProjectMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const filteredOptions = React.useMemo(
    () =>
      options.filter((opt) =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase())
      ),
    [options, inputValue]
  );

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  // Helper to display comma-separated labels, truncated
  const displayValue = React.useMemo(() => {
    if (selected.length === 0) return placeholder;
    const labels = options
      .filter((opt) => selected.includes(opt.value))
      .map((opt) => opt.label);
    const text = labels.join(", ");
    return text.length > maxTagTextLength
      ? text.slice(0, maxTagTextLength) + "..."
      : text;
  }, [selected, options, placeholder, maxTagTextLength]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between"
        >
          <span
            className={cn(
              selected.length === 0
                ? "text-muted-foreground"
                : "text-foreground",
              "truncate"
            )}
          >
            {displayValue}
          </span>
          <div className="flex items-center space-x-1">
            {selected.length > 0 && (
              <X
                className="h-4 w-4 text-muted-foreground hover:text-destructive cursor-pointer"
                onClick={clearAll}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput
            placeholder="Buscar proyectos..."
            className="h-9"
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>No se encontró ningún proyecto.</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.value}
                  onSelect={() => toggleOption(opt.value)}
                >
                  {opt.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      selected.includes(opt.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
