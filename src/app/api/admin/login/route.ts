import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyLogin } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { log } from "@/lib/log";
import { badRequest, serverError } from "../_guard";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest();
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Correo o contraseña inválidos");
  try {
    const admin = await verifyLogin(parsed.data.email, parsed.data.password);
    if (!admin) {
      log.warn("admin", `Intento de login fallido para ${parsed.data.email}`);
      return NextResponse.json({ error: "Correo o contraseña incorrectos" }, { status: 401 });
    }
    await createSession(admin.id, admin.email);
    log.ok("admin", `Sesión iniciada: ${admin.email}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    log.error("admin", `Error en login de ${parsed.data.email}`, e);
    return serverError();
  }
}
