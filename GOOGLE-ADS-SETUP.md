# Configuración de Google Ads y Google Analytics

Este documento explica cómo obtener y configurar los IDs necesarios para el seguimiento de Google Ads y Google Analytics en el sitio web de Lokus Data.

---

## 📋 Resumen

El código de seguimiento ya está implementado en `index.html`. Solo necesitas reemplazar los placeholders con tus IDs reales.

### IDs que necesitas obtener:

1. **Google Analytics 4 (GA4) Measurement ID**: `G-XXXXXXXXXX`
2. **Google Ads Conversion ID**: `AW-XXXXXXXXXX`
3. **Conversion Labels** (3 etiquetas para diferentes eventos):
   - `CONVERSION_LABEL_1` - Registro en LokusAnalytics
   - `CONVERSION_LABEL_2` - Formulario de contacto
   - `CONVERSION_LABEL_3` - Solicitud de cotización

---

## 1️⃣ Configurar Google Analytics 4 (GA4)

### Paso 1: Crear cuenta de Google Analytics
1. Ve a https://analytics.google.com/
2. Haz clic en **"Empezar a medir"** o **"Admin"** (si ya tienes cuenta)
3. Crea una nueva **Propiedad**:
   - Nombre: `Lokus Data Website`
   - Zona horaria: `(GMT-06:00) Ciudad de México`
   - Moneda: `MXN - Peso mexicano`

### Paso 2: Configurar flujo de datos
1. En **"Flujo de datos"**, selecciona **Web**
2. Agrega la URL del sitio: `https://lokusdata.com` (o tu dominio)
3. Nombre del stream: `Lokus Data Website`
4. Haz clic en **Crear stream**

### Paso 3: Obtener el Measurement ID
1. Copia el **Measurement ID** que aparece (formato: `G-XXXXXXXXXX`)
2. En `index.html`, reemplaza **ambas instancias** de `G-XXXXXXXXXX`:
   ```html
   <!-- Línea 28 -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-TU_ID_AQUI"></script>

   <!-- Línea 33 -->
   gtag('config', 'G-TU_ID_AQUI');
   ```

---

## 2️⃣ Configurar Google Ads

### Paso 1: Crear cuenta de Google Ads
1. Ve a https://ads.google.com/
2. Haz clic en **"Empezar ahora"**
3. Completa el proceso de configuración de cuenta
4. Configura facturación (necesario para activar conversiones)

### Paso 2: Obtener el Conversion ID
1. En Google Ads, ve a **Herramientas y configuración** (icono de llave inglesa)
2. Selecciona **Medición** → **Conversiones**
3. Haz clic en **+ Nueva acción de conversión**
4. Selecciona **Sitio web**
5. Copia el **ID de conversión** (formato: `AW-XXXXXXXXXX`)

### Paso 3: Configurar en index.html
Reemplaza **ambas instancias** de `AW-XXXXXXXXXX`:
```html
<!-- Línea 37 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-TU_ID_AQUI"></script>

<!-- Línea 42 -->
gtag('config', 'AW-TU_ID_AQUI');
```

---

## 3️⃣ Crear eventos de conversión

Necesitas crear 3 acciones de conversión en Google Ads:

### Conversión 1: Registro en LokusAnalytics

1. En Google Ads → **Conversiones** → **+ Nueva acción de conversión**
2. Selecciona **Sitio web**
3. Configuración:
   - **Categoría**: Registro
   - **Nombre**: `Registro LokusAnalytics`
   - **Valor**:
     - Usa valores diferentes para cada conversión: **No**
     - Valor predeterminado: `50` (o el valor que consideres)
   - **Recuento**: Una
   - **Período de conversión**: 30 días
4. Haz clic en **Crear y continuar**
5. Selecciona **Usar código de Google tag**
6. **Copia el Conversion Label** (aparece después de la barra `/` en el código)
   - Ejemplo: `AW-123456789/AbC-DeF_GhIjKlM`
   - El label es: `AbC-DeF_GhIjKlM`
7. En `index.html` línea 50, reemplaza:
   ```javascript
   'send_to': 'AW-TU_ID_AQUI/TU_LABEL_1_AQUI',
   ```

### Conversión 2: Formulario de Contacto

