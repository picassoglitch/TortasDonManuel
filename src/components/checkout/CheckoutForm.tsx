"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Banknote, CreditCard, Loader2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { Input } from "@/components/ui/Input";
import { formatPrice, cn } from "@/lib/utils";

const ASAP = "Lo antes posible";

const schema = z.object({
  customerName: z.string().trim().min(2, "Dinos tu nombre"),
  customerPhone: z.string().regex(/^\d{10}$/, "Teléfono a 10 dígitos"),
  pickupTime: z.string().min(1),
  notes: z.string().trim().max(300, "Máximo 300 caracteres").optional(),
  paymentMethod: z.enum(["CASH", "MERCADOPAGO"]),
});

type FieldErrors = Partial<Record<"customerName" | "customerPhone" | "notes", string>>;

function pickupSlots(): string[] {
  const out: string[] = [];
  const start = new Date(Date.now() + 25 * 60_000);
  start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15, 0, 0);
  const end = new Date();
  end.setHours(19, 30, 0, 0);
  for (let t = start.getTime(); t <= end.getTime(); t += 15 * 60_000) {
    const d = new Date(t);
    out.push(
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
    );
  }
  return out;
}

export function CheckoutForm({ paymentsEnabled }: { paymentsEnabled: boolean }) {
  const router = useRouter();
  const { lines, subtotal, clear } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [asap, setAsap] = useState(true);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<"CASH" | "MERCADOPAGO">("CASH");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [sending, setSending] = useState(false);

  const slots = useMemo(pickupSlots, []);

  if (lines.length === 0 && !sending) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-negro/5">
          <ShoppingBag className="size-8 text-negro/40" />
        </div>
        <h1 className="font-display text-2xl">No hay nada en tu carrito</h1>
        <p className="text-negro/60">Agrega algo del menú para completar tu pedido.</p>
        <div className="mt-2 flex gap-3">
          <Link href="/menu" className="btn-primary">
            Ver menú
          </Link>
          <Link href="/armala" className="btn-outline">
            Arma tu torta
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError("");
    const payload = {
      customerName: name,
      customerPhone: phone,
      pickupTime: asap ? ASAP : time || slots[0] || ASAP,
      notes: notes.trim() || undefined,
      paymentMethod: payment,
    };
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const fe: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof FieldErrors;
        if (k && !fe[k]) fe[k] = issue.message;
      }
      setErrors(fe);
      return;
    }
    setErrors({});
    setSending(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          lines: lines.map(({ kind, name: n, variantLabel, unitPrice, qty, detail }) => ({
            kind,
            name: n,
            variantLabel,
            unitPrice,
            qty,
            detail,
          })),
        }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as { id: string; initPoint?: string };
      if (payment === "MERCADOPAGO" && data.initPoint) {
        window.location.href = data.initPoint;
        return;
      }
      clear();
      router.push(`/pedido/${data.id}?ok=1`);
    } catch {
      setSending(false);
      setSubmitError(
        "No pudimos enviar tu pedido. Intenta de nuevo o llámanos al 55 5631 2022."
      );
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl px-4 pb-16 sm:px-6" noValidate>
      {/* Resumen */}
      <section className="mb-8 rounded-2xl border-2 border-negro/10 bg-white/50 p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-negro/60">Tu pedido</h2>
        <ul className="space-y-2">
          {lines.map((l) => (
            <li key={l.id} className="flex items-baseline justify-between gap-3 text-sm sm:text-base">
              <span className="min-w-0">
                <span className="font-bold tabular-nums">{l.qty}×</span> {l.name}
                {l.variantLabel && l.variantLabel !== "Única" && (
                  <span className="text-negro/60"> · {l.variantLabel}</span>
                )}
                {l.detail && l.detail.length > 0 && (
                  <span className="block truncate text-xs text-negro/50">
                    {l.detail.join(" · ")}
                  </span>
                )}
              </span>
              <span className="shrink-0 font-bold tabular-nums">
                {formatPrice(l.unitPrice * l.qty)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-baseline justify-between border-t border-negro/10 pt-3">
          <span className="font-bold uppercase tracking-wide">Total</span>
          <span className="font-display text-2xl text-rojo">{formatPrice(subtotal)}</span>
        </div>
      </section>

      {/* Datos */}
      <div className="space-y-5">
        <Input
          label="Nombre"
          name="customerName"
          autoComplete="name"
          placeholder="¿A nombre de quién?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.customerName}
        />
        <Input
          label="Teléfono (10 dígitos)"
          name="customerPhone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="55 1234 5678"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          error={errors.customerPhone}
        />

        <fieldset>
          <legend className="mb-1.5 text-sm font-bold uppercase tracking-wide text-negro/70">
            ¿Cuándo pasas?
          </legend>
          <div className="flex gap-2">
            <button
              type="button"
              aria-pressed={asap}
              onClick={() => setAsap(true)}
              className={cn(
                "min-h-12 flex-1 rounded-xl border-2 px-3 font-bold transition-colors",
                asap ? "border-rojo bg-rojo text-crema" : "border-negro/15 bg-white text-negro"
              )}
            >
              Lo antes posible
            </button>
            <button
              type="button"
              aria-pressed={!asap}
              onClick={() => setAsap(false)}
              disabled={slots.length === 0}
              className={cn(
                "min-h-12 flex-1 rounded-xl border-2 px-3 font-bold transition-colors disabled:opacity-40",
                !asap ? "border-rojo bg-rojo text-crema" : "border-negro/15 bg-white text-negro"
              )}
            >
              A una hora
            </button>
          </div>
          {!asap && slots.length > 0 && (
            <select
              aria-label="Hora de recolección"
              value={time || slots[0]}
              onChange={(e) => setTime(e.target.value)}
              className="mt-2 h-12 w-full rounded-xl border-2 border-negro/15 bg-white px-4 font-bold text-negro focus:border-rojo focus:outline-none"
            >
              {slots.map((s) => (
                <option key={s} value={s}>
                  {s} hrs
                </option>
              ))}
            </select>
          )}
        </fieldset>

        <div>
          <label
            htmlFor="notes"
            className="mb-1.5 block text-sm font-bold uppercase tracking-wide text-negro/70"
          >
            Notas <span className="font-normal normal-case text-negro/40">(opcional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            maxLength={300}
            placeholder="Sin cebolla en la Cubana, porfa"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border-2 border-negro/15 bg-white px-4 py-3 text-negro placeholder:text-negro/40 focus:border-rojo focus:outline-none"
          />
          {errors.notes && <p className="mt-1 text-sm font-semibold text-rojo">{errors.notes}</p>}
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-bold uppercase tracking-wide text-negro/70">
            ¿Cómo pagas?
          </legend>
          <div className={cn("grid gap-2", paymentsEnabled && "sm:grid-cols-2")}>
            <button
              type="button"
              aria-pressed={payment === "CASH"}
              onClick={() => setPayment("CASH")}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 text-left transition-colors",
                payment === "CASH" ? "border-verde bg-verde/10" : "border-negro/15 bg-white"
              )}
            >
              <Banknote className={cn("size-6 shrink-0", payment === "CASH" ? "text-verde" : "text-negro/40")} />
              <span>
                <span className="block font-bold leading-tight">Pago en tienda</span>
                <span className="text-sm text-negro/60">Efectivo al recoger</span>
              </span>
            </button>
            {paymentsEnabled && (
              <button
                type="button"
                aria-pressed={payment === "MERCADOPAGO"}
                onClick={() => setPayment("MERCADOPAGO")}
                className={cn(
                  "flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 text-left transition-colors",
                  payment === "MERCADOPAGO" ? "border-rojo bg-rojo/5" : "border-negro/15 bg-white"
                )}
              >
                <CreditCard className={cn("size-6 shrink-0", payment === "MERCADOPAGO" ? "text-rojo" : "text-negro/40")} />
                <span>
                  <span className="block font-bold leading-tight">Pagar en línea</span>
                  <span className="text-sm text-negro/60">Mercado Pago</span>
                </span>
              </button>
            )}
          </div>
        </fieldset>

        {submitError && (
          <p className="rounded-xl bg-rojo/10 px-4 py-3 text-sm font-semibold text-rojo">
            {submitError}
          </p>
        )}

        <button type="submit" disabled={sending} className="btn-primary min-h-14 w-full text-lg">
          {sending ? (
            <>
              <Loader2 className="size-5 animate-spin" /> Enviando…
            </>
          ) : payment === "MERCADOPAGO" ? (
            `Pagar ${formatPrice(subtotal)}`
          ) : (
            `Enviar pedido — ${formatPrice(subtotal)}`
          )}
        </button>
        <p className="text-center text-xs text-negro/50">
          Solo pickup en Tizimín 163-8, Lomas de Padierna, Tlalpan.
        </p>
      </div>
    </form>
  );
}
