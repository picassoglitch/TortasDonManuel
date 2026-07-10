"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  Layers,
  LogOut,
  Menu,
  QrCode,
  Settings,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/menu", label: "Menú", icon: UtensilsCrossed },
  { href: "/admin/armala", label: "Arma tu Torta", icon: Layers },
  { href: "/admin/qr", label: "Código QR", icon: QrCode },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex min-h-12 items-center gap-3 rounded-xl px-4 font-bold uppercase tracking-wide transition-colors",
              active ? "bg-rojo text-crema" : "text-crema/70 hover:bg-crema/10 hover:text-crema"
            )}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
      <button
        onClick={logout}
        disabled={loggingOut}
        className="mt-auto flex min-h-12 items-center gap-3 rounded-xl px-4 font-bold uppercase tracking-wide text-crema/70 transition-colors hover:bg-crema/10 hover:text-crema disabled:opacity-50"
      >
        <LogOut size={20} />
        Salir
      </button>
    </nav>
  );
}

function Brand() {
  return (
    <div className="border-b border-crema/10 px-5 py-5">
      <Image src="/media/logo-dark.png" alt="Tortas Don Manuel" width={1600} height={498} className="h-9 w-auto" />
      <p className="mt-2 text-xs font-bold uppercase tracking-widest text-dorado">Administración</p>
    </div>
  );
}

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-crema">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-carbon px-4 py-3 md:hidden print:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-crema hover:bg-crema/10"
        >
          <Menu size={24} />
        </button>
        <Image src="/media/logo-dark.png" alt="Tortas Don Manuel" width={1600} height={498} className="h-8 w-auto" />
        <span className="w-11" />
      </header>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-carbon md:flex print:hidden">
        <Brand />
        <NavLinks />
        <p className="truncate border-t border-crema/10 px-5 py-4 text-xs text-crema/40">{email}</p>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden print:hidden">
          <button aria-label="Cerrar menú" className="absolute inset-0 bg-negro/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-carbon">
            <div className="flex items-start justify-between">
              <Brand />
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="m-3 flex h-11 w-11 items-center justify-center rounded-xl text-crema/70 hover:bg-crema/10"
              >
                <X size={22} />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <p className="truncate border-t border-crema/10 px-5 py-4 text-xs text-crema/40">{email}</p>
          </div>
        </div>
      )}

      <main className="p-4 pb-24 md:p-8 md:pl-72 print:p-0">{children}</main>
    </div>
  );
}
