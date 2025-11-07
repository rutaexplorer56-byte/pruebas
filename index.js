



// index.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// ====== Envío por API MailerSend ======
async function sendEmailAPI({ to, subject, html, text }) {
  const payload = {
    from: {
      email: process.env.MAIL_FROM,
      name: process.env.MAIL_FROM_NAME || 'RutaExplorer'
    },
    to: (Array.isArray(to) ? to : [to]).map(e => ({ email: e })),
    subject,
    html: html || '',
    text: text || ''
  };

  const { data } = await axios.post(
    'https://api.mailersend.com/v1/email',
    payload,
    { headers: { Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}` } }
  );
  return data;
}

// Healthcheck
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

// Endpoint genérico
app.post('/enviar-correo', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    await sendEmailAPI({ to, subject, html, text });
    return res.json({ ok: true, via: 'api' });
  } catch (e) {
    console.error('❌ MailerSend API error:', e.response?.data || e.message);
    return res.status(500).json({ ok: false, error: e.response?.data || e.message });
  }
});

// (Opcional) endpoint con plantilla de MailerSend
app.post('/enviar-correo-template', async (req, res) => {
  try {
    const { to, templateId, variables } = req.body;
    const payload = {
      from: { email: process.env.MAIL_FROM, name: process.env.MAIL_FROM_NAME || 'RutaExplorer' },
      to: (Array.isArray(to) ? to : [to]).map(e => ({ email: e })),
      template_id: templateId,
      personalization: [{
        email: Array.isArray(to) ? to[0] : to,
        data: variables || {}
      }]
    };
    await axios.post('https://api.mailersend.com/v1/email', payload, {
      headers: { Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}` }
    });
    return res.json({ ok: true, via: 'api-template' });
  } catch (e) {
    console.error('❌ MailerSend API (template) error:', e.response?.data || e.message);
    return res.status(500).json({ ok: false, error: e.response?.data || e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor de correo escuchando en puerto ${PORT}`));


























// const express = require('express');
// const nodemailer = require('nodemailer');
// const cors = require('cors');
// require('dotenv').config();
// const dns = require('dns');
// if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');

// const app = express();
// app.use(cors({ origin: "*", credentials: true }));
// app.use(express.json());

// // Crear transporte SMTP de MailerSend
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST || "smtp.mailersend.net",
//   port: process.env.SMTP_PORT || 587, // 587 (TLS recomendado)
//   secure: false, // false para 587, true solo para 465
//   auth: {
//     user: process.env.EMAIL_USER, // tu usuario SMTP de MailerSend
//     pass: process.env.EMAIL_PASS, // tu contraseña SMTP
//   },
// });

// // Verificar conexión SMTP
// transporter.verify((error, success) => {
//   if (error) {
//     console.error('❌ Error en la configuración SMTP:', error);
//   } else {
//     console.log('✅ Servidor SMTP listo para enviar correos');
//   }
// });

// // Endpoint para enviar correo
// app.post('/enviar-correo', async (req, res) => {
//   const { to, subject, html, text } = req.body;

//   try {
//     const info = await transporter.sendMail({
//       from: `"Ruta Explorer" <${process.env.MAIL_FROM || process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       text: text || '',
//       html: html || '',
//     });

//     console.log("📤 Correo enviado:", info.messageId);
//     res.json({ ok: true, messageId: info.messageId });
//   } catch (error) {
//     console.error('❌ Error al enviar correo:', error);
//     res.status(500).json({ ok: false, error: 'No se pudo enviar el correo' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`🚀 Servidor de correo escuchando en puerto ${PORT}`));
