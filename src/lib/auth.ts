/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner";
import api from "./axios";

export async function getUser() {
  try {
    const response = await api.get(`/me`);
    return response.data;
  } catch (error: any) {
    if (
      error.response.status === 401 &&
      error.message.toLowerCase().includes("Unauthenticated.")
    ) {
      toast.error(
        error instanceof Error ? error.message : "Ocurrió un error desconocido."
      );
      return null;
    }
    
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
