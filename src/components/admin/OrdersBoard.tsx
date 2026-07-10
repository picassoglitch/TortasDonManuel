"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Phone, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn, formatPrice } from "@/lib/utils";
import { ErrorNote, LoadingRow, api } from "@/components/admin/ui";

type OrderLine = {
  name: string;
  variantLabel?: string;
  unitPrice: number;
  qty: number;
  detail?: string[];
};

type OrderStatus = "RECEIVED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";

type AdminOrder = {
  id: string;
  number: number;
  customerName: string;
  customerPhone: string;
  notes: string | null;
  pickupTime: string | null;
  items: OrderLine[];
  total: number;
  paymentMethod: "CASH" | "MERCADOPAGO";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  status: OrderStatus;
  createdAt: string;
};

const STATUS_META: Record<OrderStatus, { label: string; badge: "dorado" | "rojo" | "verde" | "negro" | "outline" }> = {
  RECEIVED: { label: "Recibido", badge: "rojo" },
  PREPARING: { label: "Preparando", badge: "dorado" },
  READY: { label: "Listo", badge: "verde" },
  COMPLETED: { label: "Entregado", badge: "negro" },
  CANCELLED: { label: "Cancelado", badge: "outline" },
};

const NEXT_ACTION: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  RECEIVED: { to: "PREPARING", label: "Empezar a preparar" },
  PREPARING: { to: "READY", label: "Marcar listo" },
  READY: { to: "COMPLETED", label: "Entregado" },
};

type Filter = "ACTIVE" | OrderStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "ACTIVE", label: "Activos" },
  { key: "RECEIVED", label: "Recibidos" },
  { key: "PREPARING", label: "Preparando" },
  { key: "READY", label: "Listos" },
  { key: "COMPLETED", label: "Entregados" },
  { key: "CANCELLED", label: "Cancelados" },
];

function timeLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function minutesAgo(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  return `hace ${Math.floor(mins / 60)} h ${mins % 60} min`;
}

function OrderCard({
  order,
  onPatch,
  busy,
}: {
  order: AdminOrder;
  onPatch: (id: string, status: OrderStatus) => void;
  busy: boolean;
}) {
  const meta = STATUS_META[order.status];
  const action = NEXT_ACTION[order.status];
  const active = order.status === "RECEIVED" || order.status === "PREPARING" || order.status === "READY";

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-2xl border-2 bg-white p-4",
        order.status === "RECEIVED" ? "border-rojo" : "border-negro/10"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-2xl leading-none">#{order.number}</p>
          <p className="mt-1 text-sm text-negro/60">
            {timeLabel(order.createdAt)} · {minutesAgo(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={meta.badge}>{meta.label}</Badge>
          <Badge variant={order.paymentStatus === "PAID" ? "verde" : "outline"}>
            {order.paymentMethod === "CASH" ? "Efectivo" : "Mercado Pago"}
            {order.paymentStatus === "PAID" ? " · Pagado" : order.paymentStatus === "FAILED" ? " · Falló" : ""}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <p className="font-bold">{order.customerName}</p>
        <a
          href={`tel:${order.customerPhone}`}
          className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-rojo underline underline-offset-2"
        >
          <Phone size={16} />
          {order.customerPhone}
        </a>
        {order.pickupTime && (
          <span className="text-sm font-semibold text-negro/70">Recoge: {order.pickupTime}</span>
        )}
      </div>

      <ul className="divide-y divide-negro/5 rounded-xl bg-crema px-3">
        {order.items.map((line, i) => (
          <li key={i} className="py-2">
            <div className="flex justify-between gap-2 font-semibold">
              <span>
                {line.qty}× {line.name}
                {line.variantLabel ? ` — ${line.variantLabel}` : ""}
              </span>
              <span>{formatPrice(line.unitPrice * line.qty)}</span>
            </div>
            {line.detail && line.detail.length > 0 && (
              <p className="mt-0.5 text-sm text-negro/60">{line.detail.join(" · ")}</p>
            )}
          </li>
        ))}
      </ul>

      {order.notes && (
        <p className="rounded-xl bg-dorado/15 px-3 py-2 text-sm font-semibold text-negro/80">
          Nota: {order.notes}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-xl">{formatPrice(order.total)}</p>
        {active && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (confirm(`¿Cancelar el pedido #${order.number}?`)) onPatch(order.id, "CANCELLED");
              }}
              disabled={busy}
              className="min-h-12 rounded-xl px-4 text-sm font-bold uppercase tracking-wide text-negro/50 hover:bg-negro/10 disabled:opacity-50"
            >
              Cancelar
            </button>
            {action && (
              <button
                onClick={() => onPatch(order.id, action.to)}
                disabled={busy}
                className="min-h-12 rounded-xl bg-rojo px-5 text-sm font-bold uppercase tracking-wide text-crema hover:bg-rojo-vivo disabled:opacity-50"
              >
                {action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export function OrdersBoard() {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("ACTIVE");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const data = await api<{ orders: AdminOrder[] }>("/api/admin/orders");
      setOrders(data.orders);
      setError(null);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los pedidos");
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 10_000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  async function patch(id: string, status: OrderStatus) {
    setBusyId(id);
    try {
      const data = await api<{ order: AdminOrder }>(`/api/admin/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev?.map((o) => (o.id === id ? data.order : o)) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el pedido");
    } finally {
      setBusyId(null);
    }
  }

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      ACTIVE: 0,
      RECEIVED: 0,
      PREPARING: 0,
      READY: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    for (const o of orders ?? []) {
      c[o.status] += 1;
      if (o.status === "RECEIVED" || o.status === "PREPARING" || o.status === "READY") c.ACTIVE += 1;
    }
    return c;
  }, [orders]);

  const visible = useMemo(() => {
    if (!orders) return [];
    if (filter === "ACTIVE") {
      return orders.filter((o) => o.status === "RECEIVED" || o.status === "PREPARING" || o.status === "READY");
    }
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-[clamp(1.5rem,5vw,2rem)]">Pedidos</h1>
        <button
          onClick={load}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-negro/50 hover:bg-negro/10"
        >
          <RefreshCw size={16} />
          {updatedAt
            ? updatedAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
            : "Actualizar"}
        </button>
      </div>

      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "min-h-11 shrink-0 rounded-full px-4 text-sm font-bold uppercase tracking-wide transition-colors",
              filter === key ? "bg-negro text-crema" : "bg-negro/10 text-negro/60 hover:bg-negro/20"
            )}
          >
            {label}
            {counts[key] > 0 && ` (${counts[key]})`}
          </button>
        ))}
      </div>

      <ErrorNote msg={error} />

      {orders === null && !error && <LoadingRow text="Cargando pedidos…" />}

      {orders !== null && visible.length === 0 && (
        <p className="rounded-2xl border-2 border-dashed border-negro/15 py-14 text-center font-semibold text-negro/40">
          Sin pedidos en esta vista. Se actualiza solo cada 10 segundos.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {visible.map((order) => (
          <OrderCard key={order.id} order={order} onPatch={patch} busy={busyId === order.id} />
        ))}
      </div>
    </div>
  );
}
