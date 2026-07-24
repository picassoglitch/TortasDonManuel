// Logger legible para los logs de Railway.
// Formato: HH:mm:ss [modulo] <emoji> mensaje — detalle
// info → stdout, warn/error → stderr (Railway los pinta en amarillo/rojo).

type Scope = "pedidos" | "pagos" | "mp-webhook" | "admin" | "db" | "whatsapp";

const TZ = "America/Mexico_City";

function now(): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

function fmt(scope: Scope, icon: string, msg: string): string {
  return `${now()} [${scope}] ${icon} ${msg}`;
}

// Compacta errores multilínea (p. ej. Prisma) a una sola línea legible.
function errDetail(err: unknown): string {
  let raw: string;
  if (err instanceof Error) raw = err.message;
  else if (typeof err === "string") raw = err;
  else {
    try {
      raw = JSON.stringify(err);
    } catch {
      raw = String(err);
    }
  }
  const line = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" · ");
  return line.length > 300 ? `${line.slice(0, 300)}…` : line;
}

export const log = {
  info(scope: Scope, msg: string) {
    console.log(fmt(scope, "·", msg));
  },
  ok(scope: Scope, msg: string) {
    console.log(fmt(scope, "✅", msg));
  },
  warn(scope: Scope, msg: string) {
    console.warn(fmt(scope, "⚠️", msg));
  },
  error(scope: Scope, msg: string, err?: unknown) {
    const detail = err === undefined ? "" : ` — ${errDetail(err)}`;
    console.error(fmt(scope, "❌", `${msg}${detail}`));
  },
};

export const money = (n: number) => `$${n.toFixed(2)}`;
