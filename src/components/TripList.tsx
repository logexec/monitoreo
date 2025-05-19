import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Trip, TripUpdate } from "../types/database";
import { TripUpdatePanel } from "./TripUpdatePanel";
import { ExpandableRow } from "./ExpandableRow";
import { StatusFilter } from "./StatusFilter";
import { SearchInput } from "./SearchInput";
import { SortableHeader } from "./SortableHeader";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { SortConfig } from "../types/sorting";
import { getTrips } from "@/lib/axios";
import Loading from "./Loading";
import CustomSwitch from "./ui/CustomSwitch";
import { useLocation } from "react-router-dom";
import { useGlobalFilters } from "@/contexts/GlobalFilterContext";
import { ProjectMultiSelect } from "./ProjectMultiSelect";

export function TripList() {
  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
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

  const { filters, setFilters } = useGlobalFilters();
  const { projects, search, status, selectedValue } = filters;
  const location = useLocation();

  const uniqueProjects = [...new Set(trips.map((t) => t.project))].sort();
  const projectOptions = uniqueProjects.map((p) => ({ value: p, label: p }));

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000); // actualiza cada segundo
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location.state?.filtersOverride) {
      setFilters((prev) => ({
        ...prev,
        ...location.state.filtersOverride,
      }));
    }
  }, [location.state, setFilters]);

  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoading(true);
      try {
        const dateParam =
          selectedValue === "on"
            ? new Date().toISOString().slice(0, 10)
            : undefined;
        const response = await getTrips(dateParam);
        setTrips(
          response.map((trip: Trip) => ({
            ...trip,
            updates: trip.updates ?? [],
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
      filters.status === "all" ||
      trip.updates?.[0]?.category === filters.status;

    const matchesProject =
      projects.length === 0 || projects.includes(trip.project);

    return matchesSearch && matchesStatus && matchesProject;
  });

  // const getMinutesSinceUpdate = (trip: Trip): number => {
  //   const lastUpdate = trip.updates?.[0]?.created_at || trip.updated_at;
  //   const updatedTime = new Date(lastUpdate);
  //   return (nowTick - updatedTime.getTime()) / 60000;
  // };

  const enrichedTrips = filteredTrips.map((trip) => {
    const lastUpdate = trip.updates?.[0]?.created_at || trip.updated_at;
    const updatedTime = new Date(lastUpdate).getTime();
    const diffSeconds = Math.floor((now - updatedTime) / 1000);
    return {
      ...trip,
      secondsSinceUpdate: diffSeconds,
      minutesSinceUpdate: diffSeconds / 60,
    };
  });
  const overdueTrips = enrichedTrips
    .filter((t) => t.minutesSinceUpdate >= 20)
    .sort((a, b) => b.secondsSinceUpdate - a.secondsSinceUpdate); // más antiguos arriba

  const recentTrips = enrichedTrips
    .filter((t) => t.minutesSinceUpdate < 20)
    .sort((a, b) => b.secondsSinceUpdate - a.secondsSinceUpdate); // más antiguos arriba también

  const sortedTrips = [...overdueTrips, ...recentTrips];

  if (isLoading) {
    return <Loading text="Cargando viajes..." fullScreen />;
  }

  // const uniqueProjects = [...new Set(trips.map((trip) => trip.project))].sort();

  return (
    <div className="space-y-4 py-5 px-2 mx-auto">
      {/* <div className="space-y-4 p-5 max-w-[1700px] screen-xl:max-w-[1280px] screen-2xl:max-w-[1536px] screen-3xl:max-w-[1600px] screen-4xl:max-w-[1800px] screen-5xl:max-w-[2000px] screen-6xl:max-w-[2200px] mx-auto"> */}
      {/* Filter Section */}
      <div className="flex gap-4">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={(v) =>
              setFilters((f) => ({
                ...f,
                search: v,
              }))
            }
            placeholder={`Buscar viajes... (${trips.length})`}
          />
        </div>
        <div className="flex items-center gap-2">
          <CustomSwitch />
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
          <ProjectMultiSelect
            options={projectOptions}
            selected={filters.projects}
            onChange={(arr) => setFilters((f) => ({ ...f, projects: arr }))}
          />
        </div>
        <StatusFilter
          value={status}
          onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
        />
      </div>

      {/* Table Section */}

      <div className="bg-white dark:bg-black rounded-lg shadow-sm overflow-x-auto relative max-h-[calc(100vh-150px)] max-w-[calc(100vw-150px)]">
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
              {/* <th className="sticky top-0 bg-gray-800 z-10 px-6 py-3 text-left">
                <SortableHeader
                  label="ID Viaje"
                  field="system_trip_id"
                  currentField={sortConfig.field}
                  direction={sortConfig.direction}
                  onSort={handleSort}
                />
              </th> */}
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
                  label="Fecha"
                  field="delivery_date"
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
                <SortableHeader
                  label="Ruta"
                  field="route"
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
                  secondsSinceUpdate={trip.secondsSinceUpdate}
                  minutesSinceUpdate={trip.minutesSinceUpdate}
                  isAlert={trip.minutesSinceUpdate >= 15}
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
