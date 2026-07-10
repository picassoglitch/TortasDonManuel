import { prisma } from "@/lib/db";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) return new Response("No encontrado", { status: 404 });
    return new Response(Buffer.from(asset.data), {
      headers: {
        "Content-Type": asset.mime,
        "Content-Length": String(asset.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Error del servidor", { status: 500 });
  }
}
