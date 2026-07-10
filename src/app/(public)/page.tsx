import HomeClient from "@/components/home/HomeClient";
import { getNosotros, getSiteConfig } from "@/lib/settings";

export const revalidate = 60;

export default async function HomePage() {
  const [nosotros, site] = await Promise.all([getNosotros(), getSiteConfig()]);
  return <HomeClient nosotros={nosotros} whatsapp={site.whatsapp} />;
}
