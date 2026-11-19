export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
}

export interface Booking {
  id: string;
  roomId: string;
  start: number; // minutes from 00:00
  end: number;   // minutes from 00:00
  bookedBy: string;
}

export interface CheckRequest {
  roomId: string;
  start: number;
  end: number;
  currentTime: number; // minutes from 00:00
}

export type Decision = 'available' | 'unavailable';

export interface CheckResult {
  decision: Decision;
  reasons: string[];
}
