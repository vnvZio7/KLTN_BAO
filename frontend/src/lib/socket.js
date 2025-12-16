import { io } from "socket.io-client";

// Tạo 1 kết nối socket duy nhất cho toàn app
const socket = io(import.meta.env.VITE_BASE_URL);

export default socket;
