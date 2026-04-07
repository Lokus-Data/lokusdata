#!/usr/bin/env node
/**
 * One-time OAuth helper para obtener el GOOGLE_ADS_REFRESH_TOKEN.
 *
 * Prerequisitos en .env:
 *   GOOGLE_ADS_CLIENT_ID
 *   GOOGLE_ADS_CLIENT_SECRET
 *
 * Uso:
 *   node scripts/google-ads-auth.js
 *
 * Pasos que hace el script:
 *   1. Imprime una URL de autorización de Google
 *   2. Tú la abres en el navegador y autorizas con la cuenta de Google Ads
 *   3. Google te da un código → lo pegas en la terminal
 *   4. El script intercambia el código por un refresh_token y lo imprime
 *   5. Tú copias el refresh_token a .env como GOOGLE_ADS_REFRESH_TOKEN
 */

require('dotenv').config();
const https = require('https');
const readline = require('readline');
const { URLSearchParams } = require('url');

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'; // OOB flow (manual copy/paste)
const SCOPE = 'https://www.googleapis.com/auth/adwords';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Falta GOOGLE_ADS_CLIENT_ID o GOOGLE_ADS_CLIENT_SECRET en .env');
  process.exit(1);
}

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  response_type: 'code',
  scope: SCOPE,
  access_type: 'offline',
  prompt: 'consent',
})}`;

console.log('\n📋 PASO 1 — Abre esta URL en tu navegador y autoriza con la cuenta de Google Ads:\n');
console.log(authUrl);
console.log('\n📋 PASO 2 — Google te dará un código. Pégalo abajo:\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Código de autorización: ', code => {
  rl.close();
  const body = new URLSearchParams({
    code: code.trim(),
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  }).toString();

  const req = https.request({
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
  }, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.refresh_token) {
          console.log('\n✅ ¡Listo! Copia esto a tu .env:\n');
          console.log(`GOOGLE_ADS_REFRESH_TOKEN=${json.refresh_token}\n`);
        } else {
          console.error('\n❌ No se recibió refresh_token. Respuesta:', json);
        }
      } catch (e) {
        console.error('Error parseando respuesta:', data);
      }
    });
  });
  req.on('error', e => console.error('Error HTTP:', e.message));
  req.write(body);
  req.end();
});
