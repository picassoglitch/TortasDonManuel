# Tortas Don Manuel — Build Spec

Production web app for a torta restaurant in Tlalpan, CDMX. Deploy target: Railway (Next.js + Postgres).
Domain owned by client. Reference sites: kfc.com.mx (bold, appetite-driven, fast checkout) × fiveguys.com (build-your-own, straightforward ordering) with modern immersive scroll animation.

## Business facts
- Name: Tortas Don Manuel · Instagram: @tortasdonmanuel
- Address: Tizimín 163-8, Lomas de Padierna, Tlalpan, 14200 CDMX
- Phone: 55 5631 2022 · WhatsApp: +52 55 5631 2022
- Tagline: "Tradición que se siente, sabor que no se olvida." · "Desde 1972"
- Pickup only. Payments: cash at pickup + Mercado Pago (kill-switch via env `NEXT_PUBLIC_PAYMENTS_ENABLED`).

## Stack (already installed — package.json is final, do NOT add deps)
Next.js 15.1 App Router · React 19 · TypeScript strict · Tailwind CSS v4 (via `@tailwindcss/postcss`, CSS-first config in globals.css with `@theme`) · Prisma 6 + Postgres · framer-motion 11 · lucide-react · jose (JWT session) · bcryptjs · mercadopago SDK v2 · zod · qrcode.
Path alias: `@/*` → `./src/*`.

## HARD RULES
- All UI copy in Spanish (es-MX). Prices in MXN, format `$45` (no decimals when .00): use `formatPrice` from `@/lib/utils`.
- NO AI-style comments, no verbose boilerplate comments, no attribution footers anywhere. Comment only where logic is non-obvious, in the terse style of a senior dev.
- Mobile-first. Every page must be flawless at 375px, good at 768px and 1280px. Typography uses clamp(). Touch targets ≥44px.
- Server Components by default; `"use client"` only where interactivity requires it.
- Tailwind v4: NO tailwind.config file. Design tokens via `@theme` in globals.css. Use utilities like `bg-crema`, `text-rojo` that map to tokens.
- Never crash if DB is unreachable: data-access helpers in `@/lib/menu.ts` fall back to `MENU_FALLBACK` static data.
- Escape apostrophes/accents correctly in JSX (use literal UTF-8 strings, they are fine).

## Design language ("painted wall" — see public/media/hero-wall.png)
Vintage hand-painted Mexican fonda sign × modern fast-food energy:
- `--color-crema: #F2EDE4` (stucco off-white, main bg)
- `--color-rojo: #A8201A` (deep painted red, primary)
- `--color-rojo-vivo: #C93B32` (hover/accent red)
- `--color-negro: #191512` (near-black, text + dark sections)
- `--color-carbon: #26211D` (dark section bg)
- `--color-dorado: #D9A441` (torta-bread gold, sparing accents)
- `--color-verde: #4A7048` (avocado green, success/wa)
- Font display: "Alfa Slab One" (Google Fonts, via next/font) for big headings — painted-sign feel.
- Font body: "Archivo" (Google Fonts, weights 400–900) — bold condensed energy for UI.
- Big oversized typography, generous whitespace on crema; dark sections (carbon) for menu/food photography contrast like the moody photos in public/media/torta-2.jpg, torta-3.jpg.
- Texture: subtle grain/noise overlay css on hero and dark sections (pure CSS, e.g. layered radial-gradients or an inline SVG feTurbulence data-URI — cheap, no asset).
- Animations (framer-motion): scroll-driven parallax on hero, staggered reveal of menu cards (whileInView), 3D tilt on product cards (rotateX/rotateY on pointer), sticky builder visualization that stacks ingredient layers as you pick them, smooth page transitions. Respect `prefers-reduced-motion`.

## Media assets (in /public/media)
- hero-wall.png — painted wall art (hero bg, 3.3MB, use next/image priority + object-cover)
- torta-2.jpg, torta-3.jpg — moody torta photos (dark bg — perfect on carbon sections)
- hero-loop.mp4 (360KB) — short loop, use muted autoplay loop playsInline as accent bg in a section
- ambiente.mp4 (9MB) — long video, ONLY lazy-load behind user interaction ("Ver video") or ignore

## Routes & file ownership (each agent owns ONLY its files — never touch others')

