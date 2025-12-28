import { customAlphabet } from "nanoid";
import "dotenv/config"; // Asegurar que las variables de entorno estén cargadas
import ValidatedResponse from "./models/validatedResponseModel.js";

/**
 * Categorías que requieren validación estricta en español (Diccionario).
 */
const CATEGORIES_STRICT = [
  "Pais",
  "Animal",
  "Fruta/Verdura",
  "Flor/Planta",
  "Parte del cuerpo",
  "Color",
  "Instrumento musical",
  "Deporte",
  "Comida/Plato",
  "Profesión/Oficio",
  "Objeto cotidiano",
];

/**
 * Categorías flexibles que admiten nombres propios, inglés o idiomas originales.
 */
const CATEGORIES_FLEXIBLE = [
  "Ciudad",
  "Nombre de persona",
  "Apellido",
  "Película",
  "Canción",
  "Serie de TV",
  "Videojuego",
  "Personaje animado",
  "Superhéroe",
  "Banda/Artista Musical",
  "Marcas",
];

/**
 * Lista maestra unificada.
 */
const ALL_CATEGORIES = [...CATEGORIES_STRICT, ...CATEGORIES_FLEXIBLE];

/**
 * Maneja la lógica de eventos de Socket.IO.
 * @param {import('socket.io').Server} io - La instancia del servidor de Socket.IO.
 */
