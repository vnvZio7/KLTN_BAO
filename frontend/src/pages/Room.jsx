import React from "react";
import { useSocket } from "../providers/Socket";
import { useEffect } from "react";
import { usePeer } from "../providers/Peer";
import { useCallback } from "react";
import { useState } from "react";
import ReactPlayer from "react-player";
import { useRef } from "react";

const Room = () => {
  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAns,
    sendStream,
    remoteStreamRef,
  } = usePeer();
  const [myStream, setMyStream] = useState();

  const myStreamRef = useRef(null);
  const [remoteEmailId, setRemoteEmailId] = useState(null);

  const handleNewUserJoined = useCallback(
    async (data) => {
      const { userId } = data;
      console.log("New User joined room", userId);
      const offer = await createOffer();
      socket.emit("call-user", { userId, offer });
      setRemoteEmailId(userId);
    },
    [createOffer, socket]
  );

  const handleIncommingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      console.log("Incomming Call from", from, offer);
      const ans = await createAnswer(offer);
      socket.emit("call-accepted", { userId: from, ans });
      setRemoteEmailId(from);
    },
    [createAnswer, socket]
  );

  const handleCallAccepted = useCallback(
    async (data) => {
      const { ans } = data;
      console.log("Incomming Call from", ans);
      await setRemoteAns(ans);
    },
    [setRemoteAns]
  );

  const getUserMediaStrean = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    // const url = URL.createObjectURL(mediaStream);

    setMyStream(stream);
    sendStream(stream);
    if (myStreamRef.current) {
      myStreamRef.current.srcObject = stream;
    }
  }, []);

  const handleNegotiation = useCallback(async () => {
    const localOffer = await peer.createOffer();
    socket.emit("call-user", { userId: remoteEmailId, offer: localOffer });
  }, []);

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incomming-call", handleIncommingCall);
    socket.on("call-accepted", handleCallAccepted);
    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("incomming-call", handleIncommingCall);
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [socket, handleNewUserJoined, handleIncommingCall, handleCallAccepted]);

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegotiation);
    return () => {
      peer.removeEventListener("negotiationneeded", handleNegotiation);
    };
  }, [peer, handleNegotiation]);

  useEffect(() => {
    getUserMediaStrean();
  }, [getUserMediaStrean]);

  return (
    <div>
      <div>Room</div>
      {/* <ReactPlayer url={myStream} playing muted /> */}
      <h1> You are connected to {remoteEmailId}</h1>
      <button onClick={() => sendStream(myStream)}>Send My Video</button>
      <video
        ref={myStreamRef}
        autoPlay
        playsInline
        muted // thường mute để tránh echo
        style={{ width: "100%", height: "auto" }}
      />
      <h1> RemoteStream</h1>
      <video
        ref={remoteStreamRef}
        autoPlay
        playsInline
        style={{ width: "100%", height: "auto" }}
      />
      {/* <ReactPlayer
        src={"https://www.youtube.com/watch?v=7cxpYJAElr4"}
        playing
      /> */}
    </div>
  );
};

export default Room;
