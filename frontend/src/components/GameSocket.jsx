import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Define la URL de tu servidor Node.js/Express
// Asegúrate de que coincida con el puerto donde estás escuchando (ej. 3000)
const SERVER_URL = 'http://localhost:3000';

const GameSocket = () => {
  // Estado para la conexión del socket y los datos del juego
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState([]);
  const [miId, setMiId] = useState('');
  
  // Usaremos una referencia para el objeto socket
  const socketRef = React.useRef(null);

  // Hook de efecto para manejar el ciclo de vida del socket
  useEffect(() => {
    // 1. CONEXIÓN: Crear la instancia del socket
    const socket = io(SERVER_URL);
    socketRef.current = socket; // Guardamos la referencia

    // 2. ESCUCHA DE EVENTOS PRINCIPALES
    
    // Al conectar exitosamente
    socket.on('connect', () => {
      setIsConnected(true);
      setMiId(socket.id);
      console.log('🔌 Conectado a Socket.IO con ID:', socket.id);
    });

    // Al desconectar
    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Desconectado de Socket.IO');
    });

    // Escucha de actualizaciones del juego (Ejemplo de evento de servidor)
    socket.on('actualizacion_juego', (data) => {
      console.log(`Actualización recibida de jugador ${data.id}:`, data.posicion);
      // Aquí actualizarías el estado de `players` basándote en `data`
    });

    // 3. LIMPIEZA: Cierra el socket al desmontar el componente
    return () => {
      console.log('Limpiando la conexión...');
      socket.disconnect();
    };
    
  }, []); // El array vacío asegura que solo se ejecute al montar/desmontar

  // Función para enviar una acción al servidor
  const enviarMiMovimiento = (posicion) => {
    if (socketRef.current && isConnected) {
      console.log('Enviando movimiento:', posicion);
      // 'movimiento' es el nombre del evento que el servidor está escuchando
      socketRef.current.emit('movimiento', posicion);
    }
  };

  // Simulación: enviar un movimiento al hacer clic
  const handleMove = () => {
      enviarMiMovimiento({ x: Math.random() * 100, y: Math.random() * 100 });
  };


  return (
    <div>
      <h2>Conexión Socket.IO con React</h2>
      <p>Estado: **{isConnected ? '✅ Conectado' : '⏳ Desconectado/Reconectando'}**</p>
      {miId && <p>Mi ID de Jugador: **{miId}**</p>}
      
      <button 
        onClick={handleMove} 
        disabled={!isConnected}
      >
        Enviar Movimiento Aleatorio
      </button>

      {/* Aquí podrías renderizar la lista de jugadores */}
    </div>
  );
};

export default GameSocket;