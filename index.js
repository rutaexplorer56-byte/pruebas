const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Crear transporte SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verificar conexión
transporter.verify((error, success) => {
  if (error) {
    console.error('Error en la configuración SMTP:', error);
  } else {
    console.log('Servidor SMTP listo para enviar correos');
  }
});

// Endpoint para enviar correo
app.post('/enviar-correo', async (req, res) => {
  const { to, subject, html, text } = req.body;

  try {
    const info = await transporter.sendMail({
      from: `"Ruta Explorer" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || '',
      html: html || '',
    });

    res.json({ ok: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ ok: false, error: 'No se pudo enviar el correo' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor de correo escuchando en puerto ${process.env.PORT}`);
});
