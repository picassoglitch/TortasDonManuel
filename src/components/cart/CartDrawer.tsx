"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart, type CartLine } from "@/components/cart/CartContext";
import { formatPrice, cn } from "@/lib/utils";

function useDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return desktop;
}

function LineRow({ line }: { line: CartLine }) {
  const { setQty, removeLine } = useCart();
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24 }}
      className="flex gap-3 border-b border-negro/10 py-4"
    >
      <div className="min-w-0 flex-1">
        <p className="font-bold leading-tight">{line.name}</p>
        {line.variantLabel && line.variantLabel !== "Única" && (
          <p className="text-sm text-negro/60">{line.variantLabel}</p>
        )}
        {line.detail && line.detail.length > 0 && (
          <p className="mt-0.5 text-xs leading-snug text-negro/50">{line.detail.join(" · ")}</p>
        )}
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center rounded-lg border-2 border-negro/15">
            <button
              type="button"
              aria-label="Quitar uno"
              onClick={() => setQty(line.id, line.qty - 1)}
              className="grid size-9 place-items-center text-negro/70 hover:text-rojo"
            >
              <Minus className="size-4" strokeWidth={3} />
            </button>
            <span className="w-7 text-center font-bold tabular-nums">{line.qty}</span>
            <button
              type="button"
              aria-label="Agregar uno"
              onClick={() => setQty(line.id, line.qty + 1)}
              className="grid size-9 place-items-center text-negro/70 hover:text-verde"
            >
              <Plus className="size-4" strokeWidth={3} />
            </button>
          </div>
          <button
            type="button"
            aria-label={`Eliminar ${line.name}`}
            onClick={() => removeLine(line.id)}
            className="grid size-9 place-items-center rounded-lg text-negro/40 hover:bg-rojo/10 hover:text-rojo"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      <p className="shrink-0 font-bold tabular-nums">{formatPrice(line.unitPrice * line.qty)}</p>
    </motion.li>
  );
}

function DrawerBody() {
  const { lines, subtotal, setOpen } = useCart();

  if (lines.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-negro/5">
          <ShoppingBag className="size-8 text-negro/40" />
        </div>
        <p className="font-display text-xl">Tu carrito está vacío</p>
        <p className="text-sm text-negro/60">Se antoja una torta, ¿no?</p>
        <Link href="/menu" onClick={() => setOpen(false)} className="btn-primary mt-2">
          Ver el menú
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="flex-1 overflow-y-auto px-5">
        <AnimatePresence initial={false}>
          {lines.map((l) => (
            <LineRow key={l.id} line={l} />
          ))}
        </AnimatePresence>
      </ul>
      <div className="border-t-2 border-negro/10 bg-crema px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm font-bold uppercase tracking-wide text-negro/60">Subtotal</span>
          <span className="font-display text-2xl">{formatPrice(subtotal)}</span>
        </div>
        <p className="mb-3 text-xs text-negro/50">Solo pickup · Pagas al recoger o en línea</p>
        <Link
          href="/checkout"
          onClick={() => setOpen(false)}
          className="btn-primary min-h-14 w-full text-lg"
        >
          Completar pedido <ArrowRight className="size-5" />
        </Link>
      </div>
    </>
  );
}

export function CartDrawer() {
  const { open, setOpen, count } = useCart();
  const desktop = useDesktop();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  const hidden = reduced ? { opacity: 0 } : desktop ? { x: "100%" } : { y: "100%" };
  const shown = reduced ? { opacity: 1 } : desktop ? { x: 0 } : { y: 0 };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Cerrar carrito"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-negro/50 backdrop-blur-[2px]"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Tu pedido"
            initial={hidden}
            animate={shown}
            exit={hidden}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed z-50 flex flex-col bg-crema shadow-2xl",
              "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-3xl",
              "md:inset-x-auto md:inset-y-0 md:right-0 md:max-h-none md:w-[420px] md:rounded-none"
            )}
          >
            <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-negro/15 md:hidden" />
            <header className="flex items-center justify-between px-5 py-4">
              <h2 className="font-display text-2xl">
                Tu pedido{" "}
                {count > 0 && <span className="text-base text-negro/50">({count})</span>}
              </h2>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setOpen(false)}
                className="grid size-11 place-items-center rounded-full hover:bg-negro/10"
              >
                <X className="size-6" />
              </button>
            </header>
            <DrawerBody />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
