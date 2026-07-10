import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "@/lib/session";

export async function requireApiSession(): Promise<SessionPayload | null> {
  return getSession();
}

export function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export function badRequest(msg = "Datos inválidos") {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export function serverError() {
  return NextResponse.json({ error: "Error del servidor. Revisa la conexión a la base de datos." }, { status: 500 });
}
