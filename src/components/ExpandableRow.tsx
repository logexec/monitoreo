import React, { useId, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  CheckIcon,
  ChevronDown,
  ChevronRight,
  CopyIcon,
  PhoneCallIcon,
  SmartphoneIcon,
} from "lucide-react";
import { Trip, TripUpdate } from "../types/database";
import { StatusBadge } from "./StatusBadge";
import { TripUpdatesList } from "./TripUpdatesList";
import { LastUpdateCell } from "./LastUpdateCell";
import { StatusOption } from "./StatusOption";
import { statusLabels } from "@/constants/statusMappings";
import { Tooltip, TooltipContent, TooltipProvider } from "./ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { BsWhatsapp } from "react-icons/bs";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { Popover, PopoverContent } from "./ui/popover";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";

interface ExpandableRowProps {
  trip: Trip;
  index: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onToggleSelect: (checked: boolean, event?: React.MouseEvent) => void;
  onTripSelect: (trip: Trip) => void;
  updates: TripUpdate[];
}

export function ExpandableRow({
  trip,
  isExpanded,
  isSelected,
  onToggleExpand,
  onToggleSelect,
  onTripSelect,
  updates,
}: ExpandableRowProps) {
  // Sort updates by created_at in descending order
  const sortedUpdates = [...updates].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Get the latest update
  const latestUpdate = sortedUpdates[0];

  const message = `Estimado ${
    trip.driver_name
  }, me comunico con usted desde la torre de control sobre el siguiente viaje:
\nID: ${trip.external_trip_id}
\nRuta: ${trip.origin} → ${trip.destination}
\nFecha de entrega: ${format(parseISO(trip.delivery_date), "dd/MM/yyyy")}
\nEstado actual: ${statusLabels[trip.current_status]}.
\n`;

  // Codificar solo la parte del texto sin los emojis
  const encodedMessage = encodeURIComponent(message);

  const id = useId();
  const [copied, setCopied] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (inputRef.current) {
      navigator.clipboard.writeText(inputRef.current.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <>
      <tr className="hover:bg-gray-50 dark:bg-black dark:hover:bg-gray-950">
        <td className="px-2">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={isSelected}
            onChange={(e) =>
              onToggleSelect(
                e.target.checked,
                e.nativeEvent as unknown as React.MouseEvent
              )
            }
            onClick={(e) => e.stopPropagation()}
          />
        </td>
        <td className="px-2 max-w-[2ch]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-900 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </td>
        {/* <td onClick={() => onTripSelect(trip)} className="pl-6">
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger className="py-0.5 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer text-start truncate max-w-[18ch]">
                {trip.system_trip_id}
              </TooltipTrigger>
              <TooltipContent side="right">
                {trip.system_trip_id}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </td> */}
        <td
          onClick={() => onTripSelect(trip)}
          className="px-4 py-4 whitespace-nowrap text-sm text-black dark:text-white max-w-[10ch] font-bold cursor-pointer"
        >
          {trip.plate_number.slice(0, 3)}-{trip.plate_number.slice(3)}
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 flex flex-col space-y-1">
          <div className="flex flex-row space-x-1 text-xs">
            <span className="font-light">Entrega prevista:</span>
            <span className="font-medium">
              {format(parseISO(trip.delivery_date), "dd/MM/yyyy")}
            </span>
          </div>
          <div className="flex flex-row space-x-1 text-xs">
            <span className="font-light">Creado el:</span>
            <span className="font-medium">
              {format(parseISO(trip.created_at), "dd/MM/yyyy")}
            </span>
          </div>
          <div className="flex flex-row space-x-1 text-xs">
            <span className="font-light">Inicio de ruta:</span>
            <span className="font-medium">
              {format(parseISO(trip.updated_at), "dd/MM/yyyy H:ii:ss")}
            </span>
          </div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 min-w-[140px] capitalize">
          <div className="flex flex-col space-y-0">
            <span>{trip.driver_name.toLowerCase()}</span>
            {trip.driver_document ? (
              <small className="text-gray-400 italic dark:text-gray-600">
                {trip.driver_document}
              </small>
            ) : (
              <small className="text-gray-300 italic dark:text-gray-600 font-medium">
                Sin documento de Identidad
              </small>
            )}
            {trip.driver_phone ? (
              <Popover>
                <PopoverTrigger>
                  <div className="flex flex-row space-x-1 items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-red-400 hover:text-white rounded dark:hover:bg-red-700 dark:hover:text-white mt-0.5 py-0.5 px-2 cursor-pointer w-fit">
                    <span>
                      <SmartphoneIcon size={16} />
                    </span>
                    <span>
                      {trip.driver_phone
                        .replace(/\s+/g, "")
                        .replace(/(\d{1})(\d{3})(\d{3})(\d{3})/, "$1 $2 $3 $4")}
                    </span>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-max h-max p-0 shadow-xs border-none"
                  side="top"
                >
                  <div className="flex flex-row gap-3 text-center">
                    <div className="flex justify-start">
                      <Link
                        to={`https://wa.me/${trip.driver_phone
                          .replace(/\s+/g, "")
                          .trim()}?text=${encodedMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium flex flex-row items-center justify-start text-start space-x-1 border border-r-0 py-1 px-3 rounded-l-md hover:bg-gray-200 dark:hover:bg-slate-700"
                      >
                        <BsWhatsapp className="size-3" />
                        <span>WhatsApp</span>
                      </Link>
                      <Link
                        to={`tel:${trip
                          .driver_phone!.replace(/\s+/g, "")
                          .trim()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium flex flex-row items-center justify-start text-start space-x-1 border py-1 px-3 hover:bg-gray-200 dark:hover:bg-slate-700"
                      >
                        <PhoneCallIcon className="size-3" />
                        <span>Llamar</span>
                      </Link>
                      <div className="relative border border-l-0 rounded-r-md">
                        <Input
                          readOnly
                          id={id}
                          type="text"
                          defaultValue={trip.driver_phone}
                          aria-label="Copiar al Portapapeles"
                          className="shadow-none border-none focus-visible:ring-0 focus-visible:border-none text-sm font-medium text-gray-500 dark:text-gray-400 placeholder:text-gray-400 dark:placeholder:text-gray-500 w-[130px] pr-5"
                          ref={inputRef}
                        />
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={handleCopy}
                                className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:rounded-l-none focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed"
                                aria-label={
                                  copied ? "Copiado" : "Copiar al portapapeles"
                                }
                                disabled={copied}
                              >
                                <div
                                  className={cn(
                                    "transition-all",
                                    copied
                                      ? "scale-100 opacity-100"
                                      : "scale-0 opacity-0"
                                  )}
                                >
                                  <CheckIcon
                                    className="stroke-emerald-500"
                                    size={16}
                                    aria-hidden="true"
                                  />
                                </div>
                                <div
                                  className={cn(
                                    "absolute transition-all",
                                    copied
                                      ? "scale-0 opacity-0"
                                      : "scale-100 opacity-100"
                                  )}
                                >
                                  <CopyIcon size={16} aria-hidden="true" />
                                </div>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="px-2 py-1 text-xs bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 shadow-md border">
                              Copiar al portapapeles
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <small className="text-gray-300 italic dark:text-gray-400 font-medium">
                Sin número de contacto
              </small>
            )}
          </div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
          <div className="flex flex-col space-y-1">
            <div className="flex flex-row text-xs space-x-1">
              <span className="font-light">Origen:</span>
              <span className="font-medium">{trip.origin || "—"}</span>
            </div>
            <div className="flex flex-row text-xs space-x-1">
              <span className="font-light">Destino:</span>
              <span className="font-medium">{trip.destination || "—"}</span>
            </div>
          </div>
        </td>
        <td className="pl-6">
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger className="py-0.5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center truncate max-w-[8ch]">
                {trip.project}
              </TooltipTrigger>
              <TooltipContent side="right">{trip.project}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          {latestUpdate?.category ? (
            <StatusOption
              status={trip.current_status}
              label={statusLabels[trip.current_status]}
            />
          ) : (
            <span className="text-gray-400 dark:text-gray-600">—</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          {latestUpdate?.category ? (
            <StatusBadge category={latestUpdate.category} />
          ) : (
            <span className="text-gray-400 dark:text-gray-600">—</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm min-w-[180px]">
          {(trip.gps_devices.length && (
            <ul>
              {trip.gps_devices.map((devices) => (
                <li key={devices.id}>
                  {devices.uri_gps ? (
                    <div className="flex flex-col">
                      <a
                        href={devices.uri_gps}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 visited:text-red-400 dark:visited:text-red-400 dark:text-red-600 underline underline-offset-2 text-sm text-center font-medium"
                      >
                        {devices.gps_provider}
                      </a>
                      <div className="grid grid-cols-[auto_auto] gap-2 text-xs">
                        <span>Usuario:</span>
                        <span>{devices.user || "N/A"}</span>
                      </div>
                      <div className="grid grid-cols-[auto_auto] gap-6 text-xs">
                        <span>Clave: </span>
                        <span>{devices.password || "N/A"}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600 text-center">
                      {devices.gps_provider || "No provisto"}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )) || (
            <span className="text-gray-400 dark:text-gray-600 flex flex-col text-center mx-auto">
              —
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <LastUpdateCell updates={sortedUpdates} />
        </td>
      </tr>
      {sortedUpdates.length > 0 && isExpanded && (
        <tr>
          <td colSpan={11} className="px-6 py-4 bg-gray-50 dark:bg-gray-950">
            <TripUpdatesList updates={sortedUpdates} />
          </td>
        </tr>
      )}
      {isExpanded && sortedUpdates.length === 0 && (
        <tr>
          <td
            colSpan={11}
            className="px-6 py-4 bg-gray-50 dark:bg-black/90 text-gray-400 dark:text-gray-500 select-none text-center"
          >
            No hay actualizaciones
          </td>
        </tr>
      )}
    </>
  );
}
