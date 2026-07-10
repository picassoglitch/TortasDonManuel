"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartLine = {
  id: string;
  kind: "item" | "custom";
  name: string;
  variantLabel?: string;
  unitPrice: number;
  qty: number;
  detail?: string[];
};

type CartValue = {
  lines: CartLine[];
  addItem(l: Omit<CartLine, "id">): void;
  removeLine(id: string): void;
  setQty(id: string, qty: number): void;
  clear(): void;
  subtotal: number;
  count: number;
  open: boolean;
  setOpen(v: boolean): void;
};

const STORAGE_KEY = "tdm_cart";

const CartContext = createContext<CartValue | null>(null);

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `l_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function signature(l: Omit<CartLine, "id">): string {
  return [l.kind, l.name, l.variantLabel ?? "", l.unitPrice, (l.detail ?? []).join("|")].join("::");
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) setLines(parsed.filter((l) => l && l.id && l.qty > 0));
      }
    } catch {
      /* storage corrupta: carrito limpio */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* quota / privado */
    }
  }, [lines, hydrated]);

  const addItem = useCallback((l: Omit<CartLine, "id">) => {
    setLines((prev) => {
      const sig = signature(l);
      const idx = prev.findIndex((p) => signature(p) === sig);
      if (idx >= 0) {
        return prev.map((p, i) => (i === idx ? { ...p, qty: p.qty + l.qty } : p));
      }
      return [...prev, { ...l, id: newId() }];
    });
    setOpen(true);
  }, []);

  const removeLine = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty } : l))
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const { subtotal, count } = useMemo(
    () => ({
      subtotal: lines.reduce((s, l) => s + l.unitPrice * l.qty, 0),
      count: lines.reduce((s, l) => s + l.qty, 0),
    }),
    [lines]
  );

  const value = useMemo<CartValue>(
    () => ({ lines, addItem, removeLine, setQty, clear, subtotal, count, open, setOpen }),
    [lines, addItem, removeLine, setQty, clear, subtotal, count, open]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
