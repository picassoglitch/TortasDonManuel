import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Administración — Tortas Don Manuel",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  // Sin sesión solo /admin/login llega aquí (middleware redirige el resto)
  if (!session) return <>{children}</>;
  return <AdminShell email={session.email}>{children}</AdminShell>;
}
