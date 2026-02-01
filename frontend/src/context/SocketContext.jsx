import { createContext, useState, useEffect, useContext } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";

export const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const URL =
      import.meta.env.VITE_REACT_APP_BACKEND_URL || "http://localhost:3000";
    const newSocket = io(URL, { withCredentials: true, autoConnect: true });

    newSocket.on("connect", () => {
      console.log(`Socket conectado: ${user.email} con ID: ${newSocket.id}`);
      setIsConnected(true);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Error socket:", err);
      setIsConnected(false);
    });

    newSocket.on("disconnect", () => setIsConnected(false));

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user]);

  const value = {
    socket,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
