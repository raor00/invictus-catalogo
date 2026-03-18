import type { Product, ProductColorId } from "@/lib/storeTypes"

export type ProductColorOption = {
  id: ProductColorId
  label: string
  swatch: string
}

const PALETTES = {
  proTitaniumDesert: [
    { id: "black-titanium", label: "Black Titanium", swatch: "#3b3b3d" },
    { id: "white-titanium", label: "White Titanium", swatch: "#f3f2ed" },
    { id: "natural-titanium", label: "Natural Titanium", swatch: "#b8aa97" },
    { id: "desert-titanium", label: "Desert Titanium", swatch: "#b88f74" },
  ],
  proTitaniumBlue: [
    { id: "black-titanium", label: "Black Titanium", swatch: "#3b3b3d" },
    { id: "white-titanium", label: "White Titanium", swatch: "#f3f2ed" },
    { id: "natural-titanium", label: "Natural Titanium", swatch: "#b8aa97" },
    { id: "blue-titanium", label: "Blue Titanium", swatch: "#5f6f86" },
  ],
  modern: [
    { id: "black", label: "Black", swatch: "#1d1d1f" },
    { id: "white", label: "White", swatch: "#f5f5f7" },
    { id: "blue", label: "Blue", swatch: "#7aa7ff" },
    { id: "pink", label: "Pink", swatch: "#f3b1cb" },
    { id: "green", label: "Green", swatch: "#8ecf9e" },
  ],
  pastel: [
    { id: "midnight", label: "Midnight", swatch: "#1f2430" },
    { id: "starlight", label: "Starlight", swatch: "#f6f1e9" },
    { id: "blue", label: "Blue", swatch: "#8eb8ff" },
    { id: "pink", label: "Pink", swatch: "#f2b9d0" },
    { id: "green", label: "Green", swatch: "#a7d7a5" },
    { id: "red", label: "Red", swatch: "#cf4b4b" },
  ],
  fourteen: [
    { id: "midnight", label: "Midnight", swatch: "#1f2430" },
    { id: "starlight", label: "Starlight", swatch: "#f6f1e9" },
    { id: "blue", label: "Blue", swatch: "#8eb8ff" },
    { id: "yellow", label: "Yellow", swatch: "#f3d66b" },
    { id: "purple", label: "Purple", swatch: "#b8a1d9" },
    { id: "red", label: "Red", swatch: "#cf4b4b" },
  ],
  thirteen: [
    { id: "midnight", label: "Midnight", swatch: "#1f2430" },
    { id: "starlight", label: "Starlight", swatch: "#f6f1e9" },
    { id: "blue", label: "Blue", swatch: "#7aa7ff" },
    { id: "pink", label: "Pink", swatch: "#f3b1cb" },
    { id: "green", label: "Green", swatch: "#6fa37c" },
    { id: "red", label: "Red", swatch: "#cf4b4b" },
  ],
  thirteenPro: [
    { id: "graphite", label: "Graphite", swatch: "#53565a" },
    { id: "silver", label: "Silver", swatch: "#f3f2ed" },
    { id: "gold", label: "Gold", swatch: "#d7c2a4" },
    { id: "sierra-blue", label: "Sierra Blue", swatch: "#a7bdd3" },
  ],
  fourteenPro: [
    { id: "space-black", label: "Space Black", swatch: "#2c2c2e" },
    { id: "silver", label: "Silver", swatch: "#f3f2ed" },
    { id: "gold", label: "Gold", swatch: "#d7c2a4" },
    { id: "deep-purple", label: "Deep Purple", swatch: "#594f63" },
  ],
  twelve: [
    { id: "black", label: "Black", swatch: "#1d1d1f" },
    { id: "white", label: "White", swatch: "#f5f5f7" },
    { id: "blue", label: "Blue", swatch: "#2f6fed" },
    { id: "green", label: "Green", swatch: "#b7d8c7" },
    { id: "purple", label: "Purple", swatch: "#c8b5f0" },
    { id: "red", label: "Red", swatch: "#cf4b4b" },
  ],
  twelvePro: [
    { id: "graphite", label: "Graphite", swatch: "#4e5055" },
    { id: "silver", label: "Silver", swatch: "#f3f2ed" },
    { id: "gold", label: "Gold", swatch: "#d7c2a4" },
    { id: "pacific-blue", label: "Pacific Blue", swatch: "#5f7c8a" },
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
  "iPhone 17 Pro Max": PALETTES.proTitaniumDesert,
  "iPhone 17 Pro": PALETTES.proTitaniumDesert,
  "iPhone 16 Pro Max": PALETTES.proTitaniumDesert,
  "iPhone 16 Pro": PALETTES.proTitaniumDesert,
  "iPhone 15 Pro Max": PALETTES.proTitaniumBlue,
  "iPhone 15 Pro": PALETTES.proTitaniumBlue,
  "iPhone 14 Pro Max": PALETTES.fourteenPro,
  "iPhone 14 Pro": PALETTES.fourteenPro,
  "iPhone 13 Pro Max": PALETTES.thirteenPro,
  "iPhone 13 Pro": PALETTES.thirteenPro,
  "iPhone 12 Pro Max": PALETTES.twelvePro,
  "iPhone 12 Pro": PALETTES.twelvePro,
  "iPhone 11 Pro": PALETTES.elevenPro,
  "iPhone 17 Air": PALETTES.modern,
  "iPhone 17": PALETTES.modern,
  "iPhone 16 Plus": PALETTES.modern,
  "iPhone 16": PALETTES.modern,
  "iPhone 15 Plus": PALETTES.modern,
  "iPhone 15": PALETTES.modern,
  "iPhone 14 Plus": PALETTES.fourteen,
  "iPhone 14": PALETTES.fourteen,
  "iPhone 13": PALETTES.thirteen,
  "iPhone 13 mini": PALETTES.thirteen,
  "iPhone 12 mini": PALETTES.twelve,
  "iPhone 12": PALETTES.twelve,
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
