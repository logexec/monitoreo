import { UpdateCategory } from '../types/database';

export const updateCategoryLabels: Record<UpdateCategory, string> = {
  INICIO_RUTA: 'Inicio de Ruta',
  SEGUIMIENTO: 'Seguimiento',
  VIAJE_CARGADO: 'Viaje Cargado',
  ACCIDENTE: 'Accidente',
  AVERIA: 'Avería',
  ROBO_ASALTO: 'Robo/Asalto',
  PERDIDA_CONTACTO: 'Pérdida de Contacto',
  VIAJE_FINALIZADO: 'Viaje Finalizado'
};

export const updateCategoryColors: Record<UpdateCategory, { bg: string; text: string }> = {
  INICIO_RUTA: { bg: 'bg-green-100', text: 'text-green-800' },
  SEGUIMIENTO: { bg: 'bg-blue-100', text: 'text-blue-800' },
  VIAJE_CARGADO: { bg: 'bg-purple-100', text: 'text-purple-800' },
  ACCIDENTE: { bg: 'bg-red-100', text: 'text-red-800' },
  AVERIA: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  ROBO_ASALTO: { bg: 'bg-pink-100', text: 'text-pink-800' },
  PERDIDA_CONTACTO: { bg: 'bg-gray-100', text: 'text-gray-800' },
  VIAJE_FINALIZADO: { bg: 'bg-emerald-100', text: 'text-emerald-800' }
};