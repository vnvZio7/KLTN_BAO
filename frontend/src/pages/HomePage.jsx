import React, { useState } from "react";
import { useSocket } from "../providers/Socket";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

const HomePage = () => {
  const [email, setEmail] = useState();
  const [roomId, setRoomId] = useState();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const handleRoomJoined = useCallback(
    ({ roomId }) => {
      navigate(`/rooms/${roomId}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("joined-room", handleRoomJoined);

    return () => {
      socket.off("joined-room", handleRoomJoined);
    };
  }, [socket, handleRoomJoined]);

  const handleJoinRoom = () => {
    socket.emit("join-room", { roomId, userId: email });
  };

  return (
    <div className="bg-amber-300 text-black w-screen h-screen m-auto">
      <div className="flex flex-col w-[30%] gap-5 pt-10 pl-20">
        <input
          className="border"
          type="text"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border"
          type="text"
          placeholder="room"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={handleJoinRoom}>Join</button>
      </div>
    </div>
  );
};

export default HomePage;
