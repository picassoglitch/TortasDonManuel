import { Instagram, MapPin, Phone } from "lucide-react";
import { getMenu } from "@/lib/menu";
import { formatPrice } from "@/lib/utils";
import type { MenuItemData } from "@/lib/menu-data";

export const revalidate = 60;

function VariantRows({ item }: { item: MenuItemData }) {
  if (item.variants.length === 0) return null;

  if (item.variants.length === 1) {
    const v = item.variants[0];
    return (
      <>
        {v.label !== "Única" && (
          <span className="text-xs text-negro/50">{v.label}</span>
        )}
        <span aria-hidden className="mx-1 flex-1 border-b border-dotted border-negro/30" />
        <span className="font-bold tabular-nums">{formatPrice(v.price)}</span>
      </>
    );
  }
  return null;
}

function ItemRow({ item }: { item: MenuItemData }) {
  const multi = item.variants.length > 1;
  return (
    <li className="py-3">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-[1.0625rem] font-bold leading-snug">{item.name}</span>
        {item.isHoliday && (
          <span className="rounded-full bg-dorado/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-negro/80">
            Solo días festivos
          </span>
        )}
        <VariantRows item={item} />
      </div>
      {item.description && (
        <p className="mt-0.5 max-w-[32ch] text-sm leading-snug text-negro/60">
          {item.description}
        </p>
      )}
      {multi && (
        <ul className="mt-1.5 space-y-1 pl-3">
          {item.variants.map((v) => (
            <li key={v.label} className="flex items-baseline text-[15px]">
              <span className="text-negro/70">{v.label}</span>
              <span aria-hidden className="mx-2 flex-1 border-b border-dotted border-negro/30" />
              <span className="font-bold tabular-nums">{formatPrice(v.price)}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default async function CartaPage() {
  const menu = await getMenu();
  const categories = menu
    .map((c) => ({ ...c, items: c.items.filter((i) => i.isAvailable) }))
    .filter((c) => c.items.length > 0);

  return (
    <>
      <header className="px-5 pb-6 pt-10 text-center">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-negro/60">
          Desde 1972
        </p>
        <h1 className="text-painted mt-2 font-display text-[clamp(2.5rem,13vw,4.5rem)] uppercase leading-[0.95]">
          Tortas
          <br />
          Don Manuel
        </h1>
        <p className="mx-auto mt-4 max-w-[26ch] text-sm italic leading-snug text-negro/70">
          Tradición que se siente, sabor que no se olvida.
        </p>
      </header>

      <nav
        aria-label="Categorías"
        className="sticky top-0 z-10 border-y border-negro/10 bg-crema/95 backdrop-blur-sm print:hidden"
      >
        <ul className="no-scrollbar mx-auto flex max-w-xl gap-2 overflow-x-auto px-4 py-2">
          {categories.map((c) => (
            <li key={c.slug}>
              <a
                href={`#${c.slug}`}
                className="flex min-h-11 items-center whitespace-nowrap rounded-full border border-negro/15 px-4 text-xs font-bold uppercase tracking-wide text-negro/80 transition-colors active:bg-rojo active:text-crema"
              >
                {c.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="mx-auto w-full max-w-xl px-5 pb-10">
        {categories.map((c) => (
          <section key={c.slug} id={c.slug} className="scroll-mt-20 pt-8">
            <h2 className="font-display text-[clamp(1.5rem,6vw,2rem)] uppercase text-rojo">
              {c.name}
            </h2>
            {c.subtitle && (
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-negro/50">
                {c.subtitle}
              </p>
            )}
            <ul className="mt-3 divide-y divide-negro/10 border-t border-negro/10">
              {c.items.map((item) => (
                <ItemRow key={item.slug} item={item} />
              ))}
            </ul>
          </section>
        ))}

        <p className="mt-10 text-center text-xs uppercase tracking-[0.25em] text-negro/40">
          Precios en pesos mexicanos · Solo para llevar
        </p>
      </main>

      <footer className="bg-carbon px-5 py-10 text-center text-crema print:bg-transparent print:py-4 print:text-negro">
        <p className="font-display text-xl uppercase">Tortas Don Manuel</p>
        <address className="mt-4 space-y-2 text-sm not-italic leading-relaxed text-crema/80 print:text-negro/80">
          <p className="flex items-center justify-center gap-2">
            <MapPin size={16} aria-hidden className="shrink-0 print:hidden" />
            Tizimín 163-8, Lomas de Padierna, Tlalpan, 14200 CDMX
          </p>
          <p>
            <a
              href="tel:+525556312022"
              className="inline-flex min-h-11 items-center justify-center gap-2 font-bold underline-offset-4 hover:underline"
            >
              <Phone size={16} aria-hidden className="print:hidden" />
              55 5631 2022
            </a>
          </p>
          <p>
            <a
              href="https://instagram.com/tortasdonmanuel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 font-bold underline-offset-4 hover:underline"
            >
              <Instagram size={16} aria-hidden className="print:hidden" />
              @tortasdonmanuel
            </a>
          </p>
        </address>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-dorado print:text-negro/60">
          Desde 1972
        </p>
      </footer>
    </>
  );
}
