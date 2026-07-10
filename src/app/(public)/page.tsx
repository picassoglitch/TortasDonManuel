"use client";

import { useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
} from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { cn, formatPrice } from "@/lib/utils";

const TEL = "tel:+525556312022";
const WA = "https://wa.me/525556312022?text=Hola%2C%20quiero%20hacer%20un%20pedido";
const MAPS_EMBED =
  "https://www.google.com/maps?q=Tizim%C3%ADn+163%2C+Lomas+de+Padierna%2C+Tlalpan%2C+14200+CDMX&output=embed";
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Tizim%C3%ADn+163%2C+Lomas+de+Padierna%2C+Tlalpan%2C+14200+CDMX";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const FAVORITAS = [
  {
    name: "Cubana",
    price: 100,
    desc: "Jamón, salchicha, queso Oaxaca, pierna, queso menonita y queso de puerco",
    img: "/media/torta-2.jpg",
  },
  {
    name: "Mexicana",
    price: 139,
    desc: "Jamón, queso, pierna, salchicha, milanesa, longaniza",
    img: "/media/torta-3.jpg",
  },
  {
    name: "Hawaiana",
    price: 85,
    desc: "Jamón, queso Oaxaca, piña",
    img: "/media/torta-2.jpg",
  },
  {
    name: "Rusa",
    price: 120,
    desc: "Milanesa, pierna y queso manchego",
    img: "/media/torta-3.jpg",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Favoritas />
      <BuilderTeaser />
      <Nosotros />
      <Ubicacion />
    </>
  );
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const rv = reduce ? fadeOnly : fadeUp;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      className="texture-grain relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center overflow-hidden bg-crema px-4 py-16 text-center md:min-h-[calc(100svh-5rem)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(25,21,18,0.09))]"
      />
      <motion.div
        style={reduce ? undefined : { y, opacity: fade }}
        className="relative z-[2] flex flex-col items-center"
      >
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          <motion.span
            variants={rv}
            className="inline-block -rotate-2 rounded-full bg-dorado px-4 py-1.5 text-sm font-bold uppercase tracking-[0.2em] text-negro"
          >
            Desde 1972
          </motion.span>
          <motion.h1
            variants={rv}
            className="text-painted mt-4 leading-[0.88] text-[clamp(4.4rem,20vw,13rem)]"
          >
            TORTAS
          </motion.h1>
          <motion.p
            variants={rv}
            className="font-display leading-none tracking-[0.08em] text-negro text-[clamp(1.6rem,6.5vw,4rem)]"
          >
            DON MANUEL
          </motion.p>
          <motion.div
            variants={rv}
            className="mt-3 h-2 w-32 -rotate-1 rounded-full bg-dorado sm:w-44"
          />
          <motion.p
            variants={rv}
            className="mt-6 max-w-md text-balance font-medium text-negro/75 text-[clamp(1rem,2.5vw,1.25rem)]"
          >
            Tradición que se siente, sabor que no se olvida.
          </motion.p>
          <motion.div
            variants={rv}
            className="mt-9 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row"
          >
            <Link href="/menu" className="btn-primary h-14 px-8 text-lg">
              Ver Menú
            </Link>
            <Link href="/armala" className="btn-outline h-14 px-8 text-lg">
              Arma tu Torta <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
      <motion.div
        aria-hidden
        animate={reduce ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-5 z-[2] text-negro/40"
      >
        <ChevronDown size={28} />
      </motion.div>
    </section>
  );
}

