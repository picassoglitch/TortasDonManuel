"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  ChefHat,
  CircleAlert,
  Loader2,
  MapPin,
  MessageCircle,
  PartyPopper,
  Receipt,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, cn } from "@/lib/utils";

type OrderItem = {
  name: string;
  variantLabel?: string;
  unitPrice: number;
  qty: number;
  detail?: string[];
};

type OrderData = {
  number: number;
  status: "RECEIVED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod?: "CASH" | "MERCADOPAGO";
  items: OrderItem[];
  total: number;
  createdAt: string;
  pickupTime?: string | null;
};

const STEPS = [
  { key: "RECEIVED", label: "Recibido", icon: Receipt },
  { key: "PREPARING", label: "En la plancha", icon: ChefHat },
  { key: "READY", label: "Listo para recoger", icon: PartyPopper },
] as const;

const STATUS_INDEX: Record<OrderData["status"], number> = {
  RECEIVED: 0,
  PREPARING: 1,
  READY: 2,
  COMPLETED: 2,
  CANCELLED: -1,
};

const MAPS_URL =
  "https://maps.google.com/?q=Tizim%C3%ADn+163,+Lomas+de+Padierna,+Tlalpan,+CDMX";

function paymentBadge(o: OrderData) {
  if (o.paymentStatus === "PAID") return <Badge variant="verde">Pagado</Badge>;
  if (o.paymentStatus === "FAILED") return <Badge variant="rojo">Pago fallido</Badge>;
  if (o.paymentStatus === "REFUNDED") return <Badge variant="negro">Reembolsado</Badge>;
  if (o.paymentMethod === "MERCADOPAGO") return <Badge variant="dorado">Pago pendiente</Badge>;
  return <Badge variant="dorado">Pagas al recoger</Badge>;
}

export function OrderStatus({
  id,
  justCreated,
  whatsapp,
}: {
  id: string;
  justCreated: boolean;
  whatsapp: string;
}) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${id}`, { cache: "no-store" });
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) return;
      setOrder((await res.json()) as OrderData);
    } catch {
      /* red caída: reintenta en el siguiente tick */
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (order && (order.status === "COMPLETED" || order.status === "CANCELLED")) return;
    const t = setInterval(() => void load(), 15_000);
    return () => clearInterval(t);
  }, [load, order]);

  if (notFound) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <CircleAlert className="size-12 text-rojo" />
        <h1 className="font-display text-2xl">No encontramos este pedido</h1>
        <Link href="/menu" className="btn-primary mt-2">
          Ver el menú
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center gap-3 px-4 py-24 text-negro/60">
        <Loader2 className="size-6 animate-spin" /> Buscando tu pedido…
      </div>
    );
  }

  const stepIdx = STATUS_INDEX[order.status];
  const cancelled = order.status === "CANCELLED";

  return (
    <div className="mx-auto max-w-xl px-4 pb-16 sm:px-6">
      {justCreated && !cancelled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 rounded-2xl bg-verde px-4 py-3 text-crema"
        >
          <Check className="size-6 shrink-0" strokeWidth={3} />
          <p className="font-bold">¡Pedido recibido! Ya estamos en eso.</p>
        </motion.div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">
          Pedido <span className="text-rojo">#{order.number}</span>
        </h1>
        {paymentBadge(order)}
      </div>

      {/* Timeline */}
      {cancelled ? (
        <div className="mb-8 rounded-2xl bg-rojo/10 px-4 py-4">
          <p className="font-bold text-rojo">Este pedido fue cancelado.</p>
          <p className="mt-1 text-sm text-negro/60">
            Si tienes dudas escríbenos por WhatsApp o llámanos al 55 5631 2022.
          </p>
        </div>
      ) : (
        <ol className="mb-8 space-y-0">
          {STEPS.map((s, i) => {
            const done = i < stepIdx;
            const current = i === stepIdx && order.status !== "COMPLETED";
            const reached = i <= stepIdx;
            const Icon = s.icon;
            return (
              <li key={s.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-full border-2 transition-colors",
                      reached
                        ? "border-verde bg-verde text-crema"
                        : "border-negro/15 bg-white text-negro/30"
                    )}
                  >
                    {done || order.status === "COMPLETED" ? (
                      <Check className="size-5" strokeWidth={3} />
                    ) : (
                      <Icon className="size-5" />
                    )}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn("w-0.5 flex-1 min-h-6", i < stepIdx ? "bg-verde" : "bg-negro/10")} />
                  )}
                </div>
                <div className="pb-6 pt-2">
                  <p className={cn("font-bold leading-tight", reached ? "text-negro" : "text-negro/40")}>
                    {s.label}
                    {current && (
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                        className="ml-2 inline-block size-2 rounded-full bg-verde align-middle"
                      />
                    )}
                  </p>
                  {s.key === "READY" && reached && (
                    <p className="text-sm text-verde">¡Pásale por ella!</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {/* Detalle */}
      <section className="mb-6 rounded-2xl border-2 border-negro/10 bg-white/50 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-negro/60">Detalle</h2>
          {order.pickupTime && (
            <span className="text-sm font-bold text-negro/70">
              Recoger: {order.pickupTime}
            </span>
          )}
        </div>
        <ul className="space-y-2">
          {order.items.map((it, i) => (
            <li key={i} className="flex items-baseline justify-between gap-3 text-sm sm:text-base">
              <span className="min-w-0">
                <span className="font-bold tabular-nums">{it.qty}×</span> {it.name}
                {it.variantLabel && it.variantLabel !== "Única" && (
                  <span className="text-negro/60"> · {it.variantLabel}</span>
                )}
                {it.detail && it.detail.length > 0 && (
                  <span className="block text-xs text-negro/50">{it.detail.join(" · ")}</span>
                )}
              </span>
              <span className="shrink-0 font-bold tabular-nums">
                {formatPrice(it.unitPrice * it.qty)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-baseline justify-between border-t border-negro/10 pt-3">
          <span className="font-bold uppercase tracking-wide">Total</span>
          <span className="font-display text-2xl text-rojo">{formatPrice(order.total)}</span>
        </div>
      </section>

      {/* Ubicación + contacto */}
      <section className="rounded-2xl bg-carbon p-4 text-crema sm:p-5">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 size-5 shrink-0 text-dorado" />
          <div>
            <p className="font-bold">Tizimín 163-8, Lomas de Padierna</p>
            <p className="text-sm text-crema/60">Tlalpan, 14200 CDMX · Solo pickup</p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-crema font-bold uppercase tracking-wide text-negro transition-colors hover:bg-white"
          >
            <MapPin className="size-5" /> Cómo llegar
          </a>
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hola, tengo una duda sobre mi pedido #${order.number}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-verde font-bold uppercase tracking-wide text-crema transition-colors hover:brightness-110"
          >
            <MessageCircle className="size-5" /> ¿Dudas? Escríbenos
          </a>
        </div>
      </section>

      <div className="mt-8 text-center">
        <Link href="/menu" className="inline-flex items-center gap-2 font-bold text-rojo hover:text-rojo-vivo">
          <ShoppingBag className="size-4" /> Pedir algo más
        </Link>
      </div>
    </div>
  );
}
