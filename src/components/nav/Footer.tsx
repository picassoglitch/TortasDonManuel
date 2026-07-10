import Image from "next/image";
import Link from "next/link";
import { Clock, Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import { getSiteConfig } from "@/lib/settings";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Tizim%C3%ADn+163%2C+Lomas+de+Padierna%2C+Tlalpan%2C+14200+CDMX";

export async function Footer() {
  const { whatsapp, phone } = await getSiteConfig();
  const phoneHref = phone.length > 10 ? `tel:+${phone}` : `tel:+52${phone}`;
  const phoneDisplay =
    phone.length === 10
      ? `${phone.slice(0, 2)} ${phone.slice(2, 6)} ${phone.slice(6)}`
      : phone;
  return (
    <footer className="texture-grain relative bg-carbon text-crema">
      <div className="relative z-[2] mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image
              src="/media/logo-dark.png"
              alt="Tortas Don Manuel"
              width={1600}
              height={498}
              className="h-12 w-auto"
            />
            <span className="mt-4 inline-block -rotate-2 rounded-full bg-dorado px-3 py-1 text-xs font-bold uppercase tracking-widest text-negro">
              Desde 1972
            </span>
            <p className="mt-4 max-w-xs text-sm text-crema/60">
              Tradición con sazón.
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg text-dorado">Visítanos</h3>
            <p className="mt-3 flex items-start gap-2 text-sm text-crema/80">
              <MapPin size={18} className="mt-0.5 shrink-0 text-dorado" />
              Tizimín 163-8, Lomas de Padierna, Tlalpan, 14200 CDMX
            </p>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-bold uppercase tracking-wide text-crema underline decoration-dorado underline-offset-4 transition-colors hover:text-dorado"
            >
              Cómo llegar
            </a>
          </div>

          <div>
            <h3 className="font-display text-lg text-dorado">Contacto</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href={phoneHref}
                  className="inline-flex min-h-11 items-center gap-2 text-crema/80 transition-colors hover:text-dorado"
                >
                  <Phone size={16} className="text-dorado" /> {phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 text-crema/80 transition-colors hover:text-dorado"
                >
                  <MessageCircle size={16} className="text-dorado" /> WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/tortasdonmanuel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 text-crema/80 transition-colors hover:text-dorado"
                >
                  <Instagram size={16} className="text-dorado" /> @tortasdonmanuel
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg text-dorado">Horario</h3>
            <p className="mt-3 flex items-start gap-2 text-sm text-crema/80">
              <Clock size={18} className="mt-0.5 shrink-0 text-dorado" />
              <span>
                Viernes a domingo
                <br />
                desde las 10:30 am
              </span>
            </p>
            <p className="mt-3 text-sm text-crema/60">Solo pedidos para recoger.</p>
            <Link
              href="/menu"
              className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-rojo px-5 text-sm font-bold uppercase tracking-wide text-crema transition-colors hover:bg-rojo-vivo"
            >
              Ver Menú
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-crema/10 pt-6 text-xs text-crema/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Tortas Don Manuel · Tlalpan, CDMX</p>
          <p>
            Hecho a mano, una torta a la vez. · Sitio por{" "}
            <a
              href="https://nexo-ai.world"
              target="_blank"
              rel="noopener noreferrer"
              className="text-crema/40 transition-colors hover:text-dorado"
            >
              Nexo-AI
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
