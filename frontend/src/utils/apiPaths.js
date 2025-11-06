export const BASE_URL = import.meta.env.VITE_BASE_URL;

// utils/apiPath.js
export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
    GOOGLE: "/api/auth/google",
  },
  USERS: {
    GET_ALL_USERS: "/api/users",
    GET_USER_BY_ID: (userId) => `/api/users/${userId}`,
  },
  ADMIN: {
    GET_DASHBOARD_DATA: "/api/admin/dashboard",
    GET_ALL_SHOWS: "/api/admin/all-shows",
    GET_ALL_BOOKINGS: "/api/admin/all-bookings",
  },
  TESTS: {
    GET_ALL_TEST: "/api/tests",
    GET_TEST_BY_CODE: (code) => `/api/tests/${code}`,
  },
  MOVIES: {
    GET_ALL_MOVIES: "/api/movies/now-playing",
    GET_TRAILERS: "/api/movies/trailers",
    GET_UPCOMING: "/api/movies/upcoming",
    GET_DATA_SEARCH: "/api/movies/search",
    GET_MOVIE_BY_ID: (movieId) => `/api/movies/${movieId}`,
    GET_RELEASE_BY_ID: (movieId) => `/api/movies/release/${movieId}`,
  },
  ROOMS: {
    GET_ALL_ROOMS: "/api/rooms",
    GET_SEAT_MAP_BY_ID: (roomId) => `/api/rooms/${roomId}/seats`,
  },
  TYPES: {
    GET_ALL_TYPES: "/api/types",
    GET_TYPE_BY_ID: (typeId) => `/api/types/${typeId}`,
  },
  PROVINCES: {
    GET_ALL_PROVINCES: "/api/provinces",
    GET_PROVINCE_BY_ID: (provinceId) => `/api/provinces/${provinceId}`,
  },
  SNACKS: {
    GET_ALL_SNACKS: "/api/snacks",
    // GET_PROVINCE_BY_ID: (provinceId) => `/api/provinces/${provinceId}`,
  },
  SHOWTIMES: {
    GET_ALL_SHOWTIMES: "/api/showtimes/",
    CREATE_SHOWTIMES: "/api/showtimes/",
    GET_GENRES: "/api/showtimes/genres",
    GET_SHOWTIMES_BY_ID_AND_DATE: (showtime_id, date) =>
      `/api/showtimes/${showtime_id}/${date}`,
    GET_SHOWTIMES_BY_ID: (showtime_id) => `/api/showtimes/${showtime_id}`,
  },
  BOOKINGS: {
    GET_ALL_BOOKINGS: "/api/bookings-users",
    CREATE_BOOKING: "/api/bookings-users",
    GET_BOOKING_BY_ID: (id) => `/api/bookings-users/${id}`,
    GET_BOOKED_SEATS: (id) => `/api/bookings/seats/${id}`,
  },
  PAYMENT: {
    GET_SEPAY: "/api/payment/sepay",
  },
};
