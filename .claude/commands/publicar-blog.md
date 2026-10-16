# Skill: Publicar Blog en LokusData

Cuando el usuario invoque este comando, sigue estos pasos para publicar un nuevo artículo en el blog de LokusData.

## Información del proyecto

- **Ruta del proyecto:** C:\paginas\LOKUSDATA
- **Artículos HTML:** blog/articulos/
- **Base de datos de posts:** blog/posts.json
- **Página principal:** index.html
- **Borradores redes:** social-drafts/

## Datos que necesitas del usuario

1. **Título** del artículo
2. **Categoría** (Economía, Análisis, Tecnología, Demografía, Social, Educación)
3. **Contenido** completo del artículo

## Pasos a ejecutar

### 1. Crear archivo HTML del artículo

- **Nombre del archivo:** `YYYY-MM-DD-slug-del-titulo.html`
- **Ubicación:** `blog/articulos/`
- **Usar como plantilla:** Cualquier artículo existente en esa carpeta (todos ya usan el sistema cartográfico nuevo). El mejor ejemplo: `2026-06-26-consolidacion-tequila-779-179-empresas.html`.

**SISTEMA DE DISEÑO (cartográfico, igual que la landing/blog.html) — NO usar el viejo:**
- **NO** uses Tailwind CDN ni `tailwind.config` inline. El `<head>` carga las fuentes de Google (Space Grotesk + Inter + JetBrains Mono) y `<link rel="stylesheet" href="../../assets/styles.css">`.
- **Tokens de color** (definidos en `tailwind.config.js`): `ink` `#0A1626`, `ink2` `#0F2238`, `paper` `#F6F3EC`, `bone` `#EDE8DD`, `biz` (ámbar) `#E8A33D`, `analytics` (azul) `#3B82F6`, `agro` (verde) `#2FA86A`.
- **body:** `bg-paper text-ink antialiased`. **nav y footer:** copiar los de `blog.html` (con rutas `../../`).
- **Hero de portada y CTA:** sección oscura `bg-ink topo` (no gradientes de colores). Botón principal `bg-biz text-ink`; botón secundario `border border-paper/25 text-paper`.
- **Kicker / etiqueta de categoría:** `mono coord uppercase text-biz` (estilo de la landing).
- **Tablas:** `thead` con `bg-bone`; filas alternas `bg-bone/50`; fila/dato destacado en `text-agro` (verde = positivo). Cifras **negativas** en `text-red-600`.
- **Callouts:** `bg-bone border-l-4 border-biz`, título `text-ink`, cuerpo `text-ink/80`.
- **Texto cuerpo:** `text-ink/75`; títulos `text-ink`; links `text-analytics`.
- Acento por categoría (opcional, solo en el kicker): Economía/Análisis/Industria → mantener `text-biz`; temas agro/verde → `text-agro`.

> Si por error un post sale con el diseño viejo (CDN/azul/emerald), correr `node scripts/restyle-articles.js` para migrarlo, y luego `npm run build:css`.

### 2. Actualizar posts.json

- Agregar nueva entrada AL INICIO del array
- Formato:
```json
{
  "title": "Título del artículo",
  "slug": "slug-del-titulo",
  "date": "YYYY-MM-DD",
  "author": "Juan Heriberto Rosas",
  "category": "Categoría",
  "categoryColor": "color",
  "image": "",
  "excerpt": "Resumen de 2-3 líneas",
  "url": "blog/articulos/YYYY-MM-DD-slug.html",
  "readTime": "X min",
  "featured": true,
  "keywords": [
    "búsqueda real 1 con ubicación si aplica",
    "búsqueda real 2",
    "búsqueda real 3",
    "búsqueda real 4",
    "búsqueda real 5",
    "búsqueda real 6"
  ]
}
```

