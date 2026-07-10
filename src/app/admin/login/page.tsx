import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) redirect("/admin/pedidos");

  return (
    <div className="texture-grain flex min-h-dvh items-center justify-center bg-crema px-4">
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-painted font-display text-[clamp(2.2rem,10vw,3rem)] leading-none">
            DON MANUEL
          </p>
          <p className="mt-2 text-sm font-bold uppercase tracking-[0.3em] text-negro/60">
            Desde 1972 · Administración
          </p>
        </div>
        <div className="rounded-2xl border-2 border-negro/10 bg-white/60 p-6 shadow-sm">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-negro/40">
          Acceso solo para el equipo de Tortas Don Manuel.
        </p>
      </div>
    </div>
  );
}
