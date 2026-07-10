import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { badRequest, requireApiSession, serverError, unauthorized } from "../_guard";

export async function GET() {
  const session = await requireApiSession();
  if (!session) return unauthorized();
  try {
    const rows = await prisma.setting.findMany();
    const settings: Record<string, string> = {};
    for (const row of rows) settings[row.key] = row.value;
    return NextResponse.json({ settings });
  } catch {
    return serverError();
  }
}

const schema = z.object({
  key: z.string().trim().min(1).max(64),
  value: z.string().max(2000),
});

export async function PUT(req: Request) {
  const session = await requireApiSession();
  if (!session) return unauthorized();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest();
  try {
    const setting = await prisma.setting.upsert({
      where: { key: parsed.data.key },
      update: { value: parsed.data.value },
      create: { key: parsed.data.key, value: parsed.data.value },
    });
    return NextResponse.json({ setting });
  } catch {
    return serverError();
  }
}
