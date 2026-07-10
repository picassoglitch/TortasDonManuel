import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carta — Tortas Don Manuel",
  description: "Carta completa de Tortas Don Manuel. Desde 1972 en Tlalpan, CDMX.",
  robots: { index: false, follow: false },
};

export default function CartaLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-crema text-negro">{children}</div>;
}
