import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RegisterView from "./RegisterView";

//Gestion del estado y la creación de nuevas cuentas de usuario.

const RegisterContainer = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);

  const navigate = useNavigate();
  const { register } = useAuth();

  // Efecto para manejar la cuenta regresiva y la redirección automática
  useEffect(() => {
    if (secondsLeft === null) return;

    if (secondsLeft > 0) {
      setExito(
        <>
          ¡Cuenta creada con éxito! Redirigiendo en {secondsLeft}...{" "}
          <Link to="/login" className="underline decoration-wavy ml-1 font-bold">Ir ahora</Link>
        </>
      );
      const timer = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate("/login");
    }
  }, [secondsLeft, navigate]);

  /**
   * @param {Event} e - Evento de envío.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanUsername = username.trim();

    // Validaciones básicas
    if (!cleanEmail || !cleanPassword || !cleanFirstName || !cleanLastName) {
      setError("Por favor completa los campos obligatorios (*)");
      setLoading(false);
      return;
    }
    if (cleanPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      await register({ 
        email: cleanEmail, 
        password: cleanPassword, 
        username: cleanUsername, 
        firstName: cleanFirstName, 
        lastName: cleanLastName 
      });

      setSecondsLeft(5); // Iniciamos la cuenta regresiva de 5 segundos

    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Error de conexión. Inténtalo más tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterView
      email={email}
      setEmail={setEmail}
      username={username}
      setUsername={setUsername}
      firstName={firstName}
      setFirstName={setFirstName}
      lastName={lastName}
      setLastName={setLastName}
      password={password}
      setPassword={setPassword}
      error={error}
      exito={exito}
      loading={loading}
      handleSubmit={handleSubmit}
    />
  );
};

export default RegisterContainer;
