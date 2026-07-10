import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiSession, serverError, unauthorized } from "../../_guard";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApiSession();
  if (!session) return unauthorized();
  const { id } = await ctx.params;
  try {
    await prisma.mediaAsset.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return serverError();
  }
}
