import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiSession, serverError, unauthorized } from "../_guard";

export async function GET() {
  const session = await requireApiSession();
  if (!session) return unauthorized();
  try {
    const groups = await prisma.builderGroup.findMany({
      orderBy: { sortOrder: "asc" },
      include: { options: { orderBy: { sortOrder: "asc" } } },
    });
    return NextResponse.json({ groups });
  } catch {
    return serverError();
  }
}
