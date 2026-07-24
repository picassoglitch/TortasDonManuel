// Avisos de pedidos por WhatsApp (Meta WhatsApp Cloud API).
// El dueño recibe cada pedido con botones y puede cambiar el estado
// respondiendo desde WhatsApp, sin entrar al panel.
//
// Variables de entorno:
//   WHATSAPP_ACCESS_TOKEN    token permanente de la app de Meta
//   WHATSAPP_PHONE_NUMBER_ID id del número emisor (Cloud API)
//   WHATSAPP_VERIFY_TOKEN    secreto para verificar el webhook
//   WHATSAPP_NOTIFY_NUMBER   número del dueño (fallback del ajuste del panel)

import type { Order, OrderStatus } from "@prisma/client";
import { getSettings } from "@/lib/settings";
import { log, money } from "@/lib/log";

const GRAPH_URL = "https://graph.facebook.com/v21.0";

export function isWhatsAppConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

// Número del dueño que recibe los avisos (editable en el panel, ajuste notify_whatsapp).
export async function getNotifyNumber(): Promise<string> {
  const s = await getSettings(["notify_whatsapp"]);
  return s.notify_whatsapp?.trim() || process.env.WHATSAPP_NOTIFY_NUMBER || "5527928137";
}

// Los celulares de México llegan como 521XXXXXXXXXX en la API.
// Canonizamos a los últimos 10 dígitos para comparar y a 521+10 para enviar.
export const last10 = (n: string) => n.replace(/\D/g, "").slice(-10);
const toSendable = (n: string) => `521${last10(n)}`;

type Button = { id: string; title: string };

async function callGraph(payload: Record<string, unknown>): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    log.warn("whatsapp", "Aviso omitido: falta WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID");
    return false;
  }
  const res = await fetch(`${GRAPH_URL}/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    log.error("whatsapp", `La API de Meta rechazó el mensaje (HTTP ${res.status})`, detail);
    return false;
  }
  return true;
}

export async function sendText(to: string, body: string): Promise<boolean> {
  return callGraph({
    to: toSendable(to),
    type: "text",
    text: { body: body.slice(0, 4096) },
  });
}

export async function sendButtons(to: string, body: string, buttons: Button[]): Promise<boolean> {
  if (!buttons.length) return sendText(to, body);
  return callGraph({
    to: toSendable(to),
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body.slice(0, 1024) },
      action: {
        buttons: buttons.slice(0, 3).map((b) => ({
          type: "reply",
          reply: { id: b.id, title: b.title.slice(0, 20) },
        })),
      },
    },
  });
}

// --- Contenido de los mensajes ---------------------------------------------

type OrderItem = {
  name: string;
  variantLabel?: string;
  unitPrice: number;
  qty: number;
  detail?: string[];
};

export const STATUS_ES: Record<OrderStatus, string> = {
  RECEIVED: "RECIBIDO",
  PREPARING: "PREPARANDO",
  READY: "LISTO",
  COMPLETED: "ENTREGADO",
  CANCELLED: "CANCELADO",
};

// Botones con los siguientes pasos lógicos según el estado actual.
export function nextStepButtons(order: Pick<Order, "id" | "status">): Button[] {
  const b = (status: OrderStatus, title: string): Button => ({
    id: `ord:${order.id}:${status}`,
    title,
  });
  switch (order.status) {
    case "RECEIVED":
      return [b("PREPARING", "🍳 Preparando"), b("READY", "✅ Listo"), b("CANCELLED", "❌ Cancelar")];
    case "PREPARING":
      return [b("READY", "✅ Listo"), b("COMPLETED", "📦 Entregado"), b("CANCELLED", "❌ Cancelar")];
    case "READY":
      return [b("COMPLETED", "📦 Entregado"), b("CANCELLED", "❌ Cancelar")];
    default:
      return [];
  }
}

function paymentLine(order: Order): string {
  if (order.paymentStatus === "PAID") return "💚 Pagado";
  return order.paymentMethod === "CASH" ? "💵 Paga en tienda" : "💳 Pago en línea (pendiente)";
}

export function orderSummary(order: Order): string {
  const items = (Array.isArray(order.items) ? order.items : []) as OrderItem[];
  const lines = items.flatMap((it) => [
    `${it.qty}× ${it.name}${it.variantLabel ? ` (${it.variantLabel})` : ""} — ${money(it.unitPrice * it.qty)}`,
    ...(it.detail?.length ? [`   ${it.detail.join(", ")}`] : []),
  ]);
  return [
    `🥪 *Pedido #${order.number}* — ${order.customerName} (${order.customerPhone})`,
    ...lines,
    `*Total: ${money(order.total)}* · ${paymentLine(order)}`,
    ...(order.pickupTime ? [`🕐 Recoge: ${order.pickupTime}`] : []),
    ...(order.notes ? [`📝 ${order.notes}`] : []),
  ].join("\n");
}

// --- Avisos ----------------------------------------------------------------

// Aviso de pedido nuevo con botones para avanzar el estado.
// Nunca lanza: un fallo de WhatsApp no debe tirar la creación del pedido.
export async function notifyNewOrder(order: Order): Promise<void> {
  try {
    if (!isWhatsAppConfigured()) {
      log.warn("whatsapp", `Pedido #${order.number}: aviso no enviado, WhatsApp sin configurar`);
      return;
    }
    const to = await getNotifyNumber();
    const ok = await sendButtons(to, orderSummary(order), nextStepButtons(order));
    if (ok) log.ok("whatsapp", `Pedido #${order.number}: aviso enviado al ${last10(to)}`);
  } catch (e) {
    log.error("whatsapp", `Pedido #${order.number}: no se pudo enviar el aviso`, e);
  }
}

// Aviso de cambio en el pago (webhook de Mercado Pago).
export async function notifyPayment(order: Order): Promise<void> {
  try {
    if (!isWhatsAppConfigured()) return;
    const to = await getNotifyNumber();
    const msg =
      order.paymentStatus === "PAID"
        ? `💚 *Pedido #${order.number} PAGADO* en línea — ${money(order.total)} (${order.customerName})`
        : `⚠️ Pedido #${order.number}: el pago en línea quedó ${
            order.paymentStatus === "REFUNDED" ? "REEMBOLSADO" : "FALLIDO"
          } (${order.customerName}, ${money(order.total)})`;
    const ok = await sendText(to, msg);
    if (ok) log.ok("whatsapp", `Pedido #${order.number}: aviso de pago enviado al ${last10(to)}`);
  } catch (e) {
    log.error("whatsapp", `Pedido #${order.number}: no se pudo enviar el aviso de pago`, e);
  }
}
