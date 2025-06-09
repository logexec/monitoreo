import axios from "./axios";
import { toast } from "sonner";

export async function getUser() {
  try {
    const response = await axios.get(`/me`);
    return response.data;
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : "Ocurrió un error desconocido."
    );
    console.error(
      "Error en auth.ts@getUser:",
      error instanceof Error && error.message
    );
    return null;
  }
}
