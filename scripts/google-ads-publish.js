#!/usr/bin/env node
/**
 * Crea Responsive Search Ads en Google Ads para posts del blog.
 *
 * Uso:
 *   node scripts/google-ads-publish.js                # último post de posts.json
 *   node scripts/google-ads-publish.js --slug=mi-slug # post específico
 *   node scripts/google-ads-publish.js --all          # backfill: todos los que no tengan ad
 *   node scripts/google-ads-publish.js --dry-run      # no envía a Ads, solo imprime
 *
 * Tracking: scripts/.ads-published.json registra qué slugs ya tienen anuncio
 * para evitar duplicados en --all.
 *
 * Requiere variables en .env (ver .env.example y docs/GOOGLE-ADS-SETUP.md)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const SITE = 'https://lokusdata.com';
const POSTS_FILE = path.join(__dirname, '..', 'blog', 'posts.json');
const PUBLISHED_FILE = path.join(__dirname, '.ads-published.json');

function loadPublished() {
  try { return JSON.parse(fs.readFileSync(PUBLISHED_FILE, 'utf8')); }
  catch { return {}; }
}
function savePublished(map) {
  fs.writeFileSync(PUBLISHED_FILE, JSON.stringify(map, null, 2));
}

// ---------- Helpers para construir headlines y descriptions ----------
// Google Ads Responsive Search Ads exigen:
//   - 3 a 15 headlines (máx 30 chars cada uno)
//   - 2 a 4 descriptions (máx 90 chars cada uno)

function truncate(str, max) {
  str = (str || '').replace(/\s+/g, ' ').trim();
  if (str.length <= max) return str;
  return str.slice(0, max - 1).trimEnd() + '…';
}

function dedupe(arr) {
  const seen = new Set();
  return arr.filter(s => {
    const k = s.toLowerCase();
    if (seen.has(k) || !s) return false;
    seen.add(k);
    return true;
  });
}

function buildHeadlines(post) {
  const title = post.title;
  const cat = post.category;
  const candidates = [
    truncate(title, 30),
    truncate(title.split(':')[0], 30),
    truncate(title.split(':')[1] || title, 30),
    truncate(`${cat}: ${title.split(':')[0]}`, 30),
    'Datos oficiales INEGI 2024',
    'Inteligencia de datos México',
    'Análisis Censo Económico',
    'Lee el análisis completo',
    `Lokus Data — ${truncate(cat, 18)}`,
    'Datos para decisiones',
    'Reportes con datos reales',
  ];
  return dedupe(candidates).slice(0, 12);
}

function buildDescriptions(post) {
  const excerpt = post.excerpt || '';
  const candidates = [
    truncate(excerpt, 90),
    truncate(excerpt.split('.')[0], 90),
    truncate(`${post.title}. Análisis con datos oficiales del INEGI.`, 90),
    'Inteligencia de datos para gobiernos, empresas y cámaras. Lee el análisis.',
  ];
  return dedupe(candidates).slice(0, 4);
}

function pickPosts(posts, { slug, all, published }) {
  if (slug) {
    const p = posts.find(p => p.slug === slug);
    if (!p) throw new Error(`Post no encontrado: ${slug}`);
    return [p];
  }
  if (all) {
    return posts.filter(p => !published[p.slug]);
  }
  return [posts[0]]; // último publicado
}

async function publishOne(post, { dryRun, customer, adGroupResource, published }) {
  const finalUrl = `${SITE}/${post.url}`;

  const headlines = buildHeadlines(post);
  const descriptions = buildDescriptions(post);

  console.log('📝 Post:', post.title);
  console.log('🔗 URL:', finalUrl);
  console.log('📰 Headlines:', headlines.length);
  headlines.forEach((h, i) => console.log(`  ${i + 1}. [${h.length}] ${h}`));
  console.log('📄 Descriptions:', descriptions.length);
  descriptions.forEach((d, i) => console.log(`  ${i + 1}. [${d.length}] ${d}`));

  if (headlines.length < 3 || descriptions.length < 2) {
    throw new Error('Faltan headlines (≥3) o descriptions (≥2)');
  }

  if (dryRun) {
    console.log('  🟡 dry-run, no se envió');
    return { ok: true, dryRun: true };
  }

  const operation = {
    create: {
      ad_group: adGroupResource,
      status: 'ENABLED',
      ad: {
        final_urls: [finalUrl],
        responsive_search_ad: {
          headlines: headlines.map(text => ({ text })),
          descriptions: descriptions.map(text => ({ text })),
        },
      },
    },
  };

  try {
    const result = await customer.adGroupAds.create([operation.create]);
    const resourceName = result.results?.[0]?.resource_name || 'unknown';
    console.log(`  ✅ Creado: ${resourceName}`);
    published[post.slug] = {
      resource_name: resourceName,
      created_at: new Date().toISOString(),
      url: finalUrl,
    };
    return { ok: true, resourceName };
  } catch (e) {
    console.error('  ❌ Error:', e.errors ? JSON.stringify(e.errors) : e.message);
    return { ok: false, error: e };
  }
}

// ---------- Main ----------
async function main() {
  const args = process.argv.slice(2);
  const slugArg = args.find(a => a.startsWith('--slug='));
  const slug = slugArg ? slugArg.split('=')[1] : null;
  const all = args.includes('--all');
  const dryRun = args.includes('--dry-run');

  const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
  const published = loadPublished();
  const targets = pickPosts(posts, { slug, all, published });

  if (!targets.length) {
    console.log('✅ Nada que hacer: todos los posts ya tienen anuncio.');
    return;
  }

  console.log(`📦 ${targets.length} post(s) a procesar${all ? ' (modo backfill)' : ''}`);

  let customer = null, adGroupResource = null;
  if (!dryRun) {
    const required = [
      'GOOGLE_ADS_DEVELOPER_TOKEN',
      'GOOGLE_ADS_CLIENT_ID',
      'GOOGLE_ADS_CLIENT_SECRET',
      'GOOGLE_ADS_REFRESH_TOKEN',
      'GOOGLE_ADS_CUSTOMER_ID',
      'GOOGLE_ADS_AD_GROUP_ID',
    ];
    const missing = required.filter(k => !process.env[k]);
    if (missing.length) {
      console.error(`\n❌ Faltan variables en .env: ${missing.join(', ')}`);
      process.exit(1);
    }
    let GoogleAdsApi;
    try { ({ GoogleAdsApi } = require('google-ads-api')); }
    catch { console.error('❌ Falta dependencia. npm install'); process.exit(1); }

    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });
    customer = client.Customer({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
      login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || undefined,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });
    adGroupResource = `customers/${process.env.GOOGLE_ADS_CUSTOMER_ID}/adGroups/${process.env.GOOGLE_ADS_AD_GROUP_ID}`;
  }

  let ok = 0, fail = 0;
  for (let i = 0; i < targets.length; i++) {
    const post = targets[i];
    console.log(`\n[${i + 1}/${targets.length}] ${post.title}`);
    const r = await publishOne(post, { dryRun, customer, adGroupResource, published });
    if (r.ok) ok++; else fail++;
    // pequeño delay para no saturar la API en backfill
    if (all && i < targets.length - 1) await new Promise(r => setTimeout(r, 1000));
  }

  if (!dryRun) savePublished(published);
  console.log(`\n🎯 Resumen: ${ok} OK, ${fail} fallos`);
  if (fail) process.exit(1);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
