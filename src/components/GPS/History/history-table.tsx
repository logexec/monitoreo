/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Bell,
  AlertTriangle,
  Truck,
  Info,
  Clock,
  MapPin,
  ChevronDown,
  Loader2,
  RefreshCw,
  Eye,
  Thermometer,
  Droplet,
  BatteryFull,
  Gauge,
  Activity,
  Wind,
  Flame,
  Cpu,
} from "lucide-react";
import { BsSpeedometer2 } from "react-icons/bs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Tipos de datos para Geotab
interface GeotabDevice {
  id: string;
  name: string;
  serialNumber?: string;
  vehicleIdentificationNumber?: string;
}

interface GeotabAlert {
  id: string;
  type?: string;
  severity?: "low" | "medium" | "high" | "critical"; // Adaptado según datos disponibles
  timestamp?: string;
  activeFrom?: string; // Convertir a timestamp en caso necesario
  activeTo?: string;
  vehicleName?: string;
  device?: {
    id: string;
    name?: string;
  };
  description?: string;
  isActive?: boolean;
  resolved?: boolean; // Campo calculado
  diagnosticId?: string;
  diagnosticValue?: number;
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  speed?: number;
  driverName?: string;

  deviceInfo?: GeotabDevice;
  rule?: {
    id: string;
    name: string;
    ruleType?: string; // Para determinar el tipo de alerta
  };
  notifyVia?: string[];
  state?: string;
  resolvedAt?: string; // Puede ser activeTo
  resolvedBy?: string;
  notes?: string;
  driverId?: string;
}

