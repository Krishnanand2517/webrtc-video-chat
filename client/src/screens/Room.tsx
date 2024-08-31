import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";

import { useSocket } from "../hooks/useSocket";
import peer from "../service/peer";
import { useParams } from "react-router-dom";

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

  useEffect(() => {
    socket?.on("user:joined", handleUserJoined);
    socket?.on("incoming:call", handleIncomingCall);
    socket?.on("call:accepted", handleCallAccepted);
    socket?.on("peer:nego:needed", handleNegoIncoming);
    socket?.on("peer:nego:final", handleNegoFinal);
    socket?.on("final:send:streams", handleFinalSendStreams);

    return () => {
      socket?.off("user:joined", handleUserJoined);
      socket?.off("incoming:call", handleIncomingCall);
      socket?.off("call:accepted", handleCallAccepted);
      socket?.off("peer:nego:needed", handleNegoIncoming);
      socket?.off("peer:nego:final", handleNegoFinal);
      socket?.off("final:send:streams", handleFinalSendStreams);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoIncoming,
    handleNegoFinal,
    handleFinalSendStreams,
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
    </div>
  );
};

export default RoomScreen;
