import { requireAdmin } from "@/lib/auth";
import { MediaManager } from "@/components/admin/MediaManager";

export default async function AdminMediosPage() {
  await requireAdmin();
  return <MediaManager />;
}
