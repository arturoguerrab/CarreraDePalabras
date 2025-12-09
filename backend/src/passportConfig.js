import passport from 'passport';
import User from './models/userModel.js';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import "dotenv/config"; // Tu modelo de Mongoose

// 1. Serialización: Qué guardar en la sesión (solo el ID)
passport.serializeUser((user, done) => {
    // Solo guarda el ID de MongoDB en la sesión
    // Nota: MongoDB usa _id, no id
    done(null, user._id); 
});

// 2. Deserialización: Cómo encontrar al usuario a partir del ID de la sesión
passport.deserializeUser(async (id, done) => {
    try {
        // Busca el usuario en la DB por su ID
        const user = await User.findById(id); 
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // La URL a la que Google enviará al usuario después de la autenticación
    callbackURL: "/auth/google/callback", 
    scope: ['profile', 'email'] // Los datos que solicitas a Google
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        // 1. Intentar encontrar al usuario por su Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            // Usuario ya existe, iniciar sesión
            done(null, user); 
        } else {
            // 2. Usuario nuevo, crearlo en la DB
            const newUser = new User({
                googleId: profile.id,
                nombre: profile.displayName,
                email: profile.emails[0].value,
                // No necesitas contraseña si solo usas Google
            });
            await newUser.save();
            done(null, newUser);
        }
    } catch (err) {
      done(err, null);
    }
  }
));

export default passport;