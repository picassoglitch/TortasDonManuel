import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { badRequest, requireApiSession, serverError, unauthorized } from "../_guard";

const schema = z.object({
  current: z.string().min(1),
  next: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
});

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!session) return unauthorized();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  try {
    const admin = await prisma.admin.findUnique({ where: { id: session.adminId } });
    if (!admin) return unauthorized();
    const ok = await bcrypt.compare(parsed.data.current, admin.passwordHash);
    if (!ok) return NextResponse.json({ error: "La contraseña actual no es correcta" }, { status: 400 });
    const passwordHash = await bcrypt.hash(parsed.data.next, 10);
    await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } });
    return NextResponse.json({ ok: true });
  } catch {
    return serverError();
  }
}
