import * as roomService from "../services/roomService.js";
import logger from "../utils/logger.js";

/**
 * Helper: Emit updated player list to a room.
 */
export const emitPlayerList = (io, roomId, players) => {
  io.to(roomId).emit("update_player_list", players.map(p => ({
    email: p.email,
    displayName: p.username || p.firstName || p.email,
    ready: p.ready
  })));
};

export const handleCreateRoom = (io, socket) => {
    // Security: Use session user instead of client-provided user
    const user = socket.request.user; 
    
    if (!user) {
        socket.emit("error_joining", "Usuario no autenticado");
        return;
    }

    const roomId = roomService.createRoom(user, socket.id);
    socket.join(roomId);
    const room = roomService.getRoom(roomId);

    emitPlayerList(io, roomId, room.players);
    socket.emit("room_created", roomId);
};

export const handleJoinRoom = (io, socket, { room_id }) => {
    // Security: Use session user
    const user = socket.request.user;
    
    if (!user) {
        socket.emit("error_joining", "Usuario no autenticado");
        return;
    }

    const result = roomService.joinRoom(room_id, user, socket.id);
    if (result.error) {
      return socket.emit("error_joining", result.error);
    }

    socket.join(room_id);
    socket.emit("joined_room", room_id);
    emitPlayerList(io, room_id, result.room.players);
};

export const handleLeaveRoom = (io, socket, { room_id, user }, checkRoundCompleteCallback) => {
    const room = roomService.removePlayer(room_id, socket.id);
    if (room) {
      socket.leave(room_id);
      emitPlayerList(io, room_id, room.players);
      if (checkRoundCompleteCallback) checkRoundCompleteCallback(room_id);
    }
};

export const handleDisconnect = (io, socket, checkRoundCompleteCallback) => {
    const result = roomService.removePlayerBySocketId(socket.id);
    if (result) {
      const { roomId, room } = result;
      emitPlayerList(io, roomId, room.players);
      if (checkRoundCompleteCallback) checkRoundCompleteCallback(roomId);
    }
};
