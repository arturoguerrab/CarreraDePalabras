import mongoose from "mongoose";

const validatedResponseSchema = new mongoose.Schema({
  category: { type: String, required: true },
  letter: { type: String, required: true },
  word: { type: String, required: true }, // Se guardará en minúsculas para normalizar
  isValid: { type: Boolean, required: true },
  score: { type: Number, default: 1 }, // 1.0 = Perfecto, 0.5 = Typo/Casi, 0 = Inválido
  reason: { type: String }, // Motivo si es inválido
  createdAt: { type: Date, default: Date.now },
});

// Índice compuesto único: Una palabra en una categoría y letra solo se valida una vez
validatedResponseSchema.index({ category: 1, letter: 1, word: 1 }, { unique: true });

const ValidatedResponse = mongoose.model("ValidatedResponse", validatedResponseSchema);

export default ValidatedResponse;