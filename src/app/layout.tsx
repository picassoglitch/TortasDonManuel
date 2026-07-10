import type { Metadata, Viewport } from "next";
import { Alfa_Slab_One, Archivo } from "next/font/google";
import "./globals.css";

const alfa = Alfa_Slab_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-alfa",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Tortas Don Manuel — Desde 1972",
    template: "%s · Tortas Don Manuel",
  },
  description:
    "Tortas artesanales en Tlalpan desde 1972. Tradición que se siente, sabor que no se olvida. Pide en línea y recoge en Tizimín 163, Lomas de Padierna, CDMX.",
  openGraph: {
    title: "Tortas Don Manuel — Desde 1972",
    description:
      "Tradición que se siente, sabor que no se olvida. Tortas artesanales en Tlalpan, CDMX.",
    locale: "es_MX",
    type: "website",
    siteName: "Tortas Don Manuel",
  },
};

export const viewport: Viewport = {
  themeColor: "#f2ede4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${alfa.variable} ${archivo.variable}`}>
      <body className="min-h-dvh bg-crema font-body text-negro antialiased">
        {children}
      </body>
    </html>
  );
}
