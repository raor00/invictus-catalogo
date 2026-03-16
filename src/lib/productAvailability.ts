import type { Product } from "@/lib/StoreContext"
import { normalizeAvailableColors } from "@/lib/productColors"

export function hasManualAvailability(product: Pick<Product, "isAvailable" | "status">) {
  if (typeof product.isAvailable === "boolean") {
    return product.isAvailable
  }

  return product.status !== "Agotado" && product.status !== "No disponible"
}

export function isProductAvailable(
  product: Pick<Product, "isAvailable" | "status" | "stock">
) {
  return hasManualAvailability(product) && product.stock > 0
}

export function hasMissingPrice(product: Pick<Product, "price" | "stock">) {
  return product.stock > 0 && product.price <= 0
}

export function getProductStatus(
  product: Pick<Product, "isAvailable" | "status" | "stock">
): "Disponible" | "No disponible" {
  return isProductAvailable(product) ? "Disponible" : "No disponible"
}

export function normalizeProduct(product: Product): Product {
  const manualAvailability = hasManualAvailability(product)

  return {
    ...product,
    storage: product.storage ?? "128GB",
    condition: product.condition ?? "used",
    isAvailable: manualAvailability,
    availableColors: normalizeAvailableColors(product),
    status: getProductStatus({
      isAvailable: manualAvailability,
      status: product.status,
      stock: product.stock,
    }),
  }
}
