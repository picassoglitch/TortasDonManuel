"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn, formatPrice } from "@/lib/utils";
import { ErrorNote, Field, LoadingRow, Modal, Toggle, api } from "@/components/admin/ui";

type Variant = { label: string; price: number };

type AdminItem = {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  variants: Variant[];
  tags: string[];
  isAvailable: boolean;
  isHoliday: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

type AdminCategory = {
  id: string;
  name: string;
  subtitle: string | null;
  sortOrder: number;
  isActive: boolean;
  items: AdminItem[];
};

type VariantRow = { label: string; price: string };

type ItemForm = {
  id?: string;
  name: string;
  description: string;
  categoryId: string;
  variants: VariantRow[];
  tags: string;
  isAvailable: boolean;
  isHoliday: boolean;
  isFeatured: boolean;
  sortOrder: string;
};

type CatForm = {
  id?: string;
  name: string;
  subtitle: string;
  sortOrder: string;
  isActive: boolean;
};

function emptyItem(categoryId: string, sortOrder: number): ItemForm {
  return {
    name: "",
    description: "",
    categoryId,
    variants: [{ label: "Sencilla", price: "" }],
    tags: "",
    isAvailable: true,
    isHoliday: false,
    isFeatured: false,
    sortOrder: String(sortOrder),
  };
}

function toItemForm(item: AdminItem): ItemForm {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? "",
    categoryId: item.categoryId,
    variants: item.variants.map((v) => ({ label: v.label, price: String(v.price) })),
    tags: item.tags.join(", "),
    isAvailable: item.isAvailable,
    isHoliday: item.isHoliday,
    isFeatured: item.isFeatured,
    sortOrder: String(item.sortOrder),
  };
}

