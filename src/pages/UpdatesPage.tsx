/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  FilterFn,
  ColumnFiltersState
} from "@tanstack/react-table";
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, X, ChevronUp, ChevronDown, Filter, Check } from "lucide-react";
import { TripUpdate, UpdateCategory } from "../types/database";
import { StatusBadge } from "../components/StatusBadge";
import Loading from "@/components/Loading";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useId, useMemo, useRef, useState, useCallback } from "react";

// Interfaz extendida solo para UpdatesPage
interface ExtendedTripUpdate extends TripUpdate {
  trip?: {
    trip_id?: string;
    system_trip_id?: string;
    plate_number: string;
    project: string;
    driver_name: string;
    driver_phone: string;
  };
}

export function UpdatesPage() {
  const [updates, setUpdates] = useState<ExtendedTripUpdate[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<UpdateCategory[]>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  // Actualizar columnFilters cuando cambia selectedStatus
  useEffect(() => {
    // Establecer filtros de columna de forma independiente para evitar re-renderizados innecesarios
    if (selectedStatus.length > 0) {
      setColumnFilters([{ id: 'category', value: selectedStatus }]);
    } else {
      setColumnFilters([]);
    }
  }, [selectedStatus]);
  
  // Lista de estados disponibles con valores correctos según el tipo UpdateCategory
  const statusOptions: { value: UpdateCategory; label: string }[] = [
    { value: "INICIO_RUTA" as UpdateCategory, label: "Inicio de Ruta" },
    { value: "SEGUIMIENTO" as UpdateCategory, label: "Seguimiento" },
    { value: "VIAJE_CARGADO" as UpdateCategory, label: "Cargado" },
    { value: "ACCIDENTE" as UpdateCategory, label: "Accidente" },
    { value: "AVERIA" as UpdateCategory, label: "Avería" },
    { value: "ROBO_ASALTO" as UpdateCategory, label: "Robo/Asalto" },
    { value: "PERDIDA_CONTACTO" as UpdateCategory, label: "Pérdida de Contacto" },
    { value: "VIAJE_FINALIZADO" as UpdateCategory, label: "Finalizado" },
  ];
  
  const [sorting, setSorting] = useState<any[]>([
    { id: 'created_at', desc: true } // Ordenamiento inicial por fecha (más reciente primero)
  ]);
  const { isLoading: authLoading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedValue, setSelectedValue] = useState("100");
  
  // Referencias para virtualización
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Formatear fecha - función simple sin memoización
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return "—";
    }
  };

  // Formatear hora - función simple sin memoización
  const formatTime = (dateStr: string): string => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    } catch (e) {
      return "—";
    }
  };

  // Cargar actualizaciones
  useEffect(() => {
    loadUpdates();
  }, [selectedValue]);

  const loadUpdates = async () => {
    setDataLoading(true);
    try {
      const response = await axios.get(`/trip-updates?qty=${selectedValue}`);

      const data = response.data.map((update: ExtendedTripUpdate) => {
        return {
          ...update,
          trip: {
            trip_id: update.trip?.system_trip_id || "—",
            plate_number: update.trip?.plate_number || "—",
            project: update.trip?.project || "—",
            driver_name: update.trip?.driver_name || "—",
            driver_phone: update.trip?.driver_phone || "—",
          },
        };
      });
      setUpdates(data || []);
    } catch (error) {
      console.error("Error loading updates:", error);
      toast.error("Error al cargar las actualizaciones");
    } finally {
      setDataLoading(false);
    }
  };

  // Función de filtro global simplificada y optimizada
  const globalFilterFn: FilterFn<ExtendedTripUpdate> = useCallback((row, _, filterValue) => {
    if (!filterValue || filterValue === "") return true;
    
    const normalizedFilterValue = filterValue.toLowerCase();
    
    // Convertir todo el objeto a un texto de búsqueda
    const update = row.original;
    // Limitar los campos para mejor rendimiento
    const searchText = [
      update.trip?.trip_id || "",
      update.trip?.plate_number || "",
      update.trip?.project || "",
      update.trip?.driver_name || "",
      update.category || "",
      update.notes || "",
    ].join(" ").toLowerCase();
    
    return searchText.includes(normalizedFilterValue);
  }, []);

  // Memoizamos las columnas para evitar recreaciones
  const columns = useMemo<ColumnDef<ExtendedTripUpdate>[]>(() => [
    // Placa - columna optimizada
    {
      id: 'plate_number',
      header: 'Placa',
      accessorFn: (row) => row.trip?.plate_number || "—",
      enableSorting: true,
      sortingFn: 'alphanumeric',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <div className="whitespace-nowrap text-sm font-medium text-black dark:text-white">
            {value}
          </div>
        );
      },
    },
    // Proyecto - columna optimizada
    {
      id: 'project',
      header: 'Proyecto',
      accessorFn: (row) => row.trip?.project || "—",
      enableSorting: true,
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <div className="whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
            {value}
          </div>
        );
      },
    },
    // Conductor - columna optimizada
    {
      id: 'driver_name',
      header: 'Conductor',
      accessorFn: (row) => row.trip?.driver_name || "—",
      enableSorting: true,
      cell: ({ row }) => {
        const update = row.original;
        return (
          <div className="whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
            <div className="flex flex-row space-x-1">
              <span className="font-light">Chofer:</span>
              <span className="font-medium">
                {update.trip?.driver_name || "—"}
              </span>
            </div>
            <div className="flex flex-row space-x-1">
              <span className="font-light">Contacto:</span>
              <span className="font-medium">
                {update.trip?.driver_phone || "—"}
              </span>
            </div>
          </div>
        );
      },
    },
    // Estado - columna optimizada
    {
      id: 'category',
      header: 'Estado',
      accessorFn: (row) => row.category,
      enableSorting: true,
      cell: ({ row }) => {
        const update = row.original;
        return (
          <div className="whitespace-nowrap text-sm">
            <StatusBadge category={update.category} />
          </div>
        );
      },
    },
    // Notas - columna optimizada
    {
      id: 'notes',
      header: 'Notas',
      accessorFn: (row) => row.notes || "",
      enableSorting: true,
      cell: ({ row }) => {
        const update = row.original;
        return (
          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            <div className="line-clamp-2">{update.notes || ""}</div>
          </div>
        );
      },
    },
    // Reportado por - columna optimizada
    {
      id: 'updated_by',
      header: 'Reportado por',
      accessorFn: (row) => row.user?.name || "—",
      enableSorting: true,
      cell: ({ row }) => {
        const update = row.original;
        return (
          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            <div className="line-clamp-2">{update.user?.name || "—"}</div>
          </div>
        );
      },
    },
    // Fecha - columna optimizada
    {
      id: 'created_at',
      header: 'Fecha',
      accessorFn: (row) => new Date(row.created_at).getTime(),
      enableSorting: true,
      sortingFn: 'datetime',
      cell: ({ row }) => {
        const update = row.original;
        const date = formatDate(update.created_at);
        const time = formatTime(update.created_at);
        return (
          <div className="whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize flex flex-col space-y-0">
            <span>{date}</span>
            <span>{time}</span>
          </div>
        );
      },
    },
  ], []);

  // Manejador de cambio de estado optimizado
  const handleStatusChange = useCallback((newSelectedStatus: UpdateCategory[]) => {
    // Usamos un callback para actualizar el estado para evitar cierres de contexto
    requestAnimationFrame(() => {
      setSelectedStatus(newSelectedStatus);
    });
  }, []);

  // Manejador de cambio de búsqueda optimizado
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Usar requestAnimationFrame para las actualizaciones de UI
    const value = e.target.value;
    requestAnimationFrame(() => {
      setSearch(value);
    });
  }, []);

  // Configurar TanStack Table
  const table = useReactTable({
  data: updates,
  columns,
  enableSorting: true,
  state: {
    globalFilter: search,
    sorting: sorting,
    columnFilters: columnFilters,
  },
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  globalFilterFn,
  enableRowSelection: false,
  debugTable: false,
  debugHeaders: false,
  debugColumns: false,
  filterFns: {
    multiSelect: (row, columnId, filterValue) => {
      const value = row.getValue(columnId) as string;
      return filterValue.includes(value);
    },
  },
});


  // Obtener filas filtradas
  const { rows } = table.getFilteredRowModel();

  // Configuración para virtualización
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 60, // Altura aproximada de cada fila en píxeles
    overscan: 10, // Número de filas adicionales a renderizar
  });

  // Obtener datos de virtualización
  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom = virtualRows.length > 0 
    ? totalSize - virtualRows[virtualRows.length - 1].end 
    : 0;

  if (authLoading || dataLoading) {
    return <Loading text="Cargando..." />;
  }

  return (
    <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-2">
      {/* Estilos para scrollbar personalizado */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #aaa;
        }
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #333;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #555;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #777;
          }
        }
      ` }} />
      
      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Historial de Actualizaciones
          </h2>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              {/* Buscador */}
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-600" />
                  <input
                    type="text"
                    placeholder="Buscar actualizaciones..."
                    className="pl-10 pr-10 py-2 w-full border rounded-lg dark:bg-black/40 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all"
                    value={search}
                    onChange={handleSearchChange}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filtro por estado con popover y multiselect */}
              <StatusFilterPopover 
                options={statusOptions} 
                selected={selectedStatus} 
                onChange={handleStatusChange} 
              />

              {/* Cantidad de actualizaciones */}
              <UpdatesSelector 
                selectedValue={selectedValue} 
                setSelectedValue={setSelectedValue} 
              />
            </div>

            {/* Tabla con virtualización */}
            <div 
              ref={tableContainerRef}
              className="bg-white dark:bg-black/60 rounded-lg shadow-sm overflow-x-auto overflow-y-auto relative h-[calc(100vh-220px)] custom-scrollbar"
            >
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 table-fixed">
                <thead className="bg-gray-800/95 backdrop-blur-sm sticky top-0 z-10">
                  <tr>
                    {table.getFlatHeaders().map(header => (
                      <th 
                        key={header.id}
                        className={`sticky top-0 bg-gray-800/95 backdrop-blur-sm z-10 px-6 py-3 text-left ${
                          header.column.getCanSort() ? 'cursor-pointer hover:bg-gray-700/90' : ''
                        }`}
                        style={{ width: header.id === 'notes' ? '25%' : 'auto' }}
                        // onClick={header.column.getCanSort() 
                        //     ? () => header.column.toggleSorting() 
                        //     : undefined
                        //   }
                      >
                        <div 
                          className="flex items-center text-sm font-medium text-gray-100"
                        >
                          {!header.isPlaceholder && flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="ml-1">
                              {{
                                asc: <ChevronUp className="h-4 w-4 text-blue-400" />,
                                desc: <ChevronDown className="h-4 w-4 text-blue-400" />,
                              }[header.column.getIsSorted() as string] ?? (
                                <ChevronDown className="h-4 w-4 text-gray-500 opacity-30" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody 
                  className="bg-white divide-y divide-gray-200 dark:divide-gray-800 dark:bg-transparent"
                >
                  {rows.length > 0 ? (
                    <>
                      {paddingTop > 0 && (
                        <tr>
                          <td style={{ height: `${paddingTop}px` }} colSpan={columns.length} />
                        </tr>
                      )}
                      
                      {virtualRows.map(virtualRow => {
                        const row = rows[virtualRow.index];
                        return (
                          <tr 
                            key={row.original.id}
                            className="transition-colors duration-300 hover:bg-gray-50 dark:hover:bg-gray-900/40"
                          >
                            {row.getVisibleCells().map(cell => (
                              <td key={cell.id} className="px-6 py-4">
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                      
                      {paddingBottom > 0 && (
                        <tr>
                          <td style={{ height: `${paddingBottom}px` }} colSpan={columns.length} />
                        </tr>
                      )}
                    </>
                  ) : (
                    <tr>
                      <td
                        colSpan={table.getAllColumns().length}
                        className="p-4 text-center text-gray-300 dark:text-gray-600"
                      >
                        No se encontraron actualizaciones con este filtro
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// Componente de selección de cantidad de actualizaciones
function UpdatesSelector({ selectedValue, setSelectedValue }: {selectedValue: string, setSelectedValue: any}) {
  const id = useId();
  
  // Manejador optimizado para cambios de valor
  const handleValueChange = useCallback((value: string) => {
    requestAnimationFrame(() => {
      setSelectedValue(value);
    });
  }, [setSelectedValue]);
  
  return (
    <div className="bg-input/50 inline-flex h-9 rounded-md p-0.5">
      <RadioGroup
        value={selectedValue}
        onValueChange={handleValueChange}
        className="group after:bg-background has-focus-visible:after:border-ring has-focus-visible:after:ring-ring/50 relative inline-grid grid-cols-[1fr_1fr_1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/4 after:rounded-sm after:shadow-xs after:transition-[translate,box-shadow] after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] has-focus-visible:after:ring-[3px] data-[state=100]:after:translate-x-0 data-[state=300]:after:translate-x-18 data-[state=600]:after:translate-x-35 data-[state=all]:after:translate-x-52"
        data-state={selectedValue}
      >
        <label className="text-muted-foreground group-data-[state=100]:text-foreground relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
          100
          <RadioGroupItem id={`${id}-1`} value="100" className="sr-only" />
        </label>
        <label className="text-muted-foreground group-data-[state=300]:text-foreground relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
          300
          <RadioGroupItem id={`${id}-2`} value="300" className="sr-only" />
        </label>
        <label className="text-muted-foreground group-data-[state=600]:text-foreground relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
          600
          <RadioGroupItem id={`${id}-3`} value="600" className="sr-only" />
        </label>
        <label className="text-muted-foreground group-data-[state=all]:text-foreground relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
          Todas
          <RadioGroupItem id={`${id}-4`} value="all" className="sr-only" />
        </label>
      </RadioGroup>
    </div>
  );
}

// Componente de filtro por estado con popover y multiselect optimizado
function StatusFilterPopover({ 
  options, 
  selected, 
  onChange 
}: { 
  options: { value: UpdateCategory; label: string }[]; 
  selected: UpdateCategory[]; 
  onChange: (value: UpdateCategory[]) => void; 
}) {
  // Manejadores optimizados
  const toggleOption = useCallback((value: UpdateCategory) => {
    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value));
    } else {
      onChange([...selected, value]);
    }
  }, [selected, onChange]);

  const clearOptions = useCallback(() => {
    onChange([]);
  }, [onChange]);

  const selectAllOptions = useCallback(() => {
    onChange(options.map(option => option.value));
  }, [options, onChange]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-9 w-[150px] gap-1">
          <Filter className="h-4 w-4 mr-1" />
          <span>Estado</span>
          {selected.length > 0 && (
            <Badge className="rounded-sm px-1 font-normal ml-1 bg-primary" variant="outline">
              {selected.length}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar estado..." />
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-[200px]">
                <CommandItem onSelect={clearOptions} className="justify-between font-normal">
                  <span>Limpiar filtros</span>
                  {selected.length === 0 && <Check className="h-4 w-4" />}
                </CommandItem>
                <CommandItem onSelect={selectAllOptions} className="justify-between font-normal">
                  <span>Seleccionar todos</span>
                  {selected.length === options.length && <Check className="h-4 w-4" />}
                </CommandItem>
                <CommandGroup heading="Estados">
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleOption(option.value)}
                      className="justify-between"
                    >
                      <div className="flex items-center">
                        <span className="ml-2">{option.label}</span>
                      </div>
                      {selected.includes(option.value) && <Check className="h-4 w-4" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}