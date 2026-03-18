import type { InventoryHistoryAction, InventoryHistoryEntry, Product } from "@/lib/storeTypes"

const CARACAS_TIMEZONE = "America/Caracas"

function formatCaracasTimestamp(date: Date) {
  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: CARACAS_TIMEZONE,
  }).format(date)
}

function getAvailability(product: Product) {
  return Boolean(product.isAvailable)
}

export function formatInventoryHistoryDate(value: string) {
  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: CARACAS_TIMEZONE,
  }).format(new Date(value))
}

export function formatInventoryHistoryDelta(delta: number) {
  if (delta > 0) return `+${delta}`
  if (delta < 0) return `${delta}`
  return "0"
}

export function createInventoryHistoryEntry({
  action,
  nextProduct,
  previousProduct,
  userEmail,
}: {
  action: InventoryHistoryAction
  nextProduct: Product | null
  previousProduct: Product | null
  userEmail: string | null
}): InventoryHistoryEntry {
  const now = new Date()
  const referenceProduct = nextProduct ?? previousProduct

  if (!referenceProduct) {
    throw new Error("No hay producto de referencia para registrar historial")
  }

  const previousStock = previousProduct?.stock ?? 0
  const nextStock = nextProduct?.stock ?? 0
  const previousPrice = previousProduct?.price ?? 0
  const nextPrice = nextProduct?.price ?? 0
  const previousIsAvailable = previousProduct ? getAvailability(previousProduct) : false
  const nextIsAvailable = nextProduct ? getAvailability(nextProduct) : false
  const stockDelta = nextStock - previousStock
  const priceDelta = nextPrice - previousPrice
  const formattedMoment = formatCaracasTimestamp(now)
  const actionLabel =
    action === "create"
      ? "creo"
      : action === "delete"
        ? "elimino"
        : action === "sale"
          ? "actualizo por salida"
          : "modifico"

  const note =
    `${formattedMoment} (Venezuela): ${userEmail ?? "sistema"} ${actionLabel} ` +
    `${referenceProduct.name} ${referenceProduct.storage}. Stock ${previousStock} -> ${nextStock}` +
    `${stockDelta !== 0 ? ` (${formatInventoryHistoryDelta(stockDelta)})` : ""}.`

  return {
    id: crypto.randomUUID(),
    productId: referenceProduct.id,
    productName: referenceProduct.name,
    sku: referenceProduct.sku,
    storage: referenceProduct.storage,
    category: referenceProduct.category,
    action,
    createdAt: now.toISOString(),
    timezone: CARACAS_TIMEZONE,
    userEmail,
    previousStock,
    nextStock,
    stockDelta,
    previousPrice,
    nextPrice,
    priceDelta,
    previousIsAvailable,
    nextIsAvailable,
    note,
  }
}
