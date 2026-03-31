import type { Product } from "@/lib/storeTypes"

function deriveStatus(stock: number): Product["status"] {
  if (stock === 0) return "Agotado"
  if (stock < 3) return "Pocas Unidades"
  return "Disponible"
}

const IMAGES: Record<string, string> = {
  "iphone-17-pro-max":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-17-pro-max-finish-select-202509-naturaltitanium?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-17-pro":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-17-pro-finish-select-202509-naturaltitanium?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-17":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-17-finish-select-202509-ultramarine?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-16-pro-max":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-max-finish-select-202409-desertttitanium?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-16-pro":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-blacktitanium?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-16-plus":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-plus-finish-select-202409-starlight?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-16":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-finish-select-202409-blue?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-15-pro-max":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-15-pro-max-black-titanium-select?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-15-pro":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-15-pro-black-titanium-select?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-15-plus":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-15-plus-blue-select?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-15":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-15-blue-select?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-14-pro-max":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-14-pro-max-deepviolet-select?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-14-pro":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-14-pro-space-black-select?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-14-plus":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-14-plus-blue-select?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-14":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-14-blue-select-202209?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-13-pro-max":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-13-pro-max-graphite-select?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-13-pro":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-13-pro-graphite-select?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-13":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-13-midnight-select-2021?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-13-mini":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-13-mini-midnight-select-2021?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-12-pro-max":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-12-pro-max-graphite-select-2020?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-12-pro":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-12-pro-graphite-select-2020?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-12-mini":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-12-mini-black-select-2020?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-12":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-12-black-select-2020?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-11-pro":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-11-pro-midnight-green-select-2019?wid=400&hei=400&fmt=jpeg&qlt=95",
  "iphone-11":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-11-black-select-2019?wid=400&hei=400&fmt=jpeg&qlt=95",
}

function img(model: string): string {
  return IMAGES[model] ?? `placeholder:${model}`
}

type CatalogModelDefinition = {
  imageKey: string
  name: string
  skuCode: string
  storages: string[]
}

type ProvidedInventoryRow = {
  imageKey: string
  name: string
  skuCode: string
  storage: string
  price: number
  stock: number
}

const MODEL_DEFINITIONS: CatalogModelDefinition[] = [
  { imageKey: "iphone-17-pro-max", name: "iPhone 17 Pro Max", skuCode: "17PM", storages: ["256GB", "512GB", "1TB", "2TB"] },
  { imageKey: "iphone-17-pro", name: "iPhone 17 Pro", skuCode: "17P", storages: ["256GB", "512GB", "1TB", "2TB"] },
  { imageKey: "iphone-17", name: "iPhone 17", skuCode: "17", storages: ["256GB", "512GB", "1TB", "2TB"] },
  { imageKey: "iphone-16-pro-max", name: "iPhone 16 Pro Max", skuCode: "16PM", storages: ["256GB", "512GB", "1TB"] },
  { imageKey: "iphone-16-pro", name: "iPhone 16 Pro", skuCode: "16P", storages: ["128GB", "256GB", "512GB", "1TB"] },
  { imageKey: "iphone-16-plus", name: "iPhone 16 Plus", skuCode: "16PL", storages: ["128GB", "256GB"] },
  { imageKey: "iphone-16", name: "iPhone 16", skuCode: "16", storages: ["128GB", "256GB"] },
  { imageKey: "iphone-15-pro-max", name: "iPhone 15 Pro Max", skuCode: "15PM", storages: ["256GB", "512GB", "1TB"] },
  { imageKey: "iphone-15-pro", name: "iPhone 15 Pro", skuCode: "15P", storages: ["128GB", "256GB", "512GB", "1TB"] },
  { imageKey: "iphone-15-plus", name: "iPhone 15 Plus", skuCode: "15PL", storages: ["128GB", "256GB"] },
  { imageKey: "iphone-15", name: "iPhone 15", skuCode: "15", storages: ["128GB", "256GB"] },
  { imageKey: "iphone-14-pro-max", name: "iPhone 14 Pro Max", skuCode: "14PM", storages: ["128GB", "256GB", "512GB", "1TB"] },
  { imageKey: "iphone-14-pro", name: "iPhone 14 Pro", skuCode: "14P", storages: ["128GB", "256GB", "512GB", "1TB"] },
  { imageKey: "iphone-14-plus", name: "iPhone 14 Plus", skuCode: "14PL", storages: ["128GB", "256GB", "512GB"] },
  { imageKey: "iphone-14", name: "iPhone 14", skuCode: "14", storages: ["128GB", "256GB", "512GB"] },
  { imageKey: "iphone-13-pro-max", name: "iPhone 13 Pro Max", skuCode: "13PM", storages: ["128GB", "256GB", "512GB", "1TB"] },
  { imageKey: "iphone-13-pro", name: "iPhone 13 Pro", skuCode: "13P", storages: ["128GB", "256GB", "512GB", "1TB"] },
  { imageKey: "iphone-13", name: "iPhone 13", skuCode: "13", storages: ["128GB", "256GB", "512GB"] },
  { imageKey: "iphone-13-mini", name: "iPhone 13 mini", skuCode: "13MN", storages: ["128GB", "256GB", "512GB"] },
  { imageKey: "iphone-12-pro-max", name: "iPhone 12 Pro Max", skuCode: "12PM", storages: ["128GB", "256GB", "512GB"] },
  { imageKey: "iphone-12-pro", name: "iPhone 12 Pro", skuCode: "12P", storages: ["128GB", "256GB", "512GB"] },
  { imageKey: "iphone-12-mini", name: "iPhone 12 mini", skuCode: "12MN", storages: ["64GB", "128GB", "256GB"] },
  { imageKey: "iphone-12", name: "iPhone 12", skuCode: "12", storages: ["64GB", "128GB", "256GB"] },
  { imageKey: "iphone-11-pro", name: "iPhone 11 Pro", skuCode: "11P", storages: ["64GB", "256GB", "512GB"] },
  { imageKey: "iphone-11", name: "iPhone 11", skuCode: "11", storages: ["64GB", "128GB", "256GB"] },
]

