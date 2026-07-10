import { prisma } from "@/lib/db";
import type { NosotrosContent } from "@/components/home/HomeClient";

export const NOSOTROS_DEFAULTS: NosotrosContent = {
  titulo: "DESDE 1972",
  parrafo1:
    "Hace más de cincuenta años, Don Manuel abrió una pequeña tortería en Tlalpan con una sola idea: telera crujiente, guisos generosos y el sazón de casa.",
  parrafo2:
    "Hoy seguimos en la misma esquina, con la misma receta. Cada torta se arma a mano, una por una, como el primer día.",
};

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  try {
    const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    return {};
  }
}

export type SiteConfig = {
  paymentsEnabled: boolean;
  whatsapp: string;
  phone: string;
};

export async function getSiteConfig(): Promise<SiteConfig> {
  const s = await getSettings(["payments_enabled", "whatsapp_number"]);
  const paymentsEnabled =
    s.payments_enabled !== undefined
      ? s.payments_enabled === "true"
      : process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";
  return {
    paymentsEnabled,
    whatsapp:
      s.whatsapp_number?.trim() || process.env.NEXT_PUBLIC_STORE_WHATSAPP || "525556312022",
    phone: process.env.NEXT_PUBLIC_STORE_PHONE || "5556312022",
  };
}

export async function getNosotros(): Promise<NosotrosContent> {
  const s = await getSettings(["nosotros_titulo", "nosotros_p1", "nosotros_p2"]);
  return {
    titulo: s.nosotros_titulo?.trim() || NOSOTROS_DEFAULTS.titulo,
    parrafo1: s.nosotros_p1?.trim() || NOSOTROS_DEFAULTS.parrafo1,
    parrafo2: s.nosotros_p2?.trim() ?? NOSOTROS_DEFAULTS.parrafo2,
  };
}
