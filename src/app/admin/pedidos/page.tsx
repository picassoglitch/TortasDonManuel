import { requireAdmin } from "@/lib/auth";
import { OrdersBoard } from "@/components/admin/OrdersBoard";

export default async function AdminPedidosPage() {
  await requireAdmin();
  return <OrdersBoard />;
}