const PROVIDED_INVENTORY: ProvidedInventoryRow[] = [
  { imageKey: "iphone-17-pro-max", name: "iPhone 17 Pro Max", skuCode: "17PM", storage: "512GB", price: 1400, stock: 0 },
  { imageKey: "iphone-17-pro", name: "iPhone 17 Pro", skuCode: "17P", storage: "512GB", price: 1250, stock: 1 },
  { imageKey: "iphone-17", name: "iPhone 17", skuCode: "17", storage: "256GB", price: 800, stock: 0 },
  { imageKey: "iphone-16-pro-max", name: "iPhone 16 Pro Max", skuCode: "16PM", storage: "512GB", price: 850, stock: 0 },
  { imageKey: "iphone-16-pro-max", name: "iPhone 16 Pro Max", skuCode: "16PM", storage: "256GB", price: 830, stock: 0 },
  { imageKey: "iphone-16-pro", name: "iPhone 16 Pro", skuCode: "16P", storage: "256GB", price: 740, stock: 3 },
  { imageKey: "iphone-16-pro", name: "iPhone 16 Pro", skuCode: "16P", storage: "128GB", price: 720, stock: 1 },
  { imageKey: "iphone-16-plus", name: "iPhone 16 Plus", skuCode: "16PL", storage: "256GB", price: 670, stock: 2 },
  { imageKey: "iphone-16-plus", name: "iPhone 16 Plus", skuCode: "16PL", storage: "128GB", price: 650, stock: 0 },
  { imageKey: "iphone-16", name: "iPhone 16", skuCode: "16", storage: "128GB", price: 570, stock: 0 },
  { imageKey: "iphone-15-pro-max", name: "iPhone 15 Pro Max", skuCode: "15PM", storage: "1TB", price: 650, stock: 5 },
  { imageKey: "iphone-15-pro-max", name: "iPhone 15 Pro Max", skuCode: "15PM", storage: "512GB", price: 640, stock: 1 },
  { imageKey: "iphone-15-pro-max", name: "iPhone 15 Pro Max", skuCode: "15PM", storage: "256GB", price: 620, stock: 0 },
  { imageKey: "iphone-15-pro", name: "iPhone 15 Pro", skuCode: "15P", storage: "512GB", price: 590, stock: 0 },
  { imageKey: "iphone-15-pro", name: "iPhone 15 Pro", skuCode: "15P", storage: "256GB", price: 570, stock: 0 },
  { imageKey: "iphone-15-pro", name: "iPhone 15 Pro", skuCode: "15P", storage: "128GB", price: 550, stock: 2 },
  { imageKey: "iphone-15-plus", name: "iPhone 15 Plus", skuCode: "15PL", storage: "256GB", price: 450, stock: 3 },
  { imageKey: "iphone-15-plus", name: "iPhone 15 Plus", skuCode: "15PL", storage: "128GB", price: 430, stock: 6 },
  { imageKey: "iphone-15", name: "iPhone 15", skuCode: "15", storage: "256GB", price: 440, stock: 0 },
  { imageKey: "iphone-15", name: "iPhone 15", skuCode: "15", storage: "128GB", price: 410, stock: 7 },
  { imageKey: "iphone-14-pro-max", name: "iPhone 14 Pro Max", skuCode: "14PM", storage: "1TB", price: 600, stock: 0 },
  { imageKey: "iphone-14-pro-max", name: "iPhone 14 Pro Max", skuCode: "14PM", storage: "512GB", price: 560, stock: 0 },
  { imageKey: "iphone-14-pro-max", name: "iPhone 14 Pro Max", skuCode: "14PM", storage: "256GB", price: 540, stock: 2 },
  { imageKey: "iphone-14-pro-max", name: "iPhone 14 Pro Max", skuCode: "14PM", storage: "128GB", price: 520, stock: 0 },
  { imageKey: "iphone-14-pro", name: "iPhone 14 Pro", skuCode: "14P", storage: "1TB", price: 500, stock: 0 },
  { imageKey: "iphone-14-pro", name: "iPhone 14 Pro", skuCode: "14P", storage: "512GB", price: 490, stock: 3 },
  { imageKey: "iphone-14-pro", name: "iPhone 14 Pro", skuCode: "14P", storage: "256GB", price: 470, stock: 4 },
  { imageKey: "iphone-14-pro", name: "iPhone 14 Pro", skuCode: "14P", storage: "128GB", price: 450, stock: 1 },
  { imageKey: "iphone-14-plus", name: "iPhone 14 Plus", skuCode: "14PL", storage: "512GB", price: 0, stock: 0 },
  { imageKey: "iphone-14-plus", name: "iPhone 14 Plus", skuCode: "14PL", storage: "256GB", price: 0, stock: 0 },
  { imageKey: "iphone-14-plus", name: "iPhone 14 Plus", skuCode: "14PL", storage: "128GB", price: 350, stock: 1 },
  { imageKey: "iphone-14", name: "iPhone 14", skuCode: "14", storage: "512GB", price: 350, stock: 0 },
  { imageKey: "iphone-14", name: "iPhone 14", skuCode: "14", storage: "256GB", price: 350, stock: 1 },
  { imageKey: "iphone-14", name: "iPhone 14", skuCode: "14", storage: "128GB", price: 300, stock: 65 },
  { imageKey: "iphone-13-pro-max", name: "iPhone 13 Pro Max", skuCode: "13PM", storage: "512GB", price: 500, stock: 0 },
  { imageKey: "iphone-13-pro-max", name: "iPhone 13 Pro Max", skuCode: "13PM", storage: "256GB", price: 480, stock: 0 },
  { imageKey: "iphone-13-pro-max", name: "iPhone 13 Pro Max", skuCode: "13PM", storage: "128GB", price: 420, stock: 5 },
  { imageKey: "iphone-13-pro", name: "iPhone 13 Pro", skuCode: "13P", storage: "1TB", price: 440, stock: 1 },
  { imageKey: "iphone-13-pro", name: "iPhone 13 Pro", skuCode: "13P", storage: "256GB", price: 400, stock: 2 },
  { imageKey: "iphone-13-pro", name: "iPhone 13 Pro", skuCode: "13P", storage: "128GB", price: 380, stock: 4 },
  { imageKey: "iphone-13", name: "iPhone 13", skuCode: "13", storage: "512GB", price: 340, stock: 1 },
  { imageKey: "iphone-13", name: "iPhone 13", skuCode: "13", storage: "256GB", price: 315, stock: 1 },
  { imageKey: "iphone-13", name: "iPhone 13", skuCode: "13", storage: "128GB", price: 290, stock: 37 },
  { imageKey: "iphone-13-mini", name: "iPhone 13 mini", skuCode: "13MN", storage: "128GB", price: 230, stock: 1 },
  { imageKey: "iphone-12-pro-max", name: "iPhone 12 Pro Max", skuCode: "12PM", storage: "512GB", price: 380, stock: 0 },
  { imageKey: "iphone-12-pro-max", name: "iPhone 12 Pro Max", skuCode: "12PM", storage: "128GB", price: 0, stock: 0 },
  { imageKey: "iphone-12-pro", name: "iPhone 12 Pro", skuCode: "12P", storage: "256GB", price: 300, stock: 0 },
  { imageKey: "iphone-12-pro", name: "iPhone 12 Pro", skuCode: "12P", storage: "128GB", price: 280, stock: 0 },
  { imageKey: "iphone-12-mini", name: "iPhone 12 mini", skuCode: "12MN", storage: "64GB", price: 190, stock: 1 },
  { imageKey: "iphone-12", name: "iPhone 12", skuCode: "12", storage: "128GB", price: 220, stock: 1 },
  { imageKey: "iphone-12", name: "iPhone 12", skuCode: "12", storage: "64GB", price: 200, stock: 1 },
  { imageKey: "iphone-11-pro", name: "iPhone 11 Pro", skuCode: "11P", storage: "256GB", price: 250, stock: 0 },
  { imageKey: "iphone-11", name: "iPhone 11", skuCode: "11", storage: "256GB", price: 210, stock: 0 },
  { imageKey: "iphone-11", name: "iPhone 11", skuCode: "11", storage: "64GB", price: 180, stock: 1 },
]

