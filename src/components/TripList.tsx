/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  RefObject,
} from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  flexRender,
  ColumnDef,
  FilterFn,
  ColumnFiltersState,
  Table as TableType,
} from "@tanstack/react-table";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  ChevronRight,
  CircleXIcon,
  ListFilterIcon,
  FilterIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Trip,
  TripStatus,
  TripUpdate,
  UpdateCategory,
} from "../types/database";
import { TripUpdatePanel } from "./TripUpdatePanel";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { getTrips } from "@/lib/axios";
import Loading from "./Loading";
import CustomSwitch from "./ui/CustomSwitch";
import { useLocation } from "react-router-dom";
import { useGlobalFilters } from "@/contexts/GlobalFilterContext";
// import { ProjectMultiSelect } from "./ProjectMultiSelect";
import { StatusBadge } from "./StatusBadge";
import { StatusOption } from "./StatusOption";
import { statusLabels } from "@/constants/statusMappings";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

// Función auxiliar para formatear fechas
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return "—";
  }
};

// Filtro global personalizado
const globalFilterFn: FilterFn<Trip> = (row, _, filterValue) => {
  if (!filterValue || filterValue === "") return true;

  const normalizedFilterValue = filterValue.toLowerCase();

  // Convertir todo el objeto de viaje a un texto de búsqueda
  const trip = row.original;
  const searchText = [
    // Datos principales
    trip.system_trip_id || "",
    trip.external_trip_id || "",
    trip.driver_name || "",
    trip.driver_document || "",
    trip.origin || "",
    trip.destination || "",
    trip.project || "",
    trip.plate_number || "",
    String(trip.vehicle_id || ""),
    trip.property_type || "",
    trip.shift || "",
    trip.current_status || "",
    trip.current_status_update || "",
    trip.driver_phone || "",

    // Fechas formateadas
    formatDate(trip.delivery_date),
    formatDate(trip.created_at),
    formatDate(trip.updated_at),

    // Updates
    ...(trip.updates || []).flatMap((update) => [
      update.category || "",
      update.notes || "",
      formatDate(update.created_at),
    ]),

    // GPS devices
    ...(trip.gps_devices || []).flatMap((device) => [
      device.gps_provider || "",
      device.user || "",
    ]),
  ]
    .join(" ")
    .toLowerCase();

  return searchText.includes(normalizedFilterValue);
};

