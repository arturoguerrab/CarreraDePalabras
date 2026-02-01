import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import User from "./models/userModel.js";
import config from "./config/env.js";

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (_id, done) => {
  try {
    const user = await User.findById(_id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Local Strategy
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
    },
  ),
);

// Google OAuth 2.0 Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE.CLIENT_ID,
      clientSecret: config.GOOGLE.CLIENT_SECRET,
      callbackURL: `${config.SERVER_URL}/auth/google/callback`,
      scope: ["profile", "email", "openid"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        const email = profile.emails?.[0]?.value;
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            // Link account
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }
        }

        // Validar que tengamos un email antes de crear un nuevo usuario
        if (!email) {
          return done(
            new Error(
              "No se pudo obtener un correo electrónico de la cuenta de Google.",
            ),
            null,
          );
        }

        const newUser = new User({
          googleId: profile.id,
          firstName: profile.name?.givenName || profile.displayName,
          lastName: profile.name?.familyName || "",
          email: email,
        });
        await newUser.save();

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

export default passport;