### FOUNDATION (agent F)
- `src/app/globals.css` — @import "tailwindcss"; @theme tokens above; base styles; grain utility; `.btn-primary` etc component classes if needed
- `src/app/layout.tsx` — root layout: next/font (Alfa Slab One as `--font-display`, Archivo as `--font-body`), metadata (title "Tortas Don Manuel — Desde 1972", description, es_MX locale, openGraph), `<html lang="es">`
- `src/app/api/health/route.ts` — `GET` returns `{ ok: true }` (Railway healthcheck; must NOT touch DB)
- `src/lib/utils.ts` — `formatPrice(n: number): string` ("$45" / "$49.50"), `cn(...classes)` simple joiner, `slugify(s)`
- `src/lib/menu-data.ts` — `MENU_FALLBACK` const: full menu below as typed data; export types `MenuVariant {label, price}`, `MenuItemData`, `CategoryData`, `BuilderGroupData`, `BuilderOptionData`; also `BUILDER_FALLBACK` (builder groups below)
- `src/lib/menu.ts` — server-only helpers: `getMenu(): Promise<CategoryData[]>` (Prisma → fallback on error), `getBuilder(): Promise<BuilderGroupData[]>` (same pattern). Category/items mapped to the same shape as fallback types so UI is source-agnostic.
- `src/lib/session.ts` — jose JWT in httpOnly cookie `tdm_session`: `createSession(adminId, email)`, `getSession()`, `destroySession()`. Secret from `process.env.SESSION_SECRET`. 7-day expiry.
- `src/lib/auth.ts` — `verifyLogin(email, password)` bcrypt compare against Admin table; `requireAdmin()` for server components/actions (redirect("/admin/login") if no session)
- `src/middleware.ts` — protect `/admin/**` except `/admin/login`: check `tdm_session` cookie exists (JWT verify with jose — edge-safe), redirect to `/admin/login`
- `prisma/seed.ts` — upsert admin from SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD env, upsert full menu + builder data (from the data below, same as fallback). Idempotent.
- `src/components/ui/Button.tsx`, `src/components/ui/Badge.tsx`, `src/components/ui/Input.tsx` — minimal shared primitives (variants: primary=rojo, dark, outline, ghost)

