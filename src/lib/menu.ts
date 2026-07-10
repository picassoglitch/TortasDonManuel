import { prisma } from "@/lib/db";
import {
  MENU_FALLBACK,
  BUILDER_FALLBACK,
  type CategoryData,
  type BuilderGroupData,
  type MenuVariant,
} from "@/lib/menu-data";

export async function getMenu(): Promise<CategoryData[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });
    if (categories.length === 0) return MENU_FALLBACK;
    return categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      subtitle: c.subtitle ?? undefined,
      description: c.description ?? undefined,
      sortOrder: c.sortOrder,
      items: c.items.map((i) => ({
        slug: i.slug,
        name: i.name,
        description: i.description ?? undefined,
        imageUrl: i.imageUrl ?? undefined,
        variants: (i.variants as unknown as MenuVariant[]) ?? [],
        tags: i.tags,
        isAvailable: i.isAvailable,
        isHoliday: i.isHoliday,
        isFeatured: i.isFeatured,
        sortOrder: i.sortOrder,
      })),
    }));
  } catch {
    return MENU_FALLBACK;
  }
}

export async function getBuilder(): Promise<BuilderGroupData[]> {
  try {
    const groups = await prisma.builderGroup.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { options: { orderBy: { sortOrder: "asc" } } },
    });
    if (groups.length === 0) return BUILDER_FALLBACK;
    return groups.map((g) => ({
      key: g.key,
      name: g.name,
      description: g.description ?? undefined,
      type: g.type,
      minSelect: g.minSelect,
      maxSelect: g.maxSelect,
      required: g.required,
      sortOrder: g.sortOrder,
      options: g.options.map((o) => ({
        name: o.name,
        description: o.description ?? undefined,
        price: o.price,
        isAvailable: o.isAvailable,
        isDefault: o.isDefault,
        sortOrder: o.sortOrder,
      })),
    }));
  } catch {
    return BUILDER_FALLBACK;
  }
}
