import type { Metadata } from "next";
import { getMenu } from "@/lib/menu";
import { MenuBrowser } from "@/components/menu/MenuBrowser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Menú — Tortas Don Manuel",
  description:
    "Tortas tradicionales, especiales y preparados. Pedidos para recoger en Tlalpan, CDMX.",
};

export default async function MenuPage() {
  const categories = await getMenu();
  return <MenuBrowser categories={categories} />;
}
