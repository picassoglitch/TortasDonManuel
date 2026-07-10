"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, ImagePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorNote, LoadingRow, api } from "@/components/admin/ui";

type Asset = {
  id: string;
  name: string;
  mime: string;
  size: number;
  createdAt: string;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const MAX_SIZE = 4 * 1024 * 1024;

function formatKB(bytes: number) {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }
}

export function MediaManager() {
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<{ assets: Asset[] }>("/api/admin/media");
      setAssets(data.assets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las fotos");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      for (const file of list) {
        if (file.size > MAX_SIZE) {
          throw new Error(`"${file.name}" pesa más de 4 MB`);
        }
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/media", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error((data as { error?: string }).error ?? "No se pudo subir la imagen");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen");
    } finally {
      setUploading(false);
      load();
    }
  }

  async function copyUrl(asset: Asset) {
    const ok = await copyText(`${window.location.origin}/api/media/${asset.id}`);
    if (!ok) {
      setError("No se pudo copiar la URL");
      return;
    }
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId((prev) => (prev === asset.id ? null : prev)), 1500);
  }

  async function remove(asset: Asset) {
    if (!confirm(`¿Eliminar la foto "${asset.name}"? Los platillos que la usen se quedarán sin imagen.`)) return;
    try {
      await api(`/api/admin/media/${asset.id}`, { method: "DELETE" });
      setAssets((prev) => prev?.filter((a) => a.id !== asset.id) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la foto");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-[clamp(1.5rem,5vw,2rem)]">Medios</h1>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) uploadFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          uploadFiles(e.dataTransfer.files);
        }}
        disabled={uploading}
        className={cn(
          "mb-5 flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 transition-colors",
          dragging ? "border-rojo bg-rojo/10" : "border-negro/25 bg-white/60 hover:border-rojo hover:bg-rojo/5",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        <ImagePlus size={28} className="text-rojo" />
        <span className="text-sm font-bold uppercase tracking-wide text-negro/70">
          {uploading ? "Subiendo…" : "Toca para subir o arrastra tus fotos aquí"}
        </span>
        <span className="text-xs text-negro/50">JPG, PNG, WebP o AVIF · máx. 4 MB</span>
      </button>

      <ErrorNote msg={error} />
      {assets === null && !error && <LoadingRow text="Cargando fotos…" />}

      {assets?.length === 0 && (
        <div className="rounded-2xl border-2 border-negro/10 bg-white px-4 py-10 text-center">
          <p className="font-bold text-negro/60">Aún no hay fotos.</p>
          <p className="mt-1 text-sm text-negro/50">
            Sube la primera y podrás asignarla a los platillos del menú.
          </p>
        </div>
      )}

      {assets && assets.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {assets.map((a) => (
            <li key={a.id} className="flex flex-col overflow-hidden rounded-2xl border-2 border-negro/10 bg-white">
              <img
                src={`/api/media/${a.id}`}
                alt={a.name}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-2.5">
                <p className="truncate text-sm font-bold" title={a.name}>
                  {a.name}
                </p>
                <p className="text-xs text-negro/50">{formatKB(a.size)}</p>
                <div className="mt-2 flex items-center gap-1">
                  <button
                    onClick={() => copyUrl(a)}
                    className={cn(
                      "inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-bold uppercase tracking-wide",
                      copiedId === a.id ? "bg-verde/15 text-verde" : "text-negro/60 hover:bg-negro/10"
                    )}
                  >
                    {copiedId === a.id ? (
                      <>
                        <Check size={15} /> Copiada
                      </>
                    ) : (
                      <>
                        <Copy size={15} /> Copiar URL
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => remove(a)}
                    aria-label={`Eliminar ${a.name}`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-negro/40 hover:bg-rojo/10 hover:text-rojo"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
