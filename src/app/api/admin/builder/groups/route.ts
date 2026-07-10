import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { badRequest, requireApiSession, serverError, unauthorized } from "../../_guard";

const schema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  type: z.enum(["SINGLE", "MULTI"]).default("MULTI"),
  minSelect: z.number().int().min(0).default(0),
  maxSelect: z.number().int().min(0).default(0),
  required: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!session) return unauthorized();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest();
  try {
    let key = slugify(parsed.data.name) || "grupo";
    if (await prisma.builderGroup.findUnique({ where: { key } })) {
      key = `${key}-${Date.now().toString(36)}`;
    }
    const group = await prisma.builderGroup.create({
      data: {
        key,
        name: parsed.data.name,
        description: parsed.data.description || null,
        type: parsed.data.type,
        minSelect: parsed.data.minSelect,
        maxSelect: parsed.data.maxSelect,
        required: parsed.data.required,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
      },
    });
    return NextResponse.json({ group }, { status: 201 });
  } catch {
    return serverError();
  }
}
