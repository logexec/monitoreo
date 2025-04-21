import { User } from "@/types/database";
import axios from "axios";
import Cookies from "js-cookie";

const sanctumCsrfUrl = import.meta.env.VITE_SANCTUM_CSRF_URL;

// Configuración global de Axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true; // Se envían las cookies en cada petición

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
    const response = await axios.get("/trips", {
      params: { date, projects },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener trips:", error);
    throw error;
  }
}

export async function getTripUpdates(trip_id?: string) {
  try {
    const response = await axios.get(`/trip-updates`, {
      params: { trip_id },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener las actualizaciones:", error);
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
  imageUrl?: string
) {
  try {
    await getCSRFToken();
    const response = await axios.post("/trip-updates", {
      trip_id: tripId,
      category,
      notes,
      image_url: imageUrl || null,
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

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  try {
    await getCSRFToken();
    const response = await axios.post("/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.url;
  } catch (error) {
    console.error("Error al subir la imagen:", error);
    throw new Error("No se pudo subir la imagen");
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
