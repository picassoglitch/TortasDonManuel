"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn, formatPrice } from "@/lib/utils";
import { ErrorNote, Field, LoadingRow, Modal, Toggle, api } from "@/components/admin/ui";

type AdminOption = {
  id: string;
  groupId: string;
  name: string;
  price: number;
  isAvailable: boolean;
  isDefault: boolean;
  sortOrder: number;
};

type AdminGroup = {
  id: string;
  key: string;
  name: string;
  type: "SINGLE" | "MULTI";
  minSelect: number;
  maxSelect: number;
  required: boolean;
  sortOrder: number;
  isActive: boolean;
  options: AdminOption[];
};

type GroupForm = {
  id?: string;
  name: string;
  type: "SINGLE" | "MULTI";
  minSelect: string;
  maxSelect: string;
  required: boolean;
  sortOrder: string;
  isActive: boolean;
};

type OptionForm = {
  id?: string;
  groupId: string;
  name: string;
  price: string;
  isAvailable: boolean;
  isDefault: boolean;
  sortOrder: string;
};

function GroupModal({ form, onClose, onSaved }: { form: GroupForm; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState(form);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!f.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setError(null);
    setBusy(true);
    const body = {
      name: f.name.trim(),
      type: f.type,
      minSelect: Number(f.minSelect) || 0,
      maxSelect: Number(f.maxSelect) || 0,
      required: f.required,
      sortOrder: Number(f.sortOrder) || 0,
      isActive: f.isActive,
    };
    try {
      if (f.id) {
        await api(`/api/admin/builder/groups/${f.id}`, { method: "PATCH", body: JSON.stringify(body) });
      } else {
        await api("/api/admin/builder/groups", { method: "POST", body: JSON.stringify(body) });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
      setBusy(false);
    }
  }

  async function remove() {
    if (!f.id || !confirm(`¿Eliminar el grupo "${f.name}" y todas sus opciones?`)) return;
    setBusy(true);
    try {
      await api(`/api/admin/builder/groups/${f.id}`, { method: "DELETE" });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar");
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={f.id ? "Editar grupo" : "Nuevo grupo"}>
      <div className="flex flex-col gap-4">
        <Input label="Nombre" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Proteínas" />
        <Field label="Tipo de selección">
          <select
            value={f.type}
            onChange={(e) => setF({ ...f, type: e.target.value as "SINGLE" | "MULTI" })}
            className="h-12 w-full rounded-xl border-2 border-negro/15 bg-white px-4 focus:border-rojo focus:outline-none"
          >
            <option value="SINGLE">Una sola opción</option>
            <option value="MULTI">Varias opciones</option>
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Mínimo"
            value={f.minSelect}
            onChange={(e) => setF({ ...f, minSelect: e.target.value })}
            inputMode="numeric"
          />
          <Input
            label="Máximo (0 = sin límite)"
            value={f.maxSelect}
            onChange={(e) => setF({ ...f, maxSelect: e.target.value })}
            inputMode="numeric"
          />
        </div>
        <Input label="Orden" value={f.sortOrder} onChange={(e) => setF({ ...f, sortOrder: e.target.value })} inputMode="numeric" />
        <div className="flex flex-col gap-3 rounded-xl bg-negro/5 p-4">
          <label className="flex items-center justify-between gap-3 font-semibold">
            Obligatorio
            <Toggle checked={f.required} onChange={(v) => setF({ ...f, required: v })} label="Obligatorio" />
          </label>
          <label className="flex items-center justify-between gap-3 font-semibold">
            Activo
            <Toggle checked={f.isActive} onChange={(v) => setF({ ...f, isActive: v })} label="Activo" />
          </label>
        </div>
        <ErrorNote msg={error} />
        <div className="flex items-center justify-between gap-2">
          {f.id ? (
            <button
              onClick={remove}
              disabled={busy}
              className="inline-flex min-h-12 items-center gap-1.5 rounded-xl px-4 text-sm font-bold uppercase tracking-wide text-rojo hover:bg-rojo/10 disabled:opacity-50"
            >
              <Trash2 size={16} /> Eliminar
            </button>
          ) : (
            <span />
          )}
          <Button onClick={save} disabled={busy}>
            {busy ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function OptionModal({ form, onClose, onSaved }: { form: OptionForm; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState(form);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    const price = Number(f.price);
    if (!f.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (f.price === "" || Number.isNaN(price) || price < 0) {
      setError("Precio inválido (usa 0 si es gratis)");
      return;
    }
    setError(null);
    setBusy(true);
    const body = {
      groupId: f.groupId,
      name: f.name.trim(),
      price,
      isAvailable: f.isAvailable,
      isDefault: f.isDefault,
      sortOrder: Number(f.sortOrder) || 0,
    };
    try {
      if (f.id) {
        await api(`/api/admin/builder/options/${f.id}`, { method: "PATCH", body: JSON.stringify(body) });
      } else {
        await api("/api/admin/builder/options", { method: "POST", body: JSON.stringify(body) });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
      setBusy(false);
    }
  }

  async function remove() {
    if (!f.id || !confirm(`¿Eliminar la opción "${f.name}"?`)) return;
    setBusy(true);
    try {
      await api(`/api/admin/builder/options/${f.id}`, { method: "DELETE" });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar");
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={f.id ? "Editar opción" : "Nueva opción"}>
      <div className="flex flex-col gap-4">
        <Input label="Nombre" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Milanesa de res" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Precio extra" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} inputMode="decimal" />
          <Input label="Orden" value={f.sortOrder} onChange={(e) => setF({ ...f, sortOrder: e.target.value })} inputMode="numeric" />
        </div>
        <div className="flex flex-col gap-3 rounded-xl bg-negro/5 p-4">
          <label className="flex items-center justify-between gap-3 font-semibold">
            Disponible
            <Toggle checked={f.isAvailable} onChange={(v) => setF({ ...f, isAvailable: v })} label="Disponible" />
          </label>
          <label className="flex items-center justify-between gap-3 font-semibold">
            Seleccionada por defecto
            <Toggle checked={f.isDefault} onChange={(v) => setF({ ...f, isDefault: v })} label="Por defecto" />
          </label>
        </div>
        <ErrorNote msg={error} />
        <div className="flex items-center justify-between gap-2">
          {f.id ? (
            <button
              onClick={remove}
              disabled={busy}
              className="inline-flex min-h-12 items-center gap-1.5 rounded-xl px-4 text-sm font-bold uppercase tracking-wide text-rojo hover:bg-rojo/10 disabled:opacity-50"
            >
              <Trash2 size={16} /> Eliminar
            </button>
          ) : (
            <span />
          )}
          <Button onClick={save} disabled={busy}>
            {busy ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function BuilderManager() {
  const [groups, setGroups] = useState<AdminGroup[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [groupForm, setGroupForm] = useState<GroupForm | null>(null);
  const [optionForm, setOptionForm] = useState<OptionForm | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<{ groups: AdminGroup[] }>("/api/admin/builder");
      setGroups(data.groups);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el armador");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleOption(opt: AdminOption, value: boolean) {
    setGroups(
      (prev) =>
        prev?.map((g) => ({
          ...g,
          options: g.options.map((o) => (o.id === opt.id ? { ...o, isAvailable: value } : o)),
        })) ?? null
    );
    try {
      await api(`/api/admin/builder/options/${opt.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isAvailable: value }),
      });
    } catch {
      load();
    }
  }

  function closeAndReload() {
    setGroupForm(null);
    setOptionForm(null);
    load();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h1 className="text-[clamp(1.5rem,5vw,2rem)]">Arma tu Torta</h1>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setGroupForm({
              name: "",
              type: "MULTI",
              minSelect: "0",
              maxSelect: "0",
              required: false,
              sortOrder: String(((groups?.length ?? 0) + 1) * 10),
              isActive: true,
            })
          }
        >
          <Plus size={16} /> Grupo
        </Button>
      </div>
      <p className="mb-4 text-sm text-negro/60">Base $45 con telera, frijoles, aguacate, jitomate y cebolla.</p>

      <ErrorNote msg={error} />
      {groups === null && !error && <LoadingRow text="Cargando armador…" />}

      <div className="flex flex-col gap-6">
        {groups?.map((group) => (
          <section key={group.id} className={cn("rounded-2xl border-2 border-negro/10 bg-white", !group.isActive && "opacity-60")}>
            <header className="flex items-center justify-between gap-2 border-b border-negro/10 px-4 py-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg">
                  {group.name}
                  {!group.isActive && <span className="ml-2 text-sm font-bold text-negro/40">(inactivo)</span>}
                </h2>
                <p className="text-sm text-negro/50">
                  {group.type === "SINGLE" ? "Una opción" : "Varias opciones"}
                  {group.required && " · obligatorio"}
                  {group.maxSelect > 0 && ` · máx ${group.maxSelect}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() =>
                    setGroupForm({
                      id: group.id,
                      name: group.name,
                      type: group.type,
                      minSelect: String(group.minSelect),
                      maxSelect: String(group.maxSelect),
                      required: group.required,
                      sortOrder: String(group.sortOrder),
                      isActive: group.isActive,
                    })
                  }
                  aria-label={`Editar ${group.name}`}
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-negro/50 hover:bg-negro/10"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() =>
                    setOptionForm({
                      groupId: group.id,
                      name: "",
                      price: "0",
                      isAvailable: true,
                      isDefault: false,
                      sortOrder: String((group.options.length + 1) * 10),
                    })
                  }
                  aria-label={`Agregar opción a ${group.name}`}
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-rojo hover:bg-rojo/10"
                >
                  <Plus size={20} />
                </button>
              </div>
            </header>

            <ul className="divide-y divide-negro/5">
              {group.options.length === 0 && (
                <li className="px-4 py-6 text-center text-sm font-semibold text-negro/40">Sin opciones todavía.</li>
              )}
              {group.options.map((opt) => (
                <li key={opt.id} className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={() =>
                      setOptionForm({
                        id: opt.id,
                        groupId: opt.groupId,
                        name: opt.name,
                        price: String(opt.price),
                        isAvailable: opt.isAvailable,
                        isDefault: opt.isDefault,
                        sortOrder: String(opt.sortOrder),
                      })
                    }
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className={cn("flex items-center gap-2 font-bold", !opt.isAvailable && "text-negro/40 line-through")}>
                      {opt.name}
                      {opt.isDefault && <Star size={14} className="text-dorado" fill="currentColor" />}
                    </p>
                    <p className="text-sm text-negro/60">{opt.price > 0 ? `+${formatPrice(opt.price)}` : "Gratis"}</p>
                  </button>
                  <Toggle
                    checked={opt.isAvailable}
                    onChange={(v) => toggleOption(opt, v)}
                    label={`Disponibilidad de ${opt.name}`}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {groupForm && <GroupModal form={groupForm} onClose={() => setGroupForm(null)} onSaved={closeAndReload} />}
      {optionForm && <OptionModal form={optionForm} onClose={() => setOptionForm(null)} onSaved={closeAndReload} />}
    </div>
  );
}
