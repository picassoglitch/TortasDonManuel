"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ErrorNote, Field, LoadingRow, api } from "@/components/admin/ui";

const DEFAULT_SUBTITLE = "Desde 1972";
const DEFAULT_CTA = "Escanéame para ver el menú";

type SaveState = "idle" | "saving" | "saved" | "error";

function useSaveSetting() {
  const [state, setState] = useState<SaveState>("idle");

  const save = useCallback(async (key: string, value: string) => {
    setState("saving");
    try {
      await api("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ key, value }),
      });
      setState("saved");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
    }
  }, []);

  return { state, setState, save };
}

function SaveNote({ state }: { state: SaveState }) {
  if (state === "saved") return <span className="text-sm font-bold text-verde">Guardado</span>;
  if (state === "error") return <span className="text-sm font-bold text-rojo">No se pudo guardar</span>;
  return null;
}

function TextRow({
  label,
  settingKey,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  settingKey: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  const { state, setState, save } = useSaveSetting();

  return (
    <div className="rounded-2xl border-2 border-negro/10 bg-white p-4">
      <Field label={label}>
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setState("idle");
          }}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border-2 border-negro/15 bg-white px-4 text-negro placeholder:text-negro/40 focus:border-rojo focus:outline-none"
        />
      </Field>
      <div className="mt-2 flex min-h-9 items-center justify-end gap-3">
        <SaveNote state={state} />
        <Button size="sm" onClick={() => save(settingKey, value)} disabled={state === "saving"}>
          {state === "saving" ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}

export function QrPanel({ defaultBase }: { defaultBase: string }) {
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [subtitle, setSubtitle] = useState("");
  const [cta, setCta] = useState("");

  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState(false);

  useEffect(() => {
    api<{ settings: Record<string, string> }>("/api/admin/settings")
      .then((data) => {
        setSettings(data.settings);
        setSubtitle(data.settings.qr_subtitle ?? "");
        setCta(data.settings.qr_cta ?? "");
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : "No se pudieron cargar los ajustes");
      });
  }, []);

  const effectiveBase = defaultBase.replace(/\/$/, "");
  const qrTarget = `${effectiveBase}/qr`;
  const cardSubtitle = subtitle.trim() || DEFAULT_SUBTITLE;
  const cardCta = cta.trim() || DEFAULT_CTA;

  useEffect(() => {
    if (settings === null) return;
    setQrError(false);
    QRCode.toDataURL(qrTarget, {
      width: 1024,
      margin: 2,
      color: { dark: "#191512", light: "#ffffff" },
    })
      .then(setDataUrl)
      .catch(() => setQrError(true));
  }, [qrTarget, settings]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="print:hidden">
        <h1 className="text-[clamp(1.5rem,5vw,2rem)]">Código QR</h1>
        <p className="mt-1 mb-6 text-sm text-negro/60">
          Imprímelo y pégalo en las mesas o el mostrador. Al escanearlo se abre el menú del sitio. El código apunta a{" "}
          {qrTarget}, así que si algún día cambia el destino, los impresos siguen funcionando.
        </p>
      </div>

      <ErrorNote msg={loadError} />
      {settings === null && !loadError && <LoadingRow text="Cargando ajustes…" />}

      {settings !== null && (
        <>
          <div className="mb-6 flex flex-col gap-3 print:hidden">
            <TextRow
              label="Subtítulo"
              settingKey="qr_subtitle"
              value={subtitle}
              placeholder={DEFAULT_SUBTITLE}
              onChange={setSubtitle}
            />
            <TextRow
              label="Texto principal"
              settingKey="qr_cta"
              value={cta}
              placeholder={DEFAULT_CTA}
              onChange={setCta}
            />
          </div>

          {qrError && (
            <p className="rounded-xl border-2 border-rojo/30 bg-rojo/10 px-4 py-3 font-semibold text-rojo print:hidden">
              No se pudo generar el código QR.
            </p>
          )}
          {!dataUrl && !qrError && <LoadingRow text="Generando QR…" />}

          {dataUrl && (
            <>
              <div className="mx-auto flex max-w-sm flex-col items-center gap-4 rounded-2xl border-2 border-negro/10 bg-white p-8 text-center print:max-w-none print:border-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/media/logo-light.png" alt="Tortas Don Manuel" className="w-52" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-rojo">{cardSubtitle}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dataUrl} alt={`Código QR de la carta: ${qrTarget}`} className="w-full max-w-72 print:max-w-96" />
                <p className="font-bold uppercase tracking-wide">{cardCta}</p>
                <p className="text-sm text-negro/50 print:text-negro">{effectiveBase}</p>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
                <a href={dataUrl} download="qr-carta-tortas-don-manuel.png" className="btn-dark">
                  <Download size={18} /> Descargar PNG
                </a>
                <Button onClick={() => window.print()}>
                  <Printer size={18} /> Imprimir
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
