#!/usr/bin/env node
/**
 * Borra TODOS los ad groups (y sus ads + keywords) de la campaña configurada.
 * Uso:
 *   node scripts/google-ads-cleanup.js --dry-run   # solo lista, no borra
 *   node scripts/google-ads-cleanup.js              # borra todo
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const PUBLISHED_FILE = path.join(__dirname, '.ads-published.json');

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  const required = [
    'GOOGLE_ADS_DEVELOPER_TOKEN',
    'GOOGLE_ADS_CLIENT_ID',
    'GOOGLE_ADS_CLIENT_SECRET',
    'GOOGLE_ADS_REFRESH_TOKEN',
    'GOOGLE_ADS_CUSTOMER_ID',
    'GOOGLE_ADS_CAMPAIGN_ID',
  ];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`❌ Faltan variables en .env: ${missing.join(', ')}`);
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

  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
  const campaignId = process.env.GOOGLE_ADS_CAMPAIGN_ID;

  const customer = client.Customer({
    customer_id: customerId,
    login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || undefined,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  });

  // Listar todos los ad groups de la campaña
  console.log(`🔍 Buscando ad groups en campaña ${campaignId}...`);
  const adGroups = await customer.query(`
    SELECT ad_group.id, ad_group.name, ad_group.status
    FROM ad_group
    WHERE campaign.id = ${campaignId}
  `);

  if (!adGroups.length) {
    console.log('✅ No hay ad groups en esta campaña.');
    return;
  }

  console.log(`📦 ${adGroups.length} ad groups encontrados:\n`);
  for (const ag of adGroups) {
    console.log(`  [${ag.ad_group.status}] ${ag.ad_group.name} (ID: ${ag.ad_group.id})`);
  }

  if (dryRun) {
    console.log('\n🟡 dry-run: no se borró nada.');
    return;
  }

  // Borrar cada ad group (esto borra en cascada sus ads y keywords)
  console.log(`\n🗑️  Borrando ${adGroups.length} ad groups...`);
  let ok = 0, fail = 0;
  for (const ag of adGroups) {
    const resourceName = `customers/${customerId}/adGroups/${ag.ad_group.id}`;
    try {
      await customer.adGroups.remove([resourceName]);
      console.log(`  ✅ Borrado: ${ag.ad_group.name}`);
      ok++;
    } catch (e) {
      console.error(`  ❌ Error borrando "${ag.ad_group.name}": ${e.errors?.[0]?.message || e.message}`);
      fail++;
    }
  }

  // Limpiar el tracking de posts publicados
  if (ok > 0) {
    try {
      fs.writeFileSync(PUBLISHED_FILE, '{}');
      console.log('\n🧹 .ads-published.json limpiado');
    } catch { /* no pasa nada si no existe */ }
  }

  console.log(`\n🎯 Resumen: ${ok} borrados, ${fail} fallos`);
  if (fail) process.exit(1);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
