import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare, Image as ImageIcon, AlertCircle, Wrench, MapPin, AlertTriangle, Navigation, Upload } from 'lucide-react';
import { updateCategoryLabels, updateCategoryColors } from '../constants/updateCategories';
import { TripUpdate } from '../types/database';
import { getPublicImageUrl } from '../utils/storage';

const categoryIcons = {
  INICIO_RUTA: Navigation,
  SEGUIMIENTO: MapPin,
  VIAJE_CARGADO: Upload,
  ACCIDENTE: AlertCircle,
  AVERIA: Wrench,
  ROBO_ASALTO: AlertTriangle,
  PERDIDA_CONTACTO: AlertCircle,
  VIAJE_FINALIZADO: Navigation
};

interface TripUpdatesListProps {
  updates: TripUpdate[];
}

export function TripUpdatesList({ updates }: TripUpdatesListProps) {
  if (updates.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <MessageSquare className="mx-auto h-8 w-8 mb-2 text-gray-400" />
        <p>No hay actualizaciones registradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
      
      {updates.map((update) => {
        const Icon = categoryIcons[update.category];
        const { bg, text } = updateCategoryColors[update.category];
        
        return (
          <div key={update.id} className="relative pl-16">
            <div className={`absolute left-7 -translate-x-1/2 w-3 h-3 rounded-full ${bg} border-2 border-white`} />
            
            <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 ${text}`} />
                  <span className={`text-sm font-medium ${text}`}>
                    {updateCategoryLabels[update.category]}
                  </span>
                </div>
                <time className="text-xs text-gray-500">
                  {format(new Date(update.created_at), "dd-MMM-yy H:mm", { locale: es })}
                </time>
              </div>

              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {update.notes}
              </div>

              {update.image_url && (
                <div className="mt-3">
                  <a
                    href={getPublicImageUrl(update.image_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-block"
                  >
                    <img
                      src={getPublicImageUrl(update.image_url)}
                      alt="Update attachment"
                      className="h-24 w-auto rounded-lg border object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-opacity group-hover:bg-opacity-20">
                      <ImageIcon className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}