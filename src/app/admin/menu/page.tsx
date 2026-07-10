import { requireAdmin } from "@/lib/auth";
import { MenuManager } from "@/components/admin/MenuManager";

export default async function AdminMenuPage() {
  await requireAdmin();
  return <MenuManager />;
}
