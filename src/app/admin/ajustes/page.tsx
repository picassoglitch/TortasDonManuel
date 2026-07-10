import { requireAdmin } from "@/lib/auth";
import { SettingsPanel } from "@/components/admin/SettingsPanel";

export default async function AdminAjustesPage() {
  await requireAdmin();
  return <SettingsPanel paymentsEnabled={process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true"} />;
}
