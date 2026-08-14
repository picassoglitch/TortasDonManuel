import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { siteUrl } from "@/lib/utils";

let config: MercadoPagoConfig | null = null;

function getConfig(): MercadoPagoConfig | null {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return null;
  if (!config) config = new MercadoPagoConfig({ accessToken: token });
  return config;
}

export function isMpConfigured(): boolean {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

export type OrderForPreference = {
  id: string;
  items: Array<{ name: string; variantLabel?: string; unitPrice: number; qty: number }>;
};

export async function createPreference(
  order: OrderForPreference
): Promise<{ id: string; initPoint: string } | null> {
  const cfg = getConfig();
  if (!cfg) return null;

  const site = siteUrl();
  const orderUrl = `${site}/pedido/${order.id}`;

  const res = await new Preference(cfg).create({
    body: {
      items: order.items.map((it, i) => ({
        id: `${order.id}-${i}`,
        title: it.variantLabel ? `${it.name} (${it.variantLabel})` : it.name,
        quantity: it.qty,
        unit_price: it.unitPrice,
        currency_id: "MXN",
      })),
      external_reference: order.id,
      back_urls: { success: orderUrl, failure: orderUrl, pending: orderUrl },
      auto_return: "approved",
      notification_url: `${site}/api/webhooks/mercadopago`,
      statement_descriptor: "TORTAS DON MANUEL",
      metadata: { order_id: order.id },
    },
  });

  if (!res.id || !res.init_point) return null;
  return { id: res.id, initPoint: res.init_point };
}

export async function getPayment(paymentId: string) {
  const cfg = getConfig();
  if (!cfg) return null;
  return new Payment(cfg).get({ id: paymentId });
}
