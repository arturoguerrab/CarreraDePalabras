import { createContext, useState, useEffect, useContext } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";

export const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    const URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || "http://localhost:3000";
    const newSocket = io(URL, { withCredentials: true, autoConnect: true });

    newSocket.on("connect", () => console.log(`🔌 Socket conectado: ${user.email}`));
    newSocket.on("connect_error", (err) => console.error("❌ Error socket:", err));
    
    setSocket(newSocket);

    // Cleanup: Disconnect when user changes (logout) or component unmounts
    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user]);

  const value = {
    socket
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
