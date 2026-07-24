import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { log } from "@/lib/log";
import { badRequest, requireApiSession, serverError, unauthorized } from "../../_guard";

const ORDER_STATUS_ES: Record<string, string> = {
  RECEIVED: "RECIBIDO",
  PREPARING: "PREPARANDO",
  READY: "LISTO",
  COMPLETED: "ENTREGADO",
  CANCELLED: "CANCELADO",
};

const PAY_STATUS_ES: Record<string, string> = {
  PENDING: "PENDIENTE",
  PAID: "PAGADO",
  FAILED: "FALLIDO",
  REFUNDED: "REEMBOLSADO",
};

const schema = z.object({
  status: z.enum(["RECEIVED", "PREPARING", "READY", "COMPLETED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApiSession();
  if (!session) return unauthorized();
  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest();
  try {
    const current = await prisma.order.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    const data: { status?: typeof parsed.data.status; paymentStatus?: typeof parsed.data.paymentStatus } = {
      ...parsed.data,
    };
    // Efectivo entregado = cobrado
    if (
      parsed.data.status === "COMPLETED" &&
      current.paymentMethod === "CASH" &&
      current.paymentStatus === "PENDING" &&
      !parsed.data.paymentStatus
    ) {
      data.paymentStatus = "PAID";
    }
    const order = await prisma.order.update({ where: { id }, data });
    const changes: string[] = [];
    if (data.status && data.status !== current.status) {
      changes.push(`estado ${ORDER_STATUS_ES[current.status]} → ${ORDER_STATUS_ES[data.status]}`);
    }
    if (data.paymentStatus && data.paymentStatus !== current.paymentStatus) {
      changes.push(`pago ${PAY_STATUS_ES[current.paymentStatus]} → ${PAY_STATUS_ES[data.paymentStatus]}`);
    }
    if (changes.length) {
      log.info("admin", `Pedido #${order.number} (${order.customerName}): ${changes.join(", ")}`);
    }
    return NextResponse.json({ order });
  } catch (e) {
    log.error("admin", `No se pudo actualizar el pedido ${id}`, e);
    return serverError();
  }
}
