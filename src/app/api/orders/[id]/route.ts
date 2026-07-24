import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { log } from "@/lib/log";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }
    return NextResponse.json({
      id: order.id,
      number: order.number,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      items: order.items,
      total: order.total,
      pickupTime: order.pickupTime,
      createdAt: order.createdAt,
    });
  } catch (e) {
    log.error("db", `No se pudo consultar el pedido ${id}`, e);
    return NextResponse.json(
      { error: "No pudimos consultar el pedido. Intenta de nuevo." },
      { status: 503 }
    );
  }
}
