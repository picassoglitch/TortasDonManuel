import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getMenu, getBuilder } from "@/lib/menu";
import { BUILDER_BASE_PRICE } from "@/lib/menu-data";
import { createPreference, isMpConfigured } from "@/lib/mercadopago";
import { getSiteConfig } from "@/lib/settings";

const lineSchema = z.object({
  kind: z.enum(["item", "custom"]),
  name: z.string().min(1).max(120),
  variantLabel: z.string().max(60).optional(),
  unitPrice: z.number().nonnegative().max(10000),
  qty: z.number().int().min(1).max(50),
  detail: z.array(z.string().max(80)).max(30).optional(),
});

const bodySchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  customerPhone: z
    .string()
    .transform((s) => s.replace(/[\s\-()]/g, ""))
    .refine((s) => /^\d{10}$/.test(s), "Teléfono inválido (10 dígitos)"),
  pickupTime: z.string().max(40).optional(),
  notes: z.string().max(500).optional(),
  paymentMethod: z.enum(["CASH", "MERCADOPAGO"]),
  lines: z.array(lineSchema).min(1).max(30),
});

type Line = z.infer<typeof lineSchema>;

const norm = (s: string) => s.trim().toLowerCase();

async function buildPriceIndexes() {
  const [menu, builder] = await Promise.all([getMenu(), getBuilder()]);

  const itemVariants = new Map<string, { label: string; price: number }[]>();
  for (const cat of menu) {
    for (const it of cat.items) {
      if (it.isAvailable) itemVariants.set(norm(it.name), it.variants);
    }
  }

  const optionPrices = new Map<string, number>();
  for (const g of builder) {
    for (const o of g.options) {
      const k = norm(o.name);
      if (!optionPrices.has(k)) optionPrices.set(k, o.price);
    }
  }

  return { itemVariants, optionPrices };
}

function recomputeUnitPrice(
  line: Line,
  idx: Awaited<ReturnType<typeof buildPriceIndexes>>
): number {
  if (line.kind === "custom") {
    if (!line.detail?.length) return line.unitPrice;
    let sum = BUILDER_BASE_PRICE;
    for (const raw of line.detail) {
      const price = idx.optionPrices.get(norm(raw.replace(/^\+/, "")));
      if (price === undefined) return line.unitPrice;
      sum += price;
    }
    return sum;
  }

  const variants =
    idx.itemVariants.get(norm(line.name)) ??
    idx.itemVariants.get(norm(line.name.replace(/^torta\s+/i, "")));
  if (!variants?.length) return line.unitPrice;

  if (line.variantLabel) {
    const v = variants.find((x) => norm(x.label) === norm(line.variantLabel!));
    return v ? v.price : line.unitPrice;
  }
  return variants.length === 1 ? variants[0].price : line.unitPrice;
}

export async function POST(req: NextRequest) {
  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (e) {
    const msg =
      e instanceof z.ZodError
        ? e.errors[0]?.message ?? "Datos inválidos"
        : "Datos inválidos";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (parsed.paymentMethod === "MERCADOPAGO") {
    const { paymentsEnabled } = await getSiteConfig();
    if (!paymentsEnabled || !isMpConfigured()) {
      return NextResponse.json(
        { error: "El pago en línea no está disponible por el momento. Elige pago en tienda." },
        { status: 400 }
      );
    }
  }

  const idx = await buildPriceIndexes();
  const items = parsed.lines.map((line) => {
    const unitPrice = recomputeUnitPrice(line, idx);
    return {
      name: line.name,
      ...(line.variantLabel ? { variantLabel: line.variantLabel } : {}),
      unitPrice,
      qty: line.qty,
      ...(line.detail?.length ? { detail: line.detail } : {}),
    };
  });
  const total =
    Math.round(items.reduce((sum, it) => sum + it.unitPrice * it.qty, 0) * 100) / 100;

  let order;
  try {
    order = await prisma.order.create({
      data: {
        customerName: parsed.customerName,
        customerPhone: parsed.customerPhone,
        pickupTime: parsed.pickupTime,
        notes: parsed.notes,
        items: items as Prisma.InputJsonValue,
        subtotal: total,
        total,
        paymentMethod: parsed.paymentMethod,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "No pudimos registrar tu pedido. Intenta de nuevo o llama al 55 5631 2022." },
      { status: 503 }
    );
  }

  if (parsed.paymentMethod === "MERCADOPAGO") {
    try {
      const pref = await createPreference({ id: order.id, items });
      if (!pref) throw new Error("no preference");
      await prisma.order.update({
        where: { id: order.id },
        data: { mpPreferenceId: pref.id },
      });
      return NextResponse.json({ id: order.id, initPoint: pref.initPoint }, { status: 201 });
    } catch {
      return NextResponse.json(
        {
          id: order.id,
          error: "No se pudo iniciar el pago en línea. Puedes pagar en tienda al recoger.",
        },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({ id: order.id }, { status: 201 });
}
