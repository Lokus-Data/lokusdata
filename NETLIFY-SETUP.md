# Configuración de Netlify para Lokus Data

## 1. Conectar repositorio GitHub a Netlify

### Opción A: Nuevo sitio (Recomendado)

1. Ve a https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Selecciona **GitHub**
4. Autoriza acceso si es necesario
5. Busca y selecciona: **`Lokus-Data/lokusdata`**
6. Configuración:
   ```
   Branch to deploy: main
   Build command: (dejar vacío)
   Publish directory: /
   ```
7. Click **"Deploy site"**

### Opción B: Cambiar repositorio en sitio existente

1. Ve a tu sitio actual en Netlify
2. **Site settings** → **Build & deploy** → **Continuous deployment**
3. Click **"Link to a different repository"**
4. Selecciona `Lokus-Data/lokusdata`

---

## 2. Configurar dominio personalizado

1. En tu sitio de Netlify → **Domain settings**
2. Click **"Add custom domain"**
3. Ingresa: `lokusdata.com`
4. Netlify te dará instrucciones DNS:
   ```
   A Record:
   @ → 75.2.60.5

   CNAME:
   www → tu-sitio.netlify.app
   ```
5. Ve a tu proveedor de dominio (GoDaddy, Namecheap, etc.)
6. Actualiza los registros DNS
7. Espera 24-48 horas para propagación

---

## 3. Habilitar HTTPS (SSL)

1. En Netlify → **Domain settings** → **HTTPS**
2. Click **"Verify DNS configuration"**
3. Una vez verificado, click **"Provision certificate"**
4. Habilita **"Force HTTPS"** (redirige HTTP → HTTPS automáticamente)

---

## 4. Configurar Netlify Forms

El formulario ya está configurado con `data-netlify="true"` en el código.

### Después del primer deploy:

1. Ve a **Forms** en el menú de Netlify
2. Verás el formulario **"contact"** listado
3. Click en el nombre del formulario
4. Verás todos los envíos aquí

### Configurar notificaciones por email:

1. En la página del formulario → Click **"Settings and usage"**
2. Scroll a **"Form notifications"**
3. Click **"Add notification"**
4. Selecciona **"Email notification"**
5. Configura:
   ```
   Event to listen for: New form submission
   Email to notify: juanheriberto.rosas@lokusdata.com
   ```
6. Personaliza el asunto si quieres:
   ```
   Nuevo contacto desde lokusdata.com - {{nombre}}
   ```
7. Click **"Save"**

---

## 5. Configurar variables de entorno (si fuera necesario)

Si en el futuro necesitas API keys:

1. **Site settings** → **Build & deploy** → **Environment**
2. Click **"Edit variables"**
3. Agrega tus variables
4. Re-deploya el sitio

---

## 6. Webhooks para auto-deploy

Ya está configurado automáticamente:
- Cada `git push` a la rama `main` → Deploy automático
- Puedes ver el progreso en **Deploys** → **Deploy log**

---

## 7. Verificar que todo funciona

### Checklist post-deploy:

- [ ] Sitio accesible en `https://lokusdata.com`
- [ ] HTTPS funcionando (candado verde)
- [ ] Formulario de contacto envía correctamente
- [ ] Recibes email en `juanheriberto.rosas@lokusdata.com`
- [ ] Google Analytics registra visitas
- [ ] Google Ads registra conversiones
- [ ] Blog funciona (`/blog.html`)
- [ ] Artículos del blog cargan (`/blog/articulos/enigh-2024.html`)

### Probar formulario:

1. Ve a `https://lokusdata.com#contacto`
2. Llena el formulario de prueba
3. Envía
4. Verifica:
   - En Netlify → **Forms** → Debería aparecer el envío
   - En tu email → Deberías recibir notificación
   - En Google Ads → La conversión debería registrarse (24-48h)

---

## 8. Límites de Netlify (Plan gratuito)

- ✅ **Bandwidth**: 100GB/mes (más que suficiente)
- ✅ **Build minutes**: 300 min/mes
- ✅ **Forms**: 100 envíos/mes
- ✅ **Sites**: 500 sitios
- ✅ **SSL**: Gratis e ilimitado

Si excedes, puedes upgradearte a:
- **Pro**: $19 USD/mes (1,000 forms/mes)
- **Business**: $99 USD/mes (ilimitado)

---

## 9. Monitoreo y analytics

### En Netlify:

1. **Analytics** (tab en el menú)
   - Pageviews
   - Unique visitors
   - Top pages
   - Bandwidth usage

2. **Deploys**
   - Historial de todos los deploys
   - Logs de cada deploy
   - Rollback a versiones anteriores si algo falla

3. **Forms**
   - Todos los envíos del formulario
   - Spam filtering automático
   - Exportar a CSV

### Integrar con Google Analytics:

Ya está configurado en el `<head>` del sitio:
- Google Analytics: `G-VCQHS6GXFE`
- Google Ads: `AW-17620097832`

---

## 10. Solución de problemas comunes

### Formulario no envía:

1. Verifica que `data-netlify="true"` esté presente
2. Verifica que `name="contact"` esté en el `<form>`
3. Re-deploya el sitio (Netlify escanea forms en build time)

### No recibo emails:

1. Verifica configuración en **Forms** → **Settings and usage**
2. Revisa spam/basura en tu email
3. Agrega `noreply@netlify.com` a tus contactos

### Dominio no funciona:

1. Verifica DNS en https://dnschecker.org/
2. Espera 24-48 horas para propagación completa
3. Verifica que los registros A/CNAME estén correctos

### Google Analytics no muestra datos:

1. Verifica en **Tiempo real** primero
2. Espera 24-48 horas para datos históricos
3. Verifica que el ID `G-VCQHS6GXFE` sea correcto

---

## 📞 Soporte

- **Netlify Docs**: https://docs.netlify.com/
- **Netlify Support**: https://www.netlify.com/support/
- **Community Forum**: https://answers.netlify.com/

---

**Última actualización**: Octubre 2025
