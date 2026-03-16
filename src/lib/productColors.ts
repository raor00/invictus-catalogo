import type { Product, ProductColorId } from "@/lib/storeTypes"

export type ProductColorOption = {
  id: ProductColorId
  label: string
  swatch: string
}

const PALETTES = {
  proTitanium: [
    { id: "black-titanium", label: "Black Titanium", swatch: "#3b3b3d" },
    { id: "white-titanium", label: "White Titanium", swatch: "#f3f2ed" },
    { id: "natural-titanium", label: "Natural Titanium", swatch: "#b8aa97" },
    { id: "desert-titanium", label: "Desert Titanium", swatch: "#b88f74" },
  ],
  modern: [
    { id: "black", label: "Black", swatch: "#1d1d1f" },
    { id: "white", label: "White", swatch: "#f5f5f7" },
    { id: "blue", label: "Blue", swatch: "#7aa7ff" },
    { id: "pink", label: "Pink", swatch: "#f3b1cb" },
    { id: "green", label: "Green", swatch: "#8ecf9e" },
  ],
  pastel: [
    { id: "black", label: "Black", swatch: "#1d1d1f" },
    { id: "white", label: "White", swatch: "#f5f5f7" },
    { id: "blue", label: "Blue", swatch: "#8eb8ff" },
    { id: "yellow", label: "Yellow", swatch: "#f3d66b" },
    { id: "pink", label: "Pink", swatch: "#f2b9d0" },
    { id: "green", label: "Green", swatch: "#a7d7a5" },
  ],
  elevenPro: [
    { id: "midnight-green", label: "Midnight Green", swatch: "#5f6d62" },
    { id: "silver", label: "Silver", swatch: "#e7e7e2" },
    { id: "space-gray", label: "Space Gray", swatch: "#6a6c70" },
    { id: "gold", label: "Gold", swatch: "#d7c2a4" },
  ],
  eleven: [
    { id: "black", label: "Black", swatch: "#1d1d1f" },
    { id: "white", label: "White", swatch: "#f5f5f7" },
    { id: "green", label: "Green", swatch: "#b7d8c7" },
    { id: "yellow", label: "Yellow", swatch: "#f5e182" },
    { id: "purple", label: "Purple", swatch: "#c8b5f0" },
    { id: "red", label: "Red", swatch: "#cf4b4b" },
  ],
} satisfies Record<string, ProductColorOption[]>

const MODEL_COLOR_OPTIONS: Record<string, ProductColorOption[]> = {
  "iPhone 17 Pro Max": PALETTES.proTitanium,
  "iPhone 17 Pro": PALETTES.proTitanium,
  "iPhone 16 Pro Max": PALETTES.proTitanium,
  "iPhone 16 Pro": PALETTES.proTitanium,
  "iPhone 15 Pro Max": PALETTES.proTitanium,
  "iPhone 15 Pro": PALETTES.proTitanium,
  "iPhone 14 Pro Max": PALETTES.proTitanium,
  "iPhone 14 Pro": PALETTES.proTitanium,
  "iPhone 13 Pro Max": PALETTES.proTitanium,
  "iPhone 13 Pro": PALETTES.proTitanium,
  "iPhone 12 Pro Max": PALETTES.proTitanium,
  "iPhone 12 Pro": PALETTES.proTitanium,
  "iPhone 11 Pro": PALETTES.elevenPro,
  "iPhone 17 Air": PALETTES.modern,
  "iPhone 17": PALETTES.modern,
  "iPhone 16 Plus": PALETTES.modern,
  "iPhone 16": PALETTES.modern,
  "iPhone 15 Plus": PALETTES.modern,
  "iPhone 15": PALETTES.modern,
  "iPhone 14 Plus": PALETTES.pastel,
  "iPhone 14": PALETTES.pastel,
  "iPhone 13": PALETTES.pastel,
  "iPhone 13 mini": PALETTES.pastel,
  "iPhone 12 mini": PALETTES.pastel,
  "iPhone 12": PALETTES.pastel,
  "iPhone 11": PALETTES.eleven,
}

const FALLBACK_OPTIONS: ProductColorOption[] = PALETTES.modern

function dedupeColorIds(colorIds: ProductColorId[]) {
  return Array.from(new Set(colorIds))
}

export function getColorOptionsForProduct(productOrName: Pick<Product, "name"> | string) {
  const productName = typeof productOrName === "string" ? productOrName : productOrName.name
  return MODEL_COLOR_OPTIONS[productName] ?? FALLBACK_OPTIONS
}

export function normalizeAvailableColors(
  product: Pick<Product, "name"> & { availableColors?: ProductColorId[] }
) {
  const optionIds = new Set(getColorOptionsForProduct(product).map((option) => option.id))

  if (Array.isArray(product.availableColors)) {
    return dedupeColorIds(product.availableColors.filter((colorId) => optionIds.has(colorId)))
  }

  return Array.from(optionIds)
}

export function getSelectedColorOptions(
  product: Pick<Product, "name"> & { availableColors?: ProductColorId[] }
) {
  const selectedIds = new Set(normalizeAvailableColors(product))

  return getColorOptionsForProduct(product).filter((option) => selectedIds.has(option.id))
}
