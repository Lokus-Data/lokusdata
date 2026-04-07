#!/usr/bin/env node
/**
 * Crea un Responsive Search Ad en Google Ads para el último post publicado
 * (o uno específico pasado por --slug=xxx).
 *
 * Uso:
 *   node scripts/google-ads-publish.js                # último post de posts.json
 *   node scripts/google-ads-publish.js --slug=mi-slug # post específico
 *   node scripts/google-ads-publish.js --dry-run      # imprime sin enviar a Ads
 *
 * Requiere variables en .env (ver .env.example y docs/GOOGLE-ADS-SETUP.md)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const SITE = 'https://lokusdata.com';
const POSTS_FILE = path.join(__dirname, '..', 'blog', 'posts.json');

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

function pickPost(posts, slug) {
  if (slug) {
    const p = posts.find(p => p.slug === slug);
    if (!p) throw new Error(`Post no encontrado: ${slug}`);
    return p;
  }
  return posts[0]; // último publicado (posts.json los guarda al inicio)
}

// ---------- Main ----------
async function main() {
  const args = process.argv.slice(2);
  const slugArg = args.find(a => a.startsWith('--slug='));
  const slug = slugArg ? slugArg.split('=')[1] : null;
  const dryRun = args.includes('--dry-run');

  const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
  const post = pickPost(posts, slug);
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
    console.log('\n🟡 --dry-run: no se envió nada a Google Ads');
    return;
  }

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
    console.error('Ver docs/GOOGLE-ADS-SETUP.md');
    process.exit(1);
  }

  let GoogleAdsApi;
  try {
    ({ GoogleAdsApi } = require('google-ads-api'));
  } catch (e) {
    console.error('❌ Falta dependencia. Ejecuta: npm install');
    process.exit(1);
  }

  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  });

  const customer = client.Customer({
    customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
    login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || undefined,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  });

  const adGroupResource = `customers/${process.env.GOOGLE_ADS_CUSTOMER_ID}/adGroups/${process.env.GOOGLE_ADS_AD_GROUP_ID}`;

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
    console.log('\n✅ Anuncio creado:', JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('\n❌ Error creando el anuncio:');
    console.error(e.errors ? JSON.stringify(e.errors, null, 2) : e.message);
    process.exit(1);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
