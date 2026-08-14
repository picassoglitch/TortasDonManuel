import { requireAdmin } from "@/lib/auth";
import { QrPanel } from "@/components/admin/QrPanel";
import { siteUrl } from "@/lib/utils";

export default async function AdminQrPage() {
  await requireAdmin();
  return <QrPanel defaultBase={siteUrl()} />;
}
