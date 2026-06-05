#!/usr/bin/env node
/**
 * SEO Build Script para LokusData
 * - Genera sitemap.xml a partir de blog/posts.json + páginas estáticas
 * - Hace ping a Google IndexNow para indexación rápida (~horas)
 *
 * Uso:
 *   node scripts/seo-build.js              # genera sitemap
 *   node scripts/seo-build.js --ping       # genera + pingea IndexNow
 *   node scripts/seo-build.js --ping <url> # ping de una URL específica
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://lokusdata.com';
const POSTS_FILE = path.join(ROOT, 'blog', 'posts.json');
const SITEMAP_FILE = path.join(ROOT, 'sitemap.xml');

// IndexNow key — archivo público en raíz: <key>.txt con el mismo contenido
const INDEXNOW_KEY = 'lokusdata-indexnow-2026-key-7f3a9c2e8b1d4f5a';

function loadPosts() {
  return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
}

function buildSitemap(posts) {
  const today = new Date().toISOString().slice(0, 10);
  const staticPages = [
    { loc: `${SITE}/`, priority: '1.0', changefreq: 'weekly', lastmod: today },
    { loc: `${SITE}/blog.html`, priority: '0.9', changefreq: 'weekly', lastmod: today },
  ];
  const postUrls = posts.map(p => ({
    loc: `${SITE}/${p.url}`,
    priority: p.featured ? '0.8' : '0.6',
    changefreq: 'monthly',
    lastmod: p.date,
  }));
  const all = [...staticPages, ...postUrls];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
  fs.writeFileSync(SITEMAP_FILE, xml);
  // Asegurar archivo de verificación IndexNow en raíz
  fs.writeFileSync(path.join(ROOT, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY);
  console.log(`✅ sitemap.xml generado con ${all.length} URLs`);
  return all.map(u => u.loc);
}

const delay = ms => new Promise(r => setTimeout(r, ms));

// Devuelve el código HTTP de una URL (HEAD). 0 si no responde.
function httpStatus(url) {
  return new Promise(resolve => {
    const req = https.request(url, { method: 'HEAD', timeout: 8000 }, res => {
      res.resume();
      resolve(res.statusCode);
    });
    req.on('timeout', () => { req.destroy(); resolve(0); });
    req.on('error', () => resolve(0));
    req.end();
  });
}

// Espera a que una URL responda 2xx/3xx, reintentando (cubre el lag de
// despliegue de GitHub Pages tras el push). Devuelve el último código visto.
async function waitForLive(url, tries = 6, delayMs = 5000) {
  let code = 0;
  for (let i = 1; i <= tries; i++) {
    code = await httpStatus(url);
    if (code >= 200 && code < 400) return code;
    if (i < tries) {
      console.log(`   ⏳ ${url} → HTTP ${code}; reintento ${i}/${tries - 1} en ${delayMs / 1000}s`);
      await delay(delayMs);
    }
  }
  return code;
}

async function pingIndexNow(urls) {
  // Verificar que cada URL esté viva (HTTP 200) ANTES de avisar a buscadores.
  // Evita pingear URLs que aún no desplegaron (404), lo cual resta SEO.
  const live = [];
  for (const url of urls) {
    const code = await waitForLive(url);
    if (code >= 200 && code < 400) {
      live.push(url);
    } else {
      console.warn(`⚠️  Omitida (no responde 200 tras reintentos): ${url} → HTTP ${code}`);
    }
  }
  if (!live.length) {
    console.warn('⚠️  Ninguna URL viva; no se pingea IndexNow.');
    return;
  }

  const host = 'lokusdata.com';
  const body = JSON.stringify({
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
    urlList: live,
  });
  await new Promise(resolve => {
    const req = https.request({
      hostname: 'api.indexnow.org',
      path: '/IndexNow',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      console.log(`🔔 IndexNow ping: HTTP ${res.statusCode} (${live.length}/${urls.length} URLs vivas)`);
      res.on('data', () => {});
      res.on('end', resolve);
    });
    req.on('error', e => { console.error('IndexNow error:', e.message); resolve(); });
    req.write(body);
    req.end();
  });
  // Nota: el ping de sitemap a Google (google.com/ping?sitemap=) fue
  // deprecado por Google en 2024 y siempre devuelve 404, así que se eliminó.
  // Google descubre el sitemap vía Search Console + robots.txt; IndexNow
  // (Bing/Yandex) cubre la indexación rápida.
}

async function main() {
  const args = process.argv.slice(2);
  const posts = loadPosts();
  const urls = buildSitemap(posts);
  if (args.includes('--ping')) {
    const specific = args.filter(a => a.startsWith('http'));
    await pingIndexNow(specific.length ? specific : urls);
  }
}

main();
