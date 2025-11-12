// // import React, { useState, useEffect, useRef } from "react";
// // import { io } from "socket.io-client";

// // const socket = io("http://localhost:8080");

// // function Login({ onLogin }) {
// //   const [userIdInput, setUserIdInput] = useState("");

// //   const handleLogin = async () => {
// //     if (!userIdInput) return alert("Nhập userId để đăng nhập");
// //     try {
// //       const res = await fetch("http://localhost:8080/login", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ userId: userIdInput }),
// //       });
// //       const data = await res.json();
// //       if (data.success) {
// //         localStorage.setItem("userId", data.user.userId);
// //         localStorage.setItem("callToId", data.user.callToId);
// //         onLogin(data.user);
// //         socket.emit("register", data.user.userId);
// //       } else {
// //         alert("User không tồn tại");
// //       }
// //     } catch (err) {
// //       alert("Lỗi kết nối backend");
// //       console.error(err);
// //     }
// //   };

// //   return (
// //     <div className="p-4 border rounded max-w-sm mx-auto mt-20">
// //       <h2 className="text-xl font-bold mb-4">Đăng nhập</h2>
// //       <input
// //         type="text"
// //         placeholder="Nhập userId (ví dụ: user1)"
// //         value={userIdInput}
// //         onChange={(e) => setUserIdInput(e.target.value)}
// //         className="border px-3 py-2 w-full mb-4"
// //       />
// //       <button
// //         onClick={handleLogin}
// //         className="bg-blue-600 text-red-500 px-4 py-2 rounded w-full hover:bg-blue-700"
// //       >
// //         Đăng nhập
// //       </button>
// //     </div>
// //   );
// // }

// // export default function App() {
// //   const storedUserId = localStorage.getItem("userId");
// //   const storedCallToId = localStorage.getItem("callToId");

// //   const [user, setUser] = useState(
// //     storedUserId && storedCallToId
// //       ? { userId: storedUserId, callToId: storedCallToId }
// //       : null
// //   );
// //   const [incomingCall, setIncomingCall] = useState(null);
// //   const [callAccepted, setCallAccepted] = useState(false);
// //   const [connectedUserId, setConnectedUserId] = useState(null);
// //   const [stream, setStream] = useState(null);
// //   const [calling, setCalling] = useState(false);

// //   const localVideoRef = useRef();
// //   const remoteVideoRef = useRef();
// //   const peerConnection = useRef(null);

// //   const servers = {
// //     iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
// //   };

// //   useEffect(() => {
// //     if (!user) return;

// //     socket.emit("register", user.userId);

// //     navigator.mediaDevices
// //       .getUserMedia({ video: true, audio: true })
// //       .then((s) => {
// //         setStream(s);
// //         if (localVideoRef.current) localVideoRef.current.srcObject = s;
// //       })
// //       .catch((err) => {
// //         alert("Lỗi truy cập camera/micro");
// //         console.error(err);
// //       });

// //     socket.on("incoming-call", ({ fromUserId, offer }) => {
// //       setIncomingCall({ from: fromUserId, offer });
// //     });

// //     // socket.on("call-accepted", async ({ answer }) => {
// //     //   setCallAccepted(true);
// //     //   setCalling(false); // 🔹 dừng hiển thị "Đang gọi..."

// //     //   if (peerConnection.current) {
// //     //     await peerConnection.current.setRemoteDescription(answer);
// //     //   }
// //     // });

// //     // socket.on("ice-candidate", async ({ candidate }) => {
// //     //   try {
// //     //     if (peerConnection.current && candidate) {
// //     //       await peerConnection.current.addIceCandidate(candidate);
// //     //     }
// //     //   } catch (err) {
// //     //     console.error("Error adding ice candidate:", err);
// //     //   }
// //     // });

// //     let pendingCandidates = [];

// //     socket.on("ice-candidate", async ({ candidate }) => {
// //       try {
// //         if (candidate) {
// //           if (
// //             peerConnection.current &&
// //             peerConnection.current.remoteDescription
// //           ) {
// //             // ✅ Nếu đã có remoteDescription, thêm ngay
// //             await peerConnection.current.addIceCandidate(candidate);
// //           } else {
// //             // ⏳ Nếu chưa, lưu tạm lại
// //             pendingCandidates.push(candidate);
// //           }
// //         }
// //       } catch (err) {
// //         console.error("Error adding ice candidate:", err);
// //       }
// //     });

// //     socket.on("call-accepted", async ({ answer }) => {
// //       setCallAccepted(true);
// //       setCalling(false);

