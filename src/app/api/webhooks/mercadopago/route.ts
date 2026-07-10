import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPayment } from "@/lib/mercadopago";
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
        await prisma.order
          .update({
            where: { id: orderId },
            data: { paymentStatus, mpPaymentId: String(payment!.id) },
          })
          .catch(() => null);
      }
    }
  } catch {
    // MP retries on non-200 only; never fail the ack
  }
  return NextResponse.json({ received: true });
}
