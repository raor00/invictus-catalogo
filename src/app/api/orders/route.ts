import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebaseAdmin"
import { createInventoryHistoryEntry } from "@/lib/inventoryHistory"
import { getProductStatus, normalizeProduct } from "@/lib/productAvailability"
import type { PlaceOrderInput, Product, StoredOrder } from "@/lib/storeTypes"

export const runtime = "nodejs"

function buildStoredOrder(input: PlaceOrderInput, id: string): StoredOrder {
  return {
    id,
    customer: input.customer,
    items: input.items.map(({ product, productId, quantity }) => ({
      productId,
      name: product.name,
      sku: product.sku,
      storage: product.storage,
      condition: product.condition,
      unitPrice: product.price,
      quantity,
      subtotal: product.price * quantity,
    })),
    total: input.total,
    totalQuantity: input.items.reduce((acc, item) => acc + item.quantity, 0),
    channel: input.channel,
    status: "pending",
    createdAt: new Date().toISOString(),
  }
}

export async function POST(request: Request) {
  const database = adminDb

  if (!isFirebaseAdminConfigured || !database) {
    return NextResponse.json(
      { error: "Firebase Admin no esta configurado en el servidor" },
      { status: 500 }
    )
  }

  let payload: PlaceOrderInput

  try {
    payload = (await request.json()) as PlaceOrderInput
  } catch {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 })
  }

  if (!payload.customer?.nombre || !payload.customer?.cedula || !payload.customer?.telefono) {
    return NextResponse.json({ error: "Faltan datos del cliente" }, { status: 400 })
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return NextResponse.json({ error: "No hay productos en el pedido" }, { status: 400 })
  }

  const orderId = randomUUID()

  try {
    await database.runTransaction(async (transaction) => {
      for (const item of payload.items) {
        const productRef = database.collection("products").doc(item.productId)
        const snapshot = await transaction.get(productRef)

        if (!snapshot.exists) {
          throw new Error(`El producto ${item.product.name} ya no existe`)
        }

        const product = normalizeProduct(snapshot.data() as Product)

        if (!product.isAvailable || product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product.name}`)
        }

        const nextStock = Math.max(0, product.stock - item.quantity)
        const nextProduct = normalizeProduct({
          ...product,
          stock: nextStock,
        })
        const historyEntry = createInventoryHistoryEntry({
          action: "sale",
          previousProduct: product,
          nextProduct,
          userEmail: "pedido-web",
        })

        transaction.set(productRef, {
          ...nextProduct,
          status: getProductStatus({
            isAvailable: nextProduct.isAvailable,
            status: nextProduct.status,
            stock: nextProduct.stock,
          }),
        })
        transaction.set(database.collection("inventoryHistory").doc(historyEntry.id), historyEntry)
      }

      const order = buildStoredOrder(payload, orderId)
      const orderRef = database.collection("orders").doc(orderId)
      transaction.set(orderRef, order)
    })

    return NextResponse.json({ ok: true, orderId })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo registrar el pedido"

    return NextResponse.json({ error: message }, { status: 409 })
  }
}