const FilterComponent = ({
  columnName,
  inputRef,
  filterText,
  table,
}: {
  columnName: string;
  inputRef: RefObject<HTMLInputElement | null>;
  filterText: string;
  table: TableType<Trip>;
}) => {
  return (
    <div className="relative">
      <Input
        id={`${columnName}-input`}
        ref={inputRef}
        className={cn(
          "peer min-w-64 ps-9",
          Boolean(table.getColumn(columnName)?.getFilterValue()) && "pe-9"
        )}
        value={(table.getColumn(columnName)?.getFilterValue() ?? "") as string}
        onChange={(e) =>
          table.getColumn(columnName)?.setFilterValue(e.target.value)
        }
        placeholder={`Filtrar por ${filterText}...`}
        type="text"
        aria-label={`Filtrar por ${filterText}`}
      />
      <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
        <ListFilterIcon size={16} aria-hidden="true" />
      </div>
      {Boolean(table.getColumn(columnName)?.getFilterValue()) && (
        <button
          className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Clear filter"
          onClick={() => {
            table.getColumn(columnName)?.setFilterValue("");
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }}
        >
          <CircleXIcon size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export function TripList() {
  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set());
  const [selectedTrips, setSelectedTrips] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [now, setNow] = useState(Date.now());

  const { filters, setFilters } = useGlobalFilters();
  const { search, status, selectedValue } = filters;
  const location = useLocation();

  // const uniqueProjects = [...new Set(trips.map((t) => t.project))].sort();
  // const projectOptions = uniqueProjects.map((p) => ({ value: p, label: p }));
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const routeInputRef = useRef<HTMLInputElement>(null);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  // Actualizar el tiempo cada segundo
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Aplicar filtros de la URL si existen
  useEffect(() => {
    if (location.state?.filtersOverride) {
      setFilters((prev) => ({
        ...prev,
        ...location.state.filtersOverride,
      }));
    }
  }, [location.state, setFilters]);

  // Obtener datos
  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoading(true);
      try {
        const dateParam =
          selectedValue === "on"
            ? new Date().toISOString().slice(0, 10)
            : undefined;
        const response: any = await getTrips(dateParam);
        setTrips(
          response.map((trip: Trip) => ({
            ...trip,
            updates: (trip.updates ?? []).sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            ),
            gps_devices: trip.gps_devices ?? [],
          }))
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Se produjo un error al tratar de recuperar los viajes"
        );
        console.error("Error en fetchTrips:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrips();
  }, [selectedValue]);

  const mapCategoryToStatus = (category: UpdateCategory): TripStatus => {
    switch (category) {
      case "INICIO_RUTA":
      case "SEGUIMIENTO":
        return "IN_TRANSIT";
      case "VIAJE_FINALIZADO":
        return "DELIVERED";
      case "ACCIDENTE":
      case "AVERIA":
      case "ROBO_ASALTO":
      case "PERDIDA_CONTACTO":
        return "DELAYED";
      default:
        return "SCHEDULED";
    }
  };
  // Manejar creación de actualizaciones
  const handleUpdateCreated = (newUpdate: TripUpdate) => {
    setTrips((prevTrips) =>
      prevTrips.map((trip) =>
        trip.id === newUpdate.trip_id
          ? {
              ...trip,
              updates: trip.updates?.some((u) => u.id === newUpdate.id)
                ? trip.updates
                : [
                    {
                      ...newUpdate,
                      created_at:
                        newUpdate.created_at || new Date().toISOString(),
                    },
                    ...(trip.updates || []),
                  ].sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                  ),
              current_status: mapCategoryToStatus(newUpdate.category),
            }
          : trip
      )
    );
  };

  // Toggle expandir fila usando useCallback para evitar dependencias faltantes
  const toggleExpanded = useCallback((tripId: string) => {
    setExpandedTrips((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(tripId)) {
        newExpanded.delete(tripId);
      } else {
        newExpanded.add(tripId);
      }
      return newExpanded;
    });
  }, []);

  // Manejar eliminación
  const handleDelete = async () => {
    try {
      const tripsToDelete =
        selectedTrips.size > 0
          ? Array.from(selectedTrips)
          : ([selectedTrip?.id].filter(Boolean) as string[]);

      setTrips(trips.filter((trip) => !tripsToDelete.includes(trip.id)));
      setSelectedTrips(new Set());
      setSelectedTrip(null);
      setShowDeleteModal(false);

      toast.success(
        tripsToDelete.length === 1
          ? "Viaje eliminado correctamente"
          : `${tripsToDelete.length} viajes eliminados correctamente`
      );
    } catch (error) {
      console.error("Error deleting trips:", error);
      toast.error("Error al eliminar los viajes");
    }
  };

  // Enriquecer datos con cálculos de tiempo
  const enrichedTrips = useMemo(() => {
    return trips.map((trip) => {
      const lastUpdate = trip.updates?.[0]?.created_at;
      const updatedTime = lastUpdate ? new Date(lastUpdate).getTime() : now;
      const diffSeconds = Math.floor((now - updatedTime) / 1000);
      return {
        ...trip,
        secondsSinceUpdate: diffSeconds,
        minutesSinceUpdate: Math.floor(diffSeconds / 60),
        lastUpdateTimestamp: updatedTime,
      };
    });
  }, [trips, now]);

  // Custom filter function for multi-column searching
  const multiColumnFilterFn: FilterFn<Trip> = (row, _columnId, value) => {
    const plate = String(row.original.plate_number);
    // device_id puede faltar o venir vacío
    const devId = String(row.original?.gps_devices?.[0]?.device_id ?? "");
    // string a buscar
    const haystack = `${devId} ${plate}`.toLowerCase();
    const needle = String(value ?? "")
      .toLowerCase()
      .trim();
    if (needle === "") return true; // sin término => no filtra
    return haystack.includes(needle);
  };

  const projectFilterFn: FilterFn<Trip> = (
    row,
    columnId,
    filterValue: string[]
  ) => {
    if (!filterValue?.length) return true;
    const project = row.getValue(columnId) as string;
    return filterValue.includes(project);
  };

  const routeFilterFn: FilterFn<Trip> = (row, _columnId, filterValue) => {
    const searchableRowContent =
      `${row.original.origin} ${row.original.destination}`.toLowerCase();
    const searchTerm = (filterValue ?? "").toLowerCase();
    return searchableRowContent.includes(searchTerm);
  };

  // const categoryFilterFn: FilterFn<Trip> = (row, _columnId, filterValue) => {
  //   const searchableRowContent =
  //     `${row.original.current_status_update}`.toLowerCase();
  //   const searchTerm = (filterValue ?? "").toLowerCase();
  //   return searchableRowContent.includes(searchTerm);
  // };

  // Definición de columnas para TanStack Table
  const columns = useMemo<ColumnDef<Trip>[]>(
    () => [
      // Columna de checkbox
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 ml-6"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
      },
      // Columna de expandir
      {
        id: "expand",
        header: () => null,
        cell: ({ row }) => (
          <button
            onClick={() => toggleExpanded(row.original.id)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-900 rounded"
          >
            {expandedTrips.has(row.original.id) ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
        ),
        enableSorting: false,
      },
      // Placa
      {
        id: "plate_number",
        header: "Placa",
        accessorFn: (row) => row.plate_number,
        enableSorting: true,
        sortingFn: "alphanumeric",
        cell: ({ row }) => {
          const trip = row.original;
          const plate = trip.plate_number;
          return (
            <div
              className="px-1 whitespace-nowrap text-sm font-bold cursor-pointer"
              onClick={() => setSelectedTrip(trip)}
            >
              {plate.slice(0, 3)}-{plate.slice(3)}
            </div>
          );
        },
        filterFn: multiColumnFilterFn,
      },
      {
        id: "device_id",
        header: "ID Geotab",
        enableSorting: true,
        sortingFn: "alphanumeric",
        cell: ({ row }) => {
          const trip = row.original;
          return (
            <>
              {trip.gps_devices.length ? (
                <div className="px-1 whitespace-nowrap text-sm font-medium">
                  {trip.gps_devices.map((device) => (
                    <div className="flex flex-col" key={device.device_id}>
                      <div className="grid grid-cols-[auto_auto] gap-1 text-xs">
                        <span>id: </span>
                        <span>{device.device_id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">N/A</span>
              )}
            </>
          );
        },
        filterFn: multiColumnFilterFn,
      },
      // Fecha
      {
        id: "dates",
        header: "Fecha",
        accessorKey: "delivery_date",
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          // Ordenar por fecha de entrega
          const dateA = new Date(rowA.original.delivery_date);
          const dateB = new Date(rowB.original.delivery_date);
          return dateA.getTime() - dateB.getTime();
        },
        cell: ({ row }) => {
          const trip = row.original;
          return (
            <div className="px-4 py-4 whitespace-nowrap text-sm flex flex-col space-y-1">
              <div className="flex flex-row space-x-1 text-xs">
                <span className="font-light">Entrega prevista:</span>
                <span className="font-medium">
                  {formatDate(trip.delivery_date)}
                </span>
              </div>
              <div className="flex flex-row space-x-1 text-xs">
                <span className="font-light">Creado el:</span>
                <span className="font-medium">
                  {formatDate(trip.created_at)}
                </span>
              </div>
              <div className="flex flex-row space-x-1 text-xs">
                <span className="font-light">Inicio de ruta:</span>
                <span className="font-medium">
                  {formatDate(trip.updated_at)}
                </span>
              </div>
            </div>
          );
        },
      },
      // Conductor
      {
        id: "driver",
        header: "Conductor",
        accessorKey: "driver_name",
        enableSorting: true,
        cell: ({ row }) => {
          const trip = row.original;
          return (
            <div className="px-4 py-4 whitespace-nowrap text-sm min-w-[140px] capitalize">
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
                {/* Teléfono del conductor - simplificado para este ejemplo */}
                {trip.driver_phone ? (
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {trip.driver_phone}
                  </div>
                ) : (
                  <small className="text-gray-300 italic dark:text-gray-400 font-medium">
                    Sin número de contacto
                  </small>
                )}
              </div>
            </div>
          );
        },
      },
      // Ruta
      {
        id: "route",
        header: "Ruta",
        accessorKey: "destination",
        enableSorting: true,
        cell: ({ row }) => {
          const trip = row.original;
          return (
            <div className="px-4 py-4 whitespace-nowrap text-sm">
              <div className="flex flex-col space-y-1">
                <div className="flex flex-row text-xs space-x-1">
                  <span className="font-light">Origen:</span>
                  <span className="max-w-[20ch] truncate font-medium">
                    {trip.origin && trip.origin?.length > 15 ? (
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger className="max-w-[20ch] truncate font-medium">
                            {trip.origin}
                          </TooltipTrigger>
                          <TooltipContent>{trip.origin}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span>{trip.origin || "—"}</span>
                    )}
                  </span>
                </div>
                <div className="flex flex-row text-xs space-x-1">
                  <span className="font-light">Destino:</span>
                  <span className="max-w-[20ch] truncate font-medium">
                    {trip.destination && trip.destination?.length > 15 ? (
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger className="max-w-[20ch] truncate font-medium">
                            {trip.destination}
                          </TooltipTrigger>
                          <TooltipContent>{trip.destination}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span>{trip.destination || "—"}</span>
                    )}
                  </span>
                </div>
                <div className="flex flex-row text-xs space-x-1">
                  <span className="font-light">No. Viaje:</span>
                  <span className="font-medium">
                    {trip.external_trip_id || "—"}
                  </span>
                </div>
              </div>
            </div>
          );
        },
        filterFn: routeFilterFn,
      },
      // Proyecto
      {
        id: "project",
        header: "Proyecto",
        accessorKey: "project",
        enableSorting: true,
        cell: ({ row }) => (
          <div className="py-0.5 whitespace-nowrap text-sm text-center truncate max-w-[8ch]">
            {row.original.project}
          </div>
        ),
        filterFn: projectFilterFn,
      },
      // Estado
      {
        id: "status",
        header: "Estado",
        accessorKey: "current_status",
        enableSorting: true,
        cell: ({ row }) => {
          const trip = row.original;
          return (
            <div className="px-6 py-4 whitespace-nowrap text-sm">
              {trip.current_status ? (
                <StatusOption
                  status={trip.current_status}
                  label={statusLabels[trip.current_status]}
                />
              ) : (
                <span className="text-gray-400 dark:text-gray-600">—</span>
              )}
            </div>
          );
        },
      },
      // Novedad
      {
        id: "category",
        header: "Novedad",
        accessorFn: (row) => row.updates?.[0]?.category ?? "",
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const categoryA = rowA.original.updates?.[0]?.category || "";
          const categoryB = rowB.original.updates?.[0]?.category || "";
          return categoryA.localeCompare(categoryB);
        },
        cell: ({ row }) => {
          const latestUpdate = row.original.updates?.[0];

          return (
            <div className="px-6 py-4 whitespace-nowrap text-sm">
              {latestUpdate?.category ? (
                <StatusBadge category={latestUpdate.category} />
              ) : (
                <span className="text-gray-400 dark:text-gray-600">—</span>
              )}
            </div>
          );
        },
        filterFn: (row, colId, filterValue) => {
          const value = String(row.getValue(colId) ?? "").toLowerCase();
          const needle = String(filterValue ?? "").toLowerCase();
          return value.includes(needle);
        },
      },
      // GPS
      {
        id: "gps",
        header: "Proveedor GPS",
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const providerA = rowA.original.gps_devices?.[0]?.gps_provider || "";
          const providerB = rowB.original.gps_devices?.[0]?.gps_provider || "";
          return providerA.localeCompare(providerB);
        },
        cell: ({ row }) => {
          const trip = row.original;

          return (
            <div className="px-6 py-4 whitespace-nowrap text-sm min-w-[180px]">
              {(trip.gps_devices.length && (
                <ul>
                  {trip.gps_devices.map((device) => (
                    <li key={device.id}>
                      {device.uri_gps ? (
                        <div className="flex flex-col">
                          <a
                            href={device.uri_gps}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 visited:text-red-400 dark:visited:text-red-400 dark:text-red-600 underline underline-offset-2 text-sm text-center font-medium"
                          >
                            {device.gps_provider}
                          </a>
                          <div className="grid grid-cols-[auto_auto] gap-2 text-xs">
                            <span>Usuario:</span>
                            <span>{device.user || "N/A"}</span>
                          </div>
                          <div className="grid grid-cols-[auto_auto] gap-6 text-xs">
                            <span>Clave: </span>
                            <span>{device.password || "N/A"}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600 text-center">
                          {device.gps_provider || "No provisto"}
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
            </div>
          );
        },
      },
      // Tiempo
      {
        id: "last_update",
        header: "Tiempo",
        enableSorting: true,
        accessorFn: (row) => {
          // Utilizar un accessor específico para manejar el ordenamiento de tiempo
          return row.secondsSinceUpdate || 0;
        },
        sortingFn: "basic", // Usar la función de ordenamiento básica para números
        cell: ({ row }) => {
          const trip = row.original as Trip & {
            secondsSinceUpdate?: number;
            minutesSinceUpdate?: number;
          };

          // Format elapsed time
          const formatElapsedTime = (seconds: number): string => {
            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            const pad = (n: number) => String(n).padStart(2, "0");
            return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
          };

          // Determine class based on elapsed time
          const getTimeClass = () => {
            const minutes = trip.minutesSinceUpdate || 0;
            if (minutes >= 20) {
              return "text-red-700 font-bold"; // Critical alert
            } else if (minutes >= 13 && minutes < 20) {
              return "text-amber-600 font-semibold"; // Warning
            }
            return "text-gray-900 dark:text-gray-100"; // Normal
          };

          const lastUpdate = trip.updates?.[0]?.created_at;
          const secondsElapsed = trip.secondsSinceUpdate || 0;

          return (
            <div className="px-6 py-4 whitespace-nowrap text-sm min-w-[140px]">
              <span
                className={`${
                  lastUpdate
                    ? getTimeClass() + " group-[.bg-alert]:text-white"
                    : "text-gray-400 dark:text-gray-600"
                }`}
                data-minutes={trip.minutesSinceUpdate}
                data-seconds={secondsElapsed}
                title={`Última actualización: ${formatDate(
                  trip.updates?.[0]?.created_at
                )}`}
              >
                {lastUpdate ? formatElapsedTime(secondsElapsed) : "—"}
              </span>
            </div>
          );
        },
      },
    ],
    [expandedTrips, toggleExpanded]
  );

  // Configurar TanStack Table con estado de ordenamiento
  const [sorting, setSorting] = useState<any[]>([
    { id: "last_update", desc: true }, // Ordenamiento inicial
  ]);

  // Configurar TanStack Table
  const table = useReactTable({
    data: enrichedTrips,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSorting: true,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      globalFilter: search,
      rowSelection: Object.fromEntries(
        Array.from(selectedTrips).map((id) => [id, true])
      ),
      sorting: sorting, // Usar el estado de ordenamiento
      columnFilters,
    },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    onRowSelectionChange: (updater) => {
      const rowSelection =
        typeof updater === "function"
          ? updater(table.getState().rowSelection)
          : updater;

      const selectedIds = Object.entries(rowSelection)
        .filter(([_, selected]) => selected)
        .map(([id]) => id);

      setSelectedTrips(new Set(selectedIds));
    },
    globalFilterFn,
  });

  // Get unique project values
  const uniqueProjectsValues = useMemo(() => {
    const set = new Set<string>();
    for (const t of enrichedTrips) {
      if (t.project) set.add(t.project);
    }
    return Array.from(set).sort();
  }, [enrichedTrips]);

  const projectCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of enrichedTrips) {
      if (!t.project) continue;
      counts.set(t.project, (counts.get(t.project) ?? 0) + 1);
    }
    return counts;
  }, [enrichedTrips]);

  const selectedProjects = useMemo(() => {
    const entry = columnFilters.find((f) => f.id === "project");
    return (entry?.value as string[]) ?? [];
  }, [columnFilters]);

  const handleProjectChange = (checked: boolean, value: string) => {
    const filterValue = table
      .getColumn("project")
      ?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table
      .getColumn("project")
      ?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  // Filtrado por proyecto
  const filteredRows = table.getFilteredRowModel().rows.filter((row) => {
    const trip = row.original;
    return status === "all" || trip.updates?.[0]?.category === status;
  });

  // Ordenar filas por tiempo (alertas primero)
  // Para deshacer, renombrar a sortedRows y eliminar el sortedRows actual
  const sortedRowsByAlert = [...filteredRows].sort((a, b) => {
    const tripA = a.original as Trip & { minutesSinceUpdate?: number };
    const tripB = b.original as Trip & { minutesSinceUpdate?: number };

    // Alertas primero
    if (
      (tripA.minutesSinceUpdate || 0) >= 20 &&
      (tripB.minutesSinceUpdate || 0) < 20
    )
      return -1;
    if (
      (tripA.minutesSinceUpdate || 0) < 20 &&
      (tripB.minutesSinceUpdate || 0) >= 20
    )
      return 1;

    // Luego advertencias
    if (
      (tripA.minutesSinceUpdate || 0) >= 13 &&
      (tripB.minutesSinceUpdate || 0) < 13
    )
      return -1;
    if (
      (tripA.minutesSinceUpdate || 0) < 13 &&
      (tripB.minutesSinceUpdate || 0) >= 13
    )
      return 1;

    // Resto de filas según el orden actual
    return 0;
  });

  // Filas resultantes: si el usuario ha clicado en “Placa” o “Tiempo”, usamos el orden de la tabla
  const sortedRows = (() => {
    const sortId = sorting[0]?.id;
    if (sortId === "plate_number" || sortId === "last_update") {
      return table.getSortedRowModel().rows;
    }
    // Si no hay orden activo sobre esas columnas, aplicamos la lógica de alertas
    return sortedRowsByAlert;
  })();

  if (isLoading) {
    return <Loading text="Cargando viajes..." fullScreen />;
  }

  const getRowClassName = (row: any) => {
    const trip = row.original as Trip & { minutesSinceUpdate?: number };
    const minutes = trip.minutesSinceUpdate || 0;

    if (minutes >= 20) {
      return "sticky top-[40px] z-20 border-x-[5px] border-rose-600 border-y-0 !rounded-full";
    }
    if (minutes >= 13 && minutes < 20) {
      return "border-x-[5px] border-amber-600 border-y-0 !rounded-full";
    }
  };

  return (
    <div className="space-y-4 py-5 px-2 mx-auto">
      {/* Filter Section */}
      <div className="flex gap-4">
        {selectedTrips.size > 0 && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar ({selectedTrips.size})
          </button>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Filter by plate or device_id */}
            <FilterComponent
              columnName="plate_number"
              filterText="placa o id de dispositivo"
              inputRef={inputRef}
              table={table}
            />

            {/* Filter by origin or destination */}
            <FilterComponent
              columnName="route"
              filterText="origen o destino"
              inputRef={routeInputRef}
              table={table}
            />

            {/* Filter by category */}
            <FilterComponent
              columnName="category"
              filterText="novedad"
              inputRef={categoryInputRef}
              table={table}
            />

            {/* Filter by project */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <FilterIcon
                    className="-ms-1 opacity-60"
                    size={16}
                    aria-hidden="true"
                  />
                  Proyecto
                  {selectedProjects.length > 0 && (
                    <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                      {selectedProjects.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto min-w-36 p-3" align="start">
                <div className="space-y-3">
                  <div className="text-muted-foreground text-xs font-medium">
                    Filtros
                  </div>
                  <div className="space-y-3">
                    {uniqueProjectsValues.map((value, i) => (
                      <div key={value} className="flex items-center gap-2">
                        <Checkbox
                          id={`project-${i}`}
                          checked={selectedProjects.includes(value)}
                          onCheckedChange={(checked: boolean) =>
                            handleProjectChange(checked, value)
                          }
                          className="border-slate-300 data-[state=checked]:bg-slate-500 data-[state=checked]:text-white"
                        />
                        <Label
                          htmlFor={`project-${i}`}
                          className="flex grow justify-between gap-2 font-normal"
                        >
                          {value}{" "}
                          <span className="text-muted-foreground ms-2 text-xs">
                            {projectCounts.get(value)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CustomSwitch />
        </div>
      </div>

      {/* Table Section */}
      <div className="border rounded">
        <div className="[&>div]:max-h-[810px]">
          <Table className="[&_td]:border-border [&_th]:border-border border-separate border-spacing-0 [&_tfoot_td]:border-t [&_th]:border-b [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b">
            <TableHeader className="bg-background/90 sticky top-0 z-10 backdrop-blur-xs">
              <TableRow className="hover:bg-transparent">
                {table.getFlatHeaders().map((header) => (
                  <TableHead
                    key={header.id}
                    className="relative h-10 border-t select-none last:[&>.cursor-col-resize]:opacity-0"
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                        ? "descending"
                        : "none"
                    }
                    {...{
                      colSpan: header.colSpan,
                      style: {
                        width: header.getSize(),
                      },
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          header.column.getCanSort() &&
                            "flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          // Enhanced keyboard handling for sorting
                          if (
                            header.column.getCanSort() &&
                            (e.key === "Enter" || e.key === " ")
                          ) {
                            e.preventDefault();
                            header.column.getToggleSortingHandler()?.(e);
                          }
                        }}
                        tabIndex={header.column.getCanSort() ? 0 : undefined}
                      >
                        <span className="truncate">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        {{
                          asc: (
                            <ChevronUp
                              className="shrink-0 opacity-60"
                              size={16}
                              aria-hidden="true"
                            />
                          ),
                          desc: (
                            <ChevronDown
                              className="shrink-0 opacity-60"
                              size={16}
                              aria-hidden="true"
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRows.length > 0 ? (
                sortedRows.map((row) => {
                  const trip = row.original as Trip & {
                    minutesSinceUpdate?: number;
                    secondsSinceUpdate?: number;
                  };

                  return (
                    <React.Fragment key={row.id}>
                      <TableRow
                        className={`transition-colors duration-500 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-950 ${getRowClassName(
                          row
                        )}`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className="whitespace-nowrap"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>

                      {/* Expanded Row Content - Versión mejorada */}
                      {expandedTrips.has(trip.id) && (
                        <TableRow>
                          <TableCell
                            colSpan={table.getAllColumns().length}
                            className={`px-0 py-0 ${
                              (trip.minutesSinceUpdate || 0) >= 20
                                ? "bg-red-50 dark:bg-red-950/50 dark:border-y-4 dark:border-x-2 dark:border-red-950"
                                : "bg-gray-50 dark:bg-gray-900"
                            }`}
                          >
                            {trip.updates && trip.updates.length > 0 ? (
                              <div className="p-4 transition-all duration-300 ease-in-out">
                                <div className="flex items-center justify-between mb-3">
                                  <h4
                                    className={`font-semibold text-sm ${
                                      (trip.minutesSinceUpdate || 0) >= 20
                                        ? "text-red-700 dark:text-red-400"
                                        : "text-gray-700 dark:text-gray-300"
                                    }`}
                                  >
                                    Historial de Actualizaciones (
                                    {trip.updates.length})
                                  </h4>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Mostrando todas las actualizaciones
                                    ordenadas por fecha
                                  </div>
                                </div>

                                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                  {trip.updates.map((update, index) => (
                                    <div
                                      key={update.id}
                                      className={`p-3 rounded-lg transition-colors ${
                                        index === 0
                                          ? "bg-blue-50 border-l-4 border-blue-500 dark:bg-indigo-900 dark:border-blue-400"
                                          : "bg-white hover:bg-gray-50 dark:bg-indigo-800 dark:hover:bg-indigo-800/60"
                                      } ${
                                        index % 2 === 0
                                          ? "dark:bg-indigo-800/40"
                                          : "dark:bg-indigo-800/20"
                                      }`}
                                    >
                                      <div className="flex justify-between items-start gap-x-2">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <StatusBadge
                                              category={update.category}
                                            />
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                              {update.notes || "Sin detalles"}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-200 whitespace-nowrap">
                                          <span className="hidden sm:inline mr-1">
                                            Actualizado:
                                          </span>
                                          {formatDate(update.created_at)}
                                          <span className="ml-1 text-xs">
                                            {new Date(
                                              update.created_at
                                            ).toLocaleTimeString("es-EC", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        </div>
                                      </div>

                                      {update.image_url && (
                                        <div className="mt-2">
                                          <img
                                            src={update.image_url}
                                            alt="Imagen de actualización"
                                            className="h-20 rounded border border-gray-200 dark:border-gray-700"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="py-6 text-center">
                                <span className="inline-block py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                                  No hay actualizaciones disponibles para este
                                  viaje
                                </span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={table.getAllColumns().length}
                    className="p-4 text-center text-gray-300 dark:text-gray-600"
                  >
                    No se encontraron viajes con este filtro
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        itemCount={selectedTrips.size || (selectedTrip ? 1 : 0)}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Trip Update Panel */}
      {selectedTrips.size > 0 && (
        <TripUpdatePanel
          trip={trips.filter((t) => selectedTrips.has(t.id))}
          onClose={() => setSelectedTrips(new Set())}
          onUpdateCreated={handleUpdateCreated}
        />
      )}

      {selectedTrips.size === 0 && selectedTrip && (
        <TripUpdatePanel
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
          onUpdateCreated={handleUpdateCreated}
        />
      )}
    </div>
  );
}
