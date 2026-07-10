import HomeClient from "@/components/home/HomeClient";
import { getNosotros } from "@/lib/settings";

export const revalidate = 60;

export default async function HomePage() {
  const nosotros = await getNosotros();
  return <HomeClient nosotros={nosotros} />;
}
