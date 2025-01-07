import { parseLatinAmericanDate } from './dateUtils';

interface CSVRow {
  'FECHA DE ENTREGA': string;
  'ID_Viaje': string;
  'NOMBRE CONDUCTOR': string;
  'CELULAR': string;
  'ORIGEN': string;
  'DESTINO': string;
  'PROYECTO': string;
  'PLACA': string;
  'PROPIEDAD': string;
  'JORNADA': string;
  'GPS_Prov': string;
}

// Clean phone number by removing spaces, dashes, and other separators
function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[\s\-()]/g, '');
}

// Validate required fields
function validateRequiredFields(row: CSVRow) {
  const required = {
    'ID_Viaje': 'Trip ID',
    'FECHA DE ENTREGA': 'Delivery Date',
    'NOMBRE CONDUCTOR': 'Driver Name',
    'DESTINO': 'Destination',
    'PROYECTO': 'Project',
    'PLACA': 'Plate Number',
    'PROPIEDAD': 'Property Type',
    'JORNADA': 'Shift'
  } as const;

  for (const [field, label] of Object.entries(required)) {
    const value = row[field as keyof typeof required];
    if (!value || !value.trim()) {
      throw new Error(`Missing required field: ${label}`);
    }
  }
}

export function parseTripFromCSV(row: CSVRow) {
  try {
    // Clean up field names by trimming
    const cleanRow = Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key.trim(), value])
    ) as CSVRow;

    validateRequiredFields(cleanRow);

    return {
      external_trip_id: cleanRow['ID_Viaje'].trim(),
      delivery_date: parseLatinAmericanDate(cleanRow['FECHA DE ENTREGA'].trim()),
      driver_name: cleanRow['NOMBRE CONDUCTOR'].trim(),
      driver_phone: cleanRow['CELULAR'] ? cleanPhoneNumber(cleanRow['CELULAR']) : null,
      origin: cleanRow['ORIGEN']?.trim() || null,
      destination: cleanRow['DESTINO'].trim(),
      project: cleanRow['PROYECTO'].trim(),
      plate_number: cleanRow['PLACA'].trim(),
      property_type: cleanRow['PROPIEDAD'].trim(),
      shift: cleanRow['JORNADA'].trim(),
      gps_provider: cleanRow['GPS_Prov']?.trim() || null,
      current_status: 'SCHEDULED' as const
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Row with External Trip ID "${row['ID_Viaje']?.trim() || 'unknown'}": ${error.message}`);
    }
    throw error;
  }
}