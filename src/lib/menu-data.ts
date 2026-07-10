export type MenuVariant = {
  label: string;
  price: number;
};

export type MenuItemData = {
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  variants: MenuVariant[];
  tags: string[];
  isAvailable: boolean;
  isHoliday: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

export type CategoryData = {
  slug: string;
  name: string;
  subtitle?: string;
  description?: string;
  sortOrder: number;
  items: MenuItemData[];
};

export type BuilderOptionData = {
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  isDefault: boolean;
  sortOrder: number;
};

export type BuilderGroupData = {
  key: string;
  name: string;
  description?: string;
  type: "SINGLE" | "MULTI";
  minSelect: number;
  maxSelect: number;
  required: boolean;
  sortOrder: number;
  options: BuilderOptionData[];
};

export const BUILDER_BASE_PRICE = 45;

function item(
  slug: string,
  name: string,
  variants: MenuVariant[],
  sortOrder: number,
  extra: Partial<Pick<MenuItemData, "description" | "tags" | "isHoliday" | "isFeatured">> = {}
): MenuItemData {
  return {
    slug,
    name,
    variants,
    sortOrder,
    description: extra.description,
    tags: extra.tags ?? [],
    isAvailable: true,
    isHoliday: extra.isHoliday ?? false,
    isFeatured: extra.isFeatured ?? false,
  };
}

const tradicional = (
  slug: string,
  name: string,
  sencilla: number | null,
  conQueso: number | null,
  conHuevo: number | null,
  sortOrder: number
): MenuItemData => {
  const variants: MenuVariant[] = [];
  if (sencilla !== null) variants.push({ label: "Sencilla", price: sencilla });
  if (conQueso !== null) variants.push({ label: "Con queso", price: conQueso });
  if (conHuevo !== null) variants.push({ label: "Con huevo", price: conHuevo });
  return item(slug, name, variants, sortOrder);
};

export const MENU_FALLBACK: CategoryData[] = [
  {
    slug: "tradicionales",
    name: "Las Tradicionales",
    subtitle: "Sencilla · Con queso · Con huevo",
    sortOrder: 0,
    items: [
      tradicional("huevo", "Huevo", 45, 70, null, 0),
      tradicional("queso-de-puerco", "Queso de puerco", 45, 70, 60, 1),
      tradicional("jamon", "Jamón", 45, 70, 60, 2),
      tradicional("salchicha", "Salchicha", 50, 75, 60, 3),
      tradicional("chorizo", "Chorizo", 70, 95, 75, 4),
      tradicional("queso-oaxaca", "Queso Oaxaca", 49, null, 60, 5),
      tradicional("queso-panela", "Queso Panela", 49, null, 60, 6),
      tradicional("queso-menonita", "Queso Menonita", 49, null, 60, 7),
      tradicional("queso-amarillo", "Queso Amarillo", 49, null, 60, 8),
    ],
  },
  {
    slug: "casa",
    name: "Las de la Casa",
    subtitle: "Sencilla · Con queso",
    sortOrder: 1,
    items: [
      tradicional("pierna", "Pierna", 80, 105, null, 0),
      tradicional("milanesa-de-res", "Milanesa de res", 80, 105, null, 1),
      tradicional("milanesa-de-pollo", "Milanesa de pollo", 80, 105, null, 2),
      { ...tradicional("pierna-al-horno", "Pierna al horno", 80, 105, null, 3), isHoliday: true },
      { ...tradicional("cochinita", "Cochinita", 80, 105, null, 4), isHoliday: true },
    ],
  },
  {
    slug: "especiales",
    name: "Las Especiales",
    sortOrder: 2,
    items: [
      item("koreana", "Koreana", [{ label: "Única", price: 85 }], 0, {
        description: "Bisteck, longaniza",
      }),
      item("suiza", "Suiza", [{ label: "Única", price: 80 }], 1, {
        description: "Queso blanco, queso Oaxaca, queso menonita",
      }),
      item("hawaiana", "Hawaiana", [{ label: "Única", price: 85 }], 2, {
        description: "Jamón, queso Oaxaca, piña",
        isFeatured: true,
      }),
      item("salvadorena", "Salvadoreña", [{ label: "Única", price: 100 }], 3, {
        description: "Milanesa o pierna, queso, piña",
      }),
      item("cubana", "Cubana", [{ label: "Única", price: 100 }], 4, {
        description: "Jamón, salchicha, queso Oaxaca, pierna, queso menonita y queso de puerco",
        isFeatured: true,
      }),
      item("rusa", "Rusa", [{ label: "Única", price: 120 }], 5, {
        description: "Milanesa, pierna y queso manchego",
        isFeatured: true,
      }),
      item("argentina", "Argentina", [{ label: "Única", price: 100 }], 6, {
        description: "Salchicha, milanesa y queso",
      }),
      item("mexicana", "Mexicana", [{ label: "Única", price: 139 }], 7, {
        description: "Jamón, queso, pierna, salchicha, milanesa, longaniza",
        isFeatured: true,
      }),
      item("danesa", "Danesa", [{ label: "Única", price: 110 }], 8, {
        description: "Pollo, queso y piña",
      }),
      item("colombiana", "Colombiana", [{ label: "Única", price: 100 }], 9, {
        description: "Jamón, queso y milanesa",
      }),
    ],
  },
  {
    slug: "preparados",
    name: "Preparados",
    sortOrder: 3,
    items: [
      item("sandwich", "Sandwich", [{ label: "Única", price: 60 }], 0),
      item("sandwich-especial", "Sandwich especial", [{ label: "Única", price: 70 }], 1, {
        description: "Jamón, queso y una proteína",
      }),
      item("burrito", "Burrito", [{ label: "Única", price: 99 }], 2, {
        description: "Con papas",
      }),
      item(
        "quesadilla",
        "Quesadilla",
        [
          { label: "1 pieza", price: 20 },
          { label: "3 piezas", price: 50 },
        ],
        3
      ),
      item("sincronizada", "Sincronizada", [{ label: "Única", price: 35 }], 4),
      item("molletes", "Molletes", [{ label: "2 piezas", price: 60 }], 5),
      item(
        "quesitacos",
        "Quesitacos",
        [
          { label: "1 pieza", price: 30 },
          { label: "3 piezas", price: 85 },
        ],
        6
      ),
    ],
  },
  {
    slug: "bebidas",
    name: "Bebidas",
    sortOrder: 4,
    items: [
      item("cafe-de-olla", "Café de olla", [{ label: "Única", price: 30 }], 0),
      item("refrescos", "Refrescos", [{ label: "Única", price: 30 }], 1),
      item("agua-de-sabor-medio", "Agua de sabor ½ L", [{ label: "Única", price: 25 }], 2),
      item("agua-de-sabor-litro", "Agua de sabor 1 L", [{ label: "Única", price: 40 }], 3),
    ],
  },
];

function option(
  name: string,
  price: number,
  sortOrder: number,
  isDefault = false
): BuilderOptionData {
  return { name, price, sortOrder, isDefault, isAvailable: true };
}

export const BUILDER_FALLBACK: BuilderGroupData[] = [
  {
    key: "pan",
    name: "El Pan",
    description: "La base de $45 incluye telera, frijoles, aguacate, jitomate y cebolla",
    type: "SINGLE",
    minSelect: 1,
    maxSelect: 1,
    required: true,
    sortOrder: 0,
    options: [option("Telera tradicional", 0, 0, true)],
  },
  {
    key: "proteina",
    name: "Proteínas",
    description: "Elige hasta 3",
    type: "MULTI",
    minSelect: 0,
    maxSelect: 3,
    required: false,
    sortOrder: 1,
    options: [
      option("Huevo", 15, 0),
      option("Queso de puerco", 15, 1),
      option("Jamón", 25, 2),
      option("Salchicha", 25, 3),
      option("Chorizo", 29, 4),
      option("Pierna", 40, 5),
      option("Milanesa de res", 40, 6),
      option("Milanesa de pollo", 40, 7),
      option("Bisteck", 40, 8),
      option("Longaniza", 29, 9),
    ],
  },
  {
    key: "queso",
    name: "Quesos",
    description: "Elige hasta 3",
    type: "MULTI",
    minSelect: 0,
    maxSelect: 3,
    required: false,
    sortOrder: 2,
    options: [
      option("Queso Oaxaca", 25, 0),
      option("Queso blanco", 25, 1),
      option("Queso menonita", 25, 2),
      option("Queso amarillo", 25, 3),
      option("Queso de puerco", 15, 4),
      option("Queso manchego", 25, 5),
    ],
  },
  {
    key: "extra",
    name: "Extras",
    type: "MULTI",
    minSelect: 0,
    maxSelect: 0,
    required: false,
    sortOrder: 3,
    options: [option("Piña", 10, 0), option("Papas", 15, 1), option("Doble frijol", 5, 2)],
  },
  {
    key: "topping",
    name: "Al gusto (gratis)",
    description: "Sin costo extra",
    type: "MULTI",
    minSelect: 0,
    maxSelect: 0,
    required: false,
    sortOrder: 4,
    options: [
      option("Jitomate", 0, 0, true),
      option("Cebolla", 0, 1, true),
      option("Aguacate", 0, 2, true),
      option("Rajas", 0, 3),
      option("Chipotle", 0, 4),
      option("Mostaza", 0, 5),
      option("Mayonesa", 0, 6, true),
      option("Sin picante", 0, 7),
    ],
  },
];