function Marquee() {
  const reduce = useReducedMotion();
  const items = [
    "Tortas al momento",
    "Desde 1972",
    "Tlalpan · CDMX",
    "Para llevar",
    "Telera recién hecha",
  ];
  return (
    <div className="overflow-hidden bg-rojo py-3">
      <motion.div
        className="flex w-max"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {[...items, ...items].map((t, i) => (
          <span
            key={i}
            className="flex items-center whitespace-nowrap font-display text-lg uppercase text-crema"
          >
            <span className="px-5">{t}</span>
            <span aria-hidden className="text-dorado">
              ✶
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function Favoritas() {
  const reduce = useReducedMotion();
  const rv = reduce ? fadeOnly : fadeUp;
  return (
    <section className="texture-grain relative bg-carbon px-4 py-16 sm:py-24">
      <div className="relative z-[2] mx-auto max-w-6xl">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.p
            variants={rv}
            className="text-sm font-bold uppercase tracking-[0.25em] text-dorado"
          >
            Las que nadie perdona
          </motion.p>
          <motion.h2
            variants={rv}
            className="mt-2 leading-none text-crema text-[clamp(2.4rem,8vw,4.5rem)] [text-shadow:0.045em_0.055em_0_var(--color-rojo)]"
          >
            LAS FAVORITAS
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FAVORITAS.map((f) => (
            <motion.div key={f.name} variants={rv} className="h-full">
              <TiltCard fav={f} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={rv}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/menu"
            className="btn-outline h-13 min-h-12 border-crema text-crema hover:bg-crema hover:text-negro"
          >
            Ver todo el menú <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function TiltCard({ fav }: { fav: (typeof FAVORITAS)[number] }) {
  const reduce = useReducedMotion();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 220, damping: 18 });
  const sry = useSpring(ry, { stiffness: 220, damping: 18 });

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 10);
    rx.set(((e.clientY - r.top) / r.height - 0.5) * -10);
  }

  function reset() {
    rx.set(0);
    ry.set(0);
  }

  function add() {
    addItem({ kind: "item", name: `Torta ${fav.name}`, unitPrice: fav.price, qty: 1 });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="h-full [perspective:900px]">
      <motion.article
        onPointerMove={onPointerMove}
        onPointerLeave={reset}
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        className="flex h-full flex-col overflow-hidden rounded-3xl border border-crema/10 bg-negro/50"
      >
        <div className="relative aspect-[4/3]">
          <Image
            src={fav.img}
            alt={`Torta ${fav.name}`}
            fill
            className="object-cover"
            sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
          />
        </div>
        <div className="flex flex-1 flex-col p-5 [transform:translateZ(24px)]">
          <h3 className="font-display text-2xl text-crema">{fav.name}</h3>
          <p className="mt-1.5 text-sm leading-snug text-crema/60">{fav.desc}</p>
          <div className="mt-auto flex items-center justify-between pt-5">
            <span className="font-display text-2xl text-dorado">{formatPrice(fav.price)}</span>
            <button
              onClick={add}
              className={cn(
                "flex h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-bold uppercase tracking-wide text-crema transition-colors",
                added ? "bg-verde" : "bg-rojo hover:bg-rojo-vivo"
              )}
            >
              {added ? (
                <>
                  <Check size={17} /> Listo
                </>
              ) : (
                <>
                  <Plus size={17} /> Agregar
                </>
              )}
            </button>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

const LAYERS = [
  { label: "Telera", cls: "bg-dorado text-negro", w: "w-full" },
  { label: "Jitomate y cebolla", cls: "bg-rojo-vivo text-crema", w: "w-[86%]" },
  { label: "Aguacate", cls: "bg-verde text-crema", w: "w-[92%]" },
  { label: "Queso Oaxaca", cls: "bg-[#f0e0b8] text-negro", w: "w-[89%]" },
  { label: "Milanesa de res", cls: "bg-[#7c4a21] text-crema", w: "w-[95%]" },
  { label: "Frijoles", cls: "bg-[#4a2e1b] text-crema", w: "w-[84%]" },
  { label: "Telera", cls: "bg-dorado text-negro", w: "w-full" },
];

const layerDrop: Variants = {
  hidden: { opacity: 0, y: -16, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 380, damping: 22 },
  },
};

function BuilderTeaser() {
  const reduce = useReducedMotion();
  const rv = reduce ? fadeOnly : fadeUp;
  const layer = reduce ? fadeOnly : layerDrop;
  return (
    <section className="overflow-hidden bg-crema px-4 py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.p
            variants={rv}
            className="text-sm font-bold uppercase tracking-[0.25em] text-rojo"
          >
            Tú mandas
          </motion.p>
          <motion.h2
            variants={rv}
            className="text-painted mt-2 leading-none text-[clamp(2.4rem,8vw,4.5rem)]"
          >
            ARMA TU TORTA
          </motion.h2>
          <motion.p variants={rv} className="mt-5 max-w-md text-lg text-negro/75">
            Empieza con la base de {formatPrice(45)} — telera, frijoles, aguacate, jitomate y
            cebolla — y súmale proteínas, quesos y extras a tu gusto.
          </motion.p>
          <motion.p variants={rv} className="mt-3 text-sm font-bold uppercase tracking-wide text-negro/50">
            Capa por capa, como debe ser.
          </motion.p>
          <motion.div variants={rv} className="mt-8">
            <Link href="/armala" className="btn-dark h-14 px-8 text-lg">
              Empezar <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>

        <div className="relative lg:pb-10">
          <motion.div
            variants={rv}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="rotate-1 overflow-hidden rounded-3xl border-4 border-negro/10 shadow-xl"
          >
            <video
              src="/media/hero-loop.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="aspect-video w-full object-cover"
            />
          </motion.div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="mx-auto -mt-8 flex w-full max-w-xs flex-col items-center gap-1.5 rounded-3xl border border-negro/10 bg-white/85 p-4 shadow-xl backdrop-blur lg:absolute lg:-bottom-2 lg:-left-8 lg:mx-0 lg:-mt-0"
          >
            {LAYERS.map((l, i) => (
              <motion.div
                key={i}
                variants={layer}
                className={cn(
                  "flex h-8 items-center justify-center rounded-full text-xs font-bold uppercase tracking-wide shadow-sm",
                  l.cls,
                  l.w
                )}
              >
                {l.label}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Nosotros() {
  const reduce = useReducedMotion();
  const rv = reduce ? fadeOnly : fadeUp;
  return (
    <section id="nosotros" className="scroll-mt-20 bg-crema px-4 pb-16 sm:pb-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <motion.div
          variants={rv}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="relative -rotate-1 overflow-hidden rounded-3xl border-4 border-negro/10 shadow-lg"
        >
          <div className="relative aspect-[4/3]">
            <Image
              src="/media/hero-wall.png"
              alt="El muro pintado a mano de Tortas Don Manuel"
              fill
              className="object-cover"
              sizes="(min-width:1024px) 50vw, 100vw"
            />
          </div>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.p
            variants={rv}
            className="text-sm font-bold uppercase tracking-[0.25em] text-rojo"
          >
            Nosotros
          </motion.p>
          <motion.h2
            variants={rv}
            className="text-painted mt-2 leading-none text-[clamp(2.4rem,8vw,4.5rem)]"
          >
            DESDE 1972
          </motion.h2>
          <motion.p variants={rv} className="mt-5 max-w-lg text-lg text-negro/75">
            Hace más de cincuenta años, Don Manuel abrió una pequeña tortería en Tlalpan con una
            sola idea: telera crujiente, guisos generosos y el sazón de casa.
          </motion.p>
          <motion.p variants={rv} className="mt-4 max-w-lg text-lg text-negro/75">
            Hoy seguimos en la misma esquina, con la misma receta. Cada torta se arma a mano, una
            por una, como el primer día.
          </motion.p>
          <motion.a
            variants={rv}
            href="https://www.instagram.com/tortasdonmanuel"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center gap-2 font-bold uppercase tracking-wide text-rojo transition-colors hover:text-rojo-vivo"
          >
            <Instagram size={18} /> @tortasdonmanuel
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

function Ubicacion() {
  const reduce = useReducedMotion();
  const rv = reduce ? fadeOnly : fadeUp;
  return (
    <section
      id="ubicacion"
      className="texture-grain relative scroll-mt-20 bg-carbon px-4 py-16 text-crema sm:py-24"
    >
      <div className="relative z-[2] mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.p
            variants={rv}
            className="text-sm font-bold uppercase tracking-[0.25em] text-dorado"
          >
            Ubicación
          </motion.p>
          <motion.h2
            variants={rv}
            className="mt-2 leading-none text-crema text-[clamp(2.4rem,8vw,4rem)] [text-shadow:0.045em_0.055em_0_var(--color-rojo)]"
          >
            AQUÍ NOS ENCUENTRAS
          </motion.h2>

          <motion.div variants={rv} className="mt-7 space-y-4 text-crema/80">
            <p className="flex items-start gap-3">
              <MapPin size={20} className="mt-0.5 shrink-0 text-dorado" />
              <span>Tizimín 163-8, Lomas de Padierna, Tlalpan, 14200 CDMX</span>
            </p>
            <p className="flex items-start gap-3">
              <Clock size={20} className="mt-0.5 shrink-0 text-dorado" />
              <span>
                Viernes a domingo · abrimos 10:30 am
                <br />
                Solo pedidos para recoger
              </span>
            </p>
          </motion.div>

          <motion.div variants={rv} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={TEL} className="btn-primary h-13 min-h-12">
              <Phone size={18} /> 55 5631 2022
            </a>
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-verde px-6 font-bold uppercase tracking-wide text-crema transition-colors hover:bg-verde/85"
            >
              <MessageCircle size={18} /> WhatsApp
            </a>
          </motion.div>

          <motion.a
            variants={rv}
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center text-sm font-bold uppercase tracking-wide text-crema underline decoration-dorado underline-offset-4 transition-colors hover:text-dorado"
          >
            Abrir en Google Maps
          </motion.a>
        </motion.div>

        <motion.div
          variants={rv}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="overflow-hidden rounded-3xl border border-crema/15"
        >
          <iframe
            src={MAPS_EMBED}
            title="Mapa: Tortas Don Manuel, Tizimín 163, Lomas de Padierna"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="h-80 w-full lg:h-full lg:min-h-96"
          />
        </motion.div>
      </div>
    </section>
  );
}
