import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";

import { useSocket } from "../hooks/useSocket";
import peer from "../service/peer";
import { useParams } from "react-router-dom";

interface MessageData {
  text: string;
  author?: string;
  to: string;
  time: string;
}

const RoomScreen = () => {
  const socket = useSocket();

  const { roomId } = useParams();

  const [remoteSocketId, setRemoteSocketId] = useState<string>();
  const [remoteEmail, setRemoteEmail] = useState("");

  const [myStream, setMyStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();

  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingOffer, setIncomingOffer] =
    useState<RTCSessionDescriptionInit>();

  const [currentMessage, setCurrentMessage] = useState("");
  const [messagesList, setMessagesList] = useState<MessageData[]>([]);

  const sendStreams = useCallback(() => {
    if (myStream) {
      for (const track of myStream.getTracks()) {
        peer.peer.addTrack(track, myStream);
      }
    }
  }, [myStream]);

  const handleUserJoined = useCallback(
    ({ email, id }: { email: string; id: string }) => {
      console.log(`User ${email} joined the room!`);

      setRemoteEmail(email);
      setRemoteSocketId(id);
    },
    []
  );

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    const offer = await peer.getOffer();
    socket?.emit("user:call", { to: remoteSocketId, offer });

    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({
      email,
      from,
      offer,
    }: {
      email: string;
      from: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      console.log("Incoming Call from", email, from, offer);
      setRemoteEmail(email);
      setRemoteSocketId(from);
      setIncomingOffer(offer);

      setIsIncomingCall(true);
    },
    []
  );

  const acceptCall = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);

    const ans = incomingOffer && (await peer.getAnswer(incomingOffer));

    socket?.emit("call:accepted", { to: remoteSocketId, ans });

    setIsIncomingCall(false);
    setIncomingOffer(undefined);
  }, [socket, remoteSocketId, incomingOffer]);

  const handleCallAccepted = useCallback(
    async ({ ans }: { ans: RTCSessionDescriptionInit }) => {
      await peer.setLocalDescription(ans);
      console.log("Call Accepted");

      sendStreams();
    },
    [sendStreams]
  );

  const handleRemoteTrack = useCallback((ev: RTCTrackEvent) => {
    setRemoteStream(ev.streams[0]);
  }, []);

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket?.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [socket, remoteSocketId]);

  const handleNegoIncoming = useCallback(
    async ({
      from,
      offer,
    }: {
      from: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      const ans = await peer.getAnswer(offer);
      socket?.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoFinal = useCallback(
    async ({ from, ans }: { from: string; ans: RTCSessionDescriptionInit }) => {
      await peer.setLocalDescription(ans);
      socket?.emit("final:send:streams", { to: from });
    },
    [socket]
  );

  const handleFinalSendStreams = useCallback(() => {
    sendStreams();
  }, [sendStreams]);

  const handleSendMessage = () => {
    if (!remoteSocketId) return;

    const currentDate = new Date();

    const data: MessageData = {
      text: currentMessage,
      to: remoteSocketId,
      time: currentDate.getHours() + ":" + currentDate.getMinutes(),
    };

    socket?.emit("message:send", { messageData: data });

    setMessagesList([...messagesList, data]);
    setCurrentMessage("");
  };

  const handleReceiveMessage = useCallback(
    async ({ messageData }: { messageData: MessageData }) => {
      setMessagesList([...messagesList, messageData]);
    },
    [messagesList]
  );

  useEffect(() => {
    socket?.on("user:joined", handleUserJoined);
    socket?.on("incoming:call", handleIncomingCall);
    socket?.on("call:accepted", handleCallAccepted);
    socket?.on("peer:nego:needed", handleNegoIncoming);
    socket?.on("peer:nego:final", handleNegoFinal);
    socket?.on("final:send:streams", handleFinalSendStreams);
    socket?.on("message:receive", handleReceiveMessage);

    return () => {
      socket?.off("user:joined", handleUserJoined);
      socket?.off("incoming:call", handleIncomingCall);
      socket?.off("call:accepted", handleCallAccepted);
      socket?.off("peer:nego:needed", handleNegoIncoming);
      socket?.off("peer:nego:final", handleNegoFinal);
      socket?.off("final:send:streams", handleFinalSendStreams);
      socket?.off("message:receive", handleReceiveMessage);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoIncoming,
    handleNegoFinal,
    handleFinalSendStreams,
    handleReceiveMessage,
  ]);

  useEffect(() => {
    peer.peer.addEventListener("track", handleRemoteTrack);

    return () => {
      peer.peer.removeEventListener("track", handleRemoteTrack);
    };
  }, [handleRemoteTrack]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);

    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  return (
    <div className="flex flex-col gap-6 justify-center items-center py-6 px-10">
      <h2 className="text-lg">Room ID: {roomId}</h2>

      <h4 className="text-xl font-bold">
        {remoteSocketId ? "Connected" : "No one in room"}
      </h4>

      {remoteSocketId && !(myStream && remoteStream) && (
        <button
          className="px-6 py-2 rounded-md bg-green-500 hover:bg-green-700 transition-colors"
          onClick={handleCallUser}
        >
          CALL
        </button>
      )}

      {isIncomingCall && (
        <button
          onClick={acceptCall}
          className="px-6 py-2 rounded-md bg-green-500 hover:bg-green-700 transition-colors"
        >
          Accept Call from {remoteEmail}
        </button>
      )}

      <div className="flex flex-col-reverse lg:flex-row gap-10">
        {myStream && (
          <div>
            <h3 className="text-2xl font-bold text-center">You</h3>
            <div className="w-[300px] lg:w-10/12 max-w-md my-4 rounded-lg overflow-clip">
              <ReactPlayer
                url={myStream}
                muted
                playing
                width="100%"
                height="auto"
              />
            </div>
          </div>
        )}

        {remoteStream && (
          <div>
            <h3 className="text-2xl font-bold text-center text-green-500">
              {remoteEmail}
            </h3>
            <div className="w-[300px] lg:w-full max-w-md my-4 rounded-lg overflow-clip">
              <ReactPlayer
                url={remoteStream}
                playing
                width="100%"
                height="auto"
              />
            </div>
          </div>
        )}
      </div>

      {/* TEXT CHAT SECTION */}
      {remoteStream && (
        <div className="flex flex-col items-center gap-6 w-[300px] lg:w-3/4 lg:max-w-lg text-sm lg:text-base">
          {/* MESSAGES */}
          <div className="flex flex-col gap-4 p-4 border border-white rounded-md w-full">
            {messagesList.map((message, idx) => (
              <div
                key={idx}
                className={`p-2 min-w-36 w-fit text-black rounded-xl ${
                  message.author
                    ? "mr-8 self-start bg-blue-200"
                    : "ml-8 self-end bg-green-200"
                }`}
              >
                <h5
                  className={`font-bold mb-2 ${
                    message.author ? "text-left" : "text-right"
                  }`}
                >
                  {message.author || "You"}
                </h5>

                <p>{message.text}</p>

                <p className="text-xs text-black/40 text-right">
                  {message.time}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between gap-4">
            <input
              type="text"
              placeholder="Your message..."
              className="text-sm lg:text-base bg-transparent border border-white/80 rounded-md p-2"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
            />
            <button
              onClick={handleSendMessage}
              className="py-2 px-4 text-sm font-bold rounded-md bg-green-500 hover:bg-green-700 transition-colors"
            >
              SEND
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomScreen;
