import { useState, useEffect } from "react";
import { DateProjectSelector } from "../components/TripLoader/DateProjectSelector";
import { MySQLTripList } from "../components/TripLoader/MySQLTripList";
import { MySQLTrip } from "../types/mysql";
import { getProjects, getTrips } from "../lib/mysql";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export function ImportTripsPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>(["all"]);
  const [trips, setTrips] = useState<MySQLTrip[]>([]);
  const [selectedTrips, setSelectedTrips] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projects = await getProjects();
        setAvailableProjects(projects);
      } catch (error) {
        console.error("Error loading projects:", error);
        toast.error("Error al cargar los proyectos");
      }
    };

    loadProjects();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const trips = await getTrips(date, selectedProjects);
      setTrips(trips);
      setSelectedTrips(new Set());
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Error al buscar viajes");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (selectedTrips.size === 0) {
      toast.error("Selecciona al menos un viaje para importar");
      return;
    }

    setImporting(true);
    try {
      const tripsToImport = trips
        .filter((trip) => selectedTrips.has(trip.trip_id))
        .map((trip) => ({
          external_trip_id: trip.trip_id,
          delivery_date: trip.delivery_date,
          driver_name: trip.driver_name,
          driver_phone: trip.driver_phone,
          origin: trip.origin,
          destination: trip.destination,
          project: trip.project,
          plate_number: trip.plate_number,
          property_type: trip.property_type,
          shift: trip.shift,
          gps_provider: trip.gps_provider,
          current_status: "SCHEDULED" as const,
        }));

      // const { error } = await supabase.from("trips").insert(tripsToImport);

      // if (error) throw error;

      toast.success(`${selectedTrips.size} viajes importados correctamente`);
      navigate("/");
    } catch (error) {
      console.error("Error importing trips:", error);
      toast.error("Error al importar los viajes");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Importar Viajes desde MySQL
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Selecciona la fecha y los proyectos para buscar viajes disponibles
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <DateProjectSelector
              date={date}
              projects={selectedProjects}
              selectedProjects={selectedProjects}
              onDateChange={setDate}
              onProjectChange={setSelectedProjects}
              availableProjects={availableProjects}
            />

            <div className="mt-4 space-y-4">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {loading ? "Buscando..." : "Buscar Viajes"}
              </button>

              {trips.length > 0 && (
                <button
                  onClick={handleImport}
                  disabled={importing || selectedTrips.size === 0}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                >
                  {importing
                    ? "Importando..."
                    : `Importar ${selectedTrips.size} Viajes`}
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
                <p className="text-gray-500">Buscando viajes...</p>
              </div>
            ) : trips.length > 0 ? (
              <MySQLTripList
                trips={trips}
                selectedTrips={selectedTrips}
                onTripSelect={(tripId, selected) => {
                  const newSelected = new Set(selectedTrips);
                  if (selected) {
                    newSelected.add(tripId);
                  } else {
                    newSelected.delete(tripId);
                  }
                  setSelectedTrips(newSelected);
                }}
                onSelectAll={(selected) => {
                  setSelectedTrips(
                    selected ? new Set(trips.map((t) => t.trip_id)) : new Set()
                  );
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
                <p className="text-gray-500">
                  No hay viajes disponibles. Ajusta los filtros y vuelve a
                  buscar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
