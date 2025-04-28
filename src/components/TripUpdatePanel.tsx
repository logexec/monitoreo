/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import { Trip, TripUpdate, UpdateCategory } from "../types/database";
import { updateCategoryLabels } from "../constants/updateCategories";
import { motion } from "motion/react";
import { updateTrip } from "@/lib/axios";
import { toast } from "sonner";
import { TripProgressDialog } from "./ui/trip-progress-dialog";

interface TripUpdatePanelProps {
  trip: Trip | Trip[];
  onClose: () => void;
  onUpdateCreated?: (update: TripUpdate) => void;
}

export function TripUpdatePanel({
  trip,
  onClose,
  onUpdateCreated,
}: TripUpdatePanelProps) {
  const [category, setCategory] = useState<UpdateCategory>("INICIO_RUTA");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para el dialogo de actualización
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [_open, setOpen] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowProgress(true);
    setProgress(0);
    setCompleted(false);
    setError(false);

    try {
      const trips = Array.isArray(trip) ? trip : [trip];
      const updates: TripUpdate[] = [];

      for (const [index, t] of trips.entries()) {
        try {
          const data = await updateTrip(
            t.id,
            category,
            notes,
            file || undefined // Pasa el archivo directamente
          );
          if (data) {
            updates.push(data as TripUpdate);
          }
          setProgress(index + 1);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Error desconocido";
          console.error("Error con viaje ID:", t.id, err);
          setError(true);
          setErrorMessage(errorMessage);
          toast.error(errorMessage);
          break;
        }
      }

      if (!error) {
        updates.forEach((update) => {
          if (onUpdateCreated) {
            onUpdateCreated(update);
          }
        });

        toast.success(
          trips.length > 1
            ? `Actualización registrada para ${trips.length} viajes`
            : "Actualización registrada exitosamente"
        );

        setCompleted(true);
        setTimeout(() => {
          setShowProgress(false);
          onClose();
        }, 1500);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      console.error("Error al crear actualización:", error);
      setError(true);
      setErrorMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ right: -100, opacity: 0 }}
      animate={{ right: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-y-0 right-0 w-[500px] bg-white dark:bg-black shadow-2xl z-50 border-l"
    >
      <TripProgressDialog
        open={showProgress}
        progress={progress}
        total={Array.isArray(trip) ? trip.length : 1}
        completed={completed}
        error={error}
        errorMessage={errorMessage}
        onClose={() => setOpen(false)}
      />

      <div className="h-full flex flex-col">
        <div className="px-6 py-2 border-b bg-gray-200 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Nueva Actualización
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {Array.isArray(trip) && (
            <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <div className="flex items-start">
                <div className="shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400 dark:text-yellow-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Actualización masiva
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yello-300">
                    <p>
                      Estás por actualizar <strong>{trip.length} viajes</strong>{" "}
                      simultáneamente. Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {!Array.isArray(trip) && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Viaje #{trip.trip_id}
                </h3>
                <div className="space-y-1">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-medium">Conductor:</span>{" "}
                    {trip.driver_name}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue">
                    <span className="font-medium">Destino:</span>{" "}
                    {trip.destination}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as UpdateCategory)
                  }
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-black"
                >
                  {Object.entries(updateCategoryLabels).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Notas
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 resize-none px-3 py-2 dark:bg-black"
                  placeholder="Describe la situación..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Imagen (opcional)
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-950"
                >
                  <div className="space-y-1 text-center">
                    {preview ? (
                      <div className="relative">
                        <img
                          src={preview}
                          alt="Preview"
                          className="mx-auto h-32 w-auto rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            setPreview(null);
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-100 dark:bg-red-900 rounded-full text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Subir archivo</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          Arrastra y suelta una imagen aquí
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !notes.trim()}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-xs text-sm font-medium text-white dark:text-black bg-blue-600 dark:bg-blue-400 hover:bg-blue-700 dark:hover:bg-blue-300 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Guardando..." : "Guardar Actualización"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
