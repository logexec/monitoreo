import { parse, format } from 'date-fns';

export function parseLatinAmericanDate(dateStr: string): string {
  try {
    // Parse DD/MM/YYYY format and convert to ISO string
    const date = parse(dateStr, 'dd/MM/yyyy', new Date());
    return date.toISOString();
  } catch (error) {
    throw new Error(`Invalid date format. Expected DD/MM/YYYY, got: ${dateStr}`);
  }
}