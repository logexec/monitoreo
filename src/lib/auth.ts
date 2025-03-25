// src/auth.ts
import axios from "./axios";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export async function getUser() {
  try {
    const response = await axios.get(`${API_URL}/me`); // Usa la URL base configurada
    return response.data;
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : "Ocurrió un error desconocido."
    );
    console.error("Error en getUser:", error);
    return null;
  }
}
