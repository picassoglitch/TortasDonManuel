import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { badRequest, requireApiSession, serverError, unauthorized } from "../../../_guard";

const schema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().nullable().optional(),
  price: z.number().min(0).optional(),
  isAvailable: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApiSession();
  if (!session) return unauthorized();
  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest();
  try {
    const option = await prisma.builderOption.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ option });
  } catch {
    return serverError();
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApiSession();
  if (!session) return unauthorized();
  const { id } = await ctx.params;
  try {
    await prisma.builderOption.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return serverError();
  }
}
