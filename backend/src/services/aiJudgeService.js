import { GoogleGenAI } from "@google/genai";
import ValidatedResponse from "../models/validatedResponseModel.js";
import { CATEGORIES, CATEGORIES_FLEXIBLE } from "../config/gameConstants.js";
import config from "../config/env.js";
import logger from "../utils/logger.js";

/**
 * AI JUDGE SERVICE
 *
 * Este servicio se encarga de:
 * 1. Recibir las respuestas de los jugadores.
 * 2. Verificar si ya tenemos esas palabras validadas en la base de datos.
 * 3. Si hay palabras nuevas, preguntarle a la IA (Gemini).
 * 4. Calcular los puntos según las reglas del juego.
 */

// Normaliza una cadena para comparaciones (quita acentos, pasa a minúsculas).
const normalize = (str) =>
  str
    ? str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
    : "";

// Busca palabras en la base de datos para no preguntarle a la IA lo que ya sabemos.
const fetchCachedValidations = async (letter, uniqueWordsMap) => {
  if (uniqueWordsMap.size === 0) return new Map();

  const results = new Map();
  const queries = Array.from(uniqueWordsMap.values()).map((i) => ({
    category: i.c,
    word: normalize(i.w),
  }));

  const cachedDocs = await ValidatedResponse.find({
    letter: letter,
    $or: queries,
  });

  cachedDocs.forEach((doc) => {
    results.set(`${doc.category}|${doc.word}`, {
      v: doc.isValid ? doc.score || 1 : 0,
      m: doc.reason,
    });
  });

  return results;
};

