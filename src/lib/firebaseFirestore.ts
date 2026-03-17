import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  runTransaction,
  setDoc,
  writeBatch,
} from "firebase/firestore"
import { DEFAULT_CATALOG } from "@/data/catalog"
import { firebaseDb } from "@/lib/firebaseClient"
import { getProductStatus, normalizeProduct } from "@/lib/productAvailability"
import type { Product } from "@/lib/storeTypes"

const PRODUCTS_COLLECTION = "products"

function getFirestoreDb() {
  if (!firebaseDb) {
    throw new Error("Firebase no esta configurado")
  }

  return firebaseDb
}

function getProductsCollection() {
  return collection(getFirestoreDb(), PRODUCTS_COLLECTION)
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

export async function createProductInFirestore(product: Product) {
  if (!firebaseDb) {
    throw new Error("Firebase no esta configurado")
  }

  const db = getFirestoreDb()
  await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), serializeProduct(product))
}

export async function updateProductInFirestore(id: string, updates: Partial<Product>) {
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

    transaction.set(productRef, serializeProduct(nextProduct))
  })
}

export async function deleteProductInFirestore(id: string) {
  if (!firebaseDb) {
    throw new Error("Firebase no esta configurado")
  }

  const db = getFirestoreDb()
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, id))
}

export async function registerSaleInFirestore(items: Array<{ productId: string; quantity: number }>) {
  if (!firebaseDb) {
    throw new Error("Firebase no esta configurado")
  }

  const db = getFirestoreDb()

  await runTransaction(db, async (transaction) => {
    for (const item of items) {
      const productRef = doc(db, PRODUCTS_COLLECTION, item.productId)
      const snapshot = await transaction.get(productRef)

      if (!snapshot.exists()) {
        throw new Error("Uno de los productos ya no existe en inventario")
      }

      const product = normalizeProduct(snapshot.data() as Product)

      if (!product.isAvailable || product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}`)
      }

      const nextStock = Math.max(0, product.stock - item.quantity)

      transaction.set(productRef, {
        ...product,
        stock: nextStock,
        status: getProductStatus({
          isAvailable: product.isAvailable,
          status: product.status,
          stock: nextStock,
        }),
      })
    }
  })
}
