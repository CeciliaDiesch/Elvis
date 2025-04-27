// server.js
const express = require('express');
const session = require('express-session');
const svgCaptcha = require('svg-captcha');
const path = require('path');

const app = express();

// Session-Middleware
app.use(
  session({
    secret: 'einSichererSecretString',
    resave: false,
    saveUninitialized: true,
  })
);

// Um Formulardaten zu parsen
app.use(express.urlencoded({ extended: true }));

// Statische Dateien (deine index.html, CSS, script.js)
app.use(express.static(path.join(__dirname, 'public')));

// 1) Captcha-Bild generieren
// server.js (Auszug)

app.get('/captcha.png', (req, res) => {
  const captcha = svgCaptcha.create({
    size: 6, // Länge des Texts (z.B. 6 Zeichen statt 5)
    noise: 4, // Anzahl der störenden Linien
    color: true, // bunte Schrift
    background: '#f0f0f0', // dezenter Hintergrund
    width: 150, // Bildbreite
    height: 60, // Bildhöhe
    fontSize: 50, // Schriftgröße
    ignoreChars: '0oO1iIlL', // Zeichen, die sich ähneln, ausschließen
    charPreset: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // kontrolliertes Zeichenset
  });

  req.session.captchaText = captcha.text;
  res.type('svg');
  res.status(200).send(captcha.data);
});

// 2) Formular-Handling
app.post('/send-whatsapp', (req, res) => {
  const { captcha, website } = req.body;

  // Honeypot ausgefüllt? → Bot
  if (website) {
    return res.status(400).send('Botverdacht erkannt.');
  }

  // Captcha-Validierung
  if (captcha && captcha === req.session.captchaText) {
    // OK → auf WhatsApp-Link weiterleiten
    return res.redirect('https://wa.me/1234567890');
  } else {
    return res.status(400).send('Captcha falsch. Bitte erneut versuchen.');
  }
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
