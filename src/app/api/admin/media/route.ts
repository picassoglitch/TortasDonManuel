import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireApiSession, serverError, unauthorized } from "../_guard";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 4 * 1024 * 1024;

export async function GET() {
  const session = await requireApiSession();
  if (!session) return unauthorized();
  try {
    const assets = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, mime: true, size: true, createdAt: true },
    });
    return NextResponse.json({ assets });
  } catch {
    return serverError();
  }
}

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!session) return unauthorized();
  let file: File | null = null;
  try {
    const form = await req.formData();
    const entry = form.get("file");
    if (entry instanceof File) file = entry;
  } catch {
    return badRequest("Envía la imagen como multipart/form-data");
  }
  if (!file) return badRequest("Falta el archivo");
  if (!ALLOWED_MIMES.includes(file.type)) {
    return badRequest("Formato no soportado. Usa JPG, PNG, WebP o AVIF");
  }
  if (file.size > MAX_SIZE) return badRequest("La imagen pesa más de 4 MB");
  try {
    const data = Buffer.from(await file.arrayBuffer());
    if (data.length > MAX_SIZE) return badRequest("La imagen pesa más de 4 MB");
    const asset = await prisma.mediaAsset.create({
      data: { name: file.name || "imagen", mime: file.type, size: data.length, data },
      select: { id: true },
    });
    return NextResponse.json({ id: asset.id, url: `/api/media/${asset.id}` }, { status: 201 });
  } catch {
    return serverError();
  }
}
