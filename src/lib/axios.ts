/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "@/types/database";
import axios from "axios";
import Cookies from "js-cookie";

const sanctumCsrfUrl = import.meta.env.VITE_SANCTUM_CSRF_URL;

// Configuración global de Axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true; // Se envían las cookies en cada petición

/**
 * Cache global 
 */
const tripUpdateCache: {
  data: any;
  timestamp: number;
  trip_id?: string;
  quantity?: string;
} = {
  data: null,
  timestamp: 0,
};

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene la cookie CSRF y actualiza el header X-XSRF-TOKEN en Axios.
 */
export const getCSRFToken = async () => {
  try {
    // Esta llamada establece la cookie XSRF-TOKEN y la cookie de sesión
    await axios.get(sanctumCsrfUrl, { withCredentials: true });
    const xsrfToken = Cookies.get("XSRF-TOKEN");
    axios.defaults.headers.common["X-XSRF-TOKEN"] = xsrfToken;
  } catch (error) {
    console.error("Error al obtener el token CSRF:", error);
    throw error;
  }
};

export async function getTrips(date?: string, projects = "all") {
  // date = new Date().toISOString().slice(0, 10),
  try {
    await getCSRFToken();
    const response = await axios.get("/trips", {
      params: { date, projects },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener trips:", error);
    throw error;
  }
}

export async function getTripUpdates(trip_id?: string, quantity?: string) {
  const now = Date.now();

  // Condición para reutilizar caché
  const isSameRequest =
    tripUpdateCache.trip_id === trip_id &&
    tripUpdateCache.quantity === quantity;

  const isCacheValid = now - tripUpdateCache.timestamp < CACHE_DURATION_MS;

  if (isSameRequest && isCacheValid && tripUpdateCache.data) {
    console.log("Usando datos en caché de trip updates");
    return tripUpdateCache.data;
  }

  try {
    const response = await axios.get(`/trip-updates?qty=${quantity}`, {
      params: { trip_id },
    });

    // Guardar en caché
    tripUpdateCache.data = response.data;
    tripUpdateCache.timestamp = now;
    tripUpdateCache.trip_id = trip_id;
    tripUpdateCache.quantity = quantity;

    return response.data;
  } catch (error) {
    console.error("Error al obtener las actualizaciones:", error);
    throw error;
  }
}

export async function getTripUpdatesImage(token: string) {
  try {
    // await getCSRFToken();
    const response = await axios.get(`/images/${token}`);
    console.log("Respuesta:", response);
    console.log("Imagen obtenida:", response.data);
    return response;
  } catch (error) {
    console.error("Error al obtener los archivos:", error);
    throw error;
  }
}

export async function addTrips(
  trips: Array<{
    delivery_date: Date;
    driver_name: string;
    driver_document: string;
    driver_phone: string;
    origin: string;
    destination: string;
    project: string;
    property_type: string;
    plate_number: string;
    shift?: string;
    uri_gps?: string;
    usuario?: string;
    clave?: string;
    gps_provider?: string;
    current_status?: string;
    current_status_update?: string;
  }>
) {
  try {
    await getCSRFToken();
    const response = await axios.post("/trips", { trips });
    return response.data;
  } catch (error) {
    console.error("Error al crear viajes:", error);
    throw error;
  }
}

export async function updateTrip(
  tripId: string,
  category: string,
  notes: string,
  image?: File
) {
  try {
    await getCSRFToken();
    const formData = new FormData();
    formData.append("trip_id", tripId);
    formData.append("category", category);
    formData.append("notes", notes);
    if (image) {
      formData.append("image", image);
    }
    const response = await axios.post("/trip-updates", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Necesario para enviar FormData
      },
    });
    return response.data;
  } catch (error) {
    // Verificar si es un error de Axios con respuesta
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage =
        error.response.data.message ||
        "Error desconocido al actualizar el viaje";
      console.error("Error al actualizar el viaje:", errorMessage, error);
      // Lanzar un nuevo error con el mensaje específico
      throw new Error(errorMessage);
    } else {
      // Otros tipos de errores (p.ej., problemas de red)
      console.error("Error al actualizar el viaje:", error);
      throw new Error("No se pudo conectar con el servidor");
    }
  }
}

export async function getPlateNumbers() {
  try {
    await getCSRFToken();
    const response = await axios.get("/plate-numbers");
    return response.data;
  } catch (error) {
    console.error("Error al obtener los números de placa:", error);
    throw error;
  }
}

export async function logout() {
  try {
    await getCSRFToken();
    await axios.post("/logout");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
}

export const getUsers = async (): Promise<User[]> => {
  try {
    await getCSRFToken();
    const response = axios.get("/users");
    return (await response).data;
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    throw new Error("No fue posible obtener los usuarios");
  }
};

export default axios;
