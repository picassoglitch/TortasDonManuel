export function GET() {
  // Location relativo: detrás del proxy de Railway req.url es localhost
  return new Response(null, { status: 307, headers: { Location: "/menu" } });
}
