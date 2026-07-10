import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getSiteConfig } from "@/lib/settings";
import { isMpConfigured } from "@/lib/mercadopago";

export const metadata: Metadata = {
  title: "Completar pedido — Tortas Don Manuel",
};

export const revalidate = 60;

export default async function CheckoutPage() {
  const { paymentsEnabled } = await getSiteConfig();
  return (
    <main className="pt-20 sm:pt-24">
      <header className="mx-auto max-w-xl px-4 pb-6 sm:px-6">
        <h1 className="text-painted font-display text-[clamp(2rem,7vw,3.2rem)] uppercase leading-none">
          Tu pedido
        </h1>
        <p className="mt-2 text-negro/70">Un solo paso y a la plancha.</p>
      </header>
      <CheckoutForm paymentsEnabled={paymentsEnabled && isMpConfigured()} />
    </main>
  );
}
