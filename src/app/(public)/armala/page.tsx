import type { Metadata } from "next";
import { getBuilder } from "@/lib/menu";
import { TortaBuilder } from "@/components/builder/TortaBuilder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Arma tu Torta — Tortas Don Manuel",
  description: "Constrúyela a tu gusto desde $45: elige pan, proteínas, quesos y extras.",
};

export default async function ArmalaPage() {
  const groups = await getBuilder();
  return (
    <main className="pt-20 sm:pt-24">
      <header className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <h1 className="text-painted font-display text-[clamp(2.2rem,8vw,4rem)] uppercase leading-none">
          Arma tu torta
        </h1>
        <p className="mt-2 max-w-md text-negro/70">
          Como en la fonda: tú la pides, nosotros la planchamos.
        </p>
      </header>
      <TortaBuilder groups={groups} />
    </main>
  );
}