const socketHandler = (io) => {
  // Generador de IDs numéricos de 6 dígitos
  const generateRoomId = customAlphabet("0123456789", 4);

  // Podrías usar una estructura más robusta para almacenar las salas en producción
  const rooms = {};

  // Helper para programar la eliminación de la sala con un retraso (evita problemas con Strict Mode/Refrescos)
  const scheduleRoomDeletion = (roomId) => {
    if (rooms[roomId]) {
      if (rooms[roomId].deleteTimeout) clearTimeout(rooms[roomId].deleteTimeout);
      
      console.log(`Sala ${roomId} vacía. Se eliminará en 5 segundos si nadie entra.`);
      rooms[roomId].deleteTimeout = setTimeout(() => {
        if (rooms[roomId] && rooms[roomId].players.length === 0) {
          delete rooms[roomId];
          console.log(`Sala ${roomId} eliminada definitivamente.`);
        }
      }, 5000);
    }
  };

  const cancelRoomDeletion = (roomId) => {
    if (rooms[roomId] && rooms[roomId].deleteTimeout) {
      clearTimeout(rooms[roomId].deleteTimeout);
      delete rooms[roomId].deleteTimeout;
      console.log(`Eliminación de sala ${roomId} cancelada.`);
    }
  };

  io.on("connection", (socket) => {
    console.log(`Un usuario conectado: ${socket.id}`);

    // --- Lógica de Salas para el Juego "Stop" ---

    // Evento para crear una nueva sala de juego
    socket.on("create_room", (user) => {
      const roomId = generateRoomId(); // Genera un ID de sala numérico
      socket.join(roomId);
      rooms[roomId] = {
        // Guardamos un objeto por jugador para tener más datos
        players: [{ 
          id: socket.id, 
          email: user.email,
          username: user.username,
          firstName: user.firstName
        }],
        isPlaying: false,
      };

      console.log(`Usuario ${user.email} creó y se unió a la sala ${roomId}`);
      io.to(roomId).emit(
        "update_player_list",
        rooms[roomId].players.map((p) => ({
          email: p.email,
          displayName: p.username || p.firstName || p.email
        }))
      );
      // Notifica al creador que la sala fue creada con éxito
      socket.emit("room_created", roomId);
    });

    // Evento para unirse a una sala existente
    socket.on("join_room", (data) => {
      const { room_id, user } = data;

      // Verifica si la sala existe
      if (rooms[room_id]) {
        cancelRoomDeletion(room_id); // Cancelar eliminación si estaba programada

        // Lógica para evitar duplicados
        const playerIndex = rooms[room_id].players.findIndex(
          (p) => p.email === user.email
        );

        // Si la partida ya empezó y el usuario NO está en la lista (es nuevo), bloqueamos la entrada
        if (rooms[room_id].isPlaying && playerIndex === -1) {
          socket.emit("error_joining", "La partida ya ha comenzado. No puedes entrar.");
          return;
        }

        socket.join(room_id);

        if (playerIndex !== -1) {
          // Si el jugador ya existe (ej. por un refresco de página), solo actualizamos su socket.id
          rooms[room_id].players[playerIndex].id = socket.id;
        } else {
          // Si es un jugador nuevo en la sala, lo añadimos
          rooms[room_id].players.push({ 
            id: socket.id, 
            email: user.email,
            username: user.username,
            firstName: user.firstName
          });
        }

        console.log(`Usuario ${user.email} se unió a la sala ${room_id}`);

        // Notifica al jugador que se unió con éxito
        socket.emit("joined_room", room_id);

        // Envía la lista actualizada de jugadores a todos en la sala
        io.to(room_id).emit(
          "update_player_list",
          rooms[room_id].players.map((p) => ({
            email: p.email,
            displayName: p.username || p.firstName || p.email
          }))
        );
      } else {
        // Si la sala no existe, notifica al jugador
        socket.emit("error_joining", "La sala no existe.");
      }
    });

    // Evento para iniciar el juego
    socket.on("start_game", (data) => {
      const { room_id: roomId, rounds } = typeof data === 'object' ? data : { room_id: data, rounds: 5 };
      
      const room = rooms[roomId];
      if (!room) return;

      // Validar que quien inicia sea el dueño (primer jugador en la lista)
      if (room.players[0].id !== socket.id) {
        return; // Ignorar intento de inicio si no es el dueño
      }

      // 1. Emitir evento de cuenta regresiva (3 segundos)
      io.to(roomId).emit("start_countdown", 3);

      // 2. Esperar antes de iniciar la lógica del juego
      setTimeout(() => {
        if (!rooms[roomId]) return; // Verificar que la sala siga existiendo

        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const randomLetter =
          alphabet[Math.floor(Math.random() * alphabet.length)];

        // Seleccionar 8 categorías aleatorias
        const shuffled = [...ALL_CATEGORIES].sort(() => 0.5 - Math.random());
        const selectedCategories = shuffled.slice(0, 8);

        console.log(`Juego iniciado en sala ${roomId} con letra ${randomLetter}`);

        // Inicializar datos de la ronda
        rooms[roomId].roundData = [];
        rooms[roomId].currentLetter = randomLetter;
        rooms[roomId].currentCategories = selectedCategories;
        rooms[roomId].isPlaying = true;
        rooms[roomId].scores = {};
        rooms[roomId].config = { totalRounds: rounds, currentRound: 1 };

        io.to(roomId).emit("game_started", {
          letter: randomLetter,
          categories: selectedCategories,
        });
      }, 3000);
    });

    // Evento para siguiente ronda
    socket.on("next_round", (roomId) => {
      const room = rooms[roomId];
      if (room) {
        // Validar que quien inicia sea el dueño (primer jugador en la lista)
        if (room.players[0].id !== socket.id) {
          return;
        }

        // 1. Emitir evento de cuenta regresiva
        io.to(roomId).emit("start_countdown", 3);

        // 2. Esperar 3 segundos
        setTimeout(() => {
          if (!rooms[roomId]) return;

          const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
          const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
          
          const shuffled = [...ALL_CATEGORIES].sort(() => 0.5 - Math.random());
          const selectedCategories = shuffled.slice(0, 8);

          rooms[roomId].currentLetter = randomLetter;
          rooms[roomId].currentCategories = selectedCategories;
          rooms[roomId].roundData = [];
          
          io.to(roomId).emit("game_started", {
              letter: randomLetter,
              categories: selectedCategories
          });
        }, 3000);
      }
    });

    // Evento para reiniciar el juego (volver al lobby)
    socket.on("reset_game", (roomId) => {
      const room = rooms[roomId];
      if (room) {
        // Validar que quien inicia sea el dueño (primer jugador en la lista)
        if (room.players[0].id !== socket.id) return;

        room.isPlaying = false;
        room.scores = {};
        room.roundData = [];
        
        io.to(roomId).emit("game_reset");
      }
    });

    // Evento de ejemplo para una acción dentro del juego (ej. alguien dice "Stop")
    socket.on("game_action", ({ roomId, action }) => {
      console.log(`Acción '${action}' en la sala ${roomId} por ${socket.id}`);
      // Retransmite la acción a TODOS en la sala, incluido quien la envió
      io.to(roomId).emit("action_received", { player: socket.id, action });
    });

    // Función auxiliar para verificar si todos respondieron
    const checkRoundComplete = async (roomId) => {
      const room = rooms[roomId];
      if (!room) return;

      // Evitar múltiples llamadas si ya se está calculando
      if (room.isCalculating) return;

      // Si tenemos respuestas de todos los jugadores conectados
      if (room.roundData.length >= room.players.length) {
        room.isCalculating = true; // Bloquear

        // 1. Avisar al frontend que estamos calculando (Loading)
        io.to(roomId).emit("calculating_results");

        // Usar las categorías guardadas en la sala (o fallback por seguridad)
        const categories = room.currentCategories || [
          "Color",
          "Ciudad",
          "Animal",
          "Nombre",
          "Fruta",
        ];

        // --- PREPARACIÓN DE DATOS OPTIMIZADA (Ahorro de Tokens) ---
        // 1. Ordenamos jugadores para mapear respuestas correctamente al volver
        const playersOrdered = room.roundData.map((entry) => {
          const player = room.players.find((p) => p.id === entry.playerId);
          return {
            id: entry.playerId,
            nombre: player ? (player.username || player.firstName || player.email.split("@")[0]) : "Anon",
            answers: entry.answers || {}
          };
        });

        // 2. Creamos un input minimalista para la IA: { "Color": ["Rojo", "Azul"], "Animal": ["Perro", ""] }
        const aiInputData = {};
        categories.forEach(cat => {
          aiInputData[cat] = playersOrdered.map(p => p.answers[cat] || "");
        });

        // DEBUG: Imprimir lo que se envía a la IA para verificar errores
        console.log(`📝 Validando Letra: ${room.currentLetter}`);
        console.log("📦 Payload a IA:", JSON.stringify(aiInputData));

        // --- INICIO VALIDACIÓN (CACHE + IA) ---
        try {
          // 1. PREPARACIÓN Y CONSULTA DE CACHÉ
          // Identificamos palabras únicas para no validar lo mismo 2 veces en la misma ronda
          const uniqueQueries = [];
          const queryMap = new Map(); // Key: "cat|word_lower" -> { v, m }

          categories.forEach((cat) => {
            const words = aiInputData[cat];
            words.forEach((word) => {
              const cleanWord = word.trim();
              if (!cleanWord) return;

              const wordLower = cleanWord.toLowerCase();
              const key = `${cat}|${wordLower}`;

              if (!queryMap.has(key)) {
                queryMap.set(key, null); // Marcador 'null' significa "pendiente de validar"
                uniqueQueries.push({ category: cat, word: wordLower });
              }
            });
          });

          // Consultamos la DB para ver qué ya tenemos validado
          if (uniqueQueries.length > 0) {
            try {
              const cachedResults = await ValidatedResponse.find({
                letter: room.currentLetter,
                $or: uniqueQueries.map((q) => ({
                  category: q.category,
                  word: q.word,
                })),
              });

              cachedResults.forEach((doc) => {
                const key = `${doc.category}|${doc.word}`; // doc.word viene lowercase de DB
                queryMap.set(key, { v: doc.isValid ? (doc.score || 1) : 0, m: doc.reason });
              });
            } catch (err) {
              console.error("⚠️ Error consultando caché (continuando con IA):", err);
            }
          }

          // 2. FILTRADO: ¿Qué falta enviar a la IA?
          const missingInputData = {};
          let hasMissing = false;

          categories.forEach((cat) => {
            const missingSet = new Set();
            aiInputData[cat].forEach((word) => {
              const cleanWord = word.trim();
              if (!cleanWord) return;
              
              const key = `${cat}|${cleanWord.toLowerCase()}`;
              // Si no está en el mapa (es null), hay que preguntarle a Gemini
              if (!queryMap.get(key)) {
                missingSet.add(cleanWord); // Enviamos la palabra original para contexto
              }
            });

            if (missingSet.size > 0) {
              missingInputData[cat] = Array.from(missingSet);
              hasMissing = true;
            }
          });

          // 3. LLAMADA A GEMINI (Solo si hay palabras nuevas)
          if (hasMissing) {
            const prompt = `
  ROLE: Fair, Witty and Knowledgeable Judge for the game "STOP" (Basta).
  TARGET LETTER: '${room.currentLetter}' (Case-insensitive, ignore accents).

  VALIDATION GROUPS:
  - GROUP A (Strict Spanish only): [${CATEGORIES_STRICT.join(", ")}]. 
    Words like "Red" or "Cat" are v=0 for letter R or C (Must be "Rojo" or "Gato").
  - GROUP B (Flexible/Original Language): [${CATEGORIES_FLEXIBLE.join(", ")}]. 
    Original titles/names allowed (e.g., "Let it be" is v=1).

  RULES:
  1. START LETTER: Word MUST start with '${room.currentLetter}'. 
     - EXCEPTION: For Bands, Movies, Series, ignore leading articles ("The", "El", "La", "Los"). 
     - Example: Letter R -> "The Rolling Stones" is v=1. Letter T -> "The Rolling Stones" is v=0 (starts with R).
  2. CATEGORY CHECK: 
     - Reject Artist names in "Canción" (e.g. "Shakira" is v=0) and Actor names in "Película".
     - For "Objeto cotidiano", reject weapons (e.g. "Cañón"), vehicles, or huge things. Must be a common household/personal item.
  3. VALIDITY: Word must exist AND strictly belong to the category. (e.g. "Indu" is a culture, not an Animal -> v=0). Reject plausible-sounding inventions.
  4. FLEXIBILITY: Accept minor typos (e.g. "Fast and Furios" is v=0.5).
  5. NO CHEATING: Reject invented words, forced prefixes, filler adjectives, or GENERIC words that match the category name (e.g. "Verdura" for "Fruta/Verdura" is v=0).

  INPUT DATA (JSON): 
  ${JSON.stringify(missingInputData)}

  OUTPUT INSTRUCTION:
  Return ONLY a minified JSON object with the same keys.
  Maintain the exact order of the input arrays.
  Format: { "categoryName": [{ "v": 1|0.5|0, "m": "Spanish comment (max 10 words). v=1: Perfect (Praise). v=0.5: Typo (Warn). v=0: Invalid (Sarcasm)." }] }
        `;
            
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error("GEMINI_API_KEY no está definida");

            // ... (Lógica de fetch con reintentos igual que antes) ...
            let data;
            let retries = 0;
            const maxRetries = 2;

            while (true) {
              const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                }
              );

              if (response.ok) {
                data = await response.json();
                break;
              }
              // ... (Manejo de errores de cuota igual que antes) ...
              const errorBody = await response.text();
              if ((response.status === 429 || errorBody.includes("quota")) && retries < maxRetries) {
                await new Promise((r) => setTimeout(r, 10000));
                retries++;
              } else {
                throw new Error(`Error API Gemini: ${response.status}`);
              }
            }

            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
            
            // Extracción robusta de JSON: Busca el primer objeto JSON válido balanceando llaves
            let cleanJson = "{}";
            const firstOpen = textResponse.indexOf("{");
            
            if (firstOpen !== -1) {
              let braceCount = 0;
              let inString = false;
              let isEscaped = false;
              
              for (let i = firstOpen; i < textResponse.length; i++) {
                const char = textResponse[i];
                if (inString) {
                  if (isEscaped) isEscaped = false;
                  else if (char === "\\") isEscaped = true;
                  else if (char === '"') inString = false;
                } else {
                  if (char === '"') inString = true;
                  else if (char === "{") braceCount++;
                  else if (char === "}") {
                    braceCount--;
                    if (braceCount === 0) {
                      cleanJson = textResponse.substring(firstOpen, i + 1);
                      break;
                    }
                  }
                }
              }
            }

            let aiOutput;
            try {
              aiOutput = JSON.parse(cleanJson);
            } catch (error) {
              console.error("Error parseando JSON de IA:", error);
              console.error("Respuesta original:", textResponse);
              aiOutput = {}; // Fallback seguro para no romper el flujo
            }
            
            // 4. GUARDADO EN CACHÉ (DB)
            const newValidations = [];
            for (const [cat, results] of Object.entries(aiOutput)) {
              const words = missingInputData[cat];
              if (!words || !results) continue;

              results.forEach((res, idx) => {
                const originalWord = words[idx];
                if (!originalWord) return;

                const wordLower = originalWord.trim().toLowerCase();
                const isValid = res.v > 0;

                // Agregamos a la lista para guardar en DB
                newValidations.push({
                  category: cat,
                  letter: room.currentLetter,
                  word: wordLower,
                  isValid: isValid,
                  score: typeof res.v === 'number' ? res.v : (isValid ? 1 : 0),
                  reason: res.m || "",
                });

                // Actualizamos el mapa en memoria para usarlo YA
                queryMap.set(`${cat}|${wordLower}`, res);
              });
            }

            if (newValidations.length > 0) {
              try {
                // insertMany con ordered: false para que si uno falla (duplicado), los demás se guarden
                await ValidatedResponse.insertMany(newValidations, { ordered: false });
                console.log(`💾 Guardadas ${newValidations.length} nuevas validaciones en caché.`);
              } catch (e) {
                // Ignoramos errores de duplicados (E11000) silenciosamente
                if (e.code !== 11000) console.error("Error guardando caché:", e);
              }
            }
          }

          // 5. RECONSTRUCCIÓN DE RESULTADOS (Usando queryMap: Cache + IA)
          const parsedResults = categories.map((cat) => {
            const respuestas = playersOrdered.map((player) => {
              const word = player.answers[cat] || "";
              const cleanWord = word.trim();
              let aiDecision = { v: 0, m: "Vacío" };

              if (cleanWord) {
                const key = `${cat}|${cleanWord.toLowerCase()}`;
                // Recuperamos del mapa (que ya tiene datos de DB y de IA)
                aiDecision = queryMap.get(key) || { v: 0, m: "Error validación" };
              }

              const isValid = aiDecision.v > 0;
              return {
                nombre: player.nombre,
                palabra: word,
                es_valida: isValid,
                scoreModifier: typeof aiDecision.v === 'number' ? aiDecision.v : (isValid ? 1 : 0),
                mensaje: aiDecision.m || (isValid ? "¡Correcto!" : "Inválido"),
                puntos: 0, // Se calcula abajo
              };
            });
            return { categoria: cat, respuestas };
          });

          // --- SISTEMA DE PUNTUACIÓN (Backend) ---
          parsedResults.forEach(category => {
            const wordCounts = {};
            
            // 1. Contar frecuencias de palabras válidas (normalizadas)
            category.respuestas.forEach(r => {
              if (r.es_valida && r.palabra) {
                const word = r.palabra.trim().toLowerCase();
                wordCounts[word] = (wordCounts[word] || 0) + 1;
              }
            });

            // 2. Asignar puntos
            category.respuestas.forEach(r => {
              if (r.es_valida && r.palabra) {
                const word = r.palabra.trim().toLowerCase();
                // Si la palabra se repite más de una vez, 50 puntos. Si es única, 100.
                r.puntos = (wordCounts[word] > 1 ? 50 : 100) * (r.scoreModifier || 1);
              } else {
                r.puntos = 0;
              }

              // 3. Acumular en el score global de la sala
              room.scores[r.nombre] = (room.scores[r.nombre] || 0) + r.puntos;
            });
          });

          // Verificar si el juego terminó
          const isGameOver = room.config.currentRound >= room.config.totalRounds;

          io.to(roomId).emit("round_results", {
            results: parsedResults,
            scores: room.scores,
            isGameOver: isGameOver,
            round: room.config.currentRound,
            totalRounds: room.config.totalRounds
          });

          if (!isGameOver) {
            room.config.currentRound++;
          } else {
            room.isPlaying = false; // Juego terminado
          }
          room.roundData = []; // Limpiar datos solo tras éxito
        } catch (error) {
          console.error("Error validando con IA:", error);
          io.to(roomId).emit(
            "error_joining",
            "Error al validar resultados con la IA."
          );
          room.roundData = []; // Limpiar datos para evitar bloqueo de la sala y permitir reintentar
        } finally {
          room.isCalculating = false; // Desbloquear siempre, pase lo que pase
        }
        // --- FIN VALIDACIÓN IA ---
      }
    };

    // Alguien presionó STOP
    socket.on("stop_round", ({ roomId, answers }) => {
      const room = rooms[roomId];
      if (room) {
        // 2. Evitar duplicados: Si este socket ya envió datos, ignorar.
        if (room.roundData.find((d) => d.playerId === socket.id)) return;

        room.roundData.push({ playerId: socket.id, answers });
        // Avisar a los demás que envíen sus respuestas YA
        socket.to(roomId).emit("force_submit");
        checkRoundComplete(roomId);
      }
    });

    // Recibir respuestas forzadas de los demás
    socket.on("submit_answers", ({ roomId, answers }) => {
      const room = rooms[roomId];
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
      if (rooms[room_id] && user) {
        socket.leave(room_id);
        console.log(
          `Usuario ${user.email} salió voluntariamente de la sala ${room_id}`
        );

        // Eliminar al jugador de la lista
        const playerIndex = rooms[room_id].players.findIndex(
          (p) => p.id === socket.id
        );
        if (playerIndex !== -1) {
          rooms[room_id].players.splice(playerIndex, 1);
          
          // Si no quedan jugadores, destruir la sala
          if (rooms[room_id].players.length === 0) {
            scheduleRoomDeletion(room_id);
            return;
          }
        }

        io.to(room_id).emit(
          "update_player_list",
          rooms[room_id].players.map((p) => ({
            email: p.email,
            displayName: p.username || p.firstName || p.email
          }))
        );
      }
    });

    socket.on("disconnect", () => {
      console.log(`Usuario desconectado: ${socket.id}`);
      // Buscar en todas las salas si este socket.id estaba en alguna
      for (const roomId in rooms) {
        const room = rooms[roomId];
        const playerIndex = room.players.findIndex(
          (player) => player.id === socket.id
        );

        // Si encontramos al jugador en la sala
        if (playerIndex !== -1) {
          const disconnectedPlayer = room.players[playerIndex];
          console.log(
            `Jugador ${disconnectedPlayer.email} salió de la sala ${roomId}`
          );

          // Eliminar al jugador de la lista
          room.players.splice(playerIndex, 1);

          // Si no quedan jugadores, destruir la sala
          if (room.players.length === 0) {
            scheduleRoomDeletion(roomId);
          } else {
            // Notificar a los jugadores restantes en la sala (el primero ahora es el nuevo dueño)
            io.to(roomId).emit(
              "update_player_list",
              room.players.map((p) => ({
                email: p.email,
                displayName: p.username || p.firstName || p.email
              }))
            );
          }
          break; // Salimos del bucle una vez encontrado y eliminado
        }
      }
    });
  });
};

export default socketHandler;
