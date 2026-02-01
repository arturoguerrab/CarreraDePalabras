import { customAlphabet } from "nanoid";
import { ALL_CATEGORIES } from "../config/gameConstants.js";
import logger from "../utils/logger.js";

// Generador del ID de la sala
const generateRoomId = customAlphabet("0123456789", 4);

// Memoria de rooms activas
const rooms = {};

const ALPHABET_ARRAY = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const getRoom = (roomId) => {
  const room = rooms[roomId];
  if (room) {
    room.lastActivity = Date.now();
  }
  return room;
};

// Creacion de la sala y set de estados iniciales del creador
export const createRoom = (user, socketId) => {
  const roomId = generateRoomId();
  rooms[roomId] = {
    players: [
      {
        id: socketId,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        ready: false,
      },
    ],
    isPlaying: false,
    isCalculating: false,
    scores: {},
    roundData: [],
    usedLetters: [],
    currentLetter: "",
    currentCategories: [],
    config: { totalRounds: 5, currentRound: 1 },
    lastActivity: Date.now(),
  };
  return roomId;
};

// Revisa cada 30 minutos si hay salas abandonadas (sin actividad por 1 hora)
setInterval(
  () => {
    const ONE_HOUR = 60 * 60 * 1000;
    const now = Date.now();
    let deletedCount = 0;

    for (const roomId in rooms) {
      const room = rooms[roomId];
      if (now - room.lastActivity > ONE_HOUR) {
        delete rooms[roomId];
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      logger.info(
        `Garbage Collector: Se eliminaron ${deletedCount} salas inactivas.`,
      );
    }
  },
  30 * 60 * 1000,
);

export const joinRoom = (roomId, user, socketId) => {
  const room = rooms[roomId];
  if (!room) return { error: "La sala no existe." };

  if (room.deleteTimeout) {
    clearTimeout(room.deleteTimeout);
    delete room.deleteTimeout;
  }

  const existingPlayer = room.players.find((p) => p.email === user.email);

  if (room.isPlaying && !existingPlayer) {
    return { error: "La partida ya ha comenzado. No puedes entrar." };
  }

  if (existingPlayer) {
    existingPlayer.id = socketId;
  } else {
    room.players.push({
      id: socketId,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      ready: false,
    });
  }

  return { room };
};

// Preparacion de las letras y categorias de partida
export const prepareNextRound = (roomId) => {
  const room = rooms[roomId];
  if (!room) return null;

  // Filtrar letras que no han sido usadas
  const availableLetters = ALPHABET_ARRAY.filter(
    (l) => !room.usedLetters.includes(l),
  );
  const pool = availableLetters.length > 0 ? availableLetters : ALPHABET_ARRAY;

  const randomLetter = pool[Math.floor(Math.random() * pool.length)];
  room.usedLetters.push(randomLetter);

  const shuffledCategories = [...ALL_CATEGORIES].sort(
    () => 0.5 - Math.random(),
  );

  room.currentLetter = randomLetter;
  room.currentCategories = shuffledCategories.slice(0, 8);
  room.roundData = [];

  return {
    letter: room.currentLetter,
    categories: room.currentCategories,
  };
};

export const removePlayer = (roomId, socketId) => {
  const room = rooms[roomId];
  if (!room) return null;

  const index = room.players.findIndex((p) => p.id === socketId);
  if (index !== -1) {
    room.lastActivity = Date.now();
    room.players.splice(index, 1);
    checkAndScheduleDeletion(roomId);
  }
  return room;
};

export const removePlayerBySocketId = (socketId) => {
  for (const roomId in rooms) {
    const room = rooms[roomId];
    const index = room.players.findIndex((p) => p.id === socketId);

    if (index !== -1) {
      const player = room.players[index];
      room.players.splice(index, 1);
      checkAndScheduleDeletion(roomId);
      return { roomId, room, player };
    }
  }
  return null;
};

// Limpiar salas vacias
const checkAndScheduleDeletion = (roomId) => {
  const room = rooms[roomId];
  if (room && room.players.length === 0) {
    room.deleteTimeout = setTimeout(() => delete rooms[roomId], 10000);
  }
};

// Manejo del estado listo de un jugador para empezar la partida
export const togglePlayerReady = (roomId, socketId) => {
  const room = rooms[roomId];
  if (!room) return null;

  const player = room.players.find((p) => p.id === socketId);
  if (player) {
    player.ready = !player.ready;
  }
  return room;
};

// Reset de todos los estados de los jugadores
export const resetReadiness = (roomId) => {
  const room = rooms[roomId];
  if (!room) return;
  room.players.forEach((p) => (p.ready = false));
};
