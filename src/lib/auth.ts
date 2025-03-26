import axios from "./axios";
import { toast } from "sonner";

export async function getUser() {
  try {
    const response = await axios.get(`/me`); // Usa la URL base configurada
    return response.data;
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : "Ocurrió un error desconocido."
    );
    console.error("Error en getUser:", error);
    return null;
  }
}
