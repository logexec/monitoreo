export type TripStatus =
  | "SCHEDULED"
  | "IN_TRANSIT"
  | "DELAYED"
  | "DELIVERED"
  | "CANCELLED";

export type UpdateCategory =
  | "INICIO_RUTA"
  | "SEGUIMIENTO"
  | "ACCIDENTE"
  | "AVERIA"
  | "ROBO_ASALTO"
  | "PERDIDA_CONTACTO"
  | "VIAJE_CARGADO"
  | "VIAJE_FINALIZADO";

export interface Trip {
  id: string;
  trip_id: string;
  system_trip_id: string;
  external_trip_id: string | null;
  delivery_date: string;
  driver_name: string;
  driver_document: string | null;
  driver_phone: string | null;
  origin: string | null;
  destination: string;
  project: string;
  plate_number: string;
  property_type: string;
  shift: string;
  gps_provider: string | null;
  current_status: TripStatus;
  current_status_update: UpdateCategory;
  created_at: string;
  updated_at: string;
  updates: TripUpdate[];
}

export interface TripUpdate {
  id: string;
  trip_id: string;
  category: UpdateCategory;
  notes: string;
  image_url?: string | null;
  created_at: string;
  updated_by: string;
}

export interface TripPersonnel {
  id: string;
  trip_id: string;
  personnel_id: string;
  role: string;
  assignment_date: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripCosts {
  id: string;
  trip_id: string;
  fuel_cost: number | null;
  toll_cost: number | null;
  personnel_cost: number | null;
  other_costs: number | null;
  total_cost: number;
  revenue: number | null;
  margin: number;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripMetadata {
  id: string;
  trip_id: string;
  estimated_duration: string | null;
  actual_duration: string | null;
  distance_km: number | null;
  cargo_type: string | null;
  cargo_weight: number | null;
  special_requirements: string | null;
  customer_reference: string | null;
  internal_notes: string | null;
  external_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

// interface Column {
//   Header: string;
//   accessor: keyof User;
// }
