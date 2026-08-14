export function GET() {
  // Location relativo: detrás de un proxy (Vercel/Railway) req.url es localhost
  return new Response(null, { status: 307, headers: { Location: "/menu" } });
}
