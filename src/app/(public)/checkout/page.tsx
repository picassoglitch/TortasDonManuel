import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Completar pedido — Tortas Don Manuel",
};

export default function CheckoutPage() {
  return (
    <main className="pt-20 sm:pt-24">
      <header className="mx-auto max-w-xl px-4 pb-6 sm:px-6">
        <h1 className="text-painted font-display text-[clamp(2rem,7vw,3.2rem)] uppercase leading-none">
          Tu pedido
        </h1>
        <p className="mt-2 text-negro/70">Un solo paso y a la plancha.</p>
      </header>
      <CheckoutForm />
    </main>
  );
}
