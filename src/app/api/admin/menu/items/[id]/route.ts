import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { badRequest, requireApiSession, serverError, unauthorized } from "../../../_guard";

const schema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().nullable().optional(),
  categoryId: z.string().min(1).optional(),
  imageUrl: z.string().trim().nullable().optional(),
  variants: z.array(z.object({ label: z.string().trim().min(1), price: z.number().min(0) })).min(1).optional(),
  tags: z.array(z.string()).optional(),
  isAvailable: z.boolean().optional(),
  isHoliday: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApiSession();
  if (!session) return unauthorized();
  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest();
  const data = { ...parsed.data, ...(parsed.data.imageUrl === "" ? { imageUrl: null } : {}) };
  try {
    const item = await prisma.menuItem.update({ where: { id }, data });
    return NextResponse.json({ item });
  } catch {
    return serverError();
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApiSession();
  if (!session) return unauthorized();
  const { id } = await ctx.params;
  try {
    await prisma.menuItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return serverError();
  }
}
