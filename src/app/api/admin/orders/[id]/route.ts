import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { badRequest, requireApiSession, serverError, unauthorized } from "../../_guard";

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
    return NextResponse.json({ order });
  } catch {
    return serverError();
  }
}
