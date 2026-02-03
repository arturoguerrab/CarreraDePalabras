import mongoose from "mongoose";

const validatedResponseSchema = new mongoose.Schema({
	category: { type: String, required: true },
	letter: { type: String, required: true },
	word: { type: String, required: true },
	isValid: { type: Boolean, required: true },
	score: { type: Number, default: 1, min: 0, max: 1 },
	reason: { type: String },
	createdAt: { type: Date, default: Date.now },
});

validatedResponseSchema.index(
	{ category: 1, letter: 1, word: 1 },
	{ unique: true },
);

const ValidatedResponse = mongoose.model(
	"ValidatedResponse",
	validatedResponseSchema,
);

export default ValidatedResponse;
