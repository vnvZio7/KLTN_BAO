import { useState } from "react";
import VideoCallPopup from "./VideoCallPopup";

export default function VideoCallUser() {
  const [openCall, setOpenCall] = useState(false);

  return (
    <>
      <button
        className="border-2 border-red-700 m-10 p-2 rounded"
        onClick={() => setOpenCall(true)}
      >
        Gọi video User
      </button>

      <VideoCallPopup
        roomId="123456"
        open={openCall}
        onClose={() => setOpenCall(false)}
      />
    </>
  );
}
