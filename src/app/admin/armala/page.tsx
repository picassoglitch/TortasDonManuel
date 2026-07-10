import { requireAdmin } from "@/lib/auth";
import { BuilderManager } from "@/components/admin/BuilderManager";

export default async function AdminArmalaPage() {
  await requireAdmin();
  return <BuilderManager />;
}
