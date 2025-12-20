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
    UPDATE_USER_RETEST: "/api/users/retest",
    GET_USERS_BY_DOCTORID: "/api/users/doctor",
    GET_USERS_SWITCH_DOCTOR: "/api/users/switch-doctor",
    UPDATE_SWITCH_DOCTOR: `/api/users/update`,
    UPDATE_FREE_CALL: `/api/users/free-call`,
    ADD_NOTE: `/api/users/add-note`,
    UPDATE_RETEST: (id) => `/api/users/retest/${id}`,
  },
  ADMIN: {
    GET_DASHBOARD_DATA: "/api/admin/dashboard",
    GET_ALL_ACCOUNTS: "/api/admin/accounts",
    GET_ALL_TRANSACTIONS: "/api/admin/transactions",
    UPDATE_SWITCH_DOCTOR: "/api/admin/switch-doctor",
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
    CREATE_APPOINTMENT: "/api/appointments/",
    // GET_GENRES: "/api/showtimes/genres",
    // GET_SHOWTIMES_BY_ID_AND_DATE: (showtime_id, date) =>
    //   `/api/showtimes/${showtime_id}/${date}`,
    GET_APPOINTMENTS_BY_ROOMID: (roomId) => `/api/appointments/${roomId}`,
    UPDATE_APPOINTMENTS_BY_ID: (id) => `/api/appointments/${id}`,
  },

  SESSIONS: {
    // GET_ALL_SHOWTIMES: "/api/showtimes/",
    CREATE_SESSION: "/api/sessions/",
    // GET_GENRES: "/api/showtimes/genres",
    // GET_SHOWTIMES_BY_ID_AND_DATE: (showtime_id, date) =>
    //   `/api/showtimes/${showtime_id}/${date}`,
    GET_SESSIONS_BY_APPOINTMENT_ID: (appointmentId) =>
      `/api/sessions/${appointmentId}`,
    UPDATE_SESSION_BY_APPOINTMENT_ID: (appointmentId) =>
      `/api/sessions/${appointmentId}`,
  },

  EXERCISES: {
    GET_ALL_EXERCISES: "/api/exercises",
  },
  HOMEWORK_ASSIGNMENTS: {
    GET_HOMEWORK_ASSIGNMENT_BY_ID: (userId) =>
      `/api/homework-assignments/${userId}`,
    CREATE_HOMEWORK_ASSIGNMENT: "/api/homework-assignments",
    CREATE_HOMEWORK_ASSIGNMENT_BY_AI: "/api/homework-assignments/ai",
  },
  HOMEWORK_SUBMISSIONS: {
    GET_HOMEWORK_SUBMISSION_BY_ID: (id) => `/api/homework-submissions/${id}`,
    UPDATE_FEEDBACK_BY_ID: (id) => `/api/homework-submissions/${id}`,
    CREATE_HOMEWORK_SUBMISSION: "/api/homework-submissions",
  },
  MESSAGES: {
    GET_MESSAGES_BY_ROOM_ID: (roomId) => `/api/messages/${roomId}`,
    SEND_MESSAGE: "/api/messages",
    UPDATE_READ_MESSAGES_BY_ROOM_ID: (roomId) => `/api/messages/${roomId}`,
  },
  NOTIFY: {
    // GET_ALL_BOOKINGS: "/api/bookings-users",
    GET_ALL_NOTIFY: "/api/notify",
    GET_ALL_NOTIFY_ADMIN: "/api/notify/admin",
    UPDATE_MARK_ALL_READ: "/api/notify/mark-all-read",
    UPDATE_MARK_READ_ONE: (id) => `/api/notify/mark-read/${id}`,
  },
  PAYMENT: {
    GET_SEPAY: "/api/payment/sepay",
  },
};
