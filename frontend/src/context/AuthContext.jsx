import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import stopAPI from "../stopAPI";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificación de Sesión Inicial
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await stopAPI.get("/auth/user");
        setUser(response.data.isLoggedIn ? response.data.user : null);
      } catch (error) {
        console.error("Error de sesión:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  // Inicio de sesion
  const login = useCallback(
    async (email, password) => {
      const response = await stopAPI.post("/auth/login", { email, password });
      if (response.data.user) setUser(response.data.user);
      return response;
    },
    [setUser],
  );

  // Enviar form de Registro
  const register = useCallback(
    (userData) => stopAPI.post("/auth/register", userData),
    [],
  );

  // Cerrar sesion
  const logout = useCallback(async () => {
    try {
      await stopAPI.get("/auth/logout");
      setUser(null);
    } catch (err) {
      console.error("Error logout:", err);
    }
  }, [setUser]);

  // Actualizar username si se registro con Google
  const updateUsername = useCallback(
    async (username) => {
      const cleanUsername = username?.trim();
      const res = await stopAPI.post("/auth/set-username", { username: cleanUsername });
      if (res.data.user) setUser(res.data.user);
      return res;
    },
    [setUser],
  );

  // Inicio de sesion con Google
  const loginWithGoogle = useCallback(() => {
    const URL =
      import.meta.env.VITE_REACT_APP_BACKEND_URL || "http://localhost:3000";
    window.location.href = `${URL}/auth/google`;
  }, []);

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUsername,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
