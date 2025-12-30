import ValidatedResponse from "../models/validatedResponseModel.js";
import { CATEGORIES, CATEGORIES_FLEXIBLE } from "../config/gameConstants.js";

export const processRoundResults = async (io, roomId, room) => {
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

  // --- PREPARACIÓN DE DATOS ---
  // Usamos room.players para garantizar un orden consistente en los resultados,
  // independiente de quién envió primero (room.roundData está ordenado por llegada).
  const playersOrdered = room.players.map((player) => {
    const submission = room.roundData.find((entry) => entry.playerId === player.id);
    return {
      id: player.id,
      nombre: player.username || player.firstName || player.email.split("@")[0],
      answers: submission ? submission.answers : {},
    };
  });

  const aiInputData = {};
  categories.forEach((cat) => {
    aiInputData[cat] = playersOrdered.map((p) => p.answers[cat] || "");
  });

  console.log(`📝 Validando Letra: ${room.currentLetter}`);

  try {
    // 1. PREPARACIÓN Y CONSULTA DE CACHÉ
    const uniqueQueries = [];
    const queryMap = new Map();

    categories.forEach((cat) => {
      const words = aiInputData[cat];
      words.forEach((word) => {
        const cleanWord = word.trim();
        if (!cleanWord) return;
        const wordLower = cleanWord.toLowerCase();
        const key = `${cat}|${wordLower}`;
        if (!queryMap.has(key)) {
          queryMap.set(key, null);
          uniqueQueries.push({ category: cat, word: wordLower });
        }
      });
    });

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
          const key = `${doc.category}|${doc.word}`;
          queryMap.set(key, {
            v: doc.isValid ? doc.score || 1 : 0,
            m: doc.reason,
          });
        });
      } catch (err) {
        console.error("⚠️ Error consultando caché:", err);
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
        if (!queryMap.get(key)) {
          missingSet.add(cleanWord);
        }
      });
      if (missingSet.size > 0) {
        missingInputData[cat] = Array.from(missingSet);
        hasMissing = true;
      }
    });

    // 3. LLAMADA A GEMINI
    if (hasMissing) {
      const prompt = `
# ROLE
Expert & High-Speed Judge for the Spanish game "STOP".

# CONTEXT
Target Letter: '${room.currentLetter}'
Language: Spanish (Primary).

# VALIDATION RULES (SYSTEM LOGIC)
1. **Letter Check**: Must start with '${room.currentLetter}'. 
   - Ignore accents (Á=A).
   - For Groups [${CATEGORIES_FLEXIBLE.join(
     ", "
   )}], ignore leading articles: "El, La, Los, Las, Un, Una, The".
2. **Category Match**: Strict semantic validation.
3. **Spelling**: 
   - v=1.0: Perfect.
   - v=0.5: Small typos or phonetic errors (B/V, S/C/Z) but word is clear.
   - v=0.0: Wrong letter, fake word, or empty.

# OUTPUT INSTRUCTION
- Language for 'm' (reason): SPANISH.
- Format: Minified JSON only.
- Tone for 'm': Witty, funny, and very short.

# INPUT DATA
${JSON.stringify(missingInputData)}

# OUTPUT STRUCTURE
{ "categoryName": [{ "v": number, "m": "Mensaje corto en español" }] }
`;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY no definida");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            // Configuración de robustez:
            generationConfig: {
              temperature: 0.2, // Mantiene al juez estricto y consistente
              responseMimeType: "application/json", // Obliga a Gemini a escupir JSON puro
            },
          }),
        }
      );

      const data = await response.json();
      const textResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      // Extracción robusta de JSON
      const firstOpen = textResponse.indexOf("{");
      const lastClose = textResponse.lastIndexOf("}");
      const cleanJson =
        firstOpen !== -1 && lastClose !== -1
          ? textResponse.substring(firstOpen, lastClose + 1)
          : "{}";

      let aiOutput = {};
      try {
        aiOutput = JSON.parse(cleanJson);
      } catch (e) {
        console.error("Error parseando JSON IA", e);
      }

      // 4. GUARDADO EN CACHÉ
      const newValidations = [];
      for (const [cat, results] of Object.entries(aiOutput)) {
        const words = missingInputData[cat];
        if (!words || !results) continue;
        results.forEach((res, idx) => {
          const originalWord = words[idx];
          if (!originalWord) return;
          const wordLower = originalWord.trim().toLowerCase();
          const isValid = res.v > 0;
          newValidations.push({
            category: cat,
            letter: room.currentLetter,
            word: wordLower,
            isValid: isValid,
            score: typeof res.v === "number" ? res.v : isValid ? 1 : 0,
            reason: res.m || "",
          });
          queryMap.set(`${cat}|${wordLower}`, res);
        });
      }
      if (newValidations.length > 0) {
        try {
          await ValidatedResponse.insertMany(newValidations, {
            ordered: false,
          });
        } catch (e) {}
      }
    }

    // 5. RECONSTRUCCIÓN Y PUNTUACIÓN
    const parsedResults = categories.map((cat) => {
      const respuestas = playersOrdered.map((player) => {
        const word = player.answers[cat] || "";
        const cleanWord = word.trim();
        let aiDecision = { v: 0, m: "Vacío" };
        if (cleanWord) {
          const key = `${cat}|${cleanWord.toLowerCase()}`;
          aiDecision = queryMap.get(key) || { v: 0, m: "Error" };
        }
        const isValid = aiDecision.v > 0;
        return {
          nombre: player.nombre,
          palabra: word,
          es_valida: isValid,
          scoreModifier:
            typeof aiDecision.v === "number" ? aiDecision.v : isValid ? 1 : 0,
          mensaje: aiDecision.m || (isValid ? "¡Correcto!" : "Inválido"),
          puntos: 0,
        };
      });
      return { categoria: cat, respuestas };
    });

    parsedResults.forEach((category) => {
      const wordCounts = {};
      category.respuestas.forEach((r) => {
        if (r.es_valida && r.palabra)
          wordCounts[r.palabra.trim().toLowerCase()] =
            (wordCounts[r.palabra.trim().toLowerCase()] || 0) + 1;
      });
      category.respuestas.forEach((r) => {
        if (r.es_valida && r.palabra) {
          const word = r.palabra.trim().toLowerCase();
          r.puntos = (wordCounts[word] > 1 ? 50 : 100) * (r.scoreModifier || 1);
        }
        room.scores[r.nombre] = (room.scores[r.nombre] || 0) + r.puntos;
      });
    });

    const isGameOver = room.config.currentRound >= room.config.totalRounds;
    io.to(roomId).emit("round_results", {
      results: parsedResults,
      scores: room.scores,
      isGameOver,
      round: room.config.currentRound,
      totalRounds: room.config.totalRounds,
    });

    if (!isGameOver) room.config.currentRound++;
    else room.isPlaying = false;
    room.roundData = [];
  } catch (error) {
    console.error("Error en servicio IA:", error);
    io.to(roomId).emit("error_joining", "Error validando resultados.");
    room.roundData = [];
  } finally {
    room.isCalculating = false;
  }
};
