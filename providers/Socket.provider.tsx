"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io as ClientIO } from "socket.io-client";

type SocketContextType = {
  socket: any | null;
  isConnected: boolean;
  peer: any;
  remoteRef: any;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  peer: null,
  remoteRef: null,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const remoteRef = useRef<any>(null);

  const peer = () => {
    if (typeof window && !RTCPeerConnection) return null;
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });
    peer.onconnectionstatechange = (e) => {
      console.log("Connection state:", peer.connectionState);
    };

    peer.ontrack = (event) => {
      // console.log("Track", event)
      const stream = event.streams[0];
      remoteRef.current = stream;
    };
    return peer;
  };

  useEffect(() => {
    const socketInstance = ClientIO();

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, peer, remoteRef }}>
      {children}
    </SocketContext.Provider>
  );
};
