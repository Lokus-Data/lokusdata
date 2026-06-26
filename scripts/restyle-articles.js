#!/usr/bin/env node
/**
 * Migra los artículos de blog/articulos/*.html del diseño viejo (Tailwind CDN,
 * azul/emerald genérico) al sistema cartográfico de la landing (assets/styles.css,
 * tokens ink/paper/bone/biz/analytics/agro, fuentes Space Grotesk + Inter + JetBrains Mono).
 *
 * Idempotente: si el archivo ya no carga el CDN de Tailwind, se omite.
 * Preserva el bloque <!-- LOKUS-SEO-V1 --> (GA4, OG, JSON-LD) inyectado por inject-tracking.js.
 *
 * Uso: node scripts/restyle-articles.js
 */

const fs = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname, '..', 'blog', 'articulos');

// Familias de color de Tailwind usadas en los posts viejos.
const POS = ['emerald', 'green', 'teal', 'lime'];          // verdes = positivo → agro
const NEG = ['red', 'rose', 'orange'];                      // rojos/naranjas = negativo → se conservan en texto
const NEU = ['blue', 'indigo', 'purple', 'violet', 'sky', 'cyan', 'amber', 'yellow', 'pink', 'fuchsia'];
const ALL = [...POS, ...NEG, ...NEU];
const alt = (arr) => arr.join('|');

const NEW_HEAD = `    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <!-- Estilos compilados (Tailwind CLI + sistema cartográfico) -->
    <link rel="stylesheet" href="../../assets/styles.css">`;

const NEW_NAV = `    <!-- ============ NAV ============ -->
    <nav class="sticky top-0 z-50 bg-paper/85 backdrop-blur-md border-b border-ink/10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <a href="../../index.html" class="flex items-center space-x-2">
                    <img src="../../images/lokus-logo.png" alt="Lokus Data" class="h-9 w-9">
                    <span class="text-xl font-display font-bold tracking-tight">
                        Lokus<span class="text-biz">Data</span>
                    </span>
                </a>

                <div class="hidden md:flex items-center space-x-7 text-sm font-medium text-ink/70">
                    <a href="../../index.html#productos" class="hover:text-ink transition">Productos</a>
                    <a href="../../index.html#motor" class="hover:text-ink transition">El motor</a>
                    <a href="../../blog.html" class="text-ink font-semibold">Blog</a>
                    <a href="../../index.html#servicios" class="hover:text-ink transition">A medida</a>
                    <a href="../../index.html#contacto" class="hover:text-ink transition">Contacto</a>
                    <a href="../../index.html#productos"
                       class="bg-ink text-paper px-5 py-2 rounded-full hover:bg-ink2 transition font-semibold">
                        Entrar
                    </a>
                </div>

                <div class="md:hidden">
                    <button id="mobile-menu-btn" class="text-ink" aria-label="Menú">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <div id="mobile-menu" class="hidden md:hidden bg-paper border-t border-ink/10">
            <div class="px-4 pt-3 pb-4 space-y-1 text-ink/80">
                <a href="../../index.html#productos" class="block px-3 py-2 rounded hover:bg-bone">Productos</a>
                <a href="../../index.html#motor" class="block px-3 py-2 rounded hover:bg-bone">El motor</a>
                <a href="../../blog.html" class="block px-3 py-2 rounded bg-bone font-semibold">Blog</a>
                <a href="../../index.html#servicios" class="block px-3 py-2 rounded hover:bg-bone">A medida</a>
                <a href="../../index.html#contacto" class="block px-3 py-2 rounded hover:bg-bone">Contacto</a>
            </div>
        </div>
    </nav>`;

const MOBILE_SCRIPT = `    <!-- Mobile menu script -->
    <script>
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
            mobileMenu.querySelectorAll('a').forEach(link =>
                link.addEventListener('click', () => mobileMenu.classList.add('hidden'))
            );
        }
    </script>
</body>`;