// //       if (peerConnection.current) {
// //         await peerConnection.current.setRemoteDescription(answer);

// //         // 🔹 Khi đã có remoteDescription, thêm các ICE tạm còn sót lại
// //         for (const c of pendingCandidates) {
// //           await peerConnection.current.addIceCandidate(c);
// //         }
// //         pendingCandidates = [];
// //       }
// //     });

// //     socket.on("call-ended", () => {
// //       handleEndCall();
// //     });
// //     socket.on("call-rejected", () => {
// //       alert("Cuộc gọi bị từ chối");
// //       setCalling(false); // 🔹 dừng hiển thị "Đang gọi..."
// //       setConnectedUserId(null);
// //       setCallAccepted(false);
// //     });
// //     return () => {
// //       socket.off("incoming-call");
// //       socket.off("call-accepted");
// //       socket.off("ice-candidate");
// //       socket.off("call-ended");
// //       socket.off("call-rejected");
// //     };
// //   }, [user]);

// //   const createPeerConnection = (otherUserId) => {
// //     peerConnection.current = new RTCPeerConnection(servers);

// //     peerConnection.current.onicecandidate = (event) => {
// //       if (event.candidate) {
// //         socket.emit("ice-candidate", {
// //           toUserId: otherUserId,
// //           candidate: event.candidate,
// //         });
// //       }
// //     };

// //     peerConnection.current.ontrack = (event) => {
// //       if (remoteVideoRef.current) {
// //         remoteVideoRef.current.srcObject = event.streams[0];
// //       }
// //     };

// //     if (stream) {
// //       stream.getTracks().forEach((track) => {
// //         peerConnection.current.addTrack(track, stream);
// //       });
// //     }
// //   };

// //   const callUser = async () => {
// //     if (!user?.callToId) {
// //       alert("Không có ID người cần gọi");
// //       return;
// //     }
// //     createPeerConnection(user.callToId);
// //     setConnectedUserId(user.callToId);
// //     setCallAccepted(true);
// //     setCalling(true); // 🔹 hiển thị “Đang gọi...”
// //     const offer = await peerConnection.current.createOffer();
// //     await peerConnection.current.setLocalDescription(offer);

// //     socket.emit("call-user", {
// //       fromUserId: user.userId,
// //       toUserId: user.callToId,
// //       offer,
// //     });
// //   };

// //   const acceptCall = async () => {
// //     setCallAccepted(true);
// //     createPeerConnection(incomingCall.from);
// //     setConnectedUserId(incomingCall.from);

// //     await peerConnection.current.setRemoteDescription(incomingCall.offer);

// //     const answer = await peerConnection.current.createAnswer();
// //     await peerConnection.current.setLocalDescription(answer);

// //     socket.emit("answer-call", { toUserId: incomingCall.from, answer });

// //     setIncomingCall(null);
// //   };
// //   const rejectCall = () => {
// //     socket.emit("reject-call", { toUserId: incomingCall.from }); // 🔹 thông báo bên kia
// //     setIncomingCall(null);
// //   };
// //   const handleEndCall = () => {
// //     if (peerConnection.current) {
// //       peerConnection.current.close();
// //       peerConnection.current = null;
// //     }
// //     setCallAccepted(false);
// //     setIncomingCall(null);
// //     setConnectedUserId(null);
// //     setCalling(false); // 🔹 dừng hiển thị “Đang gọi...”

// //     if (remoteVideoRef.current) {
// //       remoteVideoRef.current.srcObject = null;
// //     }
// //   };

// //   const endCall = () => {
// //     if (connectedUserId) {
// //       socket.emit("end-call", { toUserId: connectedUserId });
// //     }
// //     handleEndCall();
// //   };

// //   const logout = () => {
// //     localStorage.removeItem("userId");
// //     localStorage.removeItem("callToId");
// //     setUser(null);
// //     handleEndCall();
// //   };

// //   if (!user) {
// //     return <Login onLogin={setUser} />;
// //   }

// //   return (
// //     <div className="p-8 max-w-md mx-auto">
// //       <h1 className="text-2xl font-bold mb-4">Demo Video Call có Login</h1>
// //       <p>
// //         Bạn đang đăng nhập với User ID: <b>{user.userId}</b>
// //       </p>
// //       <p>
// //         Sẽ gọi đến User ID: <b>{user.callToId}</b>
// //       </p>

// //       {!callAccepted && !incomingCall && (
// //         <button
// //           onClick={callUser}
// //           className="bg-blue-600 text-red-500 px-6 py-3 rounded mt-4 hover:bg-blue-700"
// //         >
// //           Gọi
// //         </button>
// //       )}
// //       {calling && (
// //         <p className="text-yellow-600 font-semibold mt-2">Đang gọi...</p>
// //       )}

