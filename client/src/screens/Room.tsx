import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

const RoomScreen = () => {
  const socket = useSocket();

  const [remoteSocketId, setRemoteSocketId] = useState<string>();

  const handleUserJoined = useCallback(
    ({ email, id }: { email: string; id: string }) => {
      console.log(`User ${email} joined the room!`);
      setRemoteSocketId(id);
    },
    []
  );

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
    </div>
  );
};

export default RoomScreen;
