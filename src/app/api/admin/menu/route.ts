import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiSession, serverError, unauthorized } from "../_guard";

export async function GET() {
  const session = await requireApiSession();
  if (!session) return unauthorized();
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });
    return NextResponse.json({ categories });
  } catch {
    return serverError();
  }
}
