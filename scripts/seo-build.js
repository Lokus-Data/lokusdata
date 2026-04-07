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

function pingIndexNow(urls) {
  const host = 'lokusdata.com';
  const body = JSON.stringify({
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  });
  const req = https.request({
    hostname: 'api.indexnow.org',
    path: '/IndexNow',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  }, res => {
    console.log(`🔔 IndexNow ping: HTTP ${res.statusCode} (${urls.length} URLs)`);
    res.on('data', () => {});
  });
  req.on('error', e => console.error('IndexNow error:', e.message));
  req.write(body);
  req.end();

  // Ping a Google sitemap (legacy pero sigue funcionando para algunos)
  https.get(`https://www.google.com/ping?sitemap=${encodeURIComponent(SITE + '/sitemap.xml')}`, res => {
    console.log(`🔔 Google sitemap ping: HTTP ${res.statusCode}`);
  }).on('error', () => {});
}

function main() {
  const args = process.argv.slice(2);
  const posts = loadPosts();
  const urls = buildSitemap(posts);
  if (args.includes('--ping')) {
    const specific = args.filter(a => a.startsWith('http'));
    pingIndexNow(specific.length ? specific : urls);
  }
}

main();
