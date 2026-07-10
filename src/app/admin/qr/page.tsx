import { requireAdmin } from "@/lib/auth";
import { QrPanel } from "@/components/admin/QrPanel";

export default async function AdminQrPage() {
  await requireAdmin();
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return <QrPanel defaultBase={base} />;
}
