import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { sessionSecret } from "@/lib/session-secret";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get("tdm_session")?.value;
  const loginUrl = new URL("/admin/login", req.url);
  if (!token) return NextResponse.redirect(loginUrl);

  try {
    // Si SESSION_SECRET falta en producción, sessionSecret() tira y caemos al
    // catch: sin panel, pero sin sesiones falsificables.
    await jwtVerify(token, sessionSecret());
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete("tdm_session");
    return res;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
