// Sin dependencias de next/headers: lo importa tanto session.ts (server) como
// middleware.ts (edge).

const DEV_SECRET = "tdm-dev-secret";

/**
 * Clave para firmar/verificar la sesión de admin.
 *
 * En producción exige SESSION_SECRET de verdad: si viene vacía —que es como
 * Vercel precarga las variables que detecta en .env.example— jose firma igual
 * con clave vacía y cualquiera podría fabricarse una cookie de admin. Mejor
 * tronar y quedarnos sin panel que dejar la puerta abierta.
 */
export function sessionSecret(): Uint8Array {
  const value = process.env.SESSION_SECRET?.trim();
  if (value) return new TextEncoder().encode(value);
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET no está configurada. Ponle un valor largo y aleatorio " +
        "en las variables de entorno (openssl rand -base64 48)."
    );
  }
  return new TextEncoder().encode(DEV_SECRET);
}
