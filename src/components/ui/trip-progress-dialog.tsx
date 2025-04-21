import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";

interface TripProgressDialogProps {
  open: boolean;
  progress: number;
  total: number;
  completed: boolean;
  error?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
}

export function TripProgressDialog({
  open,
  progress,
  total,
  completed,
  error,
  errorMessage,
  onClose,
}: TripProgressDialogProps) {
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setIsVisible(true); // Mostrar al abrir
    }
  }, [open]);

  // Auto cierre con animación
  useEffect(() => {
    if (completed && open) {
      const timeout = setTimeout(() => {
        setIsVisible(false); // Triggerea la animación de salida
        setTimeout(onClose, 300); // Espera la animación y luego cierra
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [completed, open, onClose]);

  return (
    <AnimatePresence mode="sync">
      {isVisible && (
        <AlertDialog open={true}>
          <AlertDialogContent className="pointer-events-none overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {/* Progress Bar */}
              {!completed && !error && (
                <motion.div
                  className="absolute bottom-0 left-0 h-[2px] bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(progress / total) * 100}%` }}
                  transition={{ ease: "easeInOut", duration: 0.3 }}
                />
              )}

              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-semibold min-h-[28px]">
                  <AnimatePresence mode="wait">
                    {error ? (
                      <motion.span
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Ocurrió un error
                      </motion.span>
                    ) : completed ? (
                      <motion.div
                        key="completed"
                        className="flex items-center space-x-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <span className="text-green-600 dark:text-green-400">
                          Actualización completada
                        </span>
                        <motion.svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          initial="hidden"
                          animate="visible"
                          transition={{ duration: 0.5, delay: 0.5 }}
                        >
                          <motion.circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-green-600 dark:text-green-400"
                          />
                          <motion.path
                            d="M8 12.5L11 15.5L16 10"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="text-green-600 dark:text-green-400"
                          />
                        </motion.svg>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="progress"
                        className="flex items-center space-x-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Loader2 size={18} className="animate-spin" />
                        <span className="animate-pulse">
                          Registrando actualizaciones...
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </AlertDialogTitle>

                <AlertDialogDescription className="min-h-[24px]">
                  <AnimatePresence mode="wait">
                    {error ? (
                      <motion.span
                        key="desc-error"
                        className="text-red-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Hubo un error al tratar de actualizar los viajes:
                        <br />
                        {errorMessage && errorMessage}
                      </motion.span>
                    ) : completed ? (
                      <motion.span
                        key="desc-complete"
                        className="text-green-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Se actualizaron {total} viajes correctamente.
                      </motion.span>
                    ) : (
                      <motion.span
                        key="desc-progress"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Registrando {progress} de {total} viajes...
                      </motion.span>
                    )}
                  </AnimatePresence>
                </AlertDialogDescription>
              </AlertDialogHeader>
            </motion.div>
            {error && (
              <AlertDialogCancel className="bg-black hover:bg-slate-900 text-white py-2 rounded-lg">
                Cerrar
              </AlertDialogCancel>
            )}
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AnimatePresence>
  );
}