**IMPORTANTE sobre keywords:**
- Mínimo 5, máximo 6 keywords por post
- Deben ser búsquedas que la gente realmente haría en Google (ej: "deuda pública Tijuana", "industria automotriz Ciudad Juárez")
- NO extraer palabras sueltas del slug — eso genera basura como "267000 empleos pausa" que nadie busca
- Incluir ubicación geográfica + tema cuando aplique (ej: "nearshoring frontera norte México")
- El script google-ads-publish.js las usa directamente como keywords de Google Ads con match type PHRASE

### 3. Actualizar index.html

- Buscar la sección `<!-- Blog/Publications Section -->`
- El nuevo artículo va como **PRIMERO** de los 3 destacados
- Mover el primero actual al segundo lugar
- Mover el segundo actual al tercer lugar
- **ELIMINAR** el tercer artículo anterior (ya no aparece en index, pero sí en blog.html)

### 4. Crear borrador LinkedIn

**Ubicación:** `social-drafts/linkedin-YYYY-MM-DD-slug.txt`

**Formato CON MUCHOS EMOJIS y HASHTAGS:**

```
🚀🔥 [TÍTULO EN MAYÚSCULAS] 🔥🚀

📊 Nuevo análisis publicado en Lokus Data

[Gancho inicial con emoji relevante]

💡 Los hallazgos clave:

✅ [Punto 1]
✅ [Punto 2]
✅ [Punto 3]
✅ [Punto 4]
✅ [Punto 5]

📈 [Dato impactante destacado]

🎯 [Conclusión o llamado a la acción]

👉 Lee el análisis completo: [URL]

━━━━━━━━━━━━━━━━━━━━━━

#[Tema1] #[Tema2] #[Tema3] #[Tema4] #[Tema5] #INEGI #México #AnálisisDeDatos #BigData #DataScience #Economía #DesarrolloRegional #Productividad #Negocios #Empresas #Estadísticas #LokusData #InteligenciaDeNegocios #TransformaciónDigital #[+relevantes al tema]
```

**Reglas LinkedIn:**
- Mínimo 15-20 hashtags
- Emojis en cada sección
- Formato visual con líneas separadoras
- Datos duros destacados con emojis de números o gráficas

### 5. Crear borrador Twitter/X

**Ubicación:** `social-drafts/twitter-x-YYYY-MM-DD-slug.txt`

**Formato UN SOLO TWEET (no hilo):**

```
🚀 [Título corto o gancho]

[1-2 datos impactantes máximo]

👉 [URL]

#INEGI #México #[2-3 hashtags relevantes]
```

**Reglas Twitter/X:**
- MÁXIMO 280 caracteres
- UN solo tweet, NUNCA hilo
- Solo 3-5 hashtags
- Ir al grano

### 6. SEO automático (OBLIGATORIO antes del commit)

Después de actualizar `posts.json` y crear el HTML, ejecutar:

```bash
cd "C:\paginas\LOKUSDATA"
node scripts/inject-tracking.js   # inyecta GA4 + Ads + JSON-LD en el post nuevo
npm run build:css                 # recompila assets/styles.css con las clases del post nuevo
node scripts/seo-build.js         # SOLO regenera sitemap.xml (sin ping todavía)
# google-ads-publish.js: RETIRADO (decisión del dueño, 2026-08-05) — NO correrlo
```

Esto:
- Mete tracking de GA4 (G-VCQHS6GXFE) y Google Ads (AW-17620097832) en el HTML
- Recompila el CSS cartográfico (`assets/styles.css`) para que cualquier clase nueva del post quede incluida (el `tailwind.config.js` escanea `blog/articulos/**/*.html`)
- Inyecta JSON-LD Article schema (rich snippets)
- Regenera `sitemap.xml`

**El ping de IndexNow se hace DESPUÉS del push (paso 7).** Antes del push el post
nuevo aún no está desplegado en GitHub Pages (responde 404), y avisarle a los
buscadores de una URL muerta resta SEO. `seo-build.js --ping <url>` ahora verifica
que la URL responda HTTP 200 (reintentando hasta ~30s mientras despliega) antes de
pingear; las que no respondan 200 se omiten con un `⚠️`.

**Google Ads — RETIRADO (decisión del dueño, 2026-08-05):** las campañas quedaron pausadas definitivamente y los blogs se publican SIN pauta. NO correr `google-ads-publish.js` ni ningún otro script de ads. Las notas siguientes quedan solo como histórico:
- **NUNCA** uses `2>/dev/null` ni `|| echo` al correr `google-ads-publish.js`. Eso oculta los errores reales de la API. Corre el comando limpio y LEE la salida completa.
- El script termina con `🎯 Resumen: X OK, Y fallos`. Si `Y > 0`, **NO está hecho** — hay que ver el error y resolverlo, no darlo por omitido.
- Si falta `.env`, el script lo dice explícitamente (`❌ Faltan variables en .env`). Solo en ese caso es "omitido"; cualquier otro fallo se arregla.
- El script ya es idempotente: si reintentas, reutiliza el ad group existente (no lo dupliques manualmente).
- Causa de fallo conocida (resuelta): Google Ads rechaza texto con **símbolos desbalanceados** (policy `SYMBOLS`/`PROHIBITED`), p. ej. un `(` sin cerrar. El script ya sanea esto, pero si vuelve a aparecer un rechazo por `SYMBOLS`, revisa headlines/descriptions por paréntesis o símbolos sueltos.

### 7. Git commit y push

```bash
cd "C:\paginas\LOKUSDATA"
# Agregar SOLO los archivos del post — NO usar `git add .` ni `git add -A`:
# eso arrastra basura como .claude/worktrees/ (repos embebidos) al commit.
git add blog/ index.html sitemap.xml social-drafts/ assets/styles.css
git status   # verificar que NO se cuele nada de .claude/ antes de commitear
git commit -m "Nuevo post: [Título del artículo]"
git push origin main

# DESPUÉS del push: pingear IndexNow con la URL del post nuevo.
# El script espera a que GitHub Pages la despliegue (HTTP 200) y entonces pingea.
node scripts/seo-build.js --ping https://lokusdata.com/blog/articulos/YYYY-MM-DD-slug.html
```

**IMPORTANTE — git (no repetir errores pasados):**
- **NUNCA** uses `git add .` ni `git add -A`. Agrega rutas explícitas (las de arriba).
- Antes del commit, corre `git status` y confirma que no aparezca nada bajo `.claude/`. Si aparece `.claude/worktrees/`, NO lo commitees (ya está en `.gitignore`).

## Checklist final (verificar todo antes de terminar)

- [ ] HTML creado en blog/articulos/
- [ ] posts.json actualizado (entrada al inicio)
- [ ] posts.json tiene campo `keywords` con 5-6 búsquedas reales (NO palabras del slug)
- [ ] index.html actualizado (3 artículos, nuevo primero)
- [ ] `node scripts/inject-tracking.js` ejecutado
- [ ] `node scripts/seo-build.js` ejecutado (regenera sitemap antes del commit)
- [ ] `npm run build:css` ejecutado y `assets/styles.css` incluido en el commit
- [ ] `google-ads-publish.js` NO ejecutado (Google Ads retirado 2026-08-05)
- [ ] Borrador LinkedIn con emojis y 15+ hashtags
- [ ] Borrador Twitter/X UN solo tweet
- [ ] `git status` revisado: nada de `.claude/` en el commit
- [ ] Git commit (rutas explícitas, NO `git add .`) y push completado
- [ ] DESPUÉS del push: `node scripts/seo-build.js --ping <url-del-post>` terminó en `IndexNow ping: HTTP 200` (no `⚠️ Omitida`)

## Respuesta al usuario

Al terminar, mostrar:
1. Archivos creados/modificados
2. URL del artículo
3. Recordatorio de publicar en LinkedIn y Twitter/X manualmente