// //       {incomingCall && !callAccepted && (
// //         <div className="mt-4 p-4 border rounded bg-yellow-100">
// //           <p>{incomingCall.from} đang gọi bạn</p>
// //           <button
// //             onClick={acceptCall}
// //             className="bg-green-600 text-red-500 px-4 py-2 rounded mr-2 hover:bg-green-700"
// //           >
// //             Chấp nhận
// //           </button>
// //           <button
// //             onClick={rejectCall}
// //             className="bg-red-600 text-red-500 px-4 py-2 rounded hover:bg-red-700"
// //           >
// //             Từ chối
// //           </button>
// //         </div>
// //       )}

// //       {callAccepted && (
// //         <button
// //           onClick={endCall}
// //           className="bg-red-600 text-red-500 px-4 py-2 rounded mt-4 hover:bg-red-700"
// //         >
// //           Kết thúc cuộc gọi
// //         </button>
// //       )}

// //       <button
// //         onClick={logout}
// //         className="bg-gray-600 text-red-500 px-4 py-2 rounded mt-6 hover:bg-gray-700"
// //       >
// //         Đăng xuất
// //       </button>

// //       <div className="flex space-x-4 mt-6">
// //         <video
// //           ref={localVideoRef}
// //           autoPlay
// //           muted
// //           className="w-48 h-36 bg-black rounded"
// //         />
// //         <video
// //           ref={remoteVideoRef}
// //           autoPlay
// //           className="w-48 h-36 bg-black rounded"
// //         />
// //       </div>
// //     </div>
// //   );
// // }

import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Guess/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import TestAndMatch from "./components/user/TestAndMatch";
import Page from "./pages/User/Page";
import DoctorPage from "./pages/Doctor/DoctorPage";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import Users from "./pages/Admin/Users";
import Doctors from "./pages/Admin/Doctors";
import Appointments from "./pages/Admin/Appointments";
import Screenings from "./pages/Admin/Screenings";
import DoctorHomeworkPage from "./pages/User/Homework";
import PendingApproval from "./pages/Doctor/PendingApproval";
import DoctorListWithPayment from "./pages/User/features/DoctorListWithPayment";
import AdminPortal from "./pages/Admin/Admin";
import ProtectedRoute, {
  RequireDoctorApproved,
  RequireDoctorPending,
  RequireNoTest,
  RequireTestDone,
} from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/test" element={<TestAndMatch />} />{" "}
      <Route path="/user" element={<Page />} />
      <Route path="/doctor" element={<DoctorPage />} />{" "}
      <Route path="/pending" element={<PendingApproval />} />
      <Route path="/payment" element={<DoctorListWithPayment />} />*{" "}
      <Route path="/admin-test" element={<AdminPortal />} />
      {/* <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="screenings" element={<Screenings />} />
      </Route> */}
      {/* USER */}
      {/* <Route element={<ProtectedRoute allow={["user"]} />}>
        <Route element={<RequireNoTest />}>
          <Route path="/test" element={<TestAndMatch />} />{" "}
        </Route>
        <Route element={<RequireTestDone />}>
          <Route path="/user" element={<Page />} />
          <Route path="/payment" element={<DoctorListWithPayment />} />
        </Route>
      </Route> */}
      {/* DOCTOR ROUTES */}
      {/* <Route element={<ProtectedRoute allow={["doctor"]} />}>
        <Route element={<RequireDoctorApproved />}>
          <Route path="/doctor" element={<DoctorPage />} />{" "}
        </Route>
        <Route element={<RequireDoctorPending />}>
          <Route path="/pending" element={<PendingApproval />} />
        </Route>
      </Route> */}
      {/* ADMIN ROUTES */}
      {/* <Route element={<ProtectedRoute allow={["admin"]} />}>
        
        <Route path="/admin-test" element={<AdminPortal />} />
      </Route> */}
      {/* <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="screenings" element={<Screenings />} />
        </Route> */}
      {/* Nếu route không tồn tại */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Room from "./pages/Room";
// import HomePage from "./pages/HomePage";
// import { SocketProvider } from "./providers/Socket";
// import { PeerProvider } from "./providers/Peer";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <SocketProvider>
//         <PeerProvider>
//           <Routes>
//             <Route path="/" element={<HomePage />} />
//             <Route path="/rooms/:roomId" element={<Room />} />
//           </Routes>
//         </PeerProvider>
//       </SocketProvider>
//     </BrowserRouter>
//   );
// }
