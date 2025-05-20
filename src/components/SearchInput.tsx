import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

/**
 * Componente mejorado de entrada de búsqueda con debounce para evitar
 * demasiadas actualizaciones durante la escritura
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  debounceMs = 300,
}: SearchInputProps) {
  // Estado interno para el valor de entrada
  const [inputValue, setInputValue] = useState(value);
  
  // Efecto para sincronizar el valor externo con el interno
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Efecto para implementar debounce
  useEffect(() => {
    // Si el valor interno es diferente del externo, aplicamos debounce
    if (inputValue !== value) {
      const timer = setTimeout(() => {
        onChange(inputValue);
      }, debounceMs);
      
      return () => clearTimeout(timer);
    }
  }, [inputValue, value, onChange, debounceMs]);
  
  // Manejador para limpiar la búsqueda
  const handleClear = () => {
    setInputValue("");
    onChange("");
  };
  
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-600" />
      <input
        type="text"
        placeholder={placeholder}
        className="pl-10 pr-10 py-2 w-full border rounded-lg dark:bg-black"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}