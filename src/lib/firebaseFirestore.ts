import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  writeBatch,
} from "firebase/firestore"
import { DEFAULT_APP_SETTINGS, normalizeAppSettings } from "@/lib/appSettings"
import { DEFAULT_CATALOG } from "@/data/catalog"
import { firebaseDb } from "@/lib/firebaseClient"
import { createInventoryHistoryEntry } from "@/lib/inventoryHistory"
import { getProductStatus, normalizeProduct } from "@/lib/productAvailability"
import type { AppSettings, InventoryHistoryEntry, Product } from "@/lib/storeTypes"

const PRODUCTS_COLLECTION = "products"
const INVENTORY_HISTORY_COLLECTION = "inventoryHistory"
const APP_SETTINGS_COLLECTION = "appSettings"
const PUBLIC_HEADER_SETTINGS_ID = "publicHeader"

function getFirestoreDb() {
  if (!firebaseDb) {
    throw new Error("Firebase no esta configurado")
  }

  return firebaseDb
}

function getProductsCollection() {
  return collection(getFirestoreDb(), PRODUCTS_COLLECTION)
}

function getInventoryHistoryCollection() {
  return collection(getFirestoreDb(), INVENTORY_HISTORY_COLLECTION)
}

function getAppSettingsRef() {
  return doc(getFirestoreDb(), APP_SETTINGS_COLLECTION, PUBLIC_HEADER_SETTINGS_ID)
}

function serializeProduct(product: Product) {
  return {
    ...normalizeProduct(product),
    isAvailable: Boolean(normalizeProduct(product).isAvailable),
  }
}

export async function seedCatalogInFirestore() {
  const db = getFirestoreDb()

  const batch = writeBatch(db)
  const defaultProducts = DEFAULT_CATALOG.map(normalizeProduct)
  const defaultIds = new Set(defaultProducts.map((product) => product.id))
  const existingProducts = await getDocs(getProductsCollection())

  existingProducts.docs.forEach((snapshotDoc) => {
    if (!defaultIds.has(snapshotDoc.id)) {
      batch.delete(snapshotDoc.ref)
    }
  })

  defaultProducts.forEach((product) => {
    batch.set(doc(db, PRODUCTS_COLLECTION, product.id), serializeProduct(product))
  })

  await batch.commit()
}

export async function ensureDefaultCatalogProductsInFirestore() {
  const db = getFirestoreDb()
  const defaultProducts = DEFAULT_CATALOG.map(normalizeProduct)
  const existingProducts = await getDocs(getProductsCollection())
  const existingIds = new Set(existingProducts.docs.map((snapshotDoc) => snapshotDoc.id))
  const missingProducts = defaultProducts.filter((product) => !existingIds.has(product.id))

  if (missingProducts.length === 0) {
    return
  }

  const batch = writeBatch(db)

  missingProducts.forEach((product) => {
    batch.set(doc(db, PRODUCTS_COLLECTION, product.id), serializeProduct(product))
  })

  await batch.commit()
}

export async function ensureAppSettingsInFirestore() {
  const settingsRef = getAppSettingsRef()
  const snapshot = await getDoc(settingsRef)

  if (snapshot.exists()) {
    return
  }

  await setDoc(settingsRef, DEFAULT_APP_SETTINGS)
}

export async function subscribeToProducts(
  onProducts: (products: Product[]) => void,
  onError: (error: Error) => void
) {
  if (!firebaseDb) {
    return () => undefined
  }

  return onSnapshot(
    getProductsCollection(),
    (snapshot) => {
      const products = snapshot.docs.map((snapshotDoc) =>
        normalizeProduct(snapshotDoc.data() as Product)
      )
      onProducts(products)
    },
    (error) => onError(error)
  )
}

export async function subscribeToInventoryHistory(
  onHistory: (history: InventoryHistoryEntry[]) => void,
  onError: (error: Error) => void
) {
  if (!firebaseDb) {
    return () => undefined
  }

  return onSnapshot(
    query(getInventoryHistoryCollection(), orderBy("createdAt", "desc")),
    (snapshot) => {
      const history = snapshot.docs.map((snapshotDoc) => snapshotDoc.data() as InventoryHistoryEntry)
      onHistory(history)
    },
    (error) => onError(error)
  )
}

export async function subscribeToAppSettings(
  onSettings: (settings: AppSettings) => void,
  onError: (error: Error) => void
) {
  if (!firebaseDb) {
    return () => undefined
  }

  return onSnapshot(
    getAppSettingsRef(),
    (snapshot) => {
      if (!snapshot.exists()) {
        onSettings(DEFAULT_APP_SETTINGS)
        return
      }

      onSettings(normalizeAppSettings(snapshot.data() as Partial<AppSettings>))
    },
    (error) => onError(error)
  )
}