1. Repite el proceso anterior
2. Configuración:
   - **Categoría**: Contacto
   - **Nombre**: `Formulario de Contacto`
   - **Valor**: `30`
3. Copia el Conversion Label
4. En `index.html` línea 60, reemplaza:
   ```javascript
   'send_to': 'AW-TU_ID_AQUI/TU_LABEL_2_AQUI',
   ```

### Conversión 3: Solicitud de Cotización

1. Repite el proceso
2. Configuración:
   - **Categoría**: Envío de formulario de cliente potencial
   - **Nombre**: `Solicitud de Cotización`
   - **Valor**: `100`
3. Copia el Conversion Label
4. En `index.html` línea 70, reemplaza:
   ```javascript
   'send_to': 'AW-TU_ID_AQUI/TU_LABEL_3_AQUI',
   ```

---

## 4️⃣ Eventos implementados

El sitio ya tiene configurados estos eventos de conversión:

| Evento | Dónde se activa | Función |
|--------|----------------|---------|
| **Registro LokusAnalytics** | Todos los botones "Crear cuenta gratis", "Empezar gratis", "Empezar ahora" | `trackLokusAnalyticsSignup()` |
| **Formulario de Contacto** | Al enviar el formulario de contacto | `trackContactForm()` |
| **Solicitud de Cotización** | Botones "Solicitar cotización" y "Agendar consultoría" | `trackQuoteRequest()` |

---

## 5️⃣ Verificar que funciona

### Verificar Google Analytics
1. Ve a Google Analytics → **Informes** → **Tiempo real**
2. Abre tu sitio web en otra pestaña
3. Deberías ver tu visita en tiempo real

### Verificar Google Ads
1. Ve a Google Ads → **Conversiones**
2. Haz clic en cada conversión que creaste
3. Verás el estado: **Esperando conversiones** (normal al inicio)
4. Prueba haciendo clic en los botones del sitio
5. Las conversiones pueden tardar hasta 24 horas en aparecer

### Probar en modo desarrollador
1. Abre el sitio web
2. Presiona `F12` para abrir las herramientas de desarrollo
3. Ve a la pestaña **Console**
4. Haz clic en cualquier botón con evento de conversión
5. Deberías ver en la consola:
   - `Conversión registrada: Signup LokusAnalytics`
   - `Conversión registrada: Formulario de contacto`
   - `Conversión registrada: Solicitud de cotización`

---

## 6️⃣ Crear campañas de Google Ads

Una vez configurado el seguimiento:

1. **Campaña de Búsqueda**:
   - Palabras clave: "análisis de datos INEGI", "consultoría datos México", etc.
   - Objetivo: Conversiones (Registro LokusAnalytics)

2. **Campaña de Display/Remarketing**:
   - Público: Visitantes del sitio que no se registraron
   - Objetivo: Completar registro

3. **Campaña de YouTube** (opcional):
   - Audiencias similares a clientes actuales
   - Videos explicativos de LokusAnalytics

---

## 📊 Próximos pasos recomendados

1. **Google Tag Manager**: Migrar a GTM para gestión más fácil de tags
2. **Remarketing**: Configurar listas de remarketing en Google Ads
3. **Eventos personalizados**: Rastrear scrolls, clics en navegación, tiempo en página
4. **Google Search Console**: Conectar para datos de búsqueda orgánica
5. **Facebook Pixel**: Agregar para anuncios en Meta

---

## 🆘 Problemas comunes

### No veo conversiones
- Espera 24-48 horas (hay delay natural)
- Verifica que los IDs estén correctos (sin espacios extra)
- Revisa que la cuenta de Google Ads tenga facturación activa

### Los eventos no se disparan
- Abre la consola del navegador (F12)
- Verifica que no haya errores de JavaScript
- Comprueba que los IDs estén bien reemplazados

### Google Analytics no muestra datos
- Verifica que hayas quitado los comentarios `<!--` y `-->` del código
- Asegúrate de estar viendo la propiedad correcta en Analytics
- Comprueba que el Measurement ID sea el correcto

---

## 📞 Contacto

Si necesitas ayuda con la configuración, contacta a:
- **Email**: analytics@lokusdata.com
- **Teléfono**: +52 55 2272 7458

---

**Última actualización**: Octubre 2025
