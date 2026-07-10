"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorNote, Field, LoadingRow, api } from "@/components/admin/ui";

const KV_FIELDS: { key: string; label: string; placeholder: string; rows: number }[] = [
  { key: "hours_text", label: "Horario", placeholder: "Vie–Dom · 10:30 am – 6:00 pm", rows: 2 },
  { key: "banner_text", label: "Anuncio (banner del sitio)", placeholder: "Ej. Cerramos el 25 de diciembre", rows: 2 },
];

function KvField({
  field,
  initial,
}: {
  field: (typeof KV_FIELDS)[number];
  initial: string;
}) {
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setState("saving");
    try {
      await api("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ key: field.key, value }),
      });
      setState("saved");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
    }
  }

  return (
    <div className="rounded-2xl border-2 border-negro/10 bg-white p-4">
      <Field label={field.label}>
        <textarea
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setState("idle");
          }}
          rows={field.rows}
          placeholder={field.placeholder}
          className="w-full rounded-xl border-2 border-negro/15 bg-white px-4 py-3 text-negro placeholder:text-negro/40 focus:border-rojo focus:outline-none"
        />
      </Field>
      <div className="mt-2 flex items-center justify-end gap-3">
        {state === "saved" && <span className="text-sm font-bold text-verde">Guardado</span>}
        {state === "error" && <span className="text-sm font-bold text-rojo">No se pudo guardar</span>}
        <Button size="sm" onClick={save} disabled={state === "saving"}>
          {state === "saving" ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    if (next !== confirmPw) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }
    setBusy(true);
    try {
      await api("/api/admin/password", {
        method: "POST",
        body: JSON.stringify({ current, next }),
      });
      setOk(true);
      setCurrent("");
      setNext("");
      setConfirmPw("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar la contraseña");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border-2 border-negro/10 bg-white p-4">
      <h2 className="text-lg">Cambiar contraseña</h2>
      <Input
        label="Contraseña actual"
        type="password"
        autoComplete="current-password"
        required
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
      />
      <Input
        label="Nueva contraseña (mínimo 8 caracteres)"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={next}
        onChange={(e) => setNext(e.target.value)}
      />
      <Input
        label="Confirmar nueva contraseña"
        type="password"
        autoComplete="new-password"
        required
        value={confirmPw}
        onChange={(e) => setConfirmPw(e.target.value)}
      />
      <ErrorNote msg={error} />
      {ok && <p className="text-sm font-bold text-verde">Contraseña actualizada.</p>}
      <Button type="submit" disabled={busy} className="self-end">
        {busy ? "Guardando…" : "Actualizar"}
      </Button>
    </form>
  );
}

export function SettingsPanel({ paymentsEnabled }: { paymentsEnabled: boolean }) {
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<{ settings: Record<string, string> }>("/api/admin/settings");
      setSettings(data.settings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los ajustes");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="text-[clamp(1.5rem,5vw,2rem)]">Ajustes</h1>

      <ErrorNote msg={error} />
      {settings === null && !error && <LoadingRow text="Cargando ajustes…" />}

      {settings !== null && (
        <>
          {KV_FIELDS.map((field) => (
            <KvField key={field.key} field={field} initial={settings[field.key] ?? ""} />
          ))}
        </>
      )}

      <div className="rounded-2xl border-2 border-negro/10 bg-white p-4">
        <h2 className="text-lg">Pagos en línea</h2>
        <p className="mt-1 text-sm text-negro/60">
          {paymentsEnabled
            ? "Mercado Pago está ACTIVO. Se controla con la variable NEXT_PUBLIC_PAYMENTS_ENABLED del servidor."
            : "Mercado Pago está DESACTIVADO. Para activarlo se cambia la variable NEXT_PUBLIC_PAYMENTS_ENABLED en el servidor (no desde aquí)."}
        </p>
        <p className="mt-2 text-sm font-bold text-negro/70">
          El pago en efectivo al recoger siempre está disponible.
        </p>
      </div>

      <PasswordForm />
    </div>
  );
}