//Llamada a la API de Gemini para validar las palabras que no esten en base de datos
const getAIValidations = async (letter, missingForAI) => {
  if (Object.keys(missingForAI).length === 0 || !config.GEMINI_API_KEY)
    return {};

  const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });

  const prompt = `
# ROLE
Expert & Witty Judge for the Spanish game "STOP".

# CONTEXT
- Target Letter: '${letter}'
- Strictly Spanish Categories: ${CATEGORIES.join(", ")}
- Flexible Categories (English/Original Names allowed): ${CATEGORIES_FLEXIBLE.join(", ")}

# VALIDATION RULES
1. **Letter Check**: Word must start with '${letter}'. This is a STRICT orthographic requirement. Ignore accents (e.g., 'Á' counts as 'A').
2. **Category Logic**:
   - Strict: Must be valid Spanish.
   - Flexible: Accept original language/names (Brands, Movies).
3. **Special Letters**: Words starting with 'CH' belong to 'C', and 'LL' to 'L'.
4. **No Phonetic Cheating**: Strictly REJECT words where the first letter was changed to force a match (e.g., if letter is 'K', 'KASA' is 0.0 because 'Casa' starts with 'C').
5. **Accents & Orthography**: Do NOT penalize for missing or extra accents in the rest of the word.
6. **Scoring (v)**: 1.0 = Correct, 0.5 = Minor typo (but NOT in the first letter), 0.0 = Wrong/Cheating/Empty.

# INPUT DATA
${JSON.stringify(missingForAI)}

# OUTPUT INSTRUCTIONS
Return strictly JSON: { "categoryName": [{ "w": "word", "v": number, "m": "short witty message in Spanish" }] }
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    logger.error("AI Error:", error.message);
    return {};
  }
};

//Guarda las nuevas validaciones de la IA en la DB para usarlas en el futuro.
const cacheNewValidations = (letter, aiData) => {
  const newDocs = [];
  for (const cat in aiData) {
    if (Array.isArray(aiData[cat])) {
      aiData[cat].forEach((res) => {
        if (res.w) {
          newDocs.push({
            category: cat,
            letter: letter,
            word: normalize(res.w),
            isValid: res.v > 0,
            score: res.v,
            reason: res.m,
          });
        }
      });
    }
  }

  if (newDocs.length > 0) {
    ValidatedResponse.insertMany(newDocs, { ordered: false }).catch(() =>
      logger.info("Nota: Algunas palabras ya estaban en caché."),
    );
  }
};

// Función Principal
export const processRoundResults = async (io, roomId, room) => {
  try {
    room.isCalculating = true;
    io.to(roomId).emit("calculating_results");

    // Destructuración segura con valores por defecto
    const {
      currentLetter = "",
      currentCategories = [],
      players = [],
      roundData = [],
      config: gameConfig = { currentRound: 1, totalRounds: 5 },
      scores = {},
    } = room;

    // 1. Organizar respuestas
    const playerResponses = players.map((p) => ({
      id: p.id,
      name: p.username || p.firstName || "Jugador",
      answers: roundData.find((r) => r.playerId === p.id)?.answers || {},
    }));

    // 2. Identificar palabras únicas para validar
    const uniqueWordsMap = new Map();
    currentCategories.forEach((cat) => {
      playerResponses.forEach((p) => {
        const word = (p.answers[cat] || "").trim();
        if (word)
          uniqueWordsMap.set(`${cat}|${normalize(word)}`, { w: word, c: cat });
      });
    });

    // 3. Buscar en Caché (DB)
    const validationResults = await fetchCachedValidations(
      currentLetter,
      uniqueWordsMap,
    );

    // 4. Procesar faltantes con IA
    const missingForAI = {};
    uniqueWordsMap.forEach(({ w, c }, key) => {
      if (!validationResults.has(key)) {
        if (!missingForAI[c]) missingForAI[c] = [];
        missingForAI[c].push(w);
      }
    });

    if (Object.keys(missingForAI).length > 0) {
      const aiResponse = await getAIValidations(currentLetter, missingForAI);

      // Actualizar mapa de validaciones con lo que dijo la IA
      if (aiResponse) {
        for (const cat in aiResponse) {
          if (Array.isArray(aiResponse[cat])) {
            aiResponse[cat].forEach((res) => {
              if (res && res.w) {
                validationResults.set(`${cat}|${normalize(res.w)}`, {
                  v: res.v,
                  m: res.m,
                });
              }
            });
          }
        }
        // Guardar en caché para siempre
        cacheNewValidations(currentLetter, aiResponse);
      }
    }

    // 5. Calcular Puntajes Finales
    const formattedResults = currentCategories.map((cat) => {
      const categoryAnswers = playerResponses.map((p) => {
        const word = (p.answers[cat] || "").trim();
        const val = validationResults.get(`${cat}|${normalize(word)}`) || {
          v: 0,
          m: word ? "No validado" : "Vacío",
        };

        return {
          nombre: p.name,
          palabra: word,
          es_valida: val.v > 0,
          scoreModifier: val.v,
          mensaje: val.m,
          puntos: 0,
        };
      });

      // Lógica de repetidos: 100 si eres único, 50 si alguien más puso lo mismo
      const wordCounts = {};
      categoryAnswers
        .filter((a) => a.es_valida)
        .forEach((a) => {
          const w = normalize(a.palabra);
          wordCounts[w] = (wordCounts[w] || 0) + 1;
        });

      categoryAnswers.forEach((a) => {
        if (a.es_valida) {
          const isRepeated = wordCounts[normalize(a.palabra)] > 1;
          a.puntos = (isRepeated ? 50 : 100) * a.scoreModifier;
          scores[a.nombre] = (scores[a.nombre] || 0) + a.puntos;
        }
      });

      return { categoria: cat, respuestas: categoryAnswers };
    });

    // 6. Enviar resultados y actualizar estado del juego
    const isGameOver = gameConfig.currentRound >= gameConfig.totalRounds;

    io.to(roomId).emit("round_results", {
      results: formattedResults,
      scores,
      isGameOver,
      round: gameConfig.currentRound,
      totalRounds: gameConfig.totalRounds,
      stoppedBy: room.stoppedBy || null,
    });

    if (isGameOver) room.isPlaying = false;
    else gameConfig.currentRound++;

    room.roundData = [];
    room.stoppedBy = null;
  } catch (error) {
    logger.error("Error en el Juez:", error);
    io.to(roomId).emit("error_joining", "Hubo un error al procesar la ronda.");
  } finally {
    room.isCalculating = false;
  }
};
