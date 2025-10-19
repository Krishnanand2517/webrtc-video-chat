import { FormEvent, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSocket } from "../hooks/useSocket";

const LobbyScreen = () => {
  const navigate = useNavigate();
  const socket = useSocket();

  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const handleSubmitForm = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      socket?.emit("room:join", { email, room });
    },
    [socket, email, room]
  );

  const handleRoomJoin = useCallback(
    ({ room }: { room: string }) => {
      navigate(`/room/${room}`);
      setIsLoading(false);
    },
    [navigate]
  );

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    socket?.on("room:join", handleRoomJoin);
  }, [socket, handleRoomJoin]);

  const isFormValid = email && room;

  return (
    <div
      className={`py-8 flex flex-col gap-24 justify-center items-center duration-1000 delay-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <h1 className="font-black text-4xl lg:text-6xl bg-gradient-to-r from-fuchsia-500 via-purple-800 to-cyan-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient drop-shadow-[0_0_5px_rgba(217,70,239,0.5)] dark:drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
        WeTalk
      </h1>

      <form
        onSubmit={handleSubmitForm}
        className="p-6 lg:p-10 flex flex-col gap-6 lg:gap-8 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-fuchsia-500/30 transition-all duration-500"
      >
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter Username"
          className="w-52 lg:w-80 text-sm lg:text-base bg-white/5 border border-white/20 rounded-xl px-6 py-2 text-white placeholder-white/40 focus:border-fuchsia-500/50 focus:bg-white/10 focus:outline-none transition-all duration-300"
          required
        />

        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Enter Room ID"
          className="w-52 lg:w-80 text-sm lg:text-base bg-white/5 border border-white/20 rounded-xl px-6 py-2 text-white placeholder-white/40 focus:border-fuchsia-500/50 focus:bg-white/10 focus:outline-none transition-all duration-300"
          required
        />

        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="px-6 py-2 rounded-lg font-medium bg-white/90 text-neutral-900 hover:bg-white/70 border border-white/20 hover:border-fuchsia-500/50 cursor-pointer transition-colors disabled:bg-white/30 disabled:cursor-not-allowed"
        >
          {isLoading ? "..." : "Join"}
        </button>
      </form>
    </div>
  );
};

export default LobbyScreen;
