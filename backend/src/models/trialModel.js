import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema({
	playerId: { type: String, required: true },
	vote: { type: String, enum: ["valid", "invalid"], required: true },
});

const TrialSchema = new mongoose.Schema({
	roomId: { type: String, required: true },
	roundNumber: { type: Number, required: true },
	challengerId: { type: String, required: true },
	challengerEmail: { type: String },
	targetPlayerId: { type: String, required: true },
	category: { type: String, required: true },
	letter: { type: String, required: true },
	word: { type: String, required: true },
	originalStatus: { type: String, enum: ["valid", "invalid"], required: true },
	status: {
		type: String,
		enum: ["pending", "resolved"],
		default: "pending",
	},
	votes: [VoteSchema],
	verdict: {
		type: String,
		enum: ["valid", "invalid", "tie"],
		default: null,
	},
	winnerId: { type: String, default: null }, // Null if tie or pending
	timestamp: { type: Date, default: Date.now },
});

const Trial = mongoose.model("Trial", TrialSchema);

export default Trial;
