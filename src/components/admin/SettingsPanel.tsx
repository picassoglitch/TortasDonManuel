"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorNote, Field, LoadingRow, api } from "@/components/admin/ui";

const KV_FIELDS: { key: string; label: string; placeholder: string; rows: number }[] = [
  { key: "hours_text", label: "Horario", placeholder: "Vie–Dom · 10:30 am – 6:00 pm", rows: 2 },
  { key: "banner_text", label: "Anuncio (banner del sitio)", placeholder: "Ej. Cerramos el 25 de diciembre", rows: 2 },
];

const NOSOTROS_FIELDS: typeof KV_FIELDS = [
  { key: "nosotros_titulo", label: "Título", placeholder: "DESDE 1972", rows: 1 },
  {
    key: "nosotros_p1",
    label: "Primer párrafo",
    placeholder:
      "Hace más de cincuenta años, Don Manuel abrió una pequeña tortería en Tlalpan…",
    rows: 4,
  },
  {
    key: "nosotros_p2",
    label: "Segundo párrafo (opcional)",
    placeholder: "Hoy seguimos en la misma esquina, con la misma receta…",
    rows: 4,
  },
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

function PaymentsToggle({
  initial,
  mpConfigured,
}: {
  initial: boolean;
  mpConfigured: boolean;
}) {
  const [on, setOn] = useState(initial);
  const [state, setState] = useState<"idle" | "saved" | "error">("idle");

  async function toggle() {
    const next = !on;
    setOn(next);
    setState("idle");
    try {
      await api("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ key: "payments_enabled", value: next ? "true" : "false" }),
      });
      setState("saved");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setOn(!next);
      setState("error");
    }
  }

  return (
    <div className="rounded-2xl border-2 border-negro/10 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg">Pagos en línea</h2>
          <p className="mt-1 text-sm text-negro/60">
            Los clientes {on ? "ven" : "no ven"} la opción de pagar con Mercado Pago al hacer
            su pedido.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Pagos en línea"
          onClick={toggle}
          className={`relative h-11 w-20 shrink-0 rounded-full transition-colors ${
            on ? "bg-verde" : "bg-negro/15"
          }`}
        >
          <span
            aria-hidden
            className={`absolute left-1 top-1 size-9 rounded-full bg-white shadow transition-transform ${
              on ? "translate-x-9" : ""
            }`}
          />
        </button>
      </div>
      <div className="mt-1 min-h-5 text-right">
        {state === "saved" && <span className="text-sm font-bold text-verde">Guardado</span>}
        {state === "error" && (
          <span className="text-sm font-bold text-rojo">No se pudo guardar</span>
        )}
      </div>
      {!mpConfigured && (
        <p className="mt-1 rounded-xl bg-dorado/15 px-3 py-2 text-sm font-semibold text-negro/80">
          Falta configurar la llave de Mercado Pago (MERCADOPAGO_ACCESS_TOKEN) en el servidor.
          Aunque el interruptor esté encendido, el pago en línea no aparecerá en el sitio hasta
          configurarla.
        </p>
      )}
      <p className="mt-2 text-sm font-bold text-negro/70">
        El pago en efectivo al recoger siempre está disponible.
      </p>
    </div>
  );
}

function WhatsAppField({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setState("saving");
    try {
      await api("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ key: "whatsapp_number", value }),
      });
      setState("saved");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
    }
  }

  return (
    <div className="rounded-2xl border-2 border-negro/10 bg-white p-4">
      <Field label="WhatsApp de pedidos">
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            setValue(e.target.value.replace(/\D/g, "").slice(0, 15));
            setState("idle");
          }}
          placeholder="525556312022"
          className="min-h-12 w-full rounded-xl border-2 border-negro/15 bg-white px-4 py-3 text-negro placeholder:text-negro/40 focus:border-rojo focus:outline-none"
        />
      </Field>
      <p className="mt-2 text-sm text-negro/60">
        Es el número al que los clientes te escriben desde las páginas de pedido y el sitio.
        Solo dígitos, con código de país (52 para México).
      </p>
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

export function SettingsPanel({
  paymentsDefault,
  mpConfigured,
}: {
  paymentsDefault: boolean;
  mpConfigured: boolean;
}) {
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

          <h2 className="mt-4 text-lg">Historia de “Nosotros”</h2>
          <p className="-mt-3 text-sm text-negro/60">
            Es la sección de la página de inicio. Si dejas un campo vacío se usa el texto
            original. Los cambios aparecen en el sitio en menos de un minuto.
          </p>
          {NOSOTROS_FIELDS.map((field) => (
            <KvField key={field.key} field={field} initial={settings[field.key] ?? ""} />
          ))}

          <h2 className="mt-4 text-lg">Pedidos y pagos</h2>
          <PaymentsToggle
            initial={(settings.payments_enabled ?? (paymentsDefault ? "true" : "false")) === "true"}
            mpConfigured={mpConfigured}
          />
          <WhatsAppField initial={settings.whatsapp_number ?? ""} />
        </>
      )}

      <PasswordForm />
    </div>
  );
}
