import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { badRequest, requireApiSession, serverError, unauthorized } from "../../_guard";

const schema = z.object({
  name: z.string().trim().min(1),
  subtitle: z.string().trim().optional(),
  description: z.string().trim().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!session) return unauthorized();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest();
  try {
    let slug = slugify(parsed.data.name) || "categoria";
    if (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    const category = await prisma.category.create({
      data: {
        slug,
        name: parsed.data.name,
        subtitle: parsed.data.subtitle || null,
        description: parsed.data.description || null,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
      },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch {
    return serverError();
  }
}