function ItemModal({
  form,
  categories,
  onClose,
  onSaved,
}: {
  form: ItemForm;
  categories: AdminCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState(form);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof ItemForm>(key: K, value: ItemForm[K]) {
    setF((prev) => ({ ...prev, [key]: value }));
  }

  function setVariant(i: number, patch: Partial<VariantRow>) {
    setF((prev) => ({
      ...prev,
      variants: prev.variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)),
    }));
  }

  async function save() {
    setError(null);
    const variants: Variant[] = [];
    for (const v of f.variants) {
      const price = Number(v.price);
      if (!v.label.trim() || v.price === "" || Number.isNaN(price) || price < 0) {
        setError("Cada variante necesita etiqueta y precio válido");
        return;
      }
      variants.push({ label: v.label.trim(), price });
    }
    if (!f.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (variants.length === 0) {
      setError("Agrega al menos una variante con precio");
      return;
    }
    const body = {
      name: f.name.trim(),
      description: f.description.trim() || (f.id ? null : undefined),
      categoryId: f.categoryId,
      variants,
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
      isAvailable: f.isAvailable,
      isHoliday: f.isHoliday,
      isFeatured: f.isFeatured,
      sortOrder: Number(f.sortOrder) || 0,
    };
    setBusy(true);
    try {
      if (f.id) {
        await api(`/api/admin/menu/items/${f.id}`, { method: "PATCH", body: JSON.stringify(body) });
      } else {
        await api("/api/admin/menu/items", { method: "POST", body: JSON.stringify(body) });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
      setBusy(false);
    }
  }

  async function remove() {
    if (!f.id || !confirm(`¿Eliminar "${f.name}" del menú?`)) return;
    setBusy(true);
    try {
      await api(`/api/admin/menu/items/${f.id}`, { method: "DELETE" });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar");
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={f.id ? "Editar platillo" : "Nuevo platillo"}>
      <div className="flex flex-col gap-4">
        <Input label="Nombre" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Torta Cubana" />
        <Field label="Descripción">
          <textarea
            value={f.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            className="w-full rounded-xl border-2 border-negro/15 bg-white px-4 py-3 text-negro placeholder:text-negro/40 focus:border-rojo focus:outline-none"
            placeholder="Jamón, salchicha, queso Oaxaca…"
          />
        </Field>
        <Field label="Categoría">
          <select
            value={f.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className="h-12 w-full rounded-xl border-2 border-negro/15 bg-white px-4 text-negro focus:border-rojo focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <div>
          <p className="mb-1.5 text-sm font-bold uppercase tracking-wide text-negro/70">Variantes y precios</p>
          <div className="flex flex-col gap-2">
            {f.variants.map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={v.label}
                  onChange={(e) => setVariant(i, { label: e.target.value })}
                  placeholder="Sencilla"
                  className="h-12 min-w-0 flex-1 rounded-xl border-2 border-negro/15 bg-white px-4 focus:border-rojo focus:outline-none"
                />
                <input
                  value={v.price}
                  onChange={(e) => setVariant(i, { price: e.target.value })}
                  placeholder="$"
                  inputMode="decimal"
                  className="h-12 w-24 rounded-xl border-2 border-negro/15 bg-white px-3 text-right focus:border-rojo focus:outline-none"
                />
                <button
                  onClick={() => set("variants", f.variants.filter((_, idx) => idx !== i))}
                  disabled={f.variants.length === 1}
                  aria-label="Quitar variante"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-negro/40 hover:bg-rojo/10 hover:text-rojo disabled:opacity-30"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => set("variants", [...f.variants, { label: "", price: "" }])}
            className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-bold uppercase tracking-wide text-rojo hover:bg-rojo/10"
          >
            <Plus size={16} /> Agregar variante
          </button>
        </div>

        <Input
          label="Etiquetas (separadas por coma)"
          value={f.tags}
          onChange={(e) => set("tags", e.target.value)}
          placeholder="picante, nuevo"
        />
        <Input
          label="Orden"
          value={f.sortOrder}
          onChange={(e) => set("sortOrder", e.target.value)}
          inputMode="numeric"
        />

        <div className="flex flex-col gap-3 rounded-xl bg-negro/5 p-4">
          <label className="flex items-center justify-between gap-3 font-semibold">
            Disponible
            <Toggle checked={f.isAvailable} onChange={(v) => set("isAvailable", v)} label="Disponible" />
          </label>
          <label className="flex items-center justify-between gap-3 font-semibold">
            Solo días festivos
            <Toggle checked={f.isHoliday} onChange={(v) => set("isHoliday", v)} label="Solo días festivos" />
          </label>
          <label className="flex items-center justify-between gap-3 font-semibold">
            Destacado (favoritas)
            <Toggle checked={f.isFeatured} onChange={(v) => set("isFeatured", v)} label="Destacado" />
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

function CategoryModal({
  form,
  onClose,
  onSaved,
}: {
  form: CatForm;
  onClose: () => void;
  onSaved: () => void;
}) {
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
      subtitle: f.subtitle.trim() || (f.id ? null : undefined),
      sortOrder: Number(f.sortOrder) || 0,
      isActive: f.isActive,
    };
    try {
      if (f.id) {
        await api(`/api/admin/menu/categories/${f.id}`, { method: "PATCH", body: JSON.stringify(body) });
      } else {
        await api("/api/admin/menu/categories", { method: "POST", body: JSON.stringify(body) });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
      setBusy(false);
    }
  }

  async function remove() {
    if (!f.id || !confirm(`¿Eliminar la categoría "${f.name}" y todos sus platillos?`)) return;
    setBusy(true);
    try {
      await api(`/api/admin/menu/categories/${f.id}`, { method: "DELETE" });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar");
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={f.id ? "Editar categoría" : "Nueva categoría"}>
      <div className="flex flex-col gap-4">
        <Input label="Nombre" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Las Especiales" />
        <Input
          label="Subtítulo"
          value={f.subtitle}
          onChange={(e) => setF({ ...f, subtitle: e.target.value })}
          placeholder="sencilla / con queso"
        />
        <Input
          label="Orden"
          value={f.sortOrder}
          onChange={(e) => setF({ ...f, sortOrder: e.target.value })}
          inputMode="numeric"
        />
        <label className="flex items-center justify-between gap-3 rounded-xl bg-negro/5 p-4 font-semibold">
          Visible en el menú
          <Toggle checked={f.isActive} onChange={(v) => setF({ ...f, isActive: v })} label="Visible" />
        </label>
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

export function MenuManager() {
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<ItemForm | null>(null);
  const [catForm, setCatForm] = useState<CatForm | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<{ categories: AdminCategory[] }>("/api/admin/menu");
      setCategories(data.categories);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el menú");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleItem(item: AdminItem, value: boolean) {
    setCategories(
      (prev) =>
        prev?.map((c) => ({
          ...c,
          items: c.items.map((i) => (i.id === item.id ? { ...i, isAvailable: value } : i)),
        })) ?? null
    );
    try {
      await api(`/api/admin/menu/items/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isAvailable: value }),
      });
    } catch {
      load();
    }
  }

  function closeAndReload() {
    setItemForm(null);
    setCatForm(null);
    load();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-[clamp(1.5rem,5vw,2rem)]">Menú</h1>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCatForm({ name: "", subtitle: "", sortOrder: String((categories?.length ?? 0) * 10), isActive: true })}
        >
          <Plus size={16} /> Categoría
        </Button>
      </div>

      <ErrorNote msg={error} />
      {categories === null && !error && <LoadingRow text="Cargando menú…" />}

      <div className="flex flex-col gap-6">
        {categories?.map((cat) => (
          <section key={cat.id} className={cn("rounded-2xl border-2 border-negro/10 bg-white", !cat.isActive && "opacity-60")}>
            <header className="flex items-center justify-between gap-2 border-b border-negro/10 px-4 py-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg">
                  {cat.name}
                  {!cat.isActive && <span className="ml-2 text-sm font-bold text-negro/40">(oculta)</span>}
                </h2>
                {cat.subtitle && <p className="truncate text-sm text-negro/50">{cat.subtitle}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() =>
                    setCatForm({
                      id: cat.id,
                      name: cat.name,
                      subtitle: cat.subtitle ?? "",
                      sortOrder: String(cat.sortOrder),
                      isActive: cat.isActive,
                    })
                  }
                  aria-label={`Editar ${cat.name}`}
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-negro/50 hover:bg-negro/10"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => setItemForm(emptyItem(cat.id, (cat.items.length + 1) * 10))}
                  aria-label={`Agregar platillo a ${cat.name}`}
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-rojo hover:bg-rojo/10"
                >
                  <Plus size={20} />
                </button>
              </div>
            </header>

            <ul className="divide-y divide-negro/5">
              {cat.items.length === 0 && (
                <li className="px-4 py-6 text-center text-sm font-semibold text-negro/40">Sin platillos todavía.</li>
              )}
              {cat.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={() => setItemForm(toItemForm(item))}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className={cn("flex flex-wrap items-center gap-2 font-bold", !item.isAvailable && "text-negro/40 line-through")}>
                      {item.name}
                      {item.isHoliday && <Badge variant="dorado">Festivos</Badge>}
                      {item.isFeatured && <Badge variant="rojo">Favorita</Badge>}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-negro/60">
                      {item.variants.map((v) => `${v.label} ${formatPrice(v.price)}`).join(" · ")}
                    </p>
                  </button>
                  <Toggle
                    checked={item.isAvailable}
                    onChange={(v) => toggleItem(item, v)}
                    label={`Disponibilidad de ${item.name}`}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {itemForm && categories && (
        <ItemModal form={itemForm} categories={categories} onClose={() => setItemForm(null)} onSaved={closeAndReload} />
      )}
      {catForm && <CategoryModal form={catForm} onClose={() => setCatForm(null)} onSaved={closeAndReload} />}
    </div>
  );
}
