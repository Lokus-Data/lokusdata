#!/usr/bin/env node
/**
 * Inyecta GA4 + Google Ads + JSON-LD Article schema en todos los posts
 * de blog/articulos/ que aún no lo tengan. Idempotente: usa el marcador
 * <!-- LOKUS-SEO-V1 --> para detectar posts ya procesados.
 *
 * Uso: node scripts/inject-tracking.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://lokusdata.com';
const POSTS_FILE = path.join(ROOT, 'blog', 'posts.json');
const ARTICLES_DIR = path.join(ROOT, 'blog', 'articulos');
const MARKER = '<!-- LOKUS-SEO-V1 -->';
const GA4_ID = 'G-VCQHS6GXFE';
const ADS_ID = 'AW-17620097832';

function buildSnippet(post) {
  const url = `${SITE}/${post.url}`;
  const title = (post.title || '').replace(/"/g, '\\"');
  const desc = (post.excerpt || '').replace(/"/g, '\\"');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Person', name: post.author || 'Juan Heriberto Rosas' },
    publisher: {
      '@type': 'Organization',
      name: 'Lokus Data',
      logo: { '@type': 'ImageObject', url: `${SITE}/images/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    articleSection: post.category,
  };
  return `    ${MARKER}
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:url" content="${url}">
    <meta property="og:site_name" content="Lokus Data">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">

    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA4_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA4_ID}');
      gtag('config', '${ADS_ID}');
    </script>

    <!-- JSON-LD Article Schema -->
    <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
    </script>
`;
}

function processPost(post) {
  const filePath = path.join(ROOT, post.url);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  No existe: ${post.url}`);
    return false;
  }
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes(MARKER)) {
    return false; // ya procesado
  }
  const snippet = buildSnippet(post);
  // Inyectar justo antes de </head>
  if (!html.includes('</head>')) {
    console.warn(`⚠️  Sin </head>: ${post.url}`);
    return false;
  }
  html = html.replace('</head>', `${snippet}</head>`);
  fs.writeFileSync(filePath, html);
  console.log(`✅ Inyectado: ${path.basename(filePath)}`);
  return true;
}

function main() {
  const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
  let count = 0;
  for (const p of posts) {
    if (processPost(p)) count++;
  }
  console.log(`\n🎯 ${count}/${posts.length} posts actualizados`);
}

main();