const providedInventoryMap = new Map(
  PROVIDED_INVENTORY.map((row) => [`${row.name}|${row.storage}`, row] as const)
)

const DEFAULT_IPHONE_CATALOG: Product[] = MODEL_DEFINITIONS.flatMap((model) =>
  model.storages.map((storage) => {
    const providedRow = providedInventoryMap.get(`${model.name}|${storage}`)
    const price = providedRow?.price ?? 0
    const stock = providedRow?.stock ?? 0

    return {
      id: `${model.imageKey}-${storage.toLowerCase()}-used`,
      name: model.name,
      sku: `INV-${model.skuCode}-${storage.toUpperCase()}-U`,
      storage,
      condition: "used",
      price,
      stock,
      image: img(model.imageKey),
      category: "Smartphones",
      status: deriveStatus(stock),
      isAvailable: stock > 0,
    }
  })
)

const DEFAULT_PARTS_CATALOG: Product[] = [
  {
    id: "part-display-iphone-14-pro",
    name: "Pantalla iPhone 14 Pro",
    sku: "INV-REP-14P-DISPLAY",
    storage: "Repuesto",
    condition: "new",
    price: 0,
    stock: 0,
    image: img("part-display-iphone-14-pro"),
    category: "Repuestos",
    status: deriveStatus(0),
    isAvailable: false,
  },
  {
    id: "part-battery-iphone-13",
    name: "Bateria iPhone 13",
    sku: "INV-REP-13-BATTERY",
    storage: "Repuesto",
    condition: "new",
    price: 0,
    stock: 0,
    image: img("part-battery-iphone-13"),
    category: "Repuestos",
    status: deriveStatus(0),
    isAvailable: false,
  },
  {
    id: "part-camera-iphone-15-pro-max",
    name: "Camara iPhone 15 Pro Max",
    sku: "INV-REP-15PM-CAMERA",
    storage: "Repuesto",
    condition: "new",
    price: 0,
    stock: 0,
    image: img("part-camera-iphone-15-pro-max"),
    category: "Repuestos",
    status: deriveStatus(0),
    isAvailable: false,
  },
  {
    id: "part-backglass-iphone-12",
    name: "Tapa trasera iPhone 12",
    sku: "INV-REP-12-BACKGLASS",
    storage: "Repuesto",
    condition: "new",
    price: 0,
    stock: 0,
    image: img("part-backglass-iphone-12"),
    category: "Repuestos",
    status: deriveStatus(0),
    isAvailable: false,
  },
  {
    id: "part-charging-flex-iphone-11",
    name: "Flex de carga iPhone 11",
    sku: "INV-REP-11-CHARGE",
    storage: "Repuesto",
    condition: "new",
    price: 0,
    stock: 0,
    image: img("part-charging-flex-iphone-11"),
    category: "Repuestos",
    status: deriveStatus(0),
    isAvailable: false,
  },
  {
    id: "part-speaker-iphone-14",
    name: "Altavoz iPhone 14",
    sku: "INV-REP-14-SPEAKER",
    storage: "Repuesto",
    condition: "new",
    price: 0,
    stock: 0,
    image: img("part-speaker-iphone-14"),
    category: "Repuestos",
    status: deriveStatus(0),
    isAvailable: false,
  },
]

export const DEFAULT_CATALOG: Product[] = [
  ...DEFAULT_IPHONE_CATALOG,
  ...DEFAULT_PARTS_CATALOG,
]
