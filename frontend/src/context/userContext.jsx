// context/UserContext.jsx
import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [messages, setMessages] = useState([]);

  const [room, setRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem("accessToken"));

  // ---------- Helpers ----------
  const clearUser = useCallback(() => {
    setUser(null);
    setDoctors([]);
    setCurrentDoctor(null);
    setPatients([]);
    setAssignments([]);
    setRoom(null);
    setRooms([]);
    setMessages([]);
    localStorage.removeItem("accessToken");
  }, []);
  const connectSocket = useCallback(() => {
    // Nếu chưa đăng nhập thì không tạo socket
    if (!user) return;

    // Nếu socket đã tồn tại và đã kết nối → không tạo lại
    if (socket && socket.connected) return;

    const s = io(
      import.meta.env.VITE_BASE_URL,
      {
        query: {
          userId: user._id,
        },
      },
      {
        autoConnect: false,
      }
    );

    setSocket(s);

    s.on("getOnlineUsers", (userIds) => {
      console.log(userIds);
      setOnlineUsers({ onlineUsers: userIds });
    });
  }, [user, socket]);
  const disConnectSocket = useCallback(() => {
    if (socket) {
      console.log(socket);
      socket.disconnect();
    }
    console.log("socket disconnec");
    setSocket(null);
  }, [socket]);
  const getToken = useCallback(() => {
    return localStorage.getItem("accessToken");
  }, []);
  useEffect(() => {
    if (user && !socket) {
      connectSocket();
    }
  }, [user, socket]);
  const handleLogout = useCallback(() => {
    setIsLoggingOut(true);
    localStorage.clear();
    clearUser();
    disConnectSocket();
    navigate("/login");
    scrollTo(0, 0);
  }, [clearUser, navigate, disConnectSocket]);

  // ---------- API calls ----------
  const fetchExercises = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(
        API_PATHS.EXERCISES.GET_ALL_EXERCISES
      );
      setExercises(data.exerciseTemplates || []);
      // console.log("exerciseTemplates >>>", data.exerciseTemplates);
    } catch (error) {
      console.error("fetchExercises error:", error?.message || error);
    }
  }, []);

  const fetchAssignment = useCallback(async (userId) => {
    try {
      const { data } = await axiosInstance.get(
        API_PATHS.HOMEWORK_ASSIGNMENTS.GET_HOMEWORK_ASSIGNMENT_BY_ID(userId)
      );
      return data.homeworkAssignment || [];
    } catch (error) {
      console.error("fetchAssignment error:", error?.message || error);
      return [];
    }
  }, []);

  const fetchRoom = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(API_PATHS.ROOMS.GET_ROOM);
      return data.room || null;
    } catch (error) {
      console.error("fetchRoom error:", error?.message || error);
    }
  }, []);
  const fetchRooms = useCallback(async () => {
    const allRooms = await fetchRoom();
    setRooms(allRooms);
  });
  const fetchMessages = useCallback(async (roomId) => {
    try {
      const { data } = await axiosInstance.get(
        API_PATHS.MESSAGES.GET_MESSAGES_BY_ROOM_ID(roomId)
      );
      setMessages(data.messages);
    } catch (error) {
      console.error("fetch Message error:", error?.message || error);
    }
  }, []);

  const sendMessage = useCallback(async ({ roomId, content }) => {
    try {
      const { data } = await axiosInstance.post(
        API_PATHS.MESSAGES.SEND_MESSAGE,
        {
          roomId,
          content,
        }
      );
      console.log(data.message);
      if (data.success) {
        await fetchMessages(roomId);
        await fetchRooms();
      }
    } catch (error) {
      console.error("send Message error:", error?.message || error);
    }
  }, []);

  const subcribeToMessages = useCallback(
    (roomId) => {
      if (!roomId) return;
      if (!socket) return;
      console.log("socket on");
      socket.on("newMessage", (msg) => {
        if (msg.roomId.toString() !== roomId.toString()) return;
        setMessages((prev) => [...prev, msg]);
      });
    },
    [socket]
  );

  const unSubcribeToMessages = useCallback(() => {
    if (!socket) return;
    socket.off("newMessage");
  }, [socket]);

  const fetchUser = useCallback(async () => {
    console.log(token);
    if (!token) {
      clearUser();
      setLoading(false);
      return;
    }

    // Đọc account trong localStorage an toàn
    let localAccount = null;
    try {
      const raw = localStorage.getItem("account");
      localAccount = raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("Cannot parse localStorage.account:", e);
    }

    // Nếu là admin: không cần gọi GET_PROFILE (tuỳ app),
    // nhưng vẫn phải tắt loading để UI hiển thị được.
    // if (localAccount?.role === "admin") {
    //   setUser(null);
    //   setDoctors([]);
    //   setCurrentDoctor(null);
    //   setPatients([]);
    //   setAssignments([]);
    //   setLoading(false);
    //   return;
    // }

    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
      const dataUser = response.data.user;
      setUser(dataUser);
      // console.log("profile >>>", dataUser);
      const accountRole = dataUser?.accountId?.role || dataUser?.role;

      // ----- USER -----
      if (accountRole === "user") {
        setDoctors(dataUser.doctorIds || []);
        setCurrentDoctor(dataUser.currentDoctorId || null);
        const r = await fetchRoom();
        console.log(r[0]);
        setRoom(r[0]);
        const hw = await fetchAssignment(dataUser._id);
        setAssignments(hw);
        await fetchMessages(r[0]._id);
      }

      // ----- DOCTOR -----
      if (accountRole === "doctor") {
        const { data } = await axiosInstance.get(
          API_PATHS.USERS.GET_USERS_BY_DOCTORID
        );
        const resPatients = data?.users || [];
        setPatients(resPatients);

        if (resPatients.length > 0) {
          const allAssignments = await Promise.all(
            resPatients.map((u) => fetchAssignment(u._id))
          );
          setAssignments(allAssignments.flat());
          await fetchRooms();
        } else {
          setAssignments([]);
        }
      }
      console.log(accountRole);
      if (accountRole === "admin") {
        const res = await axiosInstance.get(API_PATHS.ADMIN.GET_ALL_ACCOUNTS);
        const resAccounts = res.data?.accounts || [];
        setAccounts(resAccounts);
        console.log("data resAccounts: ", resAccounts);

        const responseTransaction = await axiosInstance.get(
          API_PATHS.ADMIN.GET_ALL_TRANSACTIONS
        );
        const resTransactions = responseTransaction.data?.transactions || [];
        setTransactions(resTransactions);
        console.log("data resTransactions: ", resTransactions);

        const { data } = await axiosInstance.get(
          API_PATHS.DOCTORS.GET_ALL_DOCTORS
        );
        const resDoctors = data?.doctors || [];
        setDoctors(resDoctors);
        console.log("data Doctor: ", resDoctors);
      }
    } catch (error) {
      console.error("User not authenticated:", error);
      clearUser();
    } finally {
      console.log(">>> CALL setLoading(false)");
      setLoading(false);
    }
  }, [token, clearUser, fetchAssignment]);

  // ---------- Effect khởi tạo ----------
  useEffect(() => {
    if (!token) {
      clearUser();
      setLoading(false);
      return;
    }
    fetchExercises();
    fetchUser();
  }, [token, fetchExercises, fetchUser, clearUser]);

  // ---------- Memo hoá value context ----------
  const value = useMemo(
    () => ({
      user,
      fetchUser,
      doctors,
      currentDoctor,
      loading,
      clearUser,
      handleLogout,
      getToken,
      isLoggingOut,
      patients,
      rooms,
      room,
      exercises,
      assignments,
      sendMessage,
      messages,
      fetchMessages,
      setLoading,
      accounts,
      transactions,
      onlineUsers,
      unSubcribeToMessages,
      subcribeToMessages,
    }),
    [
      user,
      messages,
      fetchUser,
      doctors,
      currentDoctor,
      loading,
      clearUser,
      handleLogout,
      getToken,
      isLoggingOut,
      patients,
      rooms,
      room,
      exercises,
      assignments,
      sendMessage,
      fetchMessages,
      setLoading,
      accounts,
      transactions,
      onlineUsers,
      unSubcribeToMessages,
      subcribeToMessages,
    ]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);
