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
    bg: "bg-green-100 dark:bg-green-900 group-[.bg-alert]:bg-white/20",
    text: "text-green-800 dark:text-green-200 group-[.bg-alert]:text-white",
  },
  SEGUIMIENTO: {
    bg: "bg-blue-100 dark:bg-blue-900 group-[.bg-alert]:bg-white/20",
    text: "text-blue-800 dark:text-blue-200 group-[.bg-alert]:text-white",
  },
  VIAJE_CARGADO: {
    bg: "bg-purple-100 dark:bg-purple-900 group-[.bg-alert]:bg-white/20",
    text: "text-purple-800 dark:text-purple-200 group-[.bg-alert]:text-white",
  },
  ACCIDENTE: {
    bg: "bg-[#fee2e2] dark:bg-[#7f1d1d] group-[.bg-alert]:bg-white/20",
    text: "text-[#991b1b] dark:text-red-200 group-[.bg-alert]:text-white",
  },
  AVERIA: {
    bg: "bg-[#fef3c7] dark:bg-[#78350f] group-[.bg-alert]:bg-white/20",
    text: "text-[#92400e] dark:text-yellow-200 group-[.bg-alert]:text-white",
  },
  ROBO_ASALTO: {
    bg: "bg-[#fce7f3] dark:bg-[#831843] group-[.bg-alert]:bg-white/20",
    text: "text-[#9d174d] dark:text-pink-200 group-[.bg-alert]:text-white",
  },
  PERDIDA_CONTACTO: {
    bg: "bg-gray-100 dark:bg-gray-900 group-[.bg-alert]:bg-white/20",
    text: "text-gray-800 dark:text-gray-200 group-[.bg-alert]:text-white",
  },
  VIAJE_FINALIZADO: {
    bg: "bg-emerald-100 dark:bg-emerald-900 group-[.bg-alert]:bg-white/20",
    text: "text-emerald-800 dark:text-emerald-200 group-[.bg-alert]:text-white",
  },
};
