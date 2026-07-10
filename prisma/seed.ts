import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { MENU_FALLBACK, BUILDER_FALLBACK } from "../src/lib/menu-data";

const prisma = new PrismaClient();

// SEED_ADMINS="correo:contraseña,correo:contraseña" — solo se crean si no existen
function parseTeamAdmins(): { email: string; password: string; name: string; role: string }[] {
  const raw = process.env.SEED_ADMINS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((pair) => {
      const i = pair.indexOf(":");
      if (i < 1) return null;
      const email = pair.slice(0, i).trim();
      const password = pair.slice(i + 1).trim();
      if (!email || !password) return null;
      return { email, password, name: email.split("@")[0], role: "owner" };
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);
}

async function seedAdmin() {
  // Cuentas del equipo: solo se crean si no existen (no pisa contraseñas cambiadas en el panel)
  for (const a of parseTeamAdmins()) {
    const email = a.email.trim().toLowerCase();
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      console.log(`Admin ya existe: ${email}`);
      continue;
    }
    await prisma.admin.create({
      data: { email, name: a.name, passwordHash: await bcrypt.hash(a.password, 10), role: a.role },
    });
    console.log(`Admin creado: ${email}`);
  }

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) return;
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.admin.upsert({
    where: { email: email.trim().toLowerCase() },
    update: { passwordHash },
    create: {
      email: email.trim().toLowerCase(),
      name: "Don Manuel",
      passwordHash,
      role: "owner",
    },
  });
  console.log(`Admin listo: ${email}`);
}

async function seedMenu() {
  for (const cat of MENU_FALLBACK) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        subtitle: cat.subtitle ?? null,
        description: cat.description ?? null,
        sortOrder: cat.sortOrder,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        subtitle: cat.subtitle ?? null,
        description: cat.description ?? null,
        sortOrder: cat.sortOrder,
      },
    });

    for (const item of cat.items) {
      const variants = item.variants as unknown as Prisma.InputJsonValue;
      await prisma.menuItem.upsert({
        where: { slug: item.slug },
        update: {
          name: item.name,
          description: item.description ?? null,
          categoryId: category.id,
          variants,
          tags: item.tags,
          isHoliday: item.isHoliday,
          isFeatured: item.isFeatured,
          sortOrder: item.sortOrder,
        },
        create: {
          slug: item.slug,
          name: item.name,
          description: item.description ?? null,
          categoryId: category.id,
          variants,
          tags: item.tags,
          isAvailable: item.isAvailable,
          isHoliday: item.isHoliday,
          isFeatured: item.isFeatured,
          sortOrder: item.sortOrder,
        },
      });
    }
  }
  console.log(`Menú listo: ${MENU_FALLBACK.length} categorías`);
}

async function seedBuilder() {
  for (const group of BUILDER_FALLBACK) {
    const g = await prisma.builderGroup.upsert({
      where: { key: group.key },
      update: {
        name: group.name,
        description: group.description ?? null,
        type: group.type,
        minSelect: group.minSelect,
        maxSelect: group.maxSelect,
        required: group.required,
        sortOrder: group.sortOrder,
      },
      create: {
        key: group.key,
        name: group.name,
        description: group.description ?? null,
        type: group.type,
        minSelect: group.minSelect,
        maxSelect: group.maxSelect,
        required: group.required,
        sortOrder: group.sortOrder,
      },
    });

    for (const opt of group.options) {
      const existing = await prisma.builderOption.findFirst({
        where: { groupId: g.id, name: opt.name },
      });
      if (existing) {
        await prisma.builderOption.update({
          where: { id: existing.id },
          data: {
            price: opt.price,
            isDefault: opt.isDefault,
            sortOrder: opt.sortOrder,
          },
        });
      } else {
        await prisma.builderOption.create({
          data: {
            groupId: g.id,
            name: opt.name,
            price: opt.price,
            isAvailable: opt.isAvailable,
            isDefault: opt.isDefault,
            sortOrder: opt.sortOrder,
          },
        });
      }
    }
  }
  console.log(`Builder listo: ${BUILDER_FALLBACK.length} grupos`);
}

async function main() {
  await seedAdmin();
  await seedMenu();
  await seedBuilder();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
