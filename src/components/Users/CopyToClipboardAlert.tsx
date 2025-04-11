import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Copy, CopyCheckIcon, Info } from "lucide-react";
import { toast } from "sonner";

const CopyToClipboardAlert = () => {
  const [copied, setCopied] = useState(false);
  const password = "Monitoreo2025";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      toast.info("Contraseña copiada al portapapeles");
      setTimeout(() => setCopied(false), 2000); // Restaurar el estado después de 2 segundos
    });
  };

  return (
    <Alert className="py-4 px-2 rounded-md bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800">
      <div className="flex items-center space-x-2">
        <Info className="h-5 w-5 text-sky-600 dark:text-sky-400" />
        <AlertTitle className="text-sky-800 dark:text-sky-200">
          Recuerda
        </AlertTitle>
      </div>
      <AlertDescription className="mt-1.5 flex items-center justify-center space-x-2">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          La contraseña por defecto es
        </span>
        <div className="relative border rounded border-sky-200 dark:border-sky-800 px-0.5 py-1 w-40">
          <input
            type="text"
            value={password}
            readOnly
            className="bg-transparent focus:outline-none cursor-pointer text-sm text-sky-600 dark:text-sky-400 pl-4"
          />
          <button
            onClick={copyToClipboard}
            className="absolute right-2 top-1 text-gray-500 hover:text-sky-500 transition duration-200"
            aria-label="Copiar al portapapeles"
          >
            {copied ? <CopyCheckIcon size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default CopyToClipboardAlert;
