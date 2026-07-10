import HomeClient, { type Favorita } from "@/components/home/HomeClient";
import { getMenu } from "@/lib/menu";
import { getNosotros, getSiteConfig } from "@/lib/settings";

export const revalidate = 60;

// Fotos de respaldo mientras un platillo destacado no tenga imagen propia
const FALLBACK_IMGS: Record<string, string> = {
  cubana: "/media/torta-2.jpg",
  mexicana: "/media/torta-4.png",
  hawaiana: "/media/torta-5.png",
  rusa: "/media/torta-3.jpg",
};

async function getFavoritas(): Promise<Favorita[]> {
  const menu = await getMenu();
  return menu
    .flatMap((c) => c.items)
    .filter((i) => i.isFeatured && i.isAvailable && i.variants.length > 0)
    .slice(0, 4)
    .map((i) => ({
      name: i.name,
      price: i.variants[0].price,
      desc: i.description ?? "",
      img: i.imageUrl || FALLBACK_IMGS[i.name.toLowerCase()] || "/media/torta-2.jpg",
    }));
}

export default async function HomePage() {
  const [nosotros, site, favoritas] = await Promise.all([
    getNosotros(),
    getSiteConfig(),
    getFavoritas(),
  ]);
  return <HomeClient nosotros={nosotros} whatsapp={site.whatsapp} favoritas={favoritas} />;
}
