export interface MySQLTrip {
  id: number;
  trip_id: string;
  delivery_date: string;
  driver_name: string;
  driver_phone: string | null;
  origin: string | null;
  destination: string;
  project: string;
  plate_number: string;
  property_type: string;
  shift: string;
  gps_provider: string | null;
}

export interface TripLoadConfig {
  date: string;
  projects: string[];
}