const DEFAULT_SITE_URL = "http://localhost:3000";

/**
 * URL pública del sitio, como origin sin diagonal final.
 * Tolera la variable vacía (Vercel la define aunque no le pongas valor),
 * sin protocolo ("tortasdonmanuel.com") o con basura; si nada sirve, cae a
 * los dominios que Vercel expone solos y al final a localhost.
 */
export function siteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL,
  ];
  for (const raw of candidates) {
    const value = raw?.trim();
    if (!value) continue;
    try {
      return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).origin;
    } catch {
      // valor inválido: probamos el siguiente candidato
    }
  }
  return DEFAULT_SITE_URL;
}

export function formatPrice(n: number): string {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

export function cn(...classes: Array<string | number | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
