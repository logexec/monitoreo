import { UpdateCategory } from "../types/database";

export const updateCategoryLabels: Record<UpdateCategory, string> = {
  INICIO_RUTA: "Inicio de Ruta",
  SEGUIMIENTO: "Seguimiento",
  VIAJE_CARGADO: "Viaje Cargado",
  ACCIDENTE: "Accidente",
  AVERIA: "Avería",
  ROBO_ASALTO: "Robo/Asalto",
  PERDIDA_CONTACTO: "Pérdida de Contacto",
  VIAJE_FINALIZADO: "Viaje Finalizado",
};

export const updateCategoryColors: Record<
  UpdateCategory,
  { bg: string; text: string }
> = {
  INICIO_RUTA: {
    bg: "bg-green-100 dark:bg-green-900",
    text: "text-green-800 dark:text-green-200",
  },
  SEGUIMIENTO: {
    bg: "bg-blue-100 dark:bg-blue-900",
    text: "text-blue-800 dark:text-blue-200",
  },
  VIAJE_CARGADO: {
    bg: "bg-purple-100 dark:bg-purple-900",
    text: "text-purple-800 dark:text-purple-200",
  },
  ACCIDENTE: {
    bg: "bg-red-100 dark:bg-red-900",
    text: "text-red-800 dark:text-red-200",
  },
  AVERIA: {
    bg: "bg-yellow-100 dark:bg-yellow-900",
    text: "text-yellow-800 dark:text-yellow-200",
  },
  ROBO_ASALTO: {
    bg: "bg-pink-100 dark:bg-pink-900",
    text: "text-pink-800 dark:text-pink-200",
  },
  PERDIDA_CONTACTO: {
    bg: "bg-gray-100 dark:bg-gray-900",
    text: "text-gray-800 dark:text-gray-200",
  },
  VIAJE_FINALIZADO: {
    bg: "bg-emerald-100 dark:bg-emerald-900",
    text: "text-emerald-800 dark:text-emerald-200",
  },
};
