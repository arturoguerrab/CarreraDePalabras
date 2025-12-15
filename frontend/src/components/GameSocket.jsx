import React, { useState, useEffect, useContext } from 'react';
import { StopContext } from '../context/StopContext';

const GameSocket = () => {
  // Obtener el socket del contexto global
  const { socket } = useContext(StopContext);

  // Estado local del componente
  // Para el ejemplo de chat
  const [mensaje, setMensaje] = useState("");
  const [chat, setChat] = useState([]);



  // Hook de efecto para manejar el ciclo de vida del socket
  useEffect(() => {
    // Si no hay socket, no hacemos nada.
    if (!socket) return;

    // Si el socket no está conectado, lo conectamos.
    // Esto es útil si el usuario se deslogueó y luego se volvió a loguear.
    if (!socket.connected) {
      socket.connect();
    }

    // 4. El cliente escucha el evento 'nuevo_mensaje' del servidor.
    const handleNewMessage = (mensajeDelServidor) => {
      console.log("Mensaje recibido del servidor:", mensajeDelServidor);
      // Añadimos el nuevo mensaje al estado del chat
      setChat((chatAnterior) => [...chatAnterior, mensajeDelServidor]);
    };

    socket.on("nuevo_mensaje", handleNewMessage);

    // LIMPIEZA: Dejamos de escuchar el evento cuando el componente se desmonte
    // No desconectamos el socket, ya que es una instancia global.
    return () => {
      socket.off("nuevo_mensaje", handleNewMessage);
    };
    
  }, [socket]); // Se ejecuta cada vez que la instancia del socket cambia.

  // 1. El cliente se prepara para enviar un mensaje al servidor.
  const enviarMensaje = (e) => {
    e.preventDefault();
    if (socket?.connected) {
      if (mensaje.trim() === "") return; // No enviar mensajes vacíos

      console.log(`Enviando mensaje: "${mensaje}"`);
      socket.emit("enviar_mensaje", mensaje);
      setMensaje(""); // Limpiar el input después de enviar
    }
  };

  return (
    <div>
      <h2>Conexión Socket.IO con React</h2>
      <p>Estado: **{socket?.connected ? '✅ Conectado' : '⏳ Desconectado'}**</p>
      {socket?.id && <p>Mi ID de Jugador: **{socket.id}**</p>}
      
      <hr style={{ margin: "20px 0" }} />

      <h3>Chat Global</h3>
      <div style={{ border: "1px solid #ccc", padding: "10px", height: "200px", overflowY: "scroll", marginBottom: "10px" }}>
        {chat.map((msg, index) => (
          <p key={index}>
            <small>{msg.timestamp}</small> | <strong>{msg.idRemitente === socket.id ? "Yo" : msg.idRemitente}:</strong> {msg.contenido}
          </p>
        ))}
      </div>
      <form onSubmit={enviarMensaje}>
        <input
          type="text"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{ width: "80%" }}
          disabled={!socket?.connected}
        />
        <button type="submit" disabled={!socket?.connected}>Enviar</button>
      </form>
    </div>
  );
};

export default GameSocket;