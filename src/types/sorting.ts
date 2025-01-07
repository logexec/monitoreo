export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string | null;
  direction: SortDirection;
}