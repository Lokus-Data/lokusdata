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
- **Usar como plantilla:** Cualquier artículo existente en esa carpeta
- **Colores por categoría:**
  - Economía: `from-blue-600 to-indigo-800`
  - Análisis: `from-emerald-600 to-teal-800`
  - Tecnología: `from-indigo-500 to-purple-700`
  - Demografía: `from-purple-500 to-purple-700`
  - Social: `from-red-500 to-red-700`
  - Educación: `from-yellow-500 to-yellow-700`

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
  "featured": true
}
```

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
node scripts/seo-build.js --ping  # regenera sitemap.xml y pingea Google IndexNow
```

Esto:
- Mete tracking de GA4 (G-VCQHS6GXFE) y Google Ads (AW-17620097832) en el HTML
- Inyecta JSON-LD Article schema (rich snippets)
- Regenera `sitemap.xml`
- Avisa a Google vía IndexNow → indexación en horas, no semanas

### 7. Git commit y push

```bash
cd "C:\paginas\LOKUSDATA"
git add .
git commit -m "Nuevo post: [Título del artículo]"
git push origin main
```

## Checklist final (verificar todo antes de terminar)

- [ ] HTML creado en blog/articulos/
- [ ] posts.json actualizado (entrada al inicio)
- [ ] index.html actualizado (3 artículos, nuevo primero)
- [ ] `node scripts/inject-tracking.js` ejecutado
- [ ] `node scripts/seo-build.js --ping` ejecutado
- [ ] Borrador LinkedIn con emojis y 15+ hashtags
- [ ] Borrador Twitter/X UN solo tweet
- [ ] Git commit y push completado

## Respuesta al usuario

Al terminar, mostrar:
1. Archivos creados/modificados
2. URL del artículo
3. Recordatorio de publicar en LinkedIn y Twitter/X manualmente
