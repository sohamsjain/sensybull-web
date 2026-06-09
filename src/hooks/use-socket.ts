"use client";

import { useState, useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { getTokens } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

export function useSocket() {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const { access } = getTokens();
    const socket = connectSocket(access);
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    return () => {
      disconnectSocket();
      socketRef.current = null;
    };
  }, [user]);

  return { socket: socketRef.current, connected };
}
