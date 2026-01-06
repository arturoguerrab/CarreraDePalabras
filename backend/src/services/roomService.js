import { customAlphabet } from "nanoid";

// Generador de IDs numéricos de 4 dígitos
const generateRoomId = customAlphabet("0123456789", 4);

// Estado en memoria de las salas
const rooms = {};

/**
 * Obtiene una sala por su ID.
 */
export const getRoom = (roomId) => rooms[roomId];

/**
 * Crea una nueva sala y añade al creador.
 */
export const createRoom = (user, socketId) => {
  const roomId = generateRoomId();
  rooms[roomId] = {
    players: [{ 
      id: socketId, 
      email: user.email, 
      username: user.username, 
      firstName: user.firstName 
    }],
    isPlaying: false,
    scores: {},
    roundData: [],
    usedLetters: [],
    config: { totalRounds: 5, currentRound: 1 }
  };
  return roomId;
};

/**
 * Intenta unir un jugador a una sala.
 */
export const joinRoom = (roomId, user, socketId) => {
  const room = rooms[roomId];
  if (!room) return { error: "La sala no existe." };

  // Cancelar eliminación si estaba programada
  if (room.deleteTimeout) {
    clearTimeout(room.deleteTimeout);
    delete room.deleteTimeout;
  }

  const existingPlayer = room.players.find((p) => p.email === user.email);

  // Bloquear entrada si la partida ya empezó y es un usuario nuevo
  if (room.isPlaying && !existingPlayer) {
    return { error: "La partida ya ha comenzado. No puedes entrar." };
  }

  if (existingPlayer) {
    existingPlayer.id = socketId; // Actualizar socket (reconectado)
  } else {
    room.players.push({ 
      id: socketId, 
      email: user.email, 
      username: user.username, 
      firstName: user.firstName 
    });
  }

  return { room };
};

/**
 * Maneja la desconexión o salida de un jugador.
 * Retorna la sala afectada para notificar a los demás.
 */
export const removePlayer = (roomId, socketId) => {
  const room = rooms[roomId];
  if (!room) return null;

  const index = room.players.findIndex((p) => p.id === socketId);
  if (index !== -1) {
    room.players.splice(index, 1);
    
    // Si la sala queda vacía, programar eliminación
    if (room.players.length === 0) {
      room.deleteTimeout = setTimeout(() => delete rooms[roomId], 5000);
    }
  }
  return room;
};

/**
 * Busca y elimina un jugador por su socketId en todas las salas.
 * Útil para desconexiones abruptas (cerrar pestaña).
 */
export const removePlayerBySocketId = (socketId) => {
  for (const roomId in rooms) {
    const room = rooms[roomId];
    const index = room.players.findIndex((p) => p.id === socketId);
    
    if (index !== -1) {
      const player = room.players[index];
      room.players.splice(index, 1);
      
      if (room.players.length === 0) {
        room.deleteTimeout = setTimeout(() => delete rooms[roomId], 5000);
      }
      return { roomId, room, player };
    }
  }
  return null;
};