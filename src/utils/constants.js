export const API_ENDPOINTS = {
  AUTH_SERVICE: import.meta.env.VITE_USER_AUTH_SERVICE ,
  VACCINE_SERVICE: import.meta.env.VITE_VACCINE_SEARCH_SERVICE ,
  BOOKING_SERVICE: import.meta.env.VITE_VACCINE_BOOKING_SERVICE,
};

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export const DEFAULT_STATS = {
  totalUsers: 10,   
  totalBookings: 25,
  pendingBookings: 5,   
  totalVaccines: 12
};

export const STATUS_COLORS = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  InProcess: 'bg-blue-100 text-blue-800',
  inprocess: 'bg-blue-100 text-blue-800',
  Booked: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  default: 'bg-gray-100 text-gray-800'
};