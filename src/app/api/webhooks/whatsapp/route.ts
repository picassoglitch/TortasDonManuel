// Webhook de WhatsApp (Meta Cloud API).
// Recibe las respuestas del dueño (botones o texto) y actualiza el estado
// del pedido, para que no tenga que entrar al panel.

import { NextRequest, NextResponse } from "next/server";
import type { Order, OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { log, money } from "@/lib/log";
import {
  STATUS_ES,
  getNotifyNumber,
  last10,
  nextStepButtons,
  sendButtons,
  sendText,
} from "@/lib/whatsapp";

// Verificación inicial del webhook (Meta manda un GET con hub.challenge).
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    log.ok("whatsapp", "Webhook verificado por Meta");
    return new Response(challenge ?? "", { status: 200 });
  }
  log.warn("whatsapp", "Intento de verificación de webhook con token inválido");
  return new Response("Forbidden", { status: 403 });
}

type IncomingMessage = {
  from?: string;
  type?: string;
  text?: { body?: string };
  interactive?: { type?: string; button_reply?: { id?: string; title?: string } };
};

const TEXT_COMMANDS: Record<string, OrderStatus | "PAID"> = {
  preparando: "PREPARING",
  listo: "READY",
  lista: "READY",
  entregado: "COMPLETED",
  entregada: "COMPLETED",
  cancelar: "CANCELLED",
  cancelado: "CANCELLED",
  pagado: "PAID",
};

const VALID_STATUS: OrderStatus[] = ["RECEIVED", "PREPARING", "READY", "COMPLETED", "CANCELLED"];

function extractMessages(body: unknown): IncomingMessage[] {
  const out: IncomingMessage[] = [];
  const entries = (body as { entry?: Array<{ changes?: Array<{ value?: { messages?: IncomingMessage[] } }> }> })
    ?.entry;
  for (const entry of entries ?? []) {
    for (const change of entry.changes ?? []) {
      out.push(...(change.value?.messages ?? []));
    }
  }
  return out;
}

// Efectivo entregado = cobrado (misma regla que el panel).
function autoPaidOnDelivery(order: Order, status: OrderStatus): PaymentStatus | undefined {
  if (status === "COMPLETED" && order.paymentMethod === "CASH" && order.paymentStatus === "PENDING") {
    return "PAID";
  }
  return undefined;
}

async function applyStatus(order: Order, status: OrderStatus, owner: string): Promise<void> {
  const paymentStatus = autoPaidOnDelivery(order, status);
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status, ...(paymentStatus ? { paymentStatus } : {}) },
  });
  log.ok(
    "whatsapp",
    `Pedido #${updated.number}: ${STATUS_ES[order.status]} → ${STATUS_ES[status]} (por WhatsApp)${
      paymentStatus ? " · pago marcado PAGADO" : ""
    }`
  );
  const confirmation = `✅ Pedido #${updated.number} → *${STATUS_ES[status]}*${
    paymentStatus ? "\n💚 Pago en efectivo marcado como cobrado." : ""
  }`;
  await sendButtons(owner, confirmation, nextStepButtons(updated));
}

async function handleCommand(
  orderRef: { id?: string; number?: number },
  command: OrderStatus | "PAID",
  owner: string
): Promise<void> {
  const order = orderRef.id
    ? await prisma.order.findUnique({ where: { id: orderRef.id } })
    : await prisma.order.findUnique({ where: { number: orderRef.number! } });
  if (!order) {
    const label = orderRef.number ?? orderRef.id;
    log.warn("whatsapp", `Comando para pedido inexistente: ${label}`);
    await sendText(owner, `No encontré el pedido #${label}. Revisa el número.`);
    return;
  }
  if (command === "PAID") {
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID" } });
    log.ok("whatsapp", `Pedido #${order.number}: pago marcado PAGADO (por WhatsApp)`);
    await sendText(owner, `💚 Pedido #${order.number} marcado como *pagado*.`);
    return;
  }
  if (order.status === command) {
    await sendText(owner, `El pedido #${order.number} ya está en *${STATUS_ES[command]}*.`);
    return;
  }
  await applyStatus(order, command, owner);
}

async function processMessage(msg: IncomingMessage, owner: string): Promise<void> {
  // Botón: id = "ord:<orderId>:<STATUS>"
  const buttonId = msg.interactive?.button_reply?.id;
  if (buttonId) {
    const [prefix, orderId, status] = buttonId.split(":");
    if (prefix === "ord" && orderId && VALID_STATUS.includes(status as OrderStatus)) {
      await handleCommand({ id: orderId }, status as OrderStatus, owner);
    } else {
      log.warn("whatsapp", `Botón con id desconocido: ${buttonId}`);
    }
    return;
  }

  // Texto: "45 listo", "#45 entregado", "45 cancelar", "45 pagado"…
  const text = msg.text?.body?.trim().toLowerCase();
  if (!text) return;
  const match = text.match(/^#?(\d{1,8})\s+([a-záéíóú]+)/i);
  const command = match ? TEXT_COMMANDS[match[2]] : undefined;
  if (match && command) {
    await handleCommand({ number: Number(match[1]) }, command, owner);
  } else {
    log.info("whatsapp", `Mensaje del dueño sin comando reconocido: "${text.slice(0, 60)}"`);
    await sendText(
      owner,
      'Para actualizar un pedido usa los botones del aviso o escribe: "45 preparando", "45 listo", "45 entregado", "45 cancelar" o "45 pagado" (usando el número del pedido).'
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const messages = extractMessages(body);
    if (messages.length) {
      const owner = await getNotifyNumber();
      for (const msg of messages) {
        const from = msg.from ?? "";
        // Solo el número del dueño puede cambiar estados.
        if (last10(from) !== last10(owner)) {
          log.warn("whatsapp", `Mensaje ignorado de número no autorizado: …${last10(from).slice(-4)}`);
          continue;
        }
        await processMessage(msg, owner);
      }
    }
  } catch (e) {
    // Nunca fallar el ack: Meta reintenta y desactiva webhooks que fallan.
    log.error("whatsapp", "Error procesando webhook de WhatsApp", e);
  }
  return NextResponse.json({ received: true });
}
