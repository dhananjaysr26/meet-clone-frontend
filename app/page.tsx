"use client";
import HomeBanner from "@/components/meeting/HomeBanner";
import { useSocket } from "@/providers/Socket.provider";
import { useEffect, useState } from "react";

export default function Home() {
  const { socket, isConnected } = useSocket();
  const [mounted, setMounted] = useState(false);

  const sendMessage = () => {
    socket.emit("message", { message: "Hello World!" });
    console.log("Message");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div>
      <div>{isConnected ? "Connected" : "Disconnected"}</div>
      <HomeBanner />
      <button onClick={sendMessage}>Send Message</button>
    </div>
  );
}
