import { FormEvent, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";

const LobbyScreen = () => {
  const navigate = useNavigate();
  const socket = useSocket();

  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const handleSubmitForm = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      socket?.emit("room:join", { email, room });
    },
    [socket, email, room]
  );

  const handleRoomJoin = useCallback(
    ({ room }: { room: string }) => {
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket?.on("room:join", handleRoomJoin);
  }, [socket, handleRoomJoin]);

  return (
    <div>
      <h1>LobbyScreen</h1>

      <form onSubmit={handleSubmitForm}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
        />
        <br />
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Enter room id"
        />
        <br />
        <button>Join</button>
      </form>
    </div>
  );
};

export default LobbyScreen;