// Componente principal
export const AlertHistory: React.FC = () => {
  const [alerts, setAlerts] = useState<GeotabAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<GeotabAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<GeotabAlert | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterResolved, setFilterResolved] = useState<string>("");
  const [currentView, setCurrentView] = useState<string>("all");
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mapAlert, setMapAlert] = useState<GeotabAlert | null>(null);

  // Cargar datos
  useEffect(() => {
    fetchAlerts();
  }, []);

  // Aplicar filtros cuando cambian
  useEffect(() => {
    applyFilters();
  }, [
    alerts,
    searchTerm,
    filterSeverity,
    filterType,
    filterResolved,
    currentView,
  ]);

  useEffect(() => {
    if (!mapAlert || !mapAlert.location) return;

    const raf = requestAnimationFrame(() => {
      const container = L.DomUtil.get("leaflet-map") as HTMLElement & {
        _leaflet_id?: number;
      };

      if (container) {
        container._leaflet_id = undefined;

        const map = L.map("leaflet-map").setView(
          [
            mapAlert.location?.latitude as number,
            mapAlert.location?.longitude as number,
          ],
          16
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        L.marker([
          mapAlert.location?.latitude as number,
          mapAlert.location?.longitude as number,
        ])
          .addTo(map)
          .bindPopup("Ubicación de la alerta")
          .openPopup();
      } else {
        console.warn("Contenedor de mapa no encontrado.");
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [mapAlert]);

  // Función para cargar las alertas desde la API de Geotab
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // Obtener las alertas de la API
      const response = await axios.get<{
        success: boolean;
        alerts: GeotabAlert[];
        count: number;
      }>("/geotab/alerts");

      if (response.data.success) {
        // Procesar y enriquecer los datos para adaptarlos al formato esperado
        const processedAlerts = processGeotabAlerts(response.data.alerts);
        setAlerts(processedAlerts);
      } else {
        console.error("Error al cargar alertas: Respuesta no exitosa");
      }
    } catch (error) {
      console.error("Error al cargar alertas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Procesar las alertas de Geotab para adaptarlas al formato requerido
  const processGeotabAlerts = (geotabAlerts: GeotabAlert[]): GeotabAlert[] => {
    return geotabAlerts.map((alert) => {
      const resolved = !alert.isActive || !!alert.activeTo;

      // Diagnóstico legible
      const diagnosticLabel = getDiagnosticLabel(alert.diagnosticId);
      const diagnosticValue = alert.diagnosticValue ?? "N/A";

      // Generar descripción más útil si está vacía o genérica
      let description = alert.description || "";
      if (
        !description ||
        description.toLowerCase().includes("desconocido") ||
        description.toLowerCase().includes("diagnóstico")
      ) {
        description = `Fallo: ${diagnosticLabel} (Valor: ${diagnosticValue})`;
      }

      // Severidad
      let severity: "low" | "medium" | "high" | "critical" =
        alert.severity || "medium";
      if (!alert.severity && alert.rule?.ruleType) {
        switch (alert.rule.ruleType) {
          case "ExceptionEventAggregation":
            severity = "high";
            break;
          case "DiagnosticAlertRule":
            severity = "medium";
            break;
          default:
            severity = "low";
        }
      }

      // Tipo
      let type = alert.type || "";
      if (!type && alert.rule?.ruleType) {
        const typeMapping: Record<string, string> = {
          ExceptionSpeedingRule: "speeding",
          ExceptionHarshBrakingRule: "hardBraking",
          ExceptionHarshAccelerationRule: "harshAcceleration",
          ExceptionIdlingRule: "idling",
          MaintenanceRule: "maintenance",
          FuelLevelRule: "fuelLevel",
          ZoneRule: "geofence",
          DiagnosticAlertRule: "engineFault",
        };

        type = typeMapping[alert.rule.ruleType] || "engineFault";

        const ruleName = alert.rule.name?.toLowerCase() || "";
        if (ruleName.includes("velocidad")) type = "speeding";
        if (ruleName.includes("frenado")) type = "hardBraking";
        if (ruleName.includes("acelera")) type = "harshAcceleration";
        if (ruleName.includes("ralentí") || ruleName.includes("idling"))
          type = "idling";
        if (ruleName.includes("mantenim") || ruleName.includes("maintenance"))
          type = "maintenance";
        if (ruleName.includes("combustible") || ruleName.includes("fuel"))
          type = "fuelLevel";
        if (
          ruleName.includes("geocerca") ||
          ruleName.includes("zona") ||
          ruleName.includes("geofence")
        )
          type = "geofence";
        if (
          ruleName.includes("motor") ||
          ruleName.includes("engine") ||
          ruleName.includes("diagnos")
        )
          type = "engineFault";
      }

      const location = alert.location || {
        address: "Ubicación no disponible",
        latitude: 0,
        longitude: 0,
      };

      const timestamp =
        alert.timestamp || alert.activeFrom || new Date().toISOString();

      const vehicleName = alert.device?.id || "Vehículo desconocido";

      return {
        ...alert,
        type,
        severity,
        description,
        resolved,
        resolvedAt:
          alert.activeTo || (resolved ? new Date().toISOString() : undefined),
        timestamp,
        location,
        vehicleName,
        vehicleId: alert.device?.id || "",
        driverName: alert.driverName || "No disponible",
      };
    });
  };

  const getDiagnosticLabel = (id?: string): string => {
    const map: Record<string, string> = {
      EngineSpeed: "Revoluciones del motor (RPM)",
      EngineRoadSpeed: "Velocidad del vehículo",
      EngineCoolantTemperature: "Temperatura del refrigerante",
      EngineOilPressure: "Presión del aceite del motor",
      BatteryVoltage: "Voltaje de la batería",
      EngineLoad: "Carga del motor",
      FuelLevel: "Nivel de combustible",
      ThrottlePosition: "Posición del acelerador",
      EngineHours: "Horas de funcionamiento del motor",
      AmbientAirTemperature: "Temperatura del aire ambiente",
      IntakeAirTemperature: "Temperatura de admisión de aire",
      BarometricPressure: "Presión barométrica",
      TransmissionOilTemperature: "Temperatura del aceite de transmisión",
      BrakeSwitch: "Interruptor de freno",
      PTOStatus: "Estado de la Toma de Fuerza (PTO)",
      Odometer: "Odómetro",
      FuelUsed: "Combustible utilizado",
      CruiseControlStatus: "Estado del control crucero",
      Torque: "Torque del motor",
      AccelerationX: "Aceleración (X)",
      AccelerationY: "Aceleración (Y)",
      AccelerationZ: "Aceleración (Z)",
    };

    return id ? map[id] || `Diagnóstico desconocido (${id})` : "No disponible";
  };

  const getDiagnosticIcon = (id?: string): JSX.Element | null => {
    const iconMap: Record<string, React.ElementType> = {
      EngineCoolantTemperature: Thermometer,
      TransmissionOilTemperature: Thermometer,
      EngineOilPressure: Droplet,
      BatteryVoltage: BatteryFull,
      EngineLoad: Gauge,
      EngineSpeed: Gauge,
      EngineRoadSpeed: BsSpeedometer2,
      FuelLevel: Flame,
      ThrottlePosition: Activity,
      Odometer: MapPin,
      BarometricPressure: Wind,
      AmbientAirTemperature: Thermometer,
      IntakeAirTemperature: Thermometer,
      AccelerationX: Cpu,
      AccelerationY: Cpu,
      AccelerationZ: Cpu,
    };

    const Icon = id && iconMap[id];
    return Icon ? <Icon className="h-5 w-5 text-slate-500" /> : null;
  };

  const refreshAlerts = async () => {
    setRefreshing(true);
    try {
      await fetchAlerts();
    } finally {
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let result = [...alerts];

    // Filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (alert) =>
          (alert.vehicleName?.toLowerCase() || "").includes(term) ||
          (alert.driverName?.toLowerCase() || "").includes(term) ||
          (alert.location?.address.toLowerCase() || "").includes(term) ||
          (alert.description?.toLowerCase() || "").includes(term)
      );
    }

    // Filtro por severidad
    if (filterSeverity) {
      result = result.filter((alert) => alert.severity === filterSeverity);
    }

    // Filtro por tipo
    if (filterType) {
      result = result.filter((alert) => alert.type === filterType);
    }

    // Filtro por estado resuelto
    if (filterResolved) {
      result = result.filter((alert) =>
        filterResolved === "resolved" ? alert.resolved : !alert.resolved
      );
    }

    // Filtro por vista actual
    if (currentView === "unresolved") {
      result = result.filter((alert) => !alert.resolved);
    } else if (currentView === "critical") {
      result = result.filter((alert) => alert.severity === "critical");
    } else if (currentView === "today") {
      const today = new Date().toISOString().split("T")[0];
      result = result.filter(
        (alert) => (alert.timestamp || "").split("T")[0] === today
      );
    }

    // Ordenar por timestamp (más reciente primero)
    result.sort(
      (a, b) =>
        new Date(b.timestamp || "").getTime() -
        new Date(a.timestamp || "").getTime()
    );

    setFilteredAlerts(result);
  };

  const clearFilters = () => {
    setFilterSeverity("");
    setFilterType("");
    setFilterResolved("");
    setSearchTerm("");
  };

  const handleAlertClick = (alert: GeotabAlert) => {
    setSelectedAlert(alert);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha desconocida";
    }
  };

  const getAlertTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      speeding: "Exceso de velocidad",
      hardBraking: "Frenado brusco",
      harshAcceleration: "Aceleración brusca",
      idling: "Ralentí excesivo",
      maintenance: "Mantenimiento",
      fuelLevel: "Nivel de combustible",
      geofence: "Geo-cerca",
      engineFault: "Fallo del motor",
    };
    return types[type] || "Alerta general";
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return colors[severity] || "bg-slate-100 text-slate-800";
  };

  const getSeverityLabel = (severity: string) => {
    const labels: Record<string, string> = {
      low: "Baja",
      medium: "Media",
      high: "Alta",
      critical: "Crítica",
    };
    return labels[severity] || "Desconocida";
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case "speeding":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "hardBraking":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "harshAcceleration":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "idling":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "maintenance":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "fuelLevel":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "geofence":
        return <MapPin className="h-5 w-5 text-purple-500" />;
      case "engineFault":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  // Método para exportar los datos filtrados
  const handleExportData = () => {
    // Convertir datos a formato CSV
    const headers =
      "ID,Tipo,Severidad,Fecha,Vehículo,Conductor,Ubicación,Estado\n";

    const csvContent = filteredAlerts.reduce((acc, alert) => {
      const type = getAlertTypeLabel(alert.type || "");
      const severity = getSeverityLabel(alert.severity || "");
      const timestamp = formatTimestamp(alert.timestamp || "");
      const vehicle = alert.vehicleName || "";
      const driver = alert.driverName || "";
      const location = alert.location?.address || "";
      const status = alert.resolved ? "Resuelta" : "Sin resolver";

      return (
        acc +
        `"${alert.id}","${type}","${severity}","${timestamp}","${vehicle}","${driver}","${location}","${status}"\n`
      );
    }, headers);

    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `alertas-geotab-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para marcar una alerta como resuelta (implementar con API real)
  const markAsResolved = async (alertId: string) => {
    // Aquí iría la llamada a la API para marcar como resuelta
    // Por ahora, actualizamos solo el estado local
    try {
      // Aquí se podría implementar la llamada a la API real
      // await axios.post(`/api/geotab/resolve-alert/${alertId}`);

      // Actualizar estado local
      const updatedAlerts = alerts.map((alert) =>
        alert.id === alertId
          ? { ...alert, resolved: true, resolvedAt: new Date().toISOString() }
          : alert
      );

      setAlerts(updatedAlerts);
      setSelectedAlert(null);
    } catch (error) {
      console.error("Error al marcar como resuelta:", error);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-black">
      <Card className="border-none shadow-none">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
                Historial de Alertas
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Sistema de monitorización de alertas para la flota de vehículos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Acciones
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {isFiltersVisible ? "Ocultar filtros" : "Mostrar filtros"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportData}>
                      <span className="h-4 w-4 mr-2">📊</span>
                      Exportar datos
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                onClick={refreshAlerts}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue="all"
            className="mb-6"
            onValueChange={setCurrentView}
          >
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">Todas las alertas</TabsTrigger>
              <TabsTrigger value="unresolved">Sin resolver</TabsTrigger>
              <TabsTrigger value="critical">Críticas</TabsTrigger>
              <TabsTrigger value="today">Hoy</TabsTrigger>
            </TabsList>

            {isFiltersVisible && (
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-md mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Buscar
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-600 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Vehículo, conductor, ubicación..."
                        value={searchTerm}
                        className="pl-10 border-slate-300 dark:border-slate-700"
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Severidad
                    </label>
                    <Select
                      value={filterSeverity}
                      onValueChange={setFilterSeverity}
                    >
                      <SelectTrigger className="border-slate-300 dark:border-slate-700">
                        <SelectValue placeholder="Todas las severidades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas las severidades</SelectItem>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Tipo de alerta
                    </label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="border-slate-300 dark:border-slate-700">
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los tipos</SelectItem>
                        <SelectItem value="speeding">
                          Exceso de velocidad
                        </SelectItem>
                        <SelectItem value="hardBraking">
                          Frenado brusco
                        </SelectItem>
                        <SelectItem value="harshAcceleration">
                          Aceleración brusca
                        </SelectItem>
                        <SelectItem value="idling">Ralentí excesivo</SelectItem>
                        <SelectItem value="maintenance">
                          Mantenimiento
                        </SelectItem>
                        <SelectItem value="fuelLevel">
                          Nivel de combustible
                        </SelectItem>
                        <SelectItem value="geofence">Geo-cerca</SelectItem>
                        <SelectItem value="engineFault">
                          Fallo del motor
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Estado
                    </label>
                    <Select
                      value={filterResolved}
                      onValueChange={setFilterResolved}
                    >
                      <SelectTrigger className="border-slate-300 dark:border-slate-700">
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los estados</SelectItem>
                        <SelectItem value="unresolved">Sin resolver</SelectItem>
                        <SelectItem value="resolved">Resueltas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-slate-700 dark:text-slate-300"
                    onClick={clearFilters}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            )}

            <TabsContent value="all" className="m-0">
              {renderAlertsList()}
            </TabsContent>
            <TabsContent value="unresolved" className="m-0">
              {renderAlertsList()}
            </TabsContent>
            <TabsContent value="critical" className="m-0">
              {renderAlertsList()}
            </TabsContent>
            <TabsContent value="today" className="m-0">
              {renderAlertsList()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Diálogo para vista detallada de la alerta */}
      <Dialog
        open={!!selectedAlert}
        onOpenChange={(open) => !open && setSelectedAlert(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {selectedAlert && (
            <>
              {/* {console.log(selectedAlert)} */}
              <DialogHeader>
                <div className="flex items-center">
                  {getAlertTypeIcon(selectedAlert.type || "")}
                  <DialogTitle className="ml-2 text-xl font-semibold text-slate-800 dark:text-slate-200">
                    {getAlertTypeLabel(selectedAlert.type || "")}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-slate-500">
                  {selectedAlert.description || "Sin descripción disponible"}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-md mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-slate-200 dark:bg-slate-800 p-2 rounded-full">
                        <Truck className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {selectedAlert.vehicleName || "Vehículo desconocido"}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {selectedAlert.location?.address ||
                            "Ubicación desconocida"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={getSeverityColor(selectedAlert.severity || "")}
                    >
                      {getSeverityLabel(selectedAlert.severity || "")}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Conductor</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {selectedAlert.driverName || "No disponible"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Hora</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {formatTimestamp(selectedAlert.timestamp || "")}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedAlert.location &&
                        selectedAlert.location.latitude &&
                        selectedAlert.location.longitude && (
                          <div>
                            <p className="text-xs text-slate-500">
                              Ubicación exacta
                            </p>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {selectedAlert.location.latitude.toFixed(6)},{" "}
                              {selectedAlert.location.longitude.toFixed(6)}
                            </p>
                            <Button
                              variant="ghost"
                              className="p-0 text-blue-600 hover:underline text-sm"
                              onClick={() => setMapAlert(selectedAlert)}
                            >
                              Ver en el mapa
                            </Button>
                          </div>
                        )}

                      {selectedAlert.speed !== undefined && (
                        <div>
                          <p className="text-xs text-slate-500">
                            Velocidad registrada
                          </p>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {selectedAlert.speed} km/h
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedAlert.type !== undefined && (
                        <div>
                          <p className="text-xs text-slate-500">Tipo</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 flex flex-row justify-items-start items-center mt-1 gap-2">
                            {getAlertTypeIcon(selectedAlert.type)}
                            {getAlertTypeLabel(selectedAlert.type)}
                          </p>
                        </div>
                      )}
                      {selectedAlert.diagnosticId && (
                        <div>
                          <p className="text-xs text-slate-500">Diagnóstico</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            {getDiagnosticIcon(selectedAlert.diagnosticId)}
                            {getDiagnosticLabel(selectedAlert.diagnosticId)}
                            {selectedAlert.diagnosticValue !== undefined &&
                              `: ${selectedAlert.diagnosticValue}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedAlert.resolved && (
                    <>
                      <div>
                        <p className="text-xs text-slate-500">Resuelta por</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {selectedAlert.resolvedBy || "Sistema"}
                        </p>
                      </div>
                      {selectedAlert.resolvedAt && (
                        <div>
                          <p className="text-xs text-slate-500">
                            Fecha de resolución
                          </p>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {formatTimestamp(selectedAlert.resolvedAt)}
                          </p>
                        </div>
                      )}
                      {selectedAlert.notes && (
                        <div>
                          <p className="text-xs text-slate-500">Notas</p>
                          <p className="text-sm text-slate-900 dark:text-slate-100">
                            {selectedAlert.notes}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={() => setSelectedAlert(null)}
                >
                  Cerrar
                </Button>
                {!selectedAlert.resolved && (
                  <Button
                    className="bg-slate-800 dark:bg-slate-200 hover:bg-slate-700 dark:hover:bg-slate-300 text-white dark:text-black"
                    onClick={() =>
                      selectedAlert.id && markAsResolved(selectedAlert.id)
                    }
                  >
                    Marcar como resuelta
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo que contiene el mapa del vehículo seleccionado */}
      <Dialog
        open={!!mapAlert}
        onOpenChange={(open) => !open && setMapAlert(null)}
      >
        <DialogContent className="w-full max-w-4xl animate-fadeIn">
          <DialogHeader>
            <DialogTitle>Ubicación en el mapa</DialogTitle>
            <DialogDescription>
              Coordenadas: {mapAlert?.location?.latitude.toFixed(6)},{" "}
              {mapAlert?.location?.longitude.toFixed(6)}
            </DialogDescription>
          </DialogHeader>

          <div
            id="map-container"
            className="w-full h-96 rounded-md overflow-hidden"
          >
            <div id="leaflet-map" className="w-full h-full z-0" />
          </div>

          <DialogFooter>
            <a
              href={`https://www.openstreetmap.org/?mlat=${mapAlert?.location?.latitude}&mlon=${mapAlert?.location?.longitude}#map=16/${mapAlert?.location?.latitude}/${mapAlert?.location?.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-blue-600 dark:bg-blue-400 text-white hover:bg-blue-700 dark:hover:bg-blue-300">
                Abrir en OpenStreetMap
              </Button>
            </a>
            <Button variant="outline" onClick={() => setMapAlert(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function renderAlertsList() {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-700 dark:text-slate-300" />
          <span className="ml-2 text-slate-600 dark:text-slate-400">
            Cargando alertas...
          </span>
        </div>
      );
    }

    if (filteredAlerts.length === 0) {
      return (
        <div className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 mb-4">
            <Bell className="h-6 w-6 text-slate-400 dark:text-slate-600" />
          </div>
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
            No se encontraron alertas
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {searchTerm || filterSeverity || filterType || filterResolved
              ? "No hay resultados para los filtros aplicados."
              : "No hay alertas disponibles en este momento."}
          </p>
          {(searchTerm || filterSeverity || filterType || filterResolved) && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-slate-700 hover:text-slate-900 underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-md">
        <div className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <div className="bg-slate-50 dark:bg-slate-950">
            <div className="grid grid-cols-12 px-6 py-3">
              <div className="col-span-5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Detalles de la alerta
              </div>
              <div className="col-span-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Vehículo / Conductor
              </div>
              <div className="col-span-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Ubicación
              </div>
              <div className="col-span-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Estado
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-black divide-y divide-slate-200 dark:divide-slate-800">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`grid grid-cols-12 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer ${
                  !alert.resolved
                    ? "border-l-4 border-red-700 dark:border-red-300"
                    : ""
                }`}
                onClick={() => handleAlertClick(alert)}
              >
                <div className="col-span-5 flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                    {getAlertTypeIcon(alert.type || "")}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {getAlertTypeLabel(alert.type || "")}
                      </span>
                      <Badge
                        className={`ml-2 ${getSeverityColor(
                          alert.severity || ""
                        )}`}
                      >
                        {getSeverityLabel(alert.severity || "")}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {formatTimestamp(alert.timestamp || "")}
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">
                      {alert.description || "Sin descripción"}
                    </div>
                  </div>
                </div>
                <div className="col-span-3 flex items-center">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {alert.vehicleName || "Vehículo desconocido"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {alert.driverName || "Conductor no disponible"}
                    </div>
                  </div>
                </div>
                <div className="col-span-2 flex items-center">
                  <div className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 text-ellipsis">
                    {alert.location?.address || "Ubicación desconocida"}
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-end">
                  <Badge
                    className={`
                    ${
                      alert.resolved
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                    }
                  `}
                  >
                    {alert.resolved ? "Resuelta" : "Sin resolver"}
                  </Badge>
                  <Button
                    variant="ghost"
                    className="ml-2 h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAlertClick(alert);
                    }}
                  >
                    <Eye className="h-4 w-4 text-slate-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
};
