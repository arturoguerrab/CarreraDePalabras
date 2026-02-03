import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			trim: true,
			unique: true,
			sparse: true,
			default: undefined,
			set: (v) => (v === "" ? undefined : v),
		},
		firstName: {
			type: String,
			trim: true,
		},
		lastName: {
			type: String,
			trim: true,
		},
		email: {
			type: String,
			required: [true, "El email es obligatorio"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/.+@.+\..+/, "Por favor, introduce un email válido"],
		},
		password: {
			type: String,
			required: function () {
				return !this.googleId;
			},
			minlength: 6,
			select: false,
		},
		googleId: {
			type: String,
			unique: true,
			sparse: true,
		},
		rol: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
	},
	{
		timestamps: true,
	},
);

const User = mongoose.model("User", userSchema);

export default User;
