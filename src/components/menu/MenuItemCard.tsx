"use client";

import { Check, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn, formatPrice } from "@/lib/utils";
import type { MenuItemData } from "@/lib/menu-data";

type Props = {
  item: MenuItemData;
  readonly?: boolean;
  added?: boolean;
  onAdd?: (item: MenuItemData) => void;
};

export function MenuItemCard({ item, readonly = false, added = false, onAdd }: Props) {
  const only = item.variants.length === 1 ? item.variants[0] : undefined;
  const disabled = !item.isAvailable || item.isHoliday;
  const showBadges = item.isHoliday || !item.isAvailable || item.isFeatured;

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl border border-negro/10 bg-white/70 p-4",
        !item.isAvailable && "opacity-60"
      )}
    >
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          className="mb-3 aspect-video w-full rounded-xl object-cover"
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl leading-tight text-negro">{item.name}</h3>
        {only && (
          <span className="shrink-0 font-display text-xl text-rojo">
            {formatPrice(only.price)}
          </span>
        )}
      </div>

      {showBadges && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {item.isFeatured && <Badge variant="rojo">Favorita</Badge>}
          {item.isHoliday && <Badge variant="dorado">Solo días festivos</Badge>}
          {!item.isAvailable && <Badge variant="outline">Agotado</Badge>}
        </div>
      )}

      {item.description && (
        <p className="mt-1.5 text-sm leading-snug text-negro/70">{item.description}</p>
      )}

      {!only && item.variants.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {item.variants.map((v) => (
            <li key={v.label} className="flex items-baseline text-sm">
              <span className="text-negro/80">{v.label}</span>
              <span
                aria-hidden
                className="mx-2 flex-1 border-b border-dotted border-negro/25"
              />
              <span className="font-bold text-negro">{formatPrice(v.price)}</span>
            </li>
          ))}
        </ul>
      )}

      {!readonly && (
        <div className="mt-auto pt-4">
          <button
            onClick={() => onAdd?.(item)}
            disabled={disabled}
            className={cn(
              "flex h-11 w-full items-center justify-center gap-1.5 rounded-xl text-sm font-bold uppercase tracking-wide text-crema transition-colors disabled:pointer-events-none disabled:opacity-40",
              added ? "bg-verde" : "bg-rojo hover:bg-rojo-vivo"
            )}
          >
            {added ? (
              <>
                <Check size={17} /> Agregado
              </>
            ) : (
              <>
                <Plus size={17} /> {only ? "Agregar" : "Elegir"}
              </>
            )}
          </button>
        </div>
      )}
    </article>
  );
}
