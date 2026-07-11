"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { getTokens } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

interface SocketContextValue {
  /** The one shared `/feed` socket for the whole authenticated session. */
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
});

/** Access the session-wide socket and connection state. */
export const useSocket = () => useContext(SocketContext);

/**
 * Owns the single Socket.IO connection at the dashboard layout level, so it
 * survives page navigation instead of being torn down and recreated by each
 * page's hook. Feature hooks (useEvents, useWatchlistInbox, useCompanyEvents)
 * subscribe to this shared socket; only this provider connects/disconnects.
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const { access } = getTokens();
    const s = connectSocket(access);

    const onConnect = () => {
      setConnected(true);
      setSocket(s);
    };
    const onDisconnect = () => setConnected(false);

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      disconnectSocket();
      setSocket(null);
      setConnected(false);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
