import axios, {
  AxiosHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import type { User } from "@/types/database";

/** ---------- ENV & URL HELPERS ---------- */
const API_URL = import.meta.env.VITE_API_URL as string; // e.g. https://api.example.com/api
if (!API_URL) {
  throw new Error("VITE_API_URL must be defined");
}

const SANCTUM_CSRF_URL: string =
  (import.meta.env.VITE_SANCTUM_CSRF_URL as string | undefined) ??
  new URL("/sanctum/csrf-cookie", new URL(API_URL).origin).toString();

/** ---------- AXIOS INSTANCE ---------- */
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

/** ---------- CSRF INITIALIZATION (ONCE PER PAGE LOAD) ---------- */
let csrfInitialized = false;
let csrfPromise: Promise<void> | null = null;

const ensureCsrfCookie = (): Promise<void> => {
  if (csrfInitialized) return Promise.resolve();
  if (csrfPromise) return csrfPromise;

  csrfPromise = api
    .get<void>(SANCTUM_CSRF_URL, {
      baseURL: undefined, // absolute to API origin, no `/api` prefix
      withCredentials: true,
    })
    .then(() => {
      csrfInitialized = true;
    })
    .finally(() => {
      csrfPromise = null;
    });

  return csrfPromise;
};

/** Public helper you can await at app boot or before unsafe calls */
export const ensureCsrfReady = async (): Promise<void> => {
  await ensureCsrfCookie();
};

const isUnsafeMethod = (method?: string): boolean => {
  const m = (method ?? "get").toUpperCase();
  return m === "POST" || m === "PUT" || m === "PATCH" || m === "DELETE";
};

/** ---------- INTERCEPTORS ---------- */
api.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> => {
    if (!config.headers) config.headers = new AxiosHeaders();
    config.withCredentials = true;

    if (isUnsafeMethod(config.method)) {
      await ensureCsrfCookie();
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// NOTE: intentionally NO 401 auto-logout interceptor.
// Handle 401s explicitly where you call APIs (e.g., getUser, guarded screens).

/** ---------- PUBLIC CSRF HELPER (compat) ---------- */
export const getCSRFToken = async (): Promise<void> => {
  await ensureCsrfCookie();
};

/** ---------- DOMAIN TYPES ---------- */
export type CreateTripInput = {
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
};

type TripUpdatesParams = {
  trip_id?: string;
  qty?: string;
};

/** ---------- SIMPLE IN-MEMORY CACHE ---------- */
type TripUpdateCache = {
  data: unknown;
  timestamp: number;
  trip_id?: string;
  quantity?: string;
};

const tripUpdateCache: TripUpdateCache = { data: null, timestamp: 0 };
const CACHE_DURATION_MS = 5 * 60 * 1000;

/** ---------- API CALLS ---------- */
export async function getTrips(
  date?: string,
  projects: string = "all"
): Promise<unknown> {
  const response = await api.get<unknown>("/trips", {
    params: { date, projects },
  });
  return response.data;
}

export async function getTripUpdates(
  trip_id?: string,
  quantity?: string
): Promise<unknown> {
  const now = Date.now();
  const isSameRequest =
    tripUpdateCache.trip_id === trip_id &&
    tripUpdateCache.quantity === quantity;
  const isCacheValid = now - tripUpdateCache.timestamp < CACHE_DURATION_MS;

  if (isSameRequest && isCacheValid && tripUpdateCache.data !== null) {
    return tripUpdateCache.data;
  }

  const params: TripUpdatesParams = { trip_id, qty: quantity };
  const response = await api.get<unknown>("/trip-updates", { params });

  tripUpdateCache.data = response.data;
  tripUpdateCache.timestamp = now;
  tripUpdateCache.trip_id = trip_id;
  tripUpdateCache.quantity = quantity;

  return response.data;
}

export async function getTripUpdatesImage(
  token: string
): Promise<AxiosResponse<unknown>> {
  const response = await api.get<unknown>(
    `/images/${encodeURIComponent(token)}`
  );
  return response;
}

export async function addTrips(
  trips: ReadonlyArray<CreateTripInput>
): Promise<unknown> {
  const response = await api.post<unknown>("/trips", { trips });
  return response.data;
}

export async function updateTrip(
  tripId: string,
  category: string,
  notes: string,
  image?: File
): Promise<unknown> {
  const formData = new FormData();
  formData.append("trip_id", tripId);
  formData.append("category", category);
  formData.append("notes", notes);
  if (image) formData.append("image", image);

  try {
    const response = await api.post<unknown>("/trip-updates", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (unknownError: unknown) {
    if (axios.isAxiosError(unknownError) && unknownError.response) {
      const data = unknownError.response.data as unknown;
      const message =
        typeof data === "object" && data !== null && "message" in data
          ? String((data as { message?: unknown }).message ?? "")
          : "Error desconocido al actualizar el viaje";
      throw new Error(message);
    }
    throw new Error("No se pudo conectar con el servidor");
  }
}

export async function getPlateNumbers(): Promise<unknown> {
  const response = await api.get<unknown>("/plate-numbers");
  return response.data;
}

export async function logout(): Promise<void> {
  await api.post<unknown>("/logout");
}

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>("/users");
  return response.data;
};

export default api;
