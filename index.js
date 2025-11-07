const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// Crear transporte SMTP de MailerSend
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mailersend.net",
  port: process.env.SMTP_PORT || 587, // 587 (TLS recomendado)
  secure: false, // false para 587, true solo para 465
  auth: {
    user: process.env.EMAIL_USER, // tu usuario SMTP de MailerSend
    pass: process.env.EMAIL_PASS, // tu contraseña SMTP
  },
});

// Verificar conexión SMTP
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error en la configuración SMTP:', error);
  } else {
    console.log('✅ Servidor SMTP listo para enviar correos');
  }
});

// Endpoint para enviar correo
app.post('/enviar-correo', async (req, res) => {
  const { to, subject, html, text } = req.body;

  try {
    const info = await transporter.sendMail({
      from: `"Ruta Explorer" <${process.env.MAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || '',
      html: html || '',
    });

    console.log("📤 Correo enviado:", info.messageId);
    res.json({ ok: true, messageId: info.messageId });
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    res.status(500).json({ ok: false, error: 'No se pudo enviar el correo' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor de correo escuchando en puerto ${PORT}`));
