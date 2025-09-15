import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";
// import data from "./data.json";
// import { DataTable } from "@/components/data-table";

// Pagina de dashboard
export default function Dashboard() {
  const auth = useAuth();
  const fetchExeptions = async () => {
    await api
      .get("/geotab/index-exeptions")
      .then((response) => {
        console.log("Excepciones:", response.data);
      })
      .catch((e) => {
        console.error("Error en fetch de API indexExceptions:", e);
      });
  };

  const fetchGroup = async () => {
    await api
      .get("/geotab/getGroup", {
        params: {
          limit: 20,
        },
      })
      .then((response) => {
        console.log("Grupos:", response.data);
      })
      .catch((e) => {
        console.error("Error en fetch de API getGroup:", e);
      });
  };

  const fetchDevice = async (deviceId: number = 20) => {
    // Pasar id por parametro; valor quemado para pruebas
    await api
      .get("/geotab/getDevice", {
        params: {
          id: deviceId,
        },
      })
      .then((response) => {
        console.log("Dispositivos:", response.data);
      })
      .catch((e) => {
        console.error("Error en fetch de API getDevice:", e);
      });
  };

  const fetchOdometer = async (deviceId: string = "b3") => {
    // b3 valor quemado para pruebas. Pasar valor real por parametro de manera dinamica.
    await api
      .get("/geotab/getOdometer", {
        params: {
          id: deviceId,
        },
      })
      .then((response) => {
        const message =
          response.data.length > 0
            ? `Odometro del vehiculo ${response.data[0].device.id}: `
            : "No hay lectura registrada para este vehiculo";
        console.log(message, response.data);
      })
      .catch((e) => {
        console.error("Error en fetch de API getOdometerReading:", e);
      });
  };

  const fetchFaultData = async (resultsLimit: number = 20) => {
    await api
      .get("/geotab/getFaultData", {
        params: {
          limit: resultsLimit,
        },
      })
      .then((response) => {
        console.log("Fault Data:", response.data);
      })
      .catch((e) => {
        console.error("Error en fetch de API getFaultData:", e);
      });
  };

  const fetchVehicleLogRecord = async (deviceId: string = "b7D") => {
    await api
      .get("/geotab/getVehicleLogRecord", {
        params: {
          id: deviceId,
        },
      })
      .then((response) => {
        console.log(
          `Log Record de vehiculo ${response.data[0].device.id}:`,
          response.data
        );
      })
      .catch((e) => {
        console.error("Error en fetch de API getVehicleLogRecord:", e);
      });
  };

  const fetchGeotabTrips = async () => {
    await api
      .get("/geotab/getGeotabTrips", {
        params: {
          // id: deviceId,
        },
      })
      .then((response) => {
        console.log("Viajes registrados en Geotab:", response.data);
      })
      .catch((e) => {
        console.error("Error en fetch de API getGeotabTrips:", e);
      });
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      {auth.user?.isAdmin && (
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 border border-gray-300 mt-4 mx-2 rounded-lg p-4">
          <span className="col-span-3 lg:col-span-4 font-medium text-md bg-amber-100 text-amber-600 rounded-lg border border-amber-600 p-2 text-center mb-4">
            Todas las respuestas se ven en consola hasta adaptar todas las
            llamadas.
          </span>
          <Button onClick={() => fetchExeptions()} variant="outline">
            Traer exepciones
          </Button>
          <Button onClick={() => fetchGroup()} variant="outline">
            Traer grupos
          </Button>
          <Button onClick={() => fetchDevice()} variant="outline">
            Traer dispositivos
          </Button>
          <Button onClick={() => fetchOdometer()} variant="outline">
            Traer odometros
          </Button>
          <Button onClick={() => fetchFaultData()} variant="outline">
            Traer fault data
          </Button>
          <Button onClick={() => fetchVehicleLogRecord()} variant="outline">
            Traer Log Record del vehiculo
          </Button>
          <Button onClick={() => fetchGeotabTrips()} variant="outline">
            Traer Viajes Registrados en Geotab
          </Button>
        </div>
      )}
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        {/* <DataTable data={data} /> */}
      </div>
    </div>
  );
}
