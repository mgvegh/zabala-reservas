export type Space = 'Parrilla' | 'SUM';
export type Turn = 'Mediodía' | 'Tarde' | 'Noche';
export type Department = 
  | '1A' | '1B' 
  | '2A' | '2B' 
  | '3A' | '3B' 
  | '4A' | '4B' 
  | '5A' | '5B' 
  | '6A' | '6B' 
  | '7A' | '7B' 
  | '8A' | '8B' 
  | '9';

export interface Reservation {
  id: string;
  space: Space;
  turn: Turn;
  dateStr: string; // YYYY-MM-DD
  department: Department;
  createdAt: number;
}

export interface Notice {
  id: string;
  message: string;
  createdAt: number;
  isAdmin?: boolean;
}

export interface SpaceBlock {
  id: string;
  space: Space | 'Ambos';
  dateFrom: string; // YYYY-MM-DD
  dateTo: string;   // YYYY-MM-DD (same as dateFrom for single-day blocks)
  reason: string;
  createdAt: number;
}
