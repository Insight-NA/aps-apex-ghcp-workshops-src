export type StopType = 'start' | 'end' | 'stop';

export interface Stop {
  id: string;
  name: string;
  coordinates: [number, number];
  type: StopType;
  address?: string;
}