### STOREFRONT (agent S)
- `src/app/(public)/layout.tsx` — public shell: `<CartProvider>` (from `@/components/cart/CartContext`), `<Navbar/>`, `{children}`, `<Footer/>`, `<CartDrawer/>` (from `@/components/cart/CartDrawer`)
- `src/components/nav/Navbar.tsx` — sticky, transparent-over-hero → solid crema on scroll; links: Menú (/menu), Arma tu Torta (/armala), Nosotros (#nosotros), Ubicación (#ubicacion); right side cart button using `useCart()` count opening drawer via `setOpen(true)`; mobile: slide-over menu
- `src/components/nav/Footer.tsx` — dark carbon: address, phone (tel:), WhatsApp link, Instagram @tortasdonmanuel, horario, mini map link (Google Maps URL), "Desde 1972"
- `src/app/(public)/page.tsx` — landing: hero (painted-wall aesthetic — recreate hero-wall.png look in live HTML/CSS: crema stucco + grain, giant TORTAS in rojo Alfa Slab with black offset shadow, "DESDE 1972", tagline, CTA buttons "Ver Menú" + "Arma tu Torta"), parallax scroll; "Las Favoritas" section on carbon bg with torta-2/torta-3 photos + 3D tilt cards (featured: Cubana, Mexicana, Hawaiana, Rusa); "Arma tu torta" teaser section with layered-ingredient animation; "Nosotros" (desde 1972 story, short); "Ubicación" section: address, hours (Vie–Dom típico, "Abre 10:30am"), embedded Google Maps iframe (q=Tizimín+163,+Lomas+de+Padierna), phone/WhatsApp CTAs. hero-loop.mp4 accent somewhere.
- `src/app/(public)/menu/page.tsx` — server component fetching `getMenu()`, renders `<MenuBrowser>`
- `src/components/menu/MenuBrowser.tsx` — client: sticky horizontal category pills (scrollspy), sections per category, item cards with variant prices; "Agregar" button → if multiple variants show variant picker (bottom sheet on mobile / popover desktop) → `addItem` from useCart; motion whileInView staggered cards; holiday items get "Solo días festivos" Badge and disabled add
- `src/components/menu/MenuItemCard.tsx` — shared card used by MenuBrowser (and QR page read-only mode via prop `readonly`)

### CART + BUILDER + CHECKOUT (agent B)
- `src/components/cart/CartContext.tsx` — client context + localStorage persistence (`tdm_cart`). EXACT contract:
  ```ts
  export type CartLine = {
    id: string;            // uuid-ish: crypto.randomUUID()
    kind: "item" | "custom";
    name: string;          // "Torta Cubana" or "Torta a tu gusto"
    variantLabel?: string; // "Con queso"
    unitPrice: number;
    qty: number;
    detail?: string[];     // builder selections e.g. ["Telera", "Milanesa de res", "Queso Oaxaca", "+Aguacate"]
  };
  export function useCart(): {
    lines: CartLine[]; addItem(l: Omit<CartLine,"id">): void; removeLine(id: string): void;
    setQty(id: string, qty: number): void; clear(): void; subtotal: number; count: number;
    open: boolean; setOpen(v: boolean): void;
  };
  export function CartProvider({children}: {children: React.ReactNode}): JSX.Element;
  ```
- `src/components/cart/CartDrawer.tsx` — slide-over (right on desktop, bottom sheet mobile), lines with qty steppers, subtotal, CTA "Completar pedido" → /checkout. Empty state with CTA to /menu.
- `src/app/(public)/armala/page.tsx` + `src/components/builder/TortaBuilder.tsx` — "Arma tu Torta": fetches `getBuilder()` server-side, passes to client builder. Steps: Pan (telera incluida) → Proteínas → Quesos → Extras → Toppings gratis. Sticky visual panel: stacked ingredient layers (motion layout anims — colored rounded bars with labels stacking like a sandwich, playful 3D feel) + live price ticker starting at base $45. Add to cart as kind:"custom" with detail lines. Mobile: visual on top collapsed, steps below; ≤3 taps to add.
- `src/app/(public)/checkout/page.tsx` + `src/components/checkout/CheckoutForm.tsx` — single-page checkout, minimal clicks: name, phone (10 digits, zod), pickup time (ASAP or select), notes optional, payment method toggle: "Pago en tienda (efectivo)" always; "Pagar en línea (Mercado Pago)" only if `process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true"`. Submits POST /api/orders → cash: router.push(`/pedido/${id}?ok=1`), clear cart; mp: window.location = initPoint returned.
- `src/app/(public)/pedido/[id]/page.tsx` — order confirmation/status: number, status timeline (RECEIVED→PREPARING→READY), items, total, payment badge, address + "Cómo llegar" maps link, WhatsApp button "¿Dudas? Escríbenos". Poll status every 15s via GET /api/orders/[id] (client sub-component).

### ADMIN (agent A)
- `src/app/admin/login/page.tsx` — clean login (email+password) posting to server action or /api/admin/login; painted-wall mini branding
- `src/app/admin/layout.tsx` — `requireAdmin()`; responsive shell: sidebar (desktop) / bottom tabs or slide-over (mobile): Pedidos, Menú, Arma tu Torta, Código QR, Ajustes, Salir
- `src/app/admin/page.tsx` — redirect to /admin/pedidos
- `src/app/admin/pedidos/page.tsx` + client components — live orders board: columns/filters by status, card per order (number, name, phone tel: link, items detail, total, payment method+status), buttons to advance status (RECEIVED→PREPARING→READY→COMPLETED, CANCEL), auto-refresh 10s. Uses PATCH /api/admin/orders/[id].
- `src/app/admin/menu/page.tsx` + components — menu CRUD: list by category (drag not needed; sortOrder number field), toggle isAvailable switch (instant PATCH), edit dialog (name, description, variants label/price rows, tags, featured, holiday), create item, create/edit categories. Server actions or /api/admin/menu routes (agent's choice, keep consistent).
- `src/app/admin/armala/page.tsx` — builder CRUD: groups (name, type, min/max, required) and options (name, price, available, default)
- `src/app/admin/qr/page.tsx` — shows QR (lib `qrcode` toDataURL) pointing to `${NEXT_PUBLIC_SITE_URL}/carta`, print-friendly page (@media print), download PNG button, short explainer
- `src/app/admin/ajustes/page.tsx` — Settings KV editor: store hours text, announcement banner text, payments toggle note (env-controlled, display-only), change password form
- `/api/admin/*` route handlers as needed; ALL must check session via `getSession()`.

### API + QR (agent Q)
- `src/app/api/orders/route.ts` — POST create order: zod-validate body {customerName, customerPhone, pickupTime?, notes?, paymentMethod, lines: CartLine-like[]}; recompute prices SERVER-SIDE from DB/fallback (never trust client totals; for custom lines recompute from builder options by name match, fallback to client price if option not found), create Order; if MERCADOPAGO: create MP preference (items, back_urls `${SITE_URL}/pedido/{id}`, notification_url `${SITE_URL}/api/webhooks/mercadopago`, external_reference orderId), save mpPreferenceId, return {id, initPoint}; else return {id}.
- `src/app/api/orders/[id]/route.ts` — GET public order status (id is cuid — unguessable; return number, status, paymentStatus, items, total, createdAt, pickupTime)
- `src/app/api/webhooks/mercadopago/route.ts` — POST: handle `payment` topic, fetch payment via SDK, match external_reference, set paymentStatus PAID/FAILED. Always 200.
- `src/lib/mercadopago.ts` — SDK client factory from MERCADOPAGO_ACCESS_TOKEN; `createPreference(order)` helper; no-op guard when token missing.
- `src/app/carta/page.tsx` + `src/app/carta/layout.tsx` — THE QR MENU: standalone route OUTSIDE (public) group — no navbar, no cart, no ordering UI. Fast, print-clean, dark-on-crema list of full menu grouped by category with prices (all variants), holiday badges, drinks, extras. Sticky mini category nav. `robots: { index: false, follow: false }` metadata + `<meta name="robots" content="noindex">`. Footer: address + phone + IG. This page must render beautifully on a phone held in one hand at a table.

## Menu data (canonical — seed + fallback MUST match exactly)
Categories in order: tradicionales "Las Tradicionales", casa "Las de la Casa", especiales "Las Especiales", preparados "Preparados", bebidas "Bebidas".
Variant labels: "Sencilla", "Con queso", "Con huevo" (only where price exists).

LAS TRADICIONALES (variants Sencilla/Con queso/Con huevo):
- Huevo 45 / 70 / —
- Queso de puerco 45 / 70 / 60
- Jamón 45 / 70 / 60
- Salchicha 50 / 75 / 60
- Chorizo 70 / 95 / 75
- Queso Oaxaca 49 / — / 60
- Queso Panela 49 / — / 60
- Queso Menonita 49 / — / 60
- Queso Amarillo 49 / — / 60

LAS DE LA CASA (Sencilla/Con queso):
- Pierna 80 / 105
- Milanesa de res 80 / 105
- Milanesa de pollo 80 / 105
- Pierna al horno 80 / 105 (isHoliday)
- Cochinita 80 / 105 (isHoliday)

LAS ESPECIALES (single price; description = ingredients; mark featured: Cubana, Mexicana, Hawaiana, Rusa):
- Koreana (Bisteck, longaniza) 85
- Suiza (Queso blanco, queso Oaxaca, queso menonita) 80
- Hawaiana (Jamón, queso Oaxaca, piña) 85
- Salvadoreña (Milanesa o pierna, queso, piña) 100
- Cubana (Jamón, salchicha, queso Oaxaca, pierna, queso menonita y queso de puerco) 100
- Rusa (Milanesa, pierna y queso manchego) 120
- Argentina (Salchicha, milanesa y queso) 100
- Mexicana (Jamón, queso, pierna, salchicha, milanesa, longaniza) 139
- Danesa (Pollo, queso y piña) 110
- Colombiana (Jamón, queso y milanesa) 100

PREPARADOS:
- Sandwich 60
- Sandwich especial (Jamón, queso y una proteína) 70
- Burrito (Con papas) 99
- Quesadilla — variants: "1 pieza" 20, "3 piezas" 50
- Sincronizada 35
- Molletes — "2 piezas" 60
- Quesitacos — variants: "1 pieza" 30, "3 piezas" 85

BEBIDAS:
- Café de olla 30
- Refrescos 30
- Agua de sabor ½ L 25
- Agua de sabor 1 L 40

## Builder data ("Arma tu Torta") — base $45 incluye telera, frijoles, aguacate, jitomate, cebolla
Groups (key, name, type, rules):
1. `pan` "El Pan" SINGLE required — "Telera tradicional" $0 default
2. `proteina` "Proteínas" MULTI 0..3 — Huevo 15, Queso de puerco 15, Jamón 25, Salchicha 25, Chorizo 29, Pierna 40, Milanesa de res 40, Milanesa de pollo 40, Bisteck 40, Longaniza 29
3. `queso` "Quesos" MULTI 0..3 — Queso Oaxaca 25, Queso blanco 25, Queso menonita 25, Queso amarillo 25, Queso de puerco 15, Queso manchego 25
4. `extra` "Extras" MULTI — Piña 10, Papas 15, Doble frijol 5
5. `topping` "Al gusto (gratis)" MULTI — Jitomate 0 (default), Cebolla 0 (default), Aguacate 0 (default), Rajas 0, Chipotle 0, Mostaza 0, Mayonesa 0 (default), Sin picante 0
Builder base price constant: export `BUILDER_BASE_PRICE = 45` from menu-data.

## Order items JSON snapshot shape (Order.items)
`[{ name, variantLabel?, unitPrice, qty, detail?: string[] }]`

## Env (see .env.example): DATABASE_URL, NEXT_PUBLIC_SITE_URL, SESSION_SECRET, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, MERCADOPAGO_ACCESS_TOKEN, NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY, NEXT_PUBLIC_PAYMENTS_ENABLED, NEXT_PUBLIC_STORE_PHONE, NEXT_PUBLIC_STORE_WHATSAPP

## Definition of done per agent
- TypeScript strict passes for your files; imports only from spec contracts, installed deps, or your own files.
- Spanish copy, mobile-first, motion tasteful and 60fps (transform/opacity only).
- No page may throw without DB (menu/builder pages use lib fallbacks; admin pages may require DB but must fail with a friendly message, not a crash).
