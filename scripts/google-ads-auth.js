#!/usr/bin/env node
/**
 * One-time OAuth helper para obtener el GOOGLE_ADS_REFRESH_TOKEN.
 * Usa loopback redirect (http://127.0.0.1:PORT) — el flujo OOB fue deprecado
 * por Google en octubre 2022.
 *
 * Uso:
 *   node scripts/google-ads-auth.js
 */

require('dotenv').config();
const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const { URLSearchParams, URL } = require('url');

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const PORT = 53682; // puerto arbitrario alto
const REDIRECT_URI = `http://127.0.0.1:${PORT}`;
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

function exchangeCode(code) {
  const body = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  }).toString();

  return new Promise((resolve, reject) => {
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
        try { resolve(JSON.parse(data)); } catch (e) { reject(new Error(data)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, REDIRECT_URI);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>Error: ${error}</h1>`);
      console.error('❌ OAuth error:', error);
      server.close();
      process.exit(1);
    }
    if (!code) {
      res.writeHead(404);
      res.end();
      return;
    }
    const json = await exchangeCode(code);
    if (json.refresh_token) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>✅ Listo</h1><p>Ya puedes cerrar esta pestaña y volver a la terminal.</p>`);
      console.log('\n✅ ¡Listo! Refresh token obtenido. Copia esto a tu .env:\n');
      console.log(`GOOGLE_ADS_REFRESH_TOKEN=${json.refresh_token}\n`);
    } else {
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<pre>${JSON.stringify(json, null, 2)}</pre>`);
      console.error('\n❌ Sin refresh_token. Respuesta:', json);
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    setTimeout(() => server.close(), 500);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\n📋 Abre esta URL en tu navegador y autoriza:\n');
  console.log(authUrl);
  console.log(`\n⏳ Esperando la redirección a ${REDIRECT_URI} ...\n`);
  // Intentar abrir automáticamente
  const cmd = process.platform === 'win32' ? `start "" "${authUrl}"`
    : process.platform === 'darwin' ? `open "${authUrl}"`
    : `xdg-open "${authUrl}"`;
  exec(cmd, () => {});
});
