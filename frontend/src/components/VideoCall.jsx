// import { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";

// const socket = io("http://localhost:8080");

// export default function VideoCall({ roomId, email }) {
//   const localVideo = useRef();
//   const remoteVideo = useRef();
//   const pc = useRef();
//   const [joined, setJoined] = useState(false);

//   useEffect(() => {
//     const init = async () => {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });
//       localVideo.current.srcObject = stream;

//       pc.current = new RTCPeerConnection();

//       stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));

//       pc.current.ontrack = (event) => {
//         remoteVideo.current.srcObject = event.streams[0];
//       };

//       pc.current.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit("ice-candidate", { candidate: event.candidate, roomId });
//         }
//       };

//       socket.emit("join-room", roomId);
//       setJoined(true);

//       socket.on("user-joined", async () => {
//         const offer = await pc.current.createOffer();
//         await pc.current.setLocalDescription(offer);
//         socket.emit("offer", { offer, roomId });
//       });

//       socket.on("offer", async ({ offer }) => {
//         await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
//         const answer = await pc.current.createAnswer();
//         await pc.current.setLocalDescription(answer);
//         socket.emit("answer", { answer, roomId });
//       });

//       socket.on("answer", async ({ answer }) => {
//         await pc.current.setRemoteDescription(
//           new RTCSessionDescription(answer)
//         );
//       });

//       socket.on("ice-candidate", async ({ candidate }) => {
//         try {
//           await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
//         } catch (e) {
//           console.error(e);
//         }
//       });
//     };

//     init();
//   }, [roomId]);

//   return (
//     <div className="flex flex-col items-center gap-4">
//       <h2 className="text-lg">Welcome, {email}</h2>
//       <div className="flex gap-4">
//         <video
//           ref={localVideo}
//           autoPlay
//           playsInline
//           muted
//           className="w-64 border rounded"
//         />
//         <video
//           ref={remoteVideo}
//           autoPlay
//           playsInline
//           className="w-64 border rounded"
//         />
//       </div>
//       {joined ? (
//         <p className="text-green-400 mt-2">✅ Joined room successfully</p>
//       ) : (
//         <p>Joining...</p>
//       )}
//     </div>
//   );
// }
