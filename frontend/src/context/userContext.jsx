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
  const [homeworkSubmissions, setHomeworkSubmissions] = useState([]);

  const [room, setRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userSwitchs, setUserSwitchs] = useState([]);
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
    setAppointments([]);
    setSessions([]);
    setRoom(null);
    setRooms([]);
    setAllDoctors([]);
    setMessages([]);
    setUserSwitchs([]);
    setNotifications([]);
    setToken(null);
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

  const fetchNotify = useCallback(async (admin) => {
    try {
      let res;
      if (admin) {
        res = await axiosInstance.get(API_PATHS.NOTIFY.GET_ALL_NOTIFY_ADMIN);
      } else {
        res = await axiosInstance.get(API_PATHS.NOTIFY.GET_ALL_NOTIFY);
      }
      return res.data.notifications || [];
    } catch (error) {
      console.error("fetchNotify error:", error?.message || error);
      return [];
    }
  }, []);
  const fetchAppointment = useCallback(async (roomId) => {
    try {
      const { data } = await axiosInstance.get(
        API_PATHS.APPOINTMENTS.GET_APPOINTMENTS_BY_ROOMID(roomId)
      );
      return data.appointments || [];
    } catch (error) {
      console.error("fetchAssignment error:", error?.message || error);
      return [];
    }
  }, []);

  const fetchSession = useCallback(async (appointmentId) => {
    try {
      const { data } = await axiosInstance.get(
        API_PATHS.SESSIONS.GET_SESSIONS_BY_APPOINTMENT_ID(appointmentId)
      );
      return data.sessions || [];
    } catch (error) {
      console.error("fetchSession error:", error?.message || error);
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
    return allRooms;
  });

  const fetchAllDoctors = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(
        API_PATHS.DOCTORS.GET_ALL_DOCTORS
      );
      setAllDoctors(data.doctors);
    } catch (error) {
      console.error("fetchAllDoctors error:", error?.message || error);
    }
  }, []);
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
  const fetchHomeWorkSubmissions = useCallback(async (assignmentId) => {
    try {
      const { data } = await axiosInstance.get(
        API_PATHS.HOMEWORK_SUBMISSIONS.GET_HOMEWORK_SUBMISSION_BY_ID(
          assignmentId
        )
      );
      return data.homeworkSubmission || [];
    } catch (error) {
      console.error("fetch Message error:", error?.message || error);
      return [];
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
    // console.log(token);
    // if (!token) {
    //   clearUser();
    //   setLoading(false);
    //   return;
    // }

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
      if (accountRole === "user" && dataUser.testHistory.length > 0) {
        fetchAllDoctors();
        setDoctors(dataUser.doctorIds || []);
        setCurrentDoctor(dataUser.currentDoctorId || null);
        const r = await fetchRoom();
        console.log(r[0]);
        setRoom(r[0]);

        const ap = await fetchAppointment(r[0]._id);
        console.log(ap);
        setAppointments(ap);

        if (ap.length > 0) {
          const allSessions = await Promise.all(
            ap.map((u) => fetchSession(u._id))
          );
          setSessions(allSessions.flatMap((arr) => arr || []));
        } else {
          setSessions([]);
        }

        const no = await fetchNotify(false);
        console.log(no);
        setNotifications(no);

        const hw = await fetchAssignment(dataUser._id);
        setAssignments(hw);
        if (hw.length > 0) {
          const allSubmissions = await Promise.all(
            hw.map((u) => fetchHomeWorkSubmissions(u._id))
          );
          setHomeworkSubmissions(allSubmissions.flatMap((arr) => arr || []));
          console.log(allSubmissions.flatMap((arr) => arr || []));
        } else {
          setHomeworkSubmissions([]);
        }

        await fetchMessages(r[0]._id);
      }

      // ----- DOCTOR -----
      if (accountRole === "doctor" && dataUser.approval.status === "approved") {
        const { data } = await axiosInstance.get(
          API_PATHS.USERS.GET_USERS_BY_DOCTORID
        );
        const resPatients = data?.users || [];
        setPatients(resPatients);

        if (resPatients.length > 0) {
          // 1. Lấy tất cả bài tập của tất cả bệnh nhân
          const allAssignmentsByPatient = await Promise.all(
            resPatients.map((u) => fetchAssignment(u._id)) // mỗi u trả về mảng bài tập
          );

          // flat thành một mảng assignment duy nhất
          const flatAssignments = allAssignmentsByPatient
            .flat()
            .filter(Boolean);

          setAssignments(flatAssignments);

          // 2. Lấy tất cả bài nộp theo từng bài tập
          if (flatAssignments.length > 0) {
            const allSubmissions = await Promise.all(
              flatAssignments.map((a) => fetchHomeWorkSubmissions(a._id)) // 🔹 theo assignmentId
            );

            const mergedSubmissions = allSubmissions.flatMap(
              (arr) => arr || []
            );

            setHomeworkSubmissions(mergedSubmissions);
            console.log(mergedSubmissions);
          } else {
            setHomeworkSubmissions([]);
          }

          const no = await fetchNotify(false);
          console.log(no);
          setNotifications(no);

          const dataRooms = await fetchRooms();
          const allAppointments = await Promise.all(
            dataRooms.map((u) => fetchAppointment(u._id))
          );
          const allAppointmentsData = allAppointments.flat();
          setAppointments(allAppointmentsData);
          if (allAppointmentsData.length > 0) {
            const allSessions = await Promise.all(
              allAppointmentsData.map((u) => fetchSession(u._id))
            );
            setSessions(allSessions.flatMap((arr) => arr || []));
          } else {
            setSessions([]);
          }
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

        const responseUsersSwitch = await axiosInstance.get(
          API_PATHS.USERS.GET_USERS_SWITCH_DOCTOR
        );
        const resUsersSwitch = responseUsersSwitch.data?.users || [];
        setUserSwitchs(resUsersSwitch);

        const no = await fetchNotify(true);
        console.log(no);
        setNotifications(no);

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
    console.log(token);
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
      userSwitchs,
      setToken,
      setUser,
      setMessages,
      homeworkSubmissions,
      appointments,
      setUserSwitchs,
      setHomeworkSubmissions,
      setAssignments,
      notifications,
      setNotifications,
      sessions,
      setSessions,
      setPatients,
      allDoctors,
      setRooms,
    }),
    [
      user,
      setToken,
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
      userSwitchs,
      setUser,
      setMessages,
      homeworkSubmissions,
      appointments,
      setUserSwitchs,
      setHomeworkSubmissions,
      setAssignments,
      notifications,
      setNotifications,
      sessions,
      setSessions,
      setPatients,
      allDoctors,
      setRooms,
    ]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);
