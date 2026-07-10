"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LoadingRow } from "@/components/admin/ui";

export function QrPanel({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 1024,
      margin: 2,
      color: { dark: "#191512", light: "#ffffff" },
    })
      .then(setDataUrl)
      .catch(() => setError(true));
  }, [url]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="print:hidden">
        <h1 className="text-[clamp(1.5rem,5vw,2rem)]">Código QR</h1>
        <p className="mt-1 mb-6 text-sm text-negro/60">
          Imprímelo y pégalo en las mesas o el mostrador. Al escanearlo se abre la carta digital ({url}) — solo
          lectura, sin pedidos.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border-2 border-rojo/30 bg-rojo/10 px-4 py-3 font-semibold text-rojo print:hidden">
          No se pudo generar el código QR.
        </p>
      )}
      {!dataUrl && !error && <LoadingRow text="Generando QR…" />}

      {dataUrl && (
        <>
          <div className="mx-auto flex max-w-sm flex-col items-center gap-4 rounded-2xl border-2 border-negro/10 bg-white p-8 text-center print:max-w-none print:border-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/logo-light.png" alt="Tortas Don Manuel" className="w-52" />
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-rojo">Desde 1972</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUrl} alt={`Código QR de la carta: ${url}`} className="w-full max-w-72 print:max-w-96" />
            <p className="font-bold uppercase tracking-wide">Escanéame para ver la carta</p>
            <p className="text-sm text-negro/50 print:text-negro">{url}</p>
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
    </div>
  );
}
