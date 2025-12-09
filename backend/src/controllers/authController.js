import User from "../models/userModel.js";
import bcrypt from 'bcryptjs';

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // **PASO CRUCIAL:** Generar el hash de la contraseña (usando bcrypt, no mostrado aquí)
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(contrasena, salt);
    // const hashedPassword = contrasena;  Solo para este ejemplo simplificado
    const salt = await bcrypt.genSalt(10);
    const hashedPw = await bcrypt.hash(password, salt);
    // 1. Crear una nueva instancia del modelo (documento)
    const newUser = new User({
      email: email,
      password: hashedPw,
      rol: "user", // Por defecto
    });

    // 2. Guardar el documento en la base de datos
    await newUser.save();

    // 3. Respuesta exitosa
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: {
        id: newUser._id,
        email: newUser.email,
        rol: newUser.rol,
      },
    });
  } catch (error) {
    // Mongoose maneja errores de validación y unicidad (unique)
    if (error.code === 11000) {
      return res.status(400).json({ message: "El email ya está registrado." });
    }
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

export const loginUser = async (req, res, next) => {
 try {
        const { email, password } = req.body;

        // 1. Buscar al usuario por email
        const user = await User.findOne({ email }).select('+password');

        // 2. Verificar si el usuario existe
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        // 3. Comparar la contraseña
        const isMatch = await bcrypt.compare(password, user.password); 

        // 4. Verificar el resultado
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        // 5. Usar req.login de Passport para crear la sesión
        // El usuario se pasará al método serializeUser de Passport
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            console.log('Inicio de sesión exitoso para:', user.email);
            res.status(200).json({ 
                message: 'Inicio de sesión exitoso',
                user: {
                    id: user._id,
                    email: user.email
                }
            });
        });

    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  }