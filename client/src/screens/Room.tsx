import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";

import { useSocket } from "../hooks/useSocket";
import peer from "../service/peer";

const RoomScreen = () => {
  const socket = useSocket();

  const [remoteSocketId, setRemoteSocketId] = useState<string>();
  const [myStream, setMyStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();

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
      from,
      offer,
    }: {
      from: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      console.log("Incoming Call", from, offer);
      setRemoteSocketId(from);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);

      const ans = await peer.getAnswer(offer);
      socket?.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

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
    async ({ ans }: { ans: RTCSessionDescriptionInit }) => {
      await peer.setLocalDescription(ans);
    },
    []
  );

  useEffect(() => {
    socket?.on("user:joined", handleUserJoined);
    socket?.on("incoming:call", handleIncomingCall);
    socket?.on("call:accepted", handleCallAccepted);
    socket?.on("peer:nego:needed", handleNegoIncoming);
    socket?.on("peer:nego:final", handleNegoFinal);

    return () => {
      socket?.off("user:joined", handleUserJoined);
      socket?.off("incoming:call", handleIncomingCall);
      socket?.off("call:accepted", handleCallAccepted);
      socket?.off("peer:nego:needed", handleNegoIncoming);
      socket?.off("peer:nego:final", handleNegoFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoIncoming,
    handleNegoFinal,
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
    <div>
      <h1>RoomScreen</h1>

      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {myStream && <button onClick={sendStreams}>Send Stream</button>}
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

      {remoteStream && (
        <>
          <h3>Remote Stream</h3>
          <ReactPlayer
            url={remoteStream}
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
