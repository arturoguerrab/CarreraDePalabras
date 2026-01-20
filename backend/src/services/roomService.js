import { customAlphabet } from "nanoid";
import { ALL_CATEGORIES } from "../config/gameConstants.js";
import logger from "../utils/logger.js";

// Generator for 4-digit numeric room IDs
const generateRoomId = customAlphabet("0123456789", 4);

// In-memory state for active game rooms
const rooms = {};

/**
 * Retrieves a room by its ID.
 */
export const getRoom = (roomId) => {
  const room = rooms[roomId];
  if (room) {
    room.lastActivity = Date.now();
  }
  return room;
};

/**
 * Creates a new room and sets the initial state for the creator.
 */
export const createRoom = (user, socketId) => {
  const roomId = generateRoomId();
  rooms[roomId] = {
    players: [{
      id: socketId,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      ready: false
    }],
    isPlaying: false,
    isCalculating: false,
    scores: {},
    roundData: [],
    usedLetters: [],
    currentLetter: "",
    currentCategories: [],
    config: { totalRounds: 5, currentRound: 1 },
    lastActivity: Date.now()
  };
  return roomId;
};

// --- GARBAGE COLLECTOR ---
// Revisa cada 30 minutos si hay salas abandonadas (sin actividad por 1 hora)
setInterval(() => {
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
    logger.info(`🧹 Garbage Collector: Se eliminaron ${deletedCount} salas inactivas.`);
  }
}, 30 * 60 * 1000); // Ejecutar cada 30 min

/**
 * Attempts to add a player to a room. Handles reconnections.
 */
export const joinRoom = (roomId, user, socketId) => {
  const room = rooms[roomId];
  if (!room) return { error: "La sala no existe." };

  // Cancel deletion if someone joins back
  if (room.deleteTimeout) {
    clearTimeout(room.deleteTimeout);
    delete room.deleteTimeout;
  }

  const existingPlayer = room.players.find((p) => p.email === user.email);

  // Prevent joining if game is already in progress and player is new
  if (room.isPlaying && !existingPlayer) {
    return { error: "La partida ya ha comenzado. No puedes entrar." };
  }

  if (existingPlayer) {
    existingPlayer.id = socketId; // Update socket ID on reconnection
  } else {
    room.players.push({ 
      id: socketId, 
      email: user.email, 
      username: user.username, 
      firstName: user.firstName,
      ready: false
    });
  }

  return { room };
};

/**
 * Prepares the next round's data (letter and categories).
 * Moved from socketHandler to keep services focused on logic.
 */
export const prepareNextRound = (roomId) => {
  const room = rooms[roomId];
  if (!room) return null;

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const availableLetters = alphabet.split('').filter(l => !room.usedLetters.includes(l));
  const pool = availableLetters.length > 0 ? availableLetters : alphabet.split('');
  
  const randomLetter = pool[Math.floor(Math.random() * pool.length)];
  room.usedLetters.push(randomLetter);

  const shuffledCategories = [...ALL_CATEGORIES].sort(() => 0.5 - Math.random());
  
  room.currentLetter = randomLetter;
  room.currentCategories = shuffledCategories.slice(0, 8);
  room.roundData = [];

  return {
    letter: room.currentLetter,
    categories: room.currentCategories
  };
};

/**
 * Removes a player from a room. Schedules room deletion if empty.
 */
export const removePlayer = (roomId, socketId) => {
  const room = rooms[roomId];
  if (!room) return null;

  const index = room.players.findIndex((p) => p.id === socketId);
  if (index !== -1) {
    room.players.splice(index, 1);
    checkAndScheduleDeletion(roomId);
  }
  return room;
};

/**
 * Global cleanup for disconnected sockets across all rooms.
 */
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

/**
 * Internal helper to cleanup empty rooms after a short grace period.
 */
const checkAndScheduleDeletion = (roomId) => {
  const room = rooms[roomId];
  if (room && room.players.length === 0) {
    // 10 second grace period before cleaning up memory
    room.deleteTimeout = setTimeout(() => delete rooms[roomId], 10000);
  }
};

/**
 * Toggles the ready status of a player.
 */
export const togglePlayerReady = (roomId, socketId) => {
  const room = rooms[roomId];
  if (!room) return null;

  const player = room.players.find(p => p.id === socketId);
  if (player) {
    player.ready = !player.ready;
  }
  return room;
};

/**
 * Resets all players' ready status to false.
 */
export const resetReadiness = (roomId) => {
  const room = rooms[roomId];
  if (!room) return;
  room.players.forEach(p => p.ready = false);
};
