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
    <div className="py-8 flex flex-col gap-24 justify-center items-center">
      <h1 className="font-black text-4xl lg:text-6xl bg-gradient-to-r from-red-700 to-blue-600 text-transparent bg-clip-text">
        We Talk
      </h1>

      <form
        onSubmit={handleSubmitForm}
        className="p-6 lg:p-10 flex flex-col gap-6 lg:gap-8 border-2 rounded-lg"
      >
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter Username"
          className="w-52 lg:w-80 text-sm lg:text-base bg-transparent border border-white/80 rounded-md p-2"
          required
        />

        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Enter Room ID"
          className="w-52 lg:w-80 text-sm lg:text-base bg-transparent border border-white/80 rounded-md p-2"
          required
        />

        <button className="px-6 py-2 rounded-lg bg-white/90 text-slate-900 hover:bg-white/40 hover:text-white transition-colors">
          Join
        </button>
      </form>
    </div>
  );
};

export default LobbyScreen;
