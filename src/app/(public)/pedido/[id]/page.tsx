import type { Metadata } from "next";
import { OrderStatus } from "./OrderStatus";

export const metadata: Metadata = {
  title: "Tu pedido — Tortas Don Manuel",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
};

export default async function PedidoPage({ params, searchParams }: Props) {
  const [{ id }, { ok }] = await Promise.all([params, searchParams]);
  return (
    <main className="pt-20 sm:pt-24">
      <OrderStatus id={id} justCreated={ok === "1"} />
    </main>
  );
}
