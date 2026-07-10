"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { formatPrice, cn } from "@/lib/utils";
import { BUILDER_BASE_PRICE, type BuilderGroupData } from "@/lib/menu-data";

const INGREDIENT_COLORS: Array<[RegExp, string]> = [
  [/huevo/i, "#F5D067"],
  [/jam[óo]n/i, "#E58B8B"],
  [/salchicha/i, "#D97B66"],
  [/chorizo|longaniza/i, "#A6402C"],
  [/pierna|cochinita/i, "#9C5A3C"],
  [/milanesa/i, "#C68A4B"],
  [/bisteck/i, "#7E4630"],
  [/queso amarillo/i, "#F2B33D"],
  [/queso de puerco/i, "#C79A86"],
  [/queso/i, "#F6E3A1"],
  [/pi[ñn]a/i, "#F3C641"],
  [/papas/i, "#E8C97E"],
  [/frijol/i, "#5C4033"],
  [/aguacate/i, "#7FA65A"],
  [/jitomate/i, "#D9534F"],
  [/cebolla/i, "#EFE6F2"],
  [/rajas/i, "#4A7048"],
  [/chipotle/i, "#8B3A2E"],
  [/mostaza/i, "#E0A93E"],
  [/mayonesa/i, "#F4EFDF"],
];

function ingredientColor(name: string): string {
  for (const [re, c] of INGREDIENT_COLORS) if (re.test(name)) return c;
  return "#D9A441";
}

function darkText(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16);
  const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum > 150;
}

type Layer = { key: string; name: string; color: string };

function SandwichViz({ layers, panName }: { layers: Layer[]; panName: string }) {
  const reduced = useReducedMotion();
  const spring = { type: "spring" as const, damping: 22, stiffness: 320 };
  return (
    <div className="flex w-full flex-col items-center" style={{ perspective: 700 }}>
      <motion.div
        layout
        transition={spring}
        className="z-10 h-9 w-[82%] rounded-t-[999px] rounded-b-lg shadow-md sm:h-11"
        style={{
          background: "linear-gradient(180deg, #E8BE73 0%, #D9A441 70%, #C08A2E 100%)",
          transform: "rotateX(8deg)",
        }}
        title={panName}
      />
      <div className="flex w-full flex-col-reverse items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {layers.map((l) => {
            const dark = darkText(l.color);
            return (
              <motion.div
                key={l.key}
                layout
                initial={reduced ? { opacity: 0 } : { opacity: 0, scaleY: 0.2, y: -18 }}
                animate={{ opacity: 1, scaleY: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scaleY: 0.2, x: 40 }}
                transition={spring}
                className="my-[3px] flex h-8 w-[90%] items-center justify-center rounded-lg shadow-sm sm:h-9"
                style={{ background: l.color, transform: "rotateX(8deg)" }}
              >
                <span
                  className={cn(
                    "truncate px-3 text-xs font-bold uppercase tracking-wide sm:text-sm",
                    dark ? "text-negro/80" : "text-crema"
                  )}
                >
                  {l.name}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {layers.length === 0 && (
          <p className="my-4 text-center text-sm text-negro/40">
            Elige ingredientes y míralos apilarse aquí
          </p>
        )}
      </div>
      <motion.div
        layout
        transition={spring}
        className="h-7 w-[86%] rounded-b-[999px] rounded-t-lg shadow-md sm:h-8"
        style={{
          background: "linear-gradient(180deg, #D9A441 0%, #B57F28 100%)",
          transform: "rotateX(8deg)",
        }}
      />
    </div>
  );
}

export function TortaBuilder({ groups }: { groups: BuilderGroupData[] }) {
  const { addItem } = useCart();
  const sorted = useMemo(
    () =>
      [...groups]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((g) => ({
          ...g,
          options: g.options.filter((o) => o.isAvailable).sort((a, b) => a.sortOrder - b.sortOrder),
        })),
    [groups]
  );

  const [sel, setSel] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    for (const g of sorted) {
      const defaults = g.options.filter((o) => o.isDefault).map((o) => o.name);
      if (g.type === "SINGLE" && defaults.length === 0 && g.options[0]) {
        init[g.key] = [g.options[0].name];
      } else {
        init[g.key] = g.type === "SINGLE" ? defaults.slice(0, 1) : defaults;
      }
    }
    return init;
  });
  const [added, setAdded] = useState(false);

  function toggle(group: BuilderGroupData, name: string) {
    setAdded(false);
    setSel((prev) => {
      const cur = prev[group.key] ?? [];
      if (group.type === "SINGLE") return { ...prev, [group.key]: [name] };
      if (cur.includes(name)) return { ...prev, [group.key]: cur.filter((n) => n !== name) };
      if (group.maxSelect > 0 && cur.length >= group.maxSelect) return prev;
      return { ...prev, [group.key]: [...cur, name] };
    });
  }

  const total = useMemo(() => {
    let t = BUILDER_BASE_PRICE;
    for (const g of sorted) {
      for (const name of sel[g.key] ?? []) {
        const opt = g.options.find((o) => o.name === name);
        if (opt) t += opt.price;
      }
    }
    return t;
  }, [sorted, sel]);

  const panName =
    sorted.find((g) => g.key === "pan")?.options.find((o) => (sel.pan ?? []).includes(o.name))
      ?.name ?? "Telera tradicional";

  const layers: Layer[] = useMemo(() => {
    const out: Layer[] = [];
    for (const g of sorted) {
      if (g.key === "pan") continue;
      for (const name of sel[g.key] ?? []) {
        if (/sin picante/i.test(name)) continue;
        out.push({ key: `${g.key}:${name}`, name, color: ingredientColor(name) });
      }
    }
    return out;
  }, [sorted, sel]);

  function addToCart() {
    const detail: string[] = [panName];
    for (const g of sorted) {
      if (g.key === "pan") continue;
      for (const name of sel[g.key] ?? []) {
        const opt = g.options.find((o) => o.name === name);
        detail.push(opt && opt.price > 0 ? name : `+${name}`);
      }
    }
    addItem({ kind: "custom", name: "Torta a tu gusto", unitPrice: total, qty: 1, detail });
    setAdded(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 sm:px-6 lg:grid lg:grid-cols-[1fr_400px] lg:gap-10 lg:pb-16">
      {/* Visual: sticky arriba en móvil, columna derecha en desktop */}
      <div className="sticky top-14 z-30 -mx-4 mb-6 border-b-2 border-negro/10 bg-crema/95 px-4 pb-3 pt-3 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:order-2 lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:pt-0">
        <div className="lg:sticky lg:top-24 lg:rounded-3xl lg:border-2 lg:border-negro/10 lg:bg-white/50 lg:p-8">
          <div className="mx-auto max-w-xs lg:max-w-none">
            <SandwichViz layers={layers} panName={panName} />
          </div>
          <div className="mt-3 flex items-baseline justify-between lg:mt-6">
            <span className="text-sm font-bold uppercase tracking-wide text-negro/60">
              Tu torta
            </span>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={total}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="font-display text-3xl text-rojo lg:text-4xl"
              >
                {formatPrice(total)}
              </motion.span>
            </AnimatePresence>
          </div>
          <button
            type="button"
            onClick={addToCart}
            className={cn("mt-4 hidden w-full lg:inline-flex", added ? "btn-dark" : "btn-primary", "min-h-14 text-lg")}
          >
            {added ? (
              <>
                <Check className="size-5" /> Agregada — ¿otra?
              </>
            ) : (
              <>
                <ShoppingBag className="size-5" /> Agregar al carrito
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pasos */}
      <div className="lg:order-1">
        <p className="mb-6 text-sm text-negro/60">
          La base de <strong>{formatPrice(BUILDER_BASE_PRICE)}</strong> incluye telera, frijoles,
          aguacate, jitomate y cebolla. Tú decides lo demás.
        </p>
        {sorted.map((g, i) => {
          const chosen = sel[g.key] ?? [];
          const atMax = g.type === "MULTI" && g.maxSelect > 0 && chosen.length >= g.maxSelect;
          return (
            <section key={g.key} className="mb-8">
              <div className="mb-3 flex items-baseline gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-negro text-sm font-black text-crema">
                  {i + 1}
                </span>
                <h2 className="font-display text-xl sm:text-2xl">{g.name}</h2>
                {g.maxSelect > 0 && g.type === "MULTI" && (
                  <span
                    className={cn(
                      "text-xs font-bold uppercase tracking-wide",
                      atMax ? "text-rojo" : "text-negro/50"
                    )}
                  >
                    {chosen.length}/{g.maxSelect}
                  </span>
                )}
              </div>
              {g.description && <p className="mb-3 text-sm text-negro/50">{g.description}</p>}
              <div className="flex flex-wrap gap-2">
                {g.options.map((o) => {
                  const active = chosen.includes(o.name);
                  const blocked = !active && atMax;
                  return (
                    <button
                      key={o.name}
                      type="button"
                      aria-pressed={active}
                      disabled={blocked}
                      onClick={() => toggle(g, o.name)}
                      className={cn(
                        "inline-flex min-h-11 items-center gap-1.5 rounded-xl border-2 px-4 py-2 text-sm font-bold transition-colors sm:text-base",
                        active
                          ? o.price > 0
                            ? "border-rojo bg-rojo text-crema"
                            : "border-verde bg-verde text-crema"
                          : "border-negro/15 bg-white/60 text-negro hover:border-negro/40",
                        blocked && "opacity-40"
                      )}
                    >
                      {active ? (
                        <Check className="size-4" strokeWidth={3} />
                      ) : (
                        <Plus className="size-4 opacity-50" strokeWidth={3} />
                      )}
                      {o.name}
                      {o.price > 0 && (
                        <span className={cn("tabular-nums", active ? "text-crema/80" : "text-negro/50")}>
                          +{formatPrice(o.price)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* CTA fija en móvil */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-negro/10 bg-crema/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={addToCart}
          className={cn("w-full min-h-14 text-lg", added ? "btn-dark" : "btn-primary")}
        >
          {added ? (
            <>
              <Check className="size-5" /> Agregada — ¿otra?
            </>
          ) : (
            <>
              <ShoppingBag className="size-5" /> Agregar — {formatPrice(total)}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
