// // import { useState } from 'react'
// // import reactLogo from './assets/react.svg'
// // import viteLogo from '/vite.svg'
// // import './App.css'

// // function App() {
// //   const [count, setCount] = useState(0)

// //   return (
// //     <>
// //       <div>
// //         <a href="https://vite.dev" target="_blank">
// //           <img src={viteLogo} className="logo" alt="Vite logo" />
// //         </a>
// //         <a href="https://react.dev" target="_blank">
// //           <img src={reactLogo} className="logo react" alt="React logo" />
// //         </a>
// //       </div>
// //       <h1>Vite + React</h1>
// //       <div className="card">
// //         <button onClick={() => setCount((count) => count + 1)}>
// //           count is {count}
// //         </button>
// //         <p>
// //           Edit <code>src/App.jsx</code> and save to test HMR
// //         </p>
// //       </div>
// //       <p className="read-the-docs">
// //         Click on the Vite and React logos to learn more
// //       </p>
// //     </>
// //   )
// // }

// // App.js
// // import React, { useState, useRef, useEffect } from "react";
// // import { io } from "socket.io-client";

// // const socket = io("http://localhost:8080");

// // export default function App() {
// //   const [myId, setMyId] = useState("");
// //   const [callToId, setCallToId] = useState("");
// //   const [incomingCall, setIncomingCall] = useState(null);
// //   const [callAccepted, setCallAccepted] = useState(false);
// //   const [connectedUserId, setConnectedUserId] = useState(null);

// //   const [stream, setStream] = useState(null);

// //   const localVideoRef = useRef();
// //   const remoteVideoRef = useRef();

// //   const peerConnection = useRef(null);

// //   const servers = {
// //     iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
// //   };

// //   useEffect(() => {
// //     // Get user media stream
// //     navigator.mediaDevices
// //       .getUserMedia({ video: true, audio: true })
// //       .then((stream) => {
// //         setStream(stream);
// //         if (localVideoRef.current) {
// //           localVideoRef.current.srcObject = stream;
// //         }
// //       });

// //     socket.on("connect", () => {
// //       setMyId(socket.id);
// //       socket.emit("register", socket.id);
// //     });

// //     socket.on("incoming-call", ({ from, offer }) => {
// //       setIncomingCall({ from, offer });
// //     });

// //     socket.on("call-accepted", async ({ answer }) => {
// //       setCallAccepted(true);
// //       if (peerConnection.current) {
// //         await peerConnection.current.setRemoteDescription(answer);
// //       }
// //     });

// //     socket.on("ice-candidate", async ({ candidate }) => {
// //       try {
// //         if (peerConnection.current && candidate) {
// //           await peerConnection.current.addIceCandidate(candidate);
// //         }
// //       } catch (err) {
// //         console.error("Error adding received ice candidate", err);
// //       }
// //     });
// //     socket.on("call-ended", () => {
// //       handleEndCall();
// //     });
// //     return () => {
// //       socket.off("incoming-call");
// //       socket.off("call-accepted");
// //       socket.off("ice-candidate");
// //       socket.off("call-ended");
// //     };
// //   }, []);

// //   const createPeerConnection = (otherUserId) => {
// //     peerConnection.current = new RTCPeerConnection(servers);

// //     // Send ICE candidates to other peer
// //     peerConnection.current.onicecandidate = (event) => {
// //       if (event.candidate) {
// //         socket.emit("ice-candidate", {
// //           to: otherUserId,
// //           candidate: event.candidate,
// //         });
// //       }
// //     };

// //     // When remote track arrives
// //     peerConnection.current.ontrack = (event) => {
// //       if (remoteVideoRef.current) {
// //         remoteVideoRef.current.srcObject = event.streams[0];
// //       }
// //     };

// //     // Add local tracks to connection
// //     if (stream) {
// //       stream.getTracks().forEach((track) => {
// //         peerConnection.current.addTrack(track, stream);
// //       });
// //     }
// //   };

// //   // Người gọi
// //   const callUser = async () => {
// //     if (!callToId) return alert("Nhập ID người muốn gọi");

// //     createPeerConnection(callToId);
// //     setConnectedUserId(callToId);

