import passport from "passport";
import User from "./models/userModel.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";

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

// Estrategia de Google OAuth 2.0
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${
        process.env.SERVER_URL || "http://localhost:3000"
      }/auth/google/callback`,
      scope: ["profile", "email", "openid"],
    },
    async (accessToken, refreshToken, profile, done) => {
      // Datos disponibles en 'profile' con el scope actual:
      // - profile.id: ID de Google
      // - profile.displayName: Nombre completo
      // - profile.name.givenName / familyName: Nombre y Apellido
      // - profile.emails[0].value: Email principal
      // - profile.photos[0].value: URL de la foto de perfil

      try {
        // 1. Buscar si ya existe el usuario por Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // 2. Buscar por Email para vincular cuentas existentes (Local -> Google)
        const email = profile.emails?.[0]?.value;
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            // Si el usuario ya existe por email, le agregamos el googleId y entramos
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }
        }

        // 3. Crear nuevo usuario si no existe
        const newUser = new User({
          googleId: profile.id,
          // username se deja implícito (undefined) para que aplique el índice sparse del modelo
          firstName: profile.name?.givenName || profile.displayName,
          lastName: profile.name?.familyName || "",
          email: email,
        });
        await newUser.save();

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
