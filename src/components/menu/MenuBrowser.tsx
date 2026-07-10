"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { X } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { cn, formatPrice } from "@/lib/utils";
import type { CategoryData, MenuItemData, MenuVariant } from "@/lib/menu-data";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};
const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35 } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export function MenuBrowser({ categories }: { categories: CategoryData[] }) {
  const reduce = useReducedMotion();
  const rv = reduce ? fadeOnly : fadeUp;
  const { addItem } = useCart();
  const [active, setActive] = useState(categories[0]?.slug ?? "");
  const [picker, setPicker] = useState<MenuItemData | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const addedTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const sections = categories
      .map((c) => document.getElementById(`cat-${c.slug}`))
      .filter((el): el is HTMLElement => el !== null);
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id.replace("cat-", ""));
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [categories]);

  useEffect(() => {
    pillRefs.current[active]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [active]);

  useEffect(() => {
    document.body.style.overflow = picker ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [picker]);

  useEffect(() => () => window.clearTimeout(addedTimer.current), []);

  function addLine(item: MenuItemData, v: MenuVariant) {
    addItem({
      kind: "item",
      name: item.name,
      variantLabel: v.label === "Única" ? undefined : v.label,
      unitPrice: v.price,
      qty: 1,
    });
    setPicker(null);
    setAdded(item.slug);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(null), 1300);
  }

  function handleAdd(item: MenuItemData) {
    if (!item.isAvailable || item.isHoliday || item.variants.length === 0) return;
    const only = item.variants.length === 1 ? item.variants[0] : undefined;
    if (only) addLine(item, only);
    else setPicker(item);
  }

  function scrollTo(slug: string) {
    document.getElementById(`cat-${slug}`)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="bg-crema">
      <header className="px-4 pb-6 pt-10 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-rojo">
          Para llevar · Tlalpan CDMX
        </p>
        <h1 className="text-painted mt-2 leading-none text-[clamp(3rem,12vw,6.5rem)]">
          EL MENÚ
        </h1>
        <p className="mt-3 text-negro/70">Todo se prepara al momento, en telera recién hecha.</p>
      </header>

      <nav
        aria-label="Categorías del menú"
        className="sticky top-16 z-30 border-b border-negro/10 bg-crema/95 backdrop-blur-md md:top-20"
      >
        <div className="no-scrollbar mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3">
          {categories.map((c) => (
            <button
              key={c.slug}
              ref={(el) => {
                pillRefs.current[c.slug] = el;
              }}
              onClick={() => scrollTo(c.slug)}
              className={cn(
                "h-11 shrink-0 whitespace-nowrap rounded-full px-5 text-sm font-bold uppercase tracking-wide transition-colors",
                active === c.slug
                  ? "bg-negro text-crema"
                  : "bg-negro/5 text-negro hover:bg-negro/10"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 pb-20">
        {categories.map((c) => (
          <section key={c.slug} id={`cat-${c.slug}`} className="scroll-mt-36 pt-12">
            <h2 className="text-painted leading-none text-[clamp(1.9rem,6vw,3rem)]">{c.name}</h2>
            {c.subtitle && (
              <p className="mt-1.5 text-sm font-bold uppercase tracking-wide text-negro/50">
                {c.subtitle}
              </p>
            )}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {c.items.map((item) => (
                <motion.div key={item.slug} variants={rv} className="h-full">
                  <MenuItemCard item={item} onAdd={handleAdd} added={added === item.slug} />
                </motion.div>
              ))}
            </motion.div>
          </section>
        ))}
      </div>

      <AnimatePresence>
        {picker && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPicker(null)}
              className="absolute inset-0 bg-negro/60"
              aria-label="Cerrar"
            />
            <motion.div
              role="dialog"
              aria-label={`Elige tu ${picker.name}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 48 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              className="relative w-full rounded-t-3xl bg-crema p-5 pb-8 sm:max-w-md sm:rounded-3xl sm:pb-5"
            >
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-negro/15 sm:hidden" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl text-negro">{picker.name}</h3>
                  <p className="mt-0.5 text-sm text-negro/60">¿Cómo la quieres?</p>
                </div>
                <button
                  onClick={() => setPicker(null)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-negro hover:bg-negro/10"
                  aria-label="Cerrar"
                >
                  <X size={22} />
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {picker.variants.map((v) => (
                  <button
                    key={v.label}
                    onClick={() => addLine(picker, v)}
                    className="flex h-14 w-full items-center justify-between rounded-2xl border border-negro/10 bg-white/70 px-4 transition-colors hover:border-rojo hover:bg-white"
                  >
                    <span className="font-bold text-negro">{v.label}</span>
                    <span className="font-display text-lg text-rojo">{formatPrice(v.price)}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
