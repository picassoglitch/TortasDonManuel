import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiSession, serverError, unauthorized } from "../_guard";

export async function GET() {
  const session = await requireApiSession();
  if (!session) return unauthorized();
  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { status: { in: ["RECEIVED", "PREPARING", "READY"] } },
          { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 120,
    });
    return NextResponse.json({ orders });
  } catch {
    return serverError();
  }
}
