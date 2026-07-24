import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPayment } from "@/lib/mercadopago";
import { log } from "@/lib/log";
import { notifyPayment } from "@/lib/whatsapp";
import type { PaymentStatus } from "@prisma/client";

function mapStatus(mpStatus: string | undefined): PaymentStatus | null {
  switch (mpStatus) {
    case "approved":
      return "PAID";
    case "rejected":
    case "cancelled":
      return "FAILED";
    case "refunded":
    case "charged_back":
      return "REFUNDED";
    default:
      return null;
  }
}

const STATUS_ES: Record<PaymentStatus, string> = {
  PENDING: "PENDIENTE",
  PAID: "PAGADO",
  FAILED: "FALLIDO",
  REFUNDED: "REEMBOLSADO",
};

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let topic = url.searchParams.get("type") ?? url.searchParams.get("topic");
    let paymentId = url.searchParams.get("data.id") ?? url.searchParams.get("id");

    const body = await req.json().catch(() => null);
    if (body && typeof body === "object") {
      topic = body.type ?? body.topic ?? topic;
      paymentId = body.data?.id != null ? String(body.data.id) : paymentId;
    }

    if (topic === "payment" && paymentId) {
      const payment = await getPayment(String(paymentId));
      const orderId = payment?.external_reference;
      const paymentStatus = mapStatus(payment?.status);
      if (orderId && paymentStatus) {
        const prev = await prisma.order
          .findUnique({ where: { id: orderId }, select: { paymentStatus: true } })
          .catch(() => null);
        const order = await prisma.order
          .update({
            where: { id: orderId },
            data: { paymentStatus, mpPaymentId: String(payment!.id) },
          })
          .catch((e) => {
            log.error(
              "mp-webhook",
              `Pago ${paymentId} (${payment?.status}) no se pudo aplicar al pedido ${orderId}`,
              e
            );
            return null;
          });
        if (order) {
          const line = `Pago ${paymentId}: pedido #${order.number} marcado ${STATUS_ES[paymentStatus]} (MP: ${payment?.status})`;
          if (paymentStatus === "PAID") log.ok("mp-webhook", line);
          else log.warn("mp-webhook", line);
          // MP reintenta notificaciones: avisar solo si el estado cambió.
          if (prev?.paymentStatus !== paymentStatus) void notifyPayment(order);
        }
      } else {
        log.info(
          "mp-webhook",
          `Pago ${paymentId} ignorado — estado MP "${payment?.status ?? "desconocido"}"${
            orderId ? "" : ", sin pedido asociado"
          }`
        );
      }
    } else {
      log.info("mp-webhook", `Notificación ignorada (tipo: ${topic ?? "?"}, id: ${paymentId ?? "?"})`);
    }
  } catch (e) {
    // MP reintenta solo si no respondemos 200; nunca fallar el ack
    log.error("mp-webhook", "Error procesando notificación de Mercado Pago", e);
  }
  return NextResponse.json({ received: true });
}
