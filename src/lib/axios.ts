import axios from "axios";
import Cookies from "js-cookie";

const sanctumCsrfUrl = `${import.meta.env.VITE_SANCTUM_CSRF_URL}`;

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
    delivery_date: string;
    driver_name: string;
    driver_email: string;
    driver_phone: string;
    origin: string;
    destination: string;
    project: string;
    plate_number: string;
    property_type: string;
    shift?: string;
    gps_provider?: string;
    uri_gps?: string;
    usuario?: string;
    clave?: string;
    current_status?: string;
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
    console.error("Error al actualizar el viaje:", error);
    throw error;
  }
}

export default axios;
