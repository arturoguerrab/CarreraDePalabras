import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema({
	id: { type: String, required: true },
	email: { type: String, required: true },
	username: { type: String },
	firstName: { type: String },
	ready: { type: Boolean, default: false },
	connected: { type: Boolean, default: true },
	dismissedResults: { type: Boolean, default: false },
});

const RoundDataSchema = new mongoose.Schema({
	playerId: { type: String, required: true },
	answers: { type: Object, default: {} },
});

const RoomSchema = new mongoose.Schema(
	{
		roomId: { type: String, required: true, unique: true },
		players: [PlayerSchema],
		isPlaying: { type: Boolean, default: false },
		isCalculating: { type: Boolean, default: false },
		scores: { type: Object, default: {} },
		roundData: [RoundDataSchema],
		lastRoundResults: { type: Object, default: null },
		usedLetters: [{ type: String }],
		currentLetter: { type: String, default: "" },
		currentCategories: [{ type: String }],
		stoppedBy: { type: String, default: null },
		config: {
			totalRounds: { type: Number, default: 5 },
			currentRound: { type: Number, default: 1 },
		},
		timerStart: { type: Date, default: null },
		lastActivity: { type: Date, default: Date.now },
	},
	{ timestamps: true },
);

RoomSchema.index({ lastActivity: 1 });

const Room = mongoose.model("Room", RoomSchema);

export default Room;
