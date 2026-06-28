import nodemailer from "nodemailer";
import config from "../config/env.js";

const createTransporter = async () => {
	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: config.EMAIL.USER,
				pass: config.EMAIL.PASSWORD, // Se requiere nueva variable EMAIL_PASSWORD
			},
		});

		return transporter;
	} catch (error) {
		console.error("Error al crear el transportador:", error);
		return null;
	}
};

//Plantilla para los correos
const getEmailTemplate = (title, message, buttonText, link) => {
	return `
    <div style="background-color: #6366f1; padding: 40px; font-family: 'Courier New', Courier, monospace;">
      <div style="max-w-idth: 600px; margin: 0 auto; background-color: #ffffff; border: 4px solid #000000; padding: 30px; box-shadow: 8px 8px 0px 0px rgba(0,0,0,0.2);">
        <h1 style="color: #000000; text-align: center; text-transform: uppercase; margin-bottom: 20px; font-size: 24px; border-bottom: 4px solid #000000; padding-bottom: 15px;">
          ${title}
        </h1>
        <p style="color: #333333; font-size: 16px; line-height: 1.5; margin-bottom: 30px; text-align: center;">
          ${message}
        </p>
        <div style="text-align: center;">
          <a href="${link}" style="background-color: #3b82f6; color: #ffffff; padding: 15px 25px; text-decoration: none; border: 3px solid #000000; font-weight: bold; text-transform: uppercase; display: inline-block; box-shadow: 4px 4px 0px 0px #000000;">
            ${buttonText}
          </a>
        </div>
        <p style="text-align: center; margin-top: 30px; font-size: 10px; color: #666666; text-transform: uppercase;">
          STOP GAME - Carrera de Palabras
        </p>
      </div>
    </div>
  `;
};

//Envía el correo de verificación - Se usa cuando el usuario se registra
export const sendVerificationEmail = async (email, name, token) => {
	try {
		const transporter = await createTransporter();
		if (!transporter) return;

		const verificationUrl = `${config.CLIENT_URL}/verify-email?token=${token}`;

		const mailOptions = {
			from: config.EMAIL.ALIAS || config.EMAIL.USER,
			to: email,
			subject: "Verifica tu cuenta - Stopify Game",
			html: getEmailTemplate(
				"Verificación",
				`¡Bienvenido ${name}! <br/> Para comenzar tu aventura, necesitamos verificar tu correo.`,
				"Verificar Cuenta",
				verificationUrl,
			),
		};

		const info = await transporter.sendMail(mailOptions);
		console.log(
			"Email de verificación enviado a:",
			email,
			"MessageID:",
			info.messageId,
		);
	} catch (error) {
		console.error("Error al enviar el email de verificación:", error);
		if (error.response) console.error("Respuesta SMTP:", error.response);
	}
};

//Envía el correo de restablecimiento de contraseña - Se usa cuando el usuario olvida su contraseña
export const sendPasswordResetEmail = async (email, token) => {
	try {
		const transporter = await createTransporter();
		if (!transporter) return;

		const resetUrl = `${config.CLIENT_URL}/reset-password?token=${token}`;

		const mailOptions = {
			from: config.EMAIL.ALIAS || config.EMAIL.USER,
			to: email,
			subject: "Restablecer contraseña - Stopify Game",
			html: getEmailTemplate(
				"Recuperar Acceso",
				"Has solicitado restablecer tu contraseña. <br/> Si no fuiste tú, ignora este mensaje.",
				"Restablecer Password",
				resetUrl,
			),
		};

		const info = await transporter.sendMail(mailOptions);
		console.log(
			"Email de restablecimiento de contraseña enviado a:",
			email,
			"MessageID:",
			info.messageId,
		);
	} catch (error) {
		console.error(
			"Error al enviar el email de restablecimiento de contraseña:",
			error,
		);
		if (error.response) console.error("Respuesta SMTP:", error.response);
	}
};
