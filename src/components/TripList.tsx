import React, { useEffect, useState } from "react";
import { Filter, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Trip, TripUpdate } from "../types/database";
import { TripUpdatePanel } from "./TripUpdatePanel";
import { ExpandableRow } from "./ExpandableRow";
import { StatusFilter } from "./StatusFilter";
import { SearchInput } from "./SearchInput";
import { SortableHeader } from "./SortableHeader";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { SortConfig } from "../types/sorting";
import { sortTrips } from "../utils/sorting";
import { getTrips } from "@/lib/axios";
import Loading from "./Loading";
import CustomSwitch from "./ui/CustomSwitch";

export function TripList() {
  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set());
  const [selectedTrips, setSelectedTrips] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    direction: "asc",
  });
  const [selectedValue, setSelectedValue] = useState("on");

  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoading(true);
      try {
        const response = await getTrips(
          selectedValue === "on"
            ? new Date().toISOString().slice(0, 10)
            : undefined
        );
        setTrips(response);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [selectedValue]);

  const handleUpdateCreated = (newUpdate: TripUpdate) => {
    setTrips((prevTrips) =>
      prevTrips.map((trip) =>
        trip.id === newUpdate.trip_id
          ? {
              ...trip,
              updates: trip.updates?.some((u) => u.id === newUpdate.id)
                ? trip.updates // Si ya existe, no agregar
                : [newUpdate, ...(trip.updates || [])], // Si no existe, agregar
            }
          : trip
      )
    );
  };

  const toggleExpanded = (tripId: string) => {
    const newExpanded = new Set(expandedTrips);
    if (newExpanded.has(tripId)) {
      newExpanded.delete(tripId);
    } else {
      newExpanded.add(tripId);
    }
    setExpandedTrips(newExpanded);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTrips(new Set(filteredTrips.map((trip) => trip.id)));
    } else {
      setSelectedTrips(new Set());
    }
  };

  const handleSelectTrip = (
    tripId: string,
    checked: boolean,
    index: number,
    event?: React.MouseEvent
  ) => {
    if (event!.shiftKey && lastSelectedIndex !== null) {
      const newSelected = new Set(selectedTrips);
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);

      sortedTrips.slice(start, end + 1).forEach((trip) => {
        if (checked) {
          newSelected.add(trip.id);
        } else {
          newSelected.delete(trip.id);
        }
      });

      setSelectedTrips(newSelected);
    } else {
      const newSelected = new Set(selectedTrips);
      if (checked) {
        newSelected.add(tripId);
      } else {
        newSelected.delete(tripId);
      }
      setSelectedTrips(newSelected);
      setLastSelectedIndex(index);
    }
  };

  const handleDelete = async () => {
    try {
      const tripsToDelete =
        selectedTrips.size > 0
          ? Array.from(selectedTrips)
          : [selectedTrip?.id].filter(Boolean);

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

  const handleSort = (field: string) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.system_trip_id.toLowerCase().includes(normalizedSearch) ||
      (trip.external_trip_id?.toLowerCase() || "").includes(normalizedSearch) ||
      trip.driver_name.toLowerCase().includes(normalizedSearch) ||
      trip.driver_document?.includes(normalizedSearch) ||
      trip.destination.toLowerCase().includes(normalizedSearch) ||
      trip.delivery_date.includes(normalizedSearch) ||
      trip.driver_phone?.includes(normalizedSearch) ||
      trip.plate_number.toLowerCase().includes(normalizedSearch) ||
      trip.current_status_update.toLowerCase().includes(normalizedSearch) ||
      trip.project.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "all" || trip.updates?.[0]?.category === statusFilter;

    const matchesProject =
      projectFilter === "all" || trip.project === projectFilter;

    const matchesDate = trip.delivery_date.includes(normalizedSearch);

    const matchesStatusUpdate =
      trip.current_status_update.includes(normalizedSearch);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesProject &&
      matchesDate &&
      matchesStatusUpdate
    );
  });

  const sortedTrips = sortTrips(filteredTrips, sortConfig) || [];

  if (isLoading) {
    return <Loading text="Cargando viajes..." fullScreen />;
  }

  const uniqueProjects = [...new Set(trips.map((trip) => trip.project))].sort();

  return (
    <div className="space-y-4 p-5 max-w-[1550px] mx-auto">
      <div className="flex gap-4">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={`Buscar viajes... (${trips.length})`}
          />
        </div>
        <div className="flex items-center gap-2">
          <CustomSwitch value={selectedValue} onChange={setSelectedValue} />
        </div>
        {selectedTrips.size > 0 && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar ({selectedTrips.size})
          </button>
        )}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-600 h-4 w-4" />
          <select
            className="pl-10 pr-4 py-2 border rounded-lg appearance-none bg-white dark:bg-black min-w-[200px]"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="all">Todos los Proyectos</option>
            {uniqueProjects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>
        <StatusFilter value={statusFilter} onChange={setStatusFilter} />
      </div>

      <div className="bg-white dark:bg-black rounded-lg shadow overflow-x-auto relative max-h-[calc(100vh-190px)]">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-800">
            <tr>
              <th className="sticky top-0 bg-gray-800 z-10 w-8 px-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-gray-700
                   text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                  checked={
                    selectedTrips.size === sortedTrips.length &&
                    sortedTrips.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="sticky top-0 bg-gray-800 z-10 w-8 px-2"></th>
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
                  label="Fecha"
                  field="delivery_date"
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
                  label="Vehículo"
                  field="vehicle_id"
                  currentField={sortConfig.field}
                  direction={sortConfig.direction}
                  onSort={handleSort}
                />
              </th>
              <th className="sticky top-0 bg-gray-800 z-10 px-6 py-3 text-left">
                <SortableHeader
                  label="Conductor"
                  field="driver_name"
                  currentField={sortConfig.field}
                  direction={sortConfig.direction}
                  onSort={handleSort}
                />
              </th>
              <th className="sticky top-0 bg-gray-800 z-10 px-6 py-3 text-left">
                <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Origen
                </span>
              </th>
              <th className="sticky top-0 bg-gray-800 z-10 px-6 py-3 text-left">
                <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Destino
                </span>
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
                  field="status_category"
                  currentField={sortConfig.field}
                  direction={sortConfig.direction}
                  onSort={handleSort}
                />
              </th>
              <th className="sticky top-0 bg-gray-800 z-10 px-6 py-3 text-left">
                <SortableHeader
                  label="Novedad"
                  field="current_status_update"
                  currentField={sortConfig.field}
                  direction={sortConfig.direction}
                  onSort={handleSort}
                />
              </th>
              <th className="sticky top-0 bg-gray-800 z-10 px-6 py-3 text-left min-w-[140px]">
                <SortableHeader
                  label="Proveedor GPS"
                  field="gps_provider"
                  currentField={sortConfig.field}
                  direction={sortConfig.direction}
                  onSort={handleSort}
                />
              </th>
              <th className="sticky top-0 bg-gray-800 z-10 px-6 py-3 text-left min-w-[140px]">
                <SortableHeader
                  label="Tiempo"
                  field="last_update"
                  currentField={sortConfig.field}
                  direction={sortConfig.direction}
                  onSort={handleSort}
                />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-200">
            {sortedTrips.length > 1 ? (
              sortedTrips.map((trip, index) => (
                <ExpandableRow
                  key={trip.id}
                  index={index}
                  trip={trip}
                  isExpanded={expandedTrips.has(trip.id)}
                  isSelected={selectedTrips.has(trip.id)}
                  onToggleExpand={() => toggleExpanded(trip.id)}
                  onToggleSelect={(checked, event) =>
                    handleSelectTrip(trip.id, checked, index, event)
                  }
                  onTripSelect={setSelectedTrip}
                  updates={trip.updates || []}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={10}
                  className="p-4 text-center text-gray-300 dark:text-gray-600"
                >
                  No se encontraron viajes con este filtro
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        itemCount={selectedTrips.size || (selectedTrip ? 1 : 0)}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {selectedTrip && (
        <TripUpdatePanel
          trip={
            selectedTrips.size > 0
              ? trips.filter((t) => selectedTrips.has(t.id))
              : selectedTrip
          }
          onClose={() => setSelectedTrip(null)}
          onUpdateCreated={handleUpdateCreated}
        />
      )}
    </div>
  );
}
