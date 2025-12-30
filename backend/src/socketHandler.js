import { ALL_CATEGORIES } from "./config/gameConstants.js";
import { processRoundResults } from "./services/aiJudgeService.js";
import * as roomService from "./services/roomService.js";

/**
 * Maneja la lógica de eventos de Socket.IO.
 * @param {import('socket.io').Server} io - La instancia del servidor de Socket.IO.
 */
const socketHandler = (io) => {
  // Helper para iniciar una ronda (evita duplicar código en start_game y next_round)
  const startRoundLogic = (roomId) => {
    const room = roomService.getRoom(roomId);
    if (!room) return;

    io.to(roomId).emit("start_countdown", 3);

    setTimeout(() => {
      // Verificar que la sala siga existiendo tras el timeout
      if (!roomService.getRoom(roomId)) return;

      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
      const shuffled = [...ALL_CATEGORIES].sort(() => 0.5 - Math.random());
      
      room.currentLetter = randomLetter;
      room.currentCategories = shuffled.slice(0, 8);
      room.roundData = [];
      
      io.to(roomId).emit("game_started", {
        letter: room.currentLetter,
        categories: room.currentCategories,
      });
    }, 3000);
  };

  // Función auxiliar para verificar si todos respondieron
  const checkRoundComplete = async (roomId) => {
    const room = roomService.getRoom(roomId);
    if (!room || room.isCalculating) return;

    // Si tenemos respuestas de todos los jugadores conectados
    if (room.roundData.length >= room.players.length) {
      await processRoundResults(io, roomId, room);
    }
  };

  io.on("connection", (socket) => {
    console.log(`Un usuario conectado: ${socket.id}`);

    // Evento para crear una nueva sala de juego
    socket.on("create_room", (user) => {
      const roomId = roomService.createRoom(user, socket.id);
      socket.join(roomId);
      const room = roomService.getRoom(roomId);

      console.log(`Usuario ${user.email} creó y se unió a la sala ${roomId}`);
      io.to(roomId).emit(
        "update_player_list",
        room.players.map((p) => ({
          email: p.email,
          displayName: p.username || p.firstName || p.email
        }))
      );
      socket.emit("room_created", roomId);
    });

    // Evento para unirse a una sala existente
    socket.on("join_room", (data) => {
      const { room_id, user } = data;
      const result = roomService.joinRoom(room_id, user, socket.id);

      if (result.error) {
        socket.emit("error_joining", result.error);
        return;
      }

      socket.join(room_id);
      console.log(`Usuario ${user.email} se unió a la sala ${room_id}`);
      socket.emit("joined_room", room_id);

      io.to(room_id).emit(
        "update_player_list",
        result.room.players.map((p) => ({
          email: p.email,
          displayName: p.username || p.firstName || p.email
        }))
      );
    });

    // Evento para iniciar el juego
    socket.on("start_game", (data) => {
      const { room_id: roomId, rounds } = typeof data === 'object' ? data : { room_id: data, rounds: 5 };
      const room = roomService.getRoom(roomId);
      
      if (room && room.players[0].id === socket.id) {
        room.isPlaying = true;
        room.scores = {};
        room.config = { totalRounds: rounds, currentRound: 1 };
        startRoundLogic(roomId);
      }
    });

    // Evento para siguiente ronda
    socket.on("next_round", (roomId) => {
      const room = roomService.getRoom(roomId);
      if (room && room.players[0].id === socket.id) {
        startRoundLogic(roomId);
      }
    });

    // Evento para reiniciar el juego (volver al lobby)
    socket.on("reset_game", (roomId) => {
      const room = roomService.getRoom(roomId);
      if (room && room.players[0].id === socket.id) {
        room.isPlaying = false;
        room.scores = {};
        room.roundData = [];
        io.to(roomId).emit("game_reset");
      }
    });

    // Alguien presionó STOP
    socket.on("stop_round", ({ roomId, answers }) => {
      const room = roomService.getRoom(roomId);
      if (room) {
        // 2. Evitar duplicados: Si este socket ya envió datos, ignorar.
        if (room.roundData.find((d) => d.playerId === socket.id)) return;

        room.roundData.push({ playerId: socket.id, answers });
        // Avisar a los demás que envíen sus respuestas YA
        socket.to(roomId).emit("force_submit");
        checkRoundComplete(roomId);
      } else {
        // Si la sala no existe (ej. reinicio de servidor), avisar al cliente para desbloquearlo
        socket.emit("error_joining", "La sala no existe o ha expirado.");
      }
    });

    // Recibir respuestas forzadas de los demás
    socket.on("submit_answers", ({ roomId, answers }) => {
      const room = roomService.getRoom(roomId);
      if (room) {
        // Evitar duplicados si el socket envía varias veces
        const exists = room.roundData.find((d) => d.playerId === socket.id);
        if (!exists) {
          room.roundData.push({ playerId: socket.id, answers });
          checkRoundComplete(roomId);
        }
      }
    });

    // Evento para salir de una sala voluntariamente (navegación)
    socket.on("leave_room", (data) => {
      const { room_id, user } = data;
      const room = roomService.removePlayer(room_id, socket.id);
      
      if (room) {
        socket.leave(room_id);
        console.log(
          `Usuario ${user.email} salió voluntariamente de la sala ${room_id}`
        );

        io.to(room_id).emit(
          "update_player_list",
          room.players.map((p) => ({
            email: p.email,
            displayName: p.username || p.firstName || p.email
          }))
        );

        // Verificar si al salir este jugador, la ronda debe terminar (si los demás ya respondieron)
        checkRoundComplete(room_id);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Usuario desconectado: ${socket.id}`);
      const result = roomService.removePlayerBySocketId(socket.id);
      
      if (result) {
        const { roomId, room, player } = result;
        console.log(`Jugador ${player.email} salió de la sala ${roomId}`);
        
        io.to(roomId).emit(
          "update_player_list",
          room.players.map((p) => ({
            email: p.email,
            displayName: p.username || p.firstName || p.email
          }))
        );

        // Verificar si al desconectarse este jugador, la ronda debe terminar
        checkRoundComplete(roomId);
      }
    });
  });
};

export default socketHandler;