export async function updateAppSettingsInFirestore(settings: AppSettings) {
  if (!firebaseDb) {
    throw new Error("Firebase no esta configurado")
  }

  await setDoc(getAppSettingsRef(), normalizeAppSettings(settings))
}

export async function createProductInFirestore(product: Product, userEmail: string | null = null) {
  if (!firebaseDb) {
    throw new Error("Firebase no esta configurado")
  }

  const db = getFirestoreDb()
  const nextProduct = normalizeProduct(product)
  const historyEntry = createInventoryHistoryEntry({
    action: "create",
    nextProduct,
    previousProduct: null,
    userEmail,
  })

  await runTransaction(db, async (transaction) => {
    transaction.set(doc(db, PRODUCTS_COLLECTION, product.id), serializeProduct(nextProduct))
    transaction.set(doc(db, INVENTORY_HISTORY_COLLECTION, historyEntry.id), historyEntry)
  })
}

export async function updateProductInFirestore(
  id: string,
  updates: Partial<Product>,
  userEmail: string | null = null
) {
  if (!firebaseDb) {
    throw new Error("Firebase no esta configurado")
  }

  const db = getFirestoreDb()

  await runTransaction(db, async (transaction) => {
    const productRef = doc(db, PRODUCTS_COLLECTION, id)
    const snapshot = await transaction.get(productRef)

    if (!snapshot.exists()) {
      throw new Error("El producto ya no existe")
    }

    const nextProduct = normalizeProduct({
      ...(snapshot.data() as Product),
      ...updates,
      id,
    })
    const previousProduct = normalizeProduct(snapshot.data() as Product)
    const historyEntry = createInventoryHistoryEntry({
      action: "update",
      nextProduct,
      previousProduct,
      userEmail,
    })

    transaction.set(productRef, serializeProduct(nextProduct))
    transaction.set(doc(db, INVENTORY_HISTORY_COLLECTION, historyEntry.id), historyEntry)
  })
}

export async function deleteProductInFirestore(id: string, userEmail: string | null = null) {
  if (!firebaseDb) {
    throw new Error("Firebase no esta configurado")
  }

  const db = getFirestoreDb()
  await runTransaction(db, async (transaction) => {
    const productRef = doc(db, PRODUCTS_COLLECTION, id)
    const snapshot = await transaction.get(productRef)

    if (!snapshot.exists()) {
      throw new Error("El producto ya no existe")
    }

    const previousProduct = normalizeProduct(snapshot.data() as Product)
    const historyEntry = createInventoryHistoryEntry({
      action: "delete",
      nextProduct: null,
      previousProduct,
      userEmail,
    })

    transaction.delete(productRef)
    transaction.set(doc(db, INVENTORY_HISTORY_COLLECTION, historyEntry.id), historyEntry)
  })
}

export async function registerSaleInFirestore(
  items: Array<{ productId: string; quantity: number }>,
  userEmail: string | null = null
) {
  if (!firebaseDb) {
    throw new Error("Firebase no esta configurado")
  }

  const db = getFirestoreDb()

  await runTransaction(db, async (transaction) => {
    const quantityByProduct = new Map<string, number>()
    for (const item of items) {
      quantityByProduct.set(
        item.productId,
        (quantityByProduct.get(item.productId) ?? 0) + item.quantity
      )
    }

    const pendingWrites: Array<{
      historyEntry: ReturnType<typeof createInventoryHistoryEntry>
      nextProduct: Product
      productRef: ReturnType<typeof doc>
    }> = []

    for (const [productId, quantity] of quantityByProduct.entries()) {
      const productRef = doc(db, PRODUCTS_COLLECTION, productId)
      const snapshot = await transaction.get(productRef)

      if (!snapshot.exists()) {
        throw new Error("Uno de los productos ya no existe en inventario")
      }

      const product = normalizeProduct(snapshot.data() as Product)

      if (!product.isAvailable || product.stock < quantity) {
        throw new Error(`Stock insuficiente para ${product.name}`)
      }

      const nextStock = Math.max(0, product.stock - quantity)
      const nextProduct = normalizeProduct({
        ...product,
        stock: nextStock,
      })
      const historyEntry = createInventoryHistoryEntry({
        action: "sale",
        previousProduct: product,
        nextProduct,
        userEmail,
      })

      pendingWrites.push({
        productRef,
        nextProduct,
        historyEntry,
      })
    }

    for (const { productRef, nextProduct, historyEntry } of pendingWrites) {
      transaction.set(productRef, {
        ...nextProduct,
        status: getProductStatus({
          isAvailable: nextProduct.isAvailable,
          status: nextProduct.status,
          stock: nextProduct.stock,
        }),
      })
      transaction.set(doc(db, INVENTORY_HISTORY_COLLECTION, historyEntry.id), historyEntry)
    }
  })
}
