// Aplica las migraciones durante el build (Vercel corre `vercel-build`).
//
// Si la base todavía no está configurada, NO revienta el build: el sitio
// público funciona sin Postgres gracias al menú de respaldo de
// src/lib/menu-data.ts. Si la base sí está configurada y la migración falla,
// el build truena a propósito: mejor eso que desplegar contra un esquema viejo.
import { spawnSync } from "node:child_process";

const missing = ["DATABASE_URL", "DIRECT_URL"].filter((k) => !process.env[k]?.trim());

if (missing.length > 0) {
  console.warn("");
  console.warn(`⚠  Falta ${missing.join(" y ")}: me salto "prisma migrate deploy".`);
  console.warn("   El sitio público va a servir el menú de respaldo y /admin no va a funcionar.");
  console.warn("   Agrega las variables en Vercel (Settings → Environment Variables)");
  console.warn("   y vuelve a desplegar para que se apliquen las migraciones.");
  console.warn("");
  process.exit(0);
}

const res = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: true,
});
process.exit(res.status ?? 1);
