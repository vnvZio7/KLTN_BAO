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
    UPDATE_USER: "/api/users",
    // GET_USER_BY_ID: (userId) => `/api/users/${userId}`,
    GET_USERS_BY_DOCTORID: "/api/users/doctor",
  },
  ADMIN: {
    GET_DASHBOARD_DATA: "/api/admin/dashboard",
    GET_ALL_SHOWS: "/api/admin/all-shows",
    GET_ALL_BOOKINGS: "/api/admin/all-bookings",
  },
  TESTS: {
    GET_ALL_TEST: "/api/tests",
    GET_TEST_BY_CODE: (code) => `/api/tests/${encodeURIComponent(code)}`,
  },
  DOCTORS: {
    GET_ALL_DOCTORS: "/api/doctors",
    GET_DOCTORS_BY_IDS: "/api/doctors/doctorIds",
    GET_UPCOMING: "/api/movies/upcoming",
    GET_DATA_SEARCH: "/api/movies/search",
    GET_D: (ids) => `/api/doctors/${ids}`,
  },
  GROQ: {
    GROQ_MATCH_DOCTOR: "/api/groq",
  },
  TRANSACTIONS: {
    GET_ALL_TRANSACTIONS: "/api/transactions",
    UPDATE_TRANSACTION: (id) => `/api/transactions/${id}`,
    GET_TRANSACTION_BY_CODE: (code) => `/api/transactions/${code}`,
  },
  ROOMS: {
    CREATE_ROOM: "/api/rooms",
    GET_ROOM: `/api/rooms`,
  },
  TEST_RESULTS: {
    CREATE_TEST_RESULTS: "/api/testresult",
    // GET_PROVINCE_BY_ID: (provinceId) => `/api/provinces/${provinceId}`,
  },
  APPOINTMENTS: {
    // GET_ALL_SHOWTIMES: "/api/showtimes/",
    // CREATE_SHOWTIMES: "/api/showtimes/",
    // GET_GENRES: "/api/showtimes/genres",
    // GET_SHOWTIMES_BY_ID_AND_DATE: (showtime_id, date) =>
    //   `/api/showtimes/${showtime_id}/${date}`,
    GET_APPOINTMENTS_BY_ROOMID: (roomId) => `/api/appointments/${roomId}`,
  },
  EXERCISES: {
    GET_ALL_EXERCISES: "/api/exercises",
  },
  HOMEWORK_ASSIGNMENTS: {
    GET_HOMEWORK_ASSIGNMENT_BY_ID: (userId) =>
      `/api/homework-assignments/${userId}`,
    CREATE_HOMEWORK_ASSIGNMENT: "/api/homework-assignments",
  },
  MESSAGES: {
    GET_MESSAGES_BY_ROOM_ID: (roomId) => `/api/messages/${roomId}`,
    SEND_MESSAGE: "/api/messages",
  },
  PAYMENT: {
    GET_SEPAY: "/api/payment/sepay",
  },
};
