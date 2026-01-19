import mongoose from "mongoose";

/**
 * ValidatedResponse Schema
 * Stores results from AI validations to avoid redundant API calls.
 */
const validatedResponseSchema = new mongoose.Schema({
  category: { type: String, required: true },
  letter: { type: String, required: true },
  word: { type: String, required: true }, // Normalized lowercase word
  isValid: { type: Boolean, required: true },
  score: { type: Number, default: 1 }, // 1.0 = Perfect, 0.5 = Partial/Typo, 0 = Invalid
  reason: { type: String }, // Explanation for the validation result
  createdAt: { type: Date, default: Date.now },
});

// Composite unique index ensures each word/category/letter combo is only validated once.
validatedResponseSchema.index({ category: 1, letter: 1, word: 1 }, { unique: true });

const ValidatedResponse = mongoose.model("ValidatedResponse", validatedResponseSchema);

export default ValidatedResponse;