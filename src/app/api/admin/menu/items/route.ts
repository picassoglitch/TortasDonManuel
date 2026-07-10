import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { badRequest, requireApiSession, serverError, unauthorized } from "../../_guard";

const schema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  categoryId: z.string().min(1),
  variants: z.array(z.object({ label: z.string().trim().min(1), price: z.number().min(0) })).min(1),
  tags: z.array(z.string()).default([]),
  isAvailable: z.boolean().default(true),
  isHoliday: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!session) return unauthorized();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest();
  try {
    let slug = slugify(parsed.data.name) || "platillo";
    if (await prisma.menuItem.findUnique({ where: { slug } })) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    const item = await prisma.menuItem.create({
      data: {
        slug,
        name: parsed.data.name,
        description: parsed.data.description || null,
        categoryId: parsed.data.categoryId,
        variants: parsed.data.variants,
        tags: parsed.data.tags,
        isAvailable: parsed.data.isAvailable,
        isHoliday: parsed.data.isHoliday,
        isFeatured: parsed.data.isFeatured,
        sortOrder: parsed.data.sortOrder,
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return serverError();
  }
}
