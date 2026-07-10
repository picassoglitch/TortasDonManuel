import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { badRequest, requireApiSession, serverError, unauthorized } from "../../_guard";

const schema = z.object({
  groupId: z.string().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  price: z.number().min(0).default(0),
  isAvailable: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!session) return unauthorized();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest();
  try {
    const option = await prisma.builderOption.create({
      data: {
        groupId: parsed.data.groupId,
        name: parsed.data.name,
        description: parsed.data.description || null,
        price: parsed.data.price,
        isAvailable: parsed.data.isAvailable,
        isDefault: parsed.data.isDefault,
        sortOrder: parsed.data.sortOrder,
      },
    });
    return NextResponse.json({ option }, { status: 201 });
  } catch {
    return serverError();
  }
}