function migrate(html) {
  // 1) HEAD: quita config inline + comentarios, sustituye CDN por fuentes + styles.css
  html = html.replace(/\s*<!-- Custom Configuration -->/g, '');
  html = html.replace(/<script>\s*tailwind\.config[\s\S]*?<\/script>\s*/, '');
  html = html.replace(
    /    <!-- Tailwind CSS -->\s*<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/,
    NEW_HEAD
  );

  // 2) NAV: reemplaza el bloque viejo completo
  html = html.replace(/    <!-- Navigation -->[\s\S]*?<\/nav>/, NEW_NAV);

  // 3) BODY tag
  html = html.replace(/<body class="bg-gray-50">/, '<body class="bg-paper text-ink antialiased">');

  // 4) Botones blancos del CTA (antes de las reglas genéricas)
  html = html.replace(new RegExp(`bg-white text-(?:${alt(ALL)})-600`, 'g'), 'bg-biz text-ink');
  html = html.replace(/border-2 border-white text-white/g, 'border border-paper/25 text-paper');
  html = html.replace(new RegExp(`hover:bg-white hover:text-(?:${alt(ALL)})-600`, 'g'), 'hover:bg-paper/10 hover:text-paper');

  // 5) Gradientes (hero placeholder + CTA) → sección oscura cartográfica
  html = html.replace(new RegExp(`bg-gradient-to-(?:br|r) from-(?:${alt(ALL)})-\\d{2,3} to-(?:${alt(ALL)})-\\d{2,3}`, 'g'), 'bg-ink topo');

  // 6) Texto blanco sobre oscuro → paper
  html = html.replace(/text-white/g, 'text-paper');

  // 7) Botones/badges sólidos de acento → ink (consistente con la landing)
  html = html.replace(new RegExp(`hover:bg-(?:${alt(ALL)})-(?:500|600|700|800|900)`, 'g'), 'hover:bg-ink2');
  html = html.replace(new RegExp(`bg-(?:${alt(ALL)})-(?:500|600|700|800|900)`, 'g'), 'bg-ink');

  // 8) Fondos suaves de acento (callouts, thead, badges) → bone
  html = html.replace(new RegExp(`bg-(?:${alt(ALL)})-(?:50|100|200|300)`, 'g'), 'bg-bone');

  // 9) Bordes de acento: suaves → ink/10 ; fuertes (callouts) → biz (ámbar)
  html = html.replace(new RegExp(`border-(?:${alt(ALL)})-(?:100|200)`, 'g'), 'border-ink/10');
  html = html.replace(new RegExp(`border-(?:${alt(ALL)})-(?:300|400|500|600|700)`, 'g'), 'border-biz');

  // 10) Texto de acento
  html = html.replace(new RegExp(`text-(?:${alt(POS)})-(?:500|600|700)`, 'g'), 'text-agro');      // positivos → verde
  html = html.replace(new RegExp(`text-(?:${alt(NEU)})-(?:500|600|700)`, 'g'), 'text-analytics'); // neutros → azul
  html = html.replace(new RegExp(`text-(?:${alt(ALL)})-(?:800|900)`, 'g'), 'text-ink');           // títulos callout
  html = html.replace(new RegExp(`text-(?:${alt(ALL)})-(?:100|200|300|400)`, 'g'), 'text-paper/80'); // sobre oscuro
  // (los rojos text-600/700 se conservan: señalan cifras negativas en tablas)

  // 11) Tokens primary/secondary/accent
  html = html.replace(/hover:bg-secondary/g, 'hover:bg-ink2');
  html = html.replace(/bg-primary/g, 'bg-ink');
  html = html.replace(/bg-secondary/g, 'bg-ink2');
  html = html.replace(/bg-accent/g, 'bg-biz');
  html = html.replace(/text-primary hover:text-secondary/g, 'text-analytics hover:text-ink');
  html = html.replace(/hover:text-primary/g, 'hover:text-ink');
  html = html.replace(/hover:text-secondary/g, 'hover:text-ink');
  html = html.replace(/text-primary/g, 'text-analytics');
  html = html.replace(/text-secondary/g, 'text-ink');
  html = html.replace(/text-accent/g, 'text-biz');

  // 12) Escala de grises → tokens
  html = html.replace(/bg-gray-900/g, 'bg-ink');
  html = html.replace(/bg-gray-(?:700|800)/g, 'bg-ink2');
  html = html.replace(/bg-gray-(?:600)/g, 'bg-ink2');
  html = html.replace(/bg-gray-50\b/g, 'bg-bone/50');       // filas alternas de tabla
  html = html.replace(/bg-gray-(?:100|200|300)/g, 'bg-bone');
  html = html.replace(/text-gray-900/g, 'text-ink');
  html = html.replace(/text-gray-800/g, 'text-ink/80');
  html = html.replace(/text-gray-700/g, 'text-ink/75');
  html = html.replace(/text-gray-600/g, 'text-ink/60');
  html = html.replace(/text-gray-500/g, 'text-ink/50');
  html = html.replace(/text-gray-400/g, 'text-paper/60');
  html = html.replace(/text-gray-300/g, 'text-paper/70');
  html = html.replace(/border-gray-(?:700|800|900)/g, 'border-paper/10');
  html = html.replace(/border-gray-(?:100|200|300|400|500|600)/g, 'border-ink/10');
  html = html.replace(/hover:bg-gray-(?:50|100|200|300)/g, 'hover:bg-bone');
  html = html.replace(/divide-gray-200/g, 'divide-ink/10');

  // 13) bg-white restante (tarjetas/tablas) → paper
  html = html.replace(/bg-white/g, 'bg-paper');

  // 14) Script del menú móvil antes de </body>
  if (html.includes('id="mobile-menu-btn"') && !html.includes('mobileMenuBtn')) {
    html = html.replace(/<\/body>/, MOBILE_SCRIPT);
  }

  return html;
}

function main() {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.html'));
  let changed = 0;
  for (const f of files) {
    const fp = path.join(DIR, f);
    const orig = fs.readFileSync(fp, 'utf8');
    if (!orig.includes('cdn.tailwindcss.com')) {
      continue; // ya migrado
    }
    const out = migrate(orig);
    if (out !== orig) {
      fs.writeFileSync(fp, out);
      changed++;
      console.log(`✅ ${f}`);
    }
  }
  console.log(`\n🎯 ${changed}/${files.length} artículos migrados`);
}

main();
