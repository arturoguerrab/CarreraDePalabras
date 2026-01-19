import mongoose from "mongoose";

/**
 * User Schema: Defines the structure and validations for the user document.
 */
const userSchema = new mongoose.Schema(
  {
    // username is optional initially for Google OAuth users.
    // sparse: true allows multiple "undefined" values while maintaining uniqueness for strings.
    username: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      default: undefined,
      set: (v) => (v === "" ? undefined : v), // Convert empty strings to undefined to avoid duplicate key errors.
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
    // Password is only required if not using Google OAuth.
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: 6,
      select: false, // Ensures password isn't returned in queries by default for safety.
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
    timestamps: true, // Automatically adds createdAt and updatedAt fields.
  }
);

const User = mongoose.model("User", userSchema);

export default User;
