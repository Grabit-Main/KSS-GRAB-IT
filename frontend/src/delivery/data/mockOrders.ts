import { Order } from '../types/delivery';

export const mockOrdersPool: Order[] = [];

export const initialStats = {
  completedToday: 0,
  failedToday: 0,
  returnedToday: 0,
  rating: 5.0,
  onTimePercentage: 100,
  totalDistanceKm: 0,
  activeShiftMinutes: 0
};

export const initialHistory = [];

