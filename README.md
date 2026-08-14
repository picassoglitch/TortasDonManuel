# Tortas Don Manuel

Sitio oficial de pedidos de Tortas Don Manuel — Tizimín 163-8, Lomas de Padierna, Tlalpan, CDMX. Desde 1972.

Next.js 15 · Postgres (Prisma) · Mercado Pago · Vercel.

## Funcionalidad

- **Storefront** — landing inmersiva, menú completo, arma tu torta, carrito y checkout en una sola pantalla (pickup en tienda).
- **Pagos** — efectivo al recoger siempre; Mercado Pago (tarjeta/OXXO/SPEI) activable con `NEXT_PUBLIC_PAYMENTS_ENABLED=true`.
- **Carta QR** — `/carta`: menú de solo lectura para consultar en el local vía QR (noindex, sin navegación ni carrito). El QR imprimible se genera en el admin.
- **Admin** — `/admin`: pedidos en vivo, CRUD de menú y del armador, QR, ajustes. Protegido por sesión JWT.

## Desarrollo local

```bash
cp .env.example .env   # completa DATABASE_URL, DIRECT_URL y SESSION_SECRET
npm install
npx prisma migrate dev # o db:push si no quieres migraciones locales
npm run db:seed        # crea admin (SEED_ADMIN_*) y todo el menú
npm run dev
```

Sin base de datos, el sitio público sigue funcionando con el menú estático de respaldo (`src/lib/menu-data.ts`); el admin sí requiere Postgres.

## Deploy en Vercel

**1. Base de datos.** Crea una Postgres serverless (Vercel Postgres o Neon). Necesitas las dos cadenas:

- `DATABASE_URL` — la **pooled** (host con `-pooler`), con `?sslmode=require&pgbouncer=true&connection_limit=1`. Cada invocación serverless abre su propia conexión; sin pooler y sin `connection_limit=1` la base se satura.
- `DIRECT_URL` — la directa, sin `-pooler`. Solo la usa `prisma migrate`.

**2. Proyecto.** Vercel → **Add New → Project** → importa este repo. Framework: Next.js (autodetectado). No cambies el Build Command: el repo trae un script `vercel-build` que corre `prisma generate`, luego `scripts/deploy-migrations.mjs` y luego `next build`, así que **las migraciones se aplican en cada deploy** (esto reemplaza al `startCommand` que se usaba en Railway).

Si `DATABASE_URL` o `DIRECT_URL` todavía no están configuradas, ese script avisa y sigue de largo en vez de tumbar el build: el sitio público sube igual con el menú de respaldo. Si sí están y la migración falla, el build truena a propósito.

**3. Variables de entorno** (Settings → Environment Variables), para Production y Preview: todo lo de `.env.example`. Mínimo indispensable: `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL` (el dominio final).

**4. Semilla, una sola vez.** Vercel no tiene shell remota; corre el seed desde tu máquina apuntando a la base nueva:

```bash
DATABASE_URL="<pooled>" DIRECT_URL="<directa>" npm run db:seed
```

**5. Dominio.** Settings → Domains. Actualiza `NEXT_PUBLIC_SITE_URL` y vuelve a desplegar.

**6. Mercado Pago.** Credenciales en el panel de desarrolladores de MP → `MERCADOPAGO_ACCESS_TOKEN` + `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`, y enciende `NEXT_PUBLIC_PAYMENTS_ENABLED=true`.

**7. Webhooks.** Reapunta las URLs al dominio de Vercel: Mercado Pago → `/api/webhooks/mercadopago`, WhatsApp (Meta) → `/api/webhooks/whatsapp` con el mismo `WHATSAPP_VERIFY_TOKEN`.

### Migrar los datos que ya viven en Railway

```bash
pg_dump --no-owner --no-acl "<DATABASE_URL de Railway>" -Fc -f tdm.dump
pg_restore --no-owner --no-acl -d "<DIRECT_URL de la base nueva>" tdm.dump
```

Las imágenes del panel de medios viven como `bytea` dentro de la propia base, así que el dump se las lleva; no hay archivos sueltos que copiar.

## Integración futura: Soft Restaurant

Los pedidos viven detrás de `/api/orders`; para empujarlos al POS Soft Restaurant se agrega un provider en ese endpoint cuando el cliente entregue credenciales de su API.
