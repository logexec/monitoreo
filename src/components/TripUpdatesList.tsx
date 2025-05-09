import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  MessageSquare,
  Image as ImageIcon,
  AlertCircle,
  Wrench,
  MapPin,
  AlertTriangle,
  Navigation,
  Upload,
  FileText,
} from "lucide-react";
import {
  updateCategoryLabels,
  updateCategoryColors,
} from "../constants/updateCategories";
import { TripUpdate } from "../types/database";

const categoryIcons = {
  INICIO_RUTA: Navigation,
  SEGUIMIENTO: MapPin,
  VIAJE_CARGADO: Upload,
  ACCIDENTE: AlertCircle,
  AVERIA: Wrench,
  ROBO_ASALTO: AlertTriangle,
  PERDIDA_CONTACTO: AlertCircle,
  VIAJE_FINALIZADO: Navigation,
};

interface TripUpdatesListProps {
  updates: TripUpdate[] | undefined;
}

export function TripUpdatesList({ updates }: TripUpdatesListProps) {
  const isLocalhost = window.location.host.includes("localhost");
  console.log("Is Localhost", isLocalhost);

  if (!updates) {
    return (
      <div className="py-8 text-center text-gray-500">
        <MessageSquare className="mx-auto h-8 w-8 mb-2 text-gray-400" />
        <p>No hay actualizaciones registradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800" />

      {updates.map((update) => {
        const Icon = categoryIcons[update.category];
        const { bg, text } = updateCategoryColors[update.category];

        // Construir la URL de la imagen usando el endpoint /api/images/{token}
        const imageUrl = update.image_token
          ? isLocalhost
            ? `http://localhost:8000/api/images/${update.image_token}`
            : `/api/images/${update.image_token}`
          : null;

        // Detectar si es un PDF basado en image_type
        const isPDF = update.image_type === "application/pdf";

        return (
          <div key={update.id} className="relative pl-16">
            <div
              className={`absolute left-[33px] -translate-x-1/2 w-3 h-3 rounded-full ${bg} border-2 border-white dark:border-black`}
            />

            <div className="bg-white dark:bg-black rounded-lg shadow-xs border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 ${text}`} />
                  <span className={`text-sm font-medium ${text}`}>
                    {updateCategoryLabels[update.category]}
                  </span>
                </div>
                <time className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(update.created_at), "dd-MMM-yy H:mm", {
                    locale: es,
                  })}
                </time>
              </div>

              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {update.notes}
              </div>

              {imageUrl && (
                <div className="mt-3">
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-block"
                  >
                    {isPDF ? (
                      <div className="flex items-center space-x-2 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                        <FileText className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Ver archivo PDF
                        </span>
                      </div>
                    ) : (
                      <>
                        <img
                          src={imageUrl}
                          alt="Evidencia"
                          className="h-24 w-auto rounded-lg border object-cover transition-transform group-hover:scale-105"
                        />
                        <div
                          style={{
                            backgroundColor: "#00000020",
                            backgroundImage: `url(${imageUrl})`,
                          }}
                          onMouseEnter={(e) => {
                            const target = e.currentTarget as HTMLDivElement;
                            target.style.backgroundColor = "#00000090";
                          }}
                          onMouseLeave={(e) => {
                            const target = e.currentTarget as HTMLDivElement;
                            target.style.backgroundColor = "#00000020";
                          }}
                          className="absolute inset-0 flex items-center justify-center bg-black dark:bg-white bg-opacity-0 transition-all duration-300 hover:b group-hover:bg-opacity-20 hover:bg-opacity-20"
                        >
                          <ImageIcon className="h-6 w-6 text-white dark:text-black opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </>
                    )}
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
