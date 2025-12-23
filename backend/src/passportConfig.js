// Importaciones
import "dotenv/config";
import passport from "passport";
import User from "./models/userModel.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";

// Estrategia Local
passport.use(
	new LocalStrategy(
		{
			usernameField: "email",
		},
		async (email, password, done) => {
			try {
				const user = await User.findOne({ email }).select("+password");
				if (!user) {
					return done(null, false, { message: "Email no registrado." });
				}

				const isMatch = await bcrypt.compare(password, user.password);
				if (!isMatch) {
					return done(null, false, { message: "Contraseña incorrecta." });
				}

				return done(null, user);
			} catch (err) {
				return done(err);
			}
		}
	)
);

// Serialización: Qué guardar en la sesión (solo el ID)
passport.serializeUser((user, done) => {
	done(null, user._id);
});

// Deserialización: Cómo encontrar al usuario a partir del ID de la sesión
passport.deserializeUser(async (_id, done) => {
	try {
		const user = await User.findById(_id);
		done(null, user);
	} catch (err) {
		done(err, null);
	}
});

// Estrategia de Google OAuth 2.0
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: `${process.env.SERVER_URL || "http://localhost:3000"}/auth/google/callback`,
			scope: ["profile", "email", "openid"],
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				let user = await User.findOne({ googleId: profile.id });

				if (user) {
					return done(null, user);
				} else {
					const newUser = new User({
						googleId: profile.id,
						// username se deja implícito (undefined) para que aplique el índice sparse del modelo
						firstName: profile.name?.givenName || profile.displayName,
						lastName: profile.name?.familyName || "",
						email: profile.emails[0].value,
					});
					await newUser.save();
					return done(null, newUser);
				}
			} catch (err) {
				return done(err, null);
			}
		}
	)
);

export default passport;
