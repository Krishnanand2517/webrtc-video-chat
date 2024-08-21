import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";

import { useSocket } from "../hooks/useSocket";

const RoomScreen = () => {
  const socket = useSocket();

  const [remoteSocketId, setRemoteSocketId] = useState<string>();
  const [myStream, setMyStream] = useState<MediaStream>();

  const handleUserJoined = useCallback(
    ({ email, id }: { email: string; id: string }) => {
      console.log(`User ${email} joined the room!`);
      setRemoteSocketId(id);
    },
    []
  );

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    setMyStream(stream);
  }, []);

  useEffect(() => {
    socket?.on("user:joined", handleUserJoined);

    return () => {
      socket?.off("user:joined", handleUserJoined);
    };
  }, [socket, handleUserJoined]);

  return (
    <div>
      <h1>RoomScreen</h1>

      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}

      {myStream && (
        <>
          <h3>My Stream</h3>
          <ReactPlayer
            url={myStream}
            muted
            playing
            width="480px"
            height="360px"
          />
        </>
      )}
    </div>
  );
};

export default RoomScreen;
