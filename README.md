# Tortas Don Manuel

Sitio oficial de pedidos de Tortas Don Manuel — Tizimín 163-8, Lomas de Padierna, Tlalpan, CDMX. Desde 1972.

Next.js 15 · Postgres (Prisma) · Mercado Pago · Railway.

## Funcionalidad

- **Storefront** — landing inmersiva, menú completo, arma tu torta, carrito y checkout en una sola pantalla (pickup en tienda).
- **Pagos** — efectivo al recoger siempre; Mercado Pago (tarjeta/OXXO/SPEI) activable con `NEXT_PUBLIC_PAYMENTS_ENABLED=true`.
- **Carta QR** — `/carta`: menú de solo lectura para consultar en el local vía QR (noindex, sin navegación ni carrito). El QR imprimible se genera en el admin.
- **Admin** — `/admin`: pedidos en vivo, CRUD de menú y del armador, QR, ajustes. Protegido por sesión JWT.

## Desarrollo local

```bash
cp .env.example .env   # completa DATABASE_URL y SESSION_SECRET
npm install
npx prisma migrate dev # o db:push si no quieres migraciones locales
npm run db:seed        # crea admin (SEED_ADMIN_*) y todo el menú
npm run dev
```

Sin base de datos, el sitio público sigue funcionando con el menú estático de respaldo (`src/lib/menu-data.ts`); el admin sí requiere Postgres.

## Deploy en Railway

1. Nuevo proyecto → **Deploy from GitHub repo** (este repo).
2. Agrega el plugin **PostgreSQL**; Railway inyecta `DATABASE_URL`.
3. Variables (Settings → Variables): copia de `.env.example` — como mínimo `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL` (el dominio), `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`.
4. El deploy corre `prisma migrate deploy` + `next start` (ver `railway.json`, healthcheck en `/api/health`).
5. Primera vez: `railway run npm run db:seed` para poblar menú y admin.
6. Dominio propio: Settings → Networking → Custom Domain.
7. Mercado Pago: crea credenciales en el panel de desarrolladores de MP, setea `MERCADOPAGO_ACCESS_TOKEN` + `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` y enciende `NEXT_PUBLIC_PAYMENTS_ENABLED=true`.

## Integración futura: Soft Restaurant

Los pedidos viven detrás de `/api/orders`; para empujarlos al POS Soft Restaurant se agrega un provider en ese endpoint cuando el cliente entregue credenciales de su API.
