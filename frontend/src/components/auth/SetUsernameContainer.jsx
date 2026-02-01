import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import SetUsernameView from "./SetUsernameView";

// Manejo del flujo para establecer un nickname obligatorio después del login (especialmente para Google OAuth).
const SetUsernameContainer = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { updateUsername, logout } = useAuth();

  /**
   * @param {Event} e - Evento de envío.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username.trim() || username.length < 3) {
      setError("El nombre debe tener al menos 3 letras.");
      setLoading(false);
      return;
    }

    try {
      await updateUsername(username);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al guardar. Intenta otro nombre.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SetUsernameView
      username={username}
      setUsername={setUsername}
      error={error}
      loading={loading}
      handleSubmit={handleSubmit}
      handleLogout={logout}
    />
  );
};

export default SetUsernameContainer;
