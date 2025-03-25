import { useEffect, useState } from "react";
import { TripUpdate } from "../types/database";
import { StatusBadge } from "../components/StatusBadge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SortableHeader } from "../components/SortableHeader";
import { SearchInput } from "../components/SearchInput";
import { StatusFilter } from "../components/StatusFilter";
import { sortUpdates } from "../utils/updateSorting";
import { SortConfig } from "../types/sorting";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/components/Loading";
import axios from "axios";
import { toast } from "sonner";

// Interfaz extendida solo para UpdatesPage
interface ExtendedTripUpdate extends TripUpdate {
  trip?: {
    trip_id?: string; // Usamos system_trip_id en el mapeo
    system_trip_id?: string; // Usamos system_trip_id en el mapeo
    plate_number: string;
    project: string;
  };
}

export function UpdatesPage() {
  const [updates, setUpdates] = useState<
    (TripUpdate & {
      trip: { trip_id: string; plate_number: string; project: string };
    })[]
  >([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "created_at",
    direction: "desc",
  });
  const { isLoading } = useAuth();

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    try {
      const response = await axios.get("/trip-updates");

      const data = await response.data.map((update: ExtendedTripUpdate) => {
        return {
          ...update,
          trip: {
            trip_id: update.trip!.system_trip_id || "—",
            plate_number: update.trip!.plate_number || "—",
            project: update.trip!.project || "—",
          },
        };
      });
      setUpdates(data || []);
    } catch (error) {
      console.error("Error loading updates:", error);
      toast.error("Error al cargar las actualizaciones");
    }
  };

  const handleSort = (field: string) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredUpdates = updates.filter((update) => {
    const matchesSearch =
      String(update.trip?.trip_id || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      update.notes.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || update.category === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedUpdates = sortUpdates(filteredUpdates, sortConfig);

  if (isLoading) {
    return <Loading text="Cargando..." />;
  }

  return (
    <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Historial de Actualizaciones
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Buscar actualizaciones..."
              />
              <StatusFilter value={statusFilter} onChange={setStatusFilter} />
            </div>

            <div className="bg-white dark:bg-black rounded-lg shadow overflow-x-auto relative max-h-[calc(100vh-220px)]">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="sticky top-0 bg-gray-800 z-10 px-6 py-3 text-left">
                      <SortableHeader
                        label="ID Viaje"
                        field="trip_id"
                        currentField={sortConfig.field}
                        direction={sortConfig.direction}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="sticky top-0 bg-gray-800 z-10 px-6 py-3 text-left">
                      <SortableHeader
                        label="Placa"
                        field="plate_number"
                        currentField={sortConfig.field}
                        direction={sortConfig.direction}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="sticky top-0 bg-gray-800 z-10 px-6 py-3 text-left">
                      <SortableHeader
                        label="Proyecto"
                        field="project"
                        currentField={sortConfig.field}
                        direction={sortConfig.direction}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="sticky top-0 bg-gray-800 z-10 px-6 py-3 text-left">
                      <SortableHeader
                        label="Estado"
                        field="category"
                        currentField={sortConfig.field}
                        direction={sortConfig.direction}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="sticky top-0 bg-gray-800 z-10 px-6 py-3 text-left">
                      <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Notas
                      </span>
                    </th>
                    <th className="sticky top-0 bg-gray-800 z-10 px-6 py-3 text-left">
                      <SortableHeader
                        label="Fecha"
                        field="created_at"
                        currentField={sortConfig.field}
                        direction={sortConfig.direction}
                        onSort={handleSort}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-800">
                  {sortedUpdates.map((update) => (
                    <tr
                      key={update.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-950"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {update.trip?.trip_id || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {update.trip?.plate_number || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {update.trip?.project || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <StatusBadge category={update.category} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                        <div className="line-clamp-2">{update.notes}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(update.created_at), "dd-MMM-yy H:mm", {
                          locale: es,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
