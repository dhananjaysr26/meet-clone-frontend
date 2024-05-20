"use client";
import { useSocket } from "@/providers/Socket.provider";
import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";

interface MeetingRoomProps {
  roomId: string;
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({ roomId }) => {
  const { socket, isConnected, peer, remoteRef } = useSocket();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const localStreamRef = useRef<any>(null);

  const connectUser = () => {
    const userName = prompt("Please enter your name:");

    if (userName != "" && roomId != "") {
      const user = {
        dsiplayName: userName,
        meetingid: roomId,
      };
      socket.emit("userconnect", user);
      setCurrentUser(user);
    }
  };

  const createOffer = async (peer: any, connId: string) => {
    console.log("===>Create Offer", { peer });
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit("exchangeSDP", {
      message: JSON.stringify({ offer }),
      to_connid: connId,
    });
  };

  const exchangeSDP = async (message: any, from_connid: string) => {
    const data = JSON.parse(message);

    if (data.answer) {
      console.log("answer", data.answer);
      await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
      console.log("connection", peer);
    } else if (data.offer) {
      console.log("offer", data.offer);

      await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("exchangeSDP", {
        message: JSON.stringify({ answer }),
        to_connid: from_connid,
      });
    } else if (data.iceCandidate) {
      console.log("iceCandidate", data.iceCandidate);
      try {
        await peer.addIceCandidate(data.iceCandidate);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const getUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localStreamRef.current) {
        localStreamRef.current.srcObject = stream;
      }
      if (peer) {
        stream.getTracks().forEach((track) => {
          peer.addTrack(track, stream);
        });
      }
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  useEffect(() => {
    if (socket && peer && !currentUser) {
      connectUser();
      getUserMedia();
      socket.on("informAboutNewConnection", function (data: any) {
        console.log({ data });
        createOffer(peer, data.connId);
      });
      socket.on("exchangeSDP", async function (data: any) {
        await exchangeSDP(data.message, data.from_connid);
      });

      if (peer) {
        peer.onicecandidate = (event: any) => {
          if (event.candidate) {
            socket.emit("exchangeSDP", {
              message: JSON.stringify({ iceCandidate: event.candidate }),
              to_connid: roomId,
            });
          }
        };
      }
    }
  }, [socket, peer]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  console.log({ remoteRef });

  return (
    <>
      <h1>Room</h1>
      <video
        className=" h-[300px] w-[300px]  border"
        ref={remoteRef}
        autoPlay
      />
      <video
        className=" h-[300px] w-[300px]  border"
        ref={localStreamRef}
        autoPlay
        muted
      />
    </>
  );
};

export default MeetingRoom;
