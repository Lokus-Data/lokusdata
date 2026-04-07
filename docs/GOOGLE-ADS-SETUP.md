# Google Ads API — Setup paso a paso

Esta guía te lleva de cero a tener `.env` lleno y `npm run ads:publish` funcionando.
Toma ~30 min de trabajo activo + ~1 día de espera por aprobación de Google.

## Lo que vas a obtener

| Variable | Dónde |
|---|---|
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Cuenta MCC de Google Ads → API Center |
| `GOOGLE_ADS_CLIENT_ID` + `CLIENT_SECRET` | Google Cloud Console → OAuth credentials |
| `GOOGLE_ADS_REFRESH_TOKEN` | Lo genera `npm run ads:auth` |
| `GOOGLE_ADS_CUSTOMER_ID` | Tu cuenta de Google Ads, esquina superior derecha |
| `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | Solo si usas MCC (manager) |
| `GOOGLE_ADS_AD_GROUP_ID` | Google Ads UI → Grupo de anuncios → URL |

---

## Paso 1 — Crear cuenta MCC (Manager) si no tienes

Google Ads exige una cuenta MCC para emitir Developer Tokens, incluso si solo tienes una cuenta.

1. Ve a https://ads.google.com/home/tools/manager-accounts/
2. Click **Crear una cuenta de administrador**
3. Nombre: "LokusData MCC", país: México, moneda: MXN
4. Una vez creada, en la MCC: **Cuentas → +** → **Vincular cuenta existente** → mete el Customer ID de tu cuenta actual `AW-17620097832` (o equivalente)

> Si ya tienes MCC, salta este paso.

---

## Paso 2 — Solicitar Developer Token

1. Loguéate en tu **MCC** (no en la cuenta normal)
2. Esquina superior derecha → **Herramientas → API Center**
   (URL directa: `https://ads.google.com/aw/apicenter`)
3. Acepta los Términos
4. Verás el **Developer Token** con estado **Test access**
5. Click **Apply for Basic Access** y rellena el formulario:
   - Tipo de aplicación: **Internal tool / In-house**
   - Uso: "Automated creation of Responsive Search Ads from blog posts published on lokusdata.com"
   - Volumen estimado: bajo (~10 calls/semana)
6. Aprobación: 1-2 días hábiles

> Mientras esperas, puedes hacer **todo lo demás** y probar con `--dry-run`.

Copia el token a `.env` como `GOOGLE_ADS_DEVELOPER_TOKEN`.

---

## Paso 3 — OAuth Client en Google Cloud

1. Ve a https://console.cloud.google.com
2. Crea un proyecto nuevo: "LokusData Ads"
3. **APIs y servicios → Biblioteca** → busca "Google Ads API" → **Habilitar**
4. **APIs y servicios → Pantalla de consentimiento OAuth**:
   - Tipo de usuario: **Externo**
   - Nombre: LokusData
   - Email de soporte: el tuyo
   - Scopes: agrega `https://www.googleapis.com/auth/adwords`
   - Test users: agrega tu propio email de Google
   - **Guardar**
5. **APIs y servicios → Credenciales → + Crear credenciales → ID de cliente OAuth**:
   - Tipo: **Aplicación de escritorio**
   - Nombre: "LokusData CLI"
   - **Crear**
6. Te muestra `Client ID` y `Client Secret` → cópialos a `.env`:
   ```
   GOOGLE_ADS_CLIENT_ID=...
   GOOGLE_ADS_CLIENT_SECRET=...
   ```

---

## Paso 4 — Generar Refresh Token

```bash
npm install
npm run ads:auth
```

El script te dará una URL. Ábrela, autoriza con tu cuenta Google, copia el código, pégalo en la terminal. Te imprime el `refresh_token` → cópialo a `.env`.

---

## Paso 5 — Customer ID y Ad Group ID

**Customer ID:**
1. Entra a https://ads.google.com con la cuenta donde corren los anuncios
2. Esquina superior derecha verás algo como `123-456-7890`
3. Cópialo a `.env` SIN guiones: `GOOGLE_ADS_CUSTOMER_ID=1234567890`

**Login Customer ID** (solo si usas MCC):
- Es el Customer ID de tu cuenta MCC, también sin guiones

**Ad Group ID:**
1. Necesitas tener al menos 1 campaña + 1 grupo de anuncios ya creados en Google Ads
2. Si no tienes: créalos manualmente con tipo **Búsqueda**, presupuesto bajo (ej $50/día), keywords genéricos sobre datos/análisis México
3. Una vez en el grupo, mira la URL del navegador: `...&adGroupId=987654321&...`
4. Copia ese número a `.env` como `GOOGLE_ADS_AD_GROUP_ID`

---

## Paso 6 — Probar

```bash
# Sin enviar nada (solo imprime los headlines/descriptions que generaría)
node scripts/google-ads-publish.js --dry-run

# Si todo se ve bien, crear el anuncio del último post
npm run ads:publish

# O para un post específico
node scripts/google-ads-publish.js --slug=camaron-granja-vale-mas-que-mar-oportunidad
```

---

## A partir de aquí

Cada vez que uses `/publicar-blog`, la skill correrá automáticamente `npm run ads:publish` al final, creando el anuncio nuevo en tu cuenta sin que toques nada.

## Troubleshooting

- **`AUTHENTICATION_ERROR`** → refresh_token expiró o customer_id incorrecto
- **`DEVELOPER_TOKEN_NOT_APPROVED`** → sigues en Test access, espera aprobación o usa una cuenta de test
- **`USER_PERMISSION_DENIED`** → la cuenta OAuth no tiene acceso al customer_id; revisa que estén vinculadas en MCC
- **`AD_GROUP_AD_LABEL_DOES_NOT_EXIST`** → ad_group_id inválido
