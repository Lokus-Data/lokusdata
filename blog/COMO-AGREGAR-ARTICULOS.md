# Cómo Agregar Artículos al Blog

Esta guía te explica cómo agregar nuevos artículos al blog de Lokus Data de forma fácil.

## Estructura del Blog

```
blog/
├── articulos/           # Carpeta con todos los artículos
│   ├── enigh-2024.html  # Ejemplo de artículo
│   └── tu-nuevo-articulo.html
└── COMO-AGREGAR-ARTICULOS.md  # Esta guía
```

---

## Pasos para Agregar un Nuevo Artículo

### 1️⃣ Copia el artículo de ejemplo

1. Ve a la carpeta `blog/articulos/`
2. Copia el archivo `enigh-2024.html`
3. Renómbralo con el tema de tu nuevo artículo (usa guiones, sin espacios)
   - Ejemplo: `censo-economico-2024.html`
   - Ejemplo: `analisis-conapo-cdmx.html`

### 2️⃣ Edita el contenido del nuevo artículo

Abre el archivo que acabas de crear y modifica:

#### **Meta tags (líneas 5-7):**
```html
<title>Tu título aquí - Lokus Data</title>
<meta name="description" content="Descripción breve de tu artículo">
```

#### **Metadata del artículo (líneas 40-50):**
```html
<div class="flex items-center text-sm text-gray-500 mb-4">
    ...
    15 de octubre de 2025  <!-- CAMBIA LA FECHA -->
    <span class="mx-2">•</span>
    <span>8 min de lectura</span>  <!-- CAMBIA EL TIEMPO DE LECTURA -->
</div>

<h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
    Tu Título Principal Aquí  <!-- CAMBIA EL TÍTULO -->
</h1>

<p class="text-xl text-gray-600">
    Tu subtítulo o descripción breve aquí  <!-- CAMBIA LA DESCRIPCIÓN -->
</p>
```

#### **Imagen destacada (líneas 58-68):**
Puedes cambiar el ícono o color de fondo:
```html
<div class="mb-8 bg-gradient-to-br from-green-500 to-green-700 rounded-xl h-96...">
    <!-- Cambia "from-blue-500 to-blue-700" por otro color -->
    <!-- Cambia el ícono SVG si quieres -->
</div>
```

#### **Contenido del artículo (líneas 70+):**
Escribe tu artículo usando:

- **Títulos principales:** `<h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">Título</h2>`
- **Subtítulos:** `<h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Subtítulo</h3>`
- **Párrafos:** `<p class="text-gray-700 mb-6">Tu texto aquí</p>`
- **Listas:**
  ```html
  <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
      <li>Primer punto</li>
      <li>Segundo punto</li>
  </ul>
  ```
- **Cajas de información:**
  ```html
  <div class="bg-blue-50 border-l-4 border-blue-600 p-6 my-6">
      <p class="text-gray-800">
          <strong>Dato importante:</strong> Información destacada aquí
      </p>
  </div>
  ```

### 3️⃣ Agrega el artículo a la página principal del blog

Abre `blog.html` y busca la sección "Articles Grid" (aproximadamente línea 60).

Copia uno de los bloques `<article>` existentes y pégalo **al inicio** del grid (para que aparezca primero).

Modifica:

```html
<article class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-1">
    <div class="h-48 bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
        <!-- Cambia el color de fondo -->
        <div class="text-white text-center p-6">
            <!-- Cambia el ícono si quieres -->
            <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="..."/>
            </svg>
            <h3 class="text-2xl font-bold">Tu Categoría</h3>
        </div>
    </div>
    <div class="p-6">
        <div class="flex items-center text-sm text-gray-500 mb-3">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">...</svg>
            15 de octubre de 2025  <!-- CAMBIA LA FECHA -->
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-3">
            Título de tu artículo  <!-- CAMBIA EL TÍTULO -->
        </h2>
        <p class="text-gray-600 mb-4">
            Resumen breve del artículo (2-3 líneas)  <!-- CAMBIA EL RESUMEN -->
        </p>
        <a href="blog/articulos/tu-nuevo-articulo.html"  <!-- CAMBIA EL ENLACE -->
           class="inline-flex items-center text-primary font-semibold hover:text-secondary transition">
            Leer más
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
        </a>
    </div>
</article>
```

### 4️⃣ Guarda y prueba

1. Guarda todos los archivos
2. Abre `blog.html` en tu navegador
3. Verifica que el nuevo artículo aparezca en la lista
4. Haz clic en "Leer más" para verificar que se vea correctamente

---

## Colores de Fondo Sugeridos para Artículos

Puedes usar estos gradientes para diferenciar categorías:

- **Azul (INEGI/General):** `from-blue-500 to-blue-700`
- **Verde (Economía):** `from-green-500 to-green-700`
- **Púrpura (Demografía):** `from-purple-500 to-purple-700`
- **Rojo (Social/CONEVAL):** `from-red-500 to-red-700`
- **Amarillo (Educación):** `from-yellow-500 to-yellow-700`
- **Índigo (Tecnología):** `from-indigo-500 to-indigo-700`
- **Rosa (Salud):** `from-pink-500 to-pink-700`

---

## Íconos SVG Útiles

### Dinero/Economía:
```html
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
```

### Edificios/DENUE:
```html
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
```

### Personas/Demografía:
```html
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
```

### Gráficas/Análisis:
```html
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
```

### Ubicación/Territorial:
```html
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
```

---

## Subir Cambios a GitHub

Después de crear tu artículo:

```bash
cd C:\paginas\LOKUSDATA
git add .
git commit -m "Nuevo artículo: [nombre del artículo]"
git push origin main
```

---

## ¿Necesitas ayuda?

Si tienes problemas o dudas, contacta a juanheriberto.rosas@lokusdata.com
