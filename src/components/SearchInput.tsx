/* eslint-disable */
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Trip } from "../types/database";

interface SearchInputProps {
  allTrips: Trip[];
  onFilteredTripsChange: (filteredTrips: Trip[]) => void;
  placeholder?: string;
}

/**
 * Componente de búsqueda simplificado que maneja internamente toda la lógica
 * de filtrado y solo devuelve los resultados filtrados al componente padre
 */
export function SearchInput({
  allTrips,
  onFilteredTripsChange,
  placeholder = "Buscar viajes..."
}: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Realizar la búsqueda cuando cambia el término o los datos
  useEffect(() => {
    // Si no hay término de búsqueda, devolvemos todos los viajes
    if (!searchTerm.trim()) {
      onFilteredTripsChange(allTrips);
      return;
    }
    
    const normalizedSearch = searchTerm.trim().toLowerCase();
    
    // Función que convierte un objeto a texto plano para búsqueda
    const objectToSearchableText = (obj: any): string => {
      if (!obj) return "";
      
      if (typeof obj !== "object") {
        return String(obj).toLowerCase();
      }
      
      if (Array.isArray(obj)) {
        return obj.map(item => objectToSearchableText(item)).join(" ");
      }
      
      // Si es un objeto Date, formatearlo
      if (obj instanceof Date) {
        return obj.toLocaleDateString("es-EC", { 
          day: "2-digit", 
          month: "2-digit", 
          year: "numeric" 
        }).toLowerCase();
      }
      
      // Para objetos regulares
      return Object.values(obj)
        .map(value => {
          // Si es una fecha en string, intentar formatearla
          if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
            try {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                return date.toLocaleDateString("es-EC", { 
                  day: "2-digit", 
                  month: "2-digit", 
                  year: "numeric" 
                }).toLowerCase();
              }
            } catch (e) {
              // Si falla, usamos el valor original
            }
          }
          return objectToSearchableText(value);
        })
        .join(" ");
    };
    
    // Filtrar viajes utilizando la función de conversión a texto
    const filtered = allTrips.filter(trip => {
      const searchableText = objectToSearchableText(trip);
      return searchableText.includes(normalizedSearch);
    });
    
    onFilteredTripsChange(filtered);
  }, [searchTerm, allTrips, onFilteredTripsChange]);
  
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-600" />
      <input
        type="text"
        placeholder={placeholder}
        className="pl-10 pr-10 py-2 w-full border rounded-lg dark:bg-black"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}