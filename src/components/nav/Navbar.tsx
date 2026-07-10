"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/menu", label: "Menú" },
  { href: "/armala", label: "Arma tu Torta" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#ubicacion", label: "Ubicación" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [panel, setPanel] = useState(false);
  const { count, setOpen } = useCart();
  const pathname = usePathname();
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setPanel(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = panel ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [panel]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300",
        scrolled ? "bg-crema/95 shadow-[0_1px_0_rgba(25,21,18,0.1)] backdrop-blur-md" : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:h-20">
        <Link href="/" className="flex items-center" aria-label="Tortas Don Manuel — inicio">
          <Image
            src="/media/logo-light.png"
            alt="Tortas Don Manuel"
            width={1600}
            height={498}
            priority
            className="h-10 w-auto md:h-12"
          />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-bold uppercase tracking-wide text-negro transition-colors hover:text-rojo"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setOpen(true)}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl text-negro transition-colors hover:bg-negro/10"
            aria-label={`Carrito, ${count} artículos`}
          >
            <ShoppingBag size={22} />
            {count > 0 && (
              <motion.span
                key={count}
                initial={reduce ? false : { scale: 0.5 }}
                animate={{ scale: 1 }}
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rojo px-1 text-[0.7rem] font-black text-crema"
              >
                {count}
              </motion.span>
            )}
          </button>
          <button
            onClick={() => setPanel(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-negro transition-colors hover:bg-negro/10 md:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {panel && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPanel(false)}
              className="absolute inset-0 bg-negro/60"
              aria-label="Cerrar menú"
            />
            <motion.div
              initial={reduce ? { opacity: 0 } : { x: "100%" }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="texture-grain absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col bg-crema"
            >
              <div className="relative z-[2] flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between">
                  <Image
                    src="/media/logo-light.png"
                    alt="Tortas Don Manuel"
                    width={1600}
                    height={498}
                    className="h-9 w-auto"
                  />
                  <button
                    onClick={() => setPanel(false)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-negro hover:bg-negro/10"
                    aria-label="Cerrar menú"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="mt-10 flex flex-col gap-6">
                  {LINKS.map((l, i) => (
                    <motion.div
                      key={l.href}
                      initial={{ opacity: 0, x: reduce ? 0 : 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                    >
                      <Link
                        href={l.href}
                        onClick={() => setPanel(false)}
                        className="font-display text-3xl text-negro transition-colors hover:text-rojo"
                      >
                        {l.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-auto space-y-2 text-sm font-bold text-negro/70">
                  <p>Tizimín 163-8, Lomas de Padierna</p>
                  <a href="tel:+525556312022" className="block text-rojo">
                    55 5631 2022
                  </a>
                  <p className="text-negro/50">Desde 1972</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
