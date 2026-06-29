import "dotenv/config";
import nodemailer from "nodemailer";

const testEmail = async () => {
	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASSWORD,
			},
		});

		const info = await transporter.sendMail({
			from: process.env.EMAIL_USER,
			to: process.env.EMAIL_USER,
			subject: "Test Nodemailer",
			text: "Este es un correo de prueba.",
		});

		console.log("Exito:", info.messageId);
	} catch (err) {
		console.error("Error:", err);
	}
};

testEmail();