// //     const offer = await peerConnection.current.createOffer();
// //     await peerConnection.current.setLocalDescription(offer);

// //     socket.emit("call-user", { from: myId, to: callToId, offer });
// //   };

// //   // Người nhận chấp nhận
// //   const acceptCall = async () => {
// //     setCallAccepted(true);
// //     createPeerConnection(incomingCall.from);
// //     setConnectedUserId(incomingCall.from);

// //     await peerConnection.current.setRemoteDescription(incomingCall.offer);

// //     const answer = await peerConnection.current.createAnswer();
// //     await peerConnection.current.setLocalDescription(answer);

// //     socket.emit("answer-call", { to: incomingCall.from, answer });

// //     setIncomingCall(null);
// //   };

// //   // // Kết thúc call
// //   // const endCall = () => {
// //   //   if (peerConnection.current) {
// //   //     peerConnection.current.close();
// //   //     peerConnection.current = null;
// //   //   }
// //   //   setCallAccepted(false);
// //   //   setIncomingCall(null);
// //   //   setCallToId("");
// //   //   if (remoteVideoRef.current) {
// //   //     remoteVideoRef.current.srcObject = null;
// //   //   }
// //   // };
// //   const handleEndCall = () => {
// //     if (peerConnection.current) {
// //       peerConnection.current.close();
// //       peerConnection.current = null;
// //     }

// //     setCallAccepted(false);
// //     setIncomingCall(null);
// //     setCallToId("");
// //     setConnectedUserId(null);

// //     if (remoteVideoRef.current) {
// //       remoteVideoRef.current.srcObject = null;
// //     }
// //   };

// //   const endCall = () => {
// //     // const otherUserId = incomingCall?.from || callToId;
// //     // if (otherUserId) {
// //     //   socket.emit("end-call", { to: otherUserId });
// //     // }
// //     if (connectedUserId) {
// //       socket.emit("end-call", { to: connectedUserId });
// //     }
// //     handleEndCall();
// //   };

// //   return (
// //     <div className="flex flex-col items-center p-8 space-y-6">
// //       <h1 className="text-2xl font-bold">Video Call Simple</h1>
// //       <div>
// //         <p>
// //           Your ID: <span className="font-mono">{myId}</span>
// //         </p>
// //       </div>

// //       {!callAccepted && !incomingCall && (
// //         <div>
// //           <input
// //             type="text"
// //             placeholder="ID người muốn gọi"
// //             className="border px-3 py-2 rounded"
// //             value={callToId}
// //             onChange={(e) => setCallToId(e.target.value)}
// //           />
// //           <button
// //             onClick={callUser}
// //             className="ml-3 bg-blue-600 text-red-500 px-4 py-2 rounded hover:bg-blue-700"
// //           >
// //             Call
// //           </button>
// //         </div>
// //       )}

// //       {incomingCall && !callAccepted && (
// //         <div className="p-4 border rounded bg-yellow-100">
// //           <p>{incomingCall.from} đang gọi bạn</p>
// //           <button
// //             onClick={acceptCall}
// //             className="bg-green-600 text-red-500 px-4 py-2 rounded mr-2 hover:bg-green-700"
// //           >
// //             Accept
// //           </button>
// //           <button
// //             onClick={() => setIncomingCall(null)}
// //             className="bg-red-600 text-red-500 px-4 py-2 rounded hover:bg-red-700"
// //           >
// //             Reject
// //           </button>
// //         </div>
// //       )}

// //       {callAccepted && (
// //         <button
// //           onClick={endCall}
// //           className="bg-red-600 text-red-500 px-4 py-2 rounded hover:bg-red-700"
// //         >
// //           End Call
// //         </button>
// //       )}

// //       <div className="flex space-x-4 mt-4">
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

// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// import Room from "./pages/Room";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/room/:id" element={<Room />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Room from "./pages/Room";
import HomePage from "./pages/HomePage";
import { SocketProvider } from "./providers/Socket";
import { PeerProvider } from "./providers/Peer";

export default function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <PeerProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/rooms/:roomId" element={<Room />} />
          </Routes>
        </PeerProvider>
      </SocketProvider>
    </BrowserRouter>
  );
}
