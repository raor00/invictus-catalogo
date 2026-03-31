"use client"

import React, { createContext, useContext, useEffect, useRef, useState } from "react"
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { DEFAULT_CATALOG } from "@/data/catalog"
import { DEFAULT_APP_SETTINGS, normalizeAppSettings } from "@/lib/appSettings"
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebaseClient"
import {
  ensureDefaultCatalogProductsInFirestore,
  ensureAppSettingsInFirestore,
  createProductInFirestore,
  deleteProductInFirestore,
  registerSaleInFirestore,
  subscribeToAppSettings,
  seedCatalogInFirestore,
  subscribeToInventoryHistory,
  subscribeToProducts,
  updateAppSettingsInFirestore,
  updateProductInFirestore,
} from "@/lib/firebaseFirestore"
import { createInventoryHistoryEntry } from "@/lib/inventoryHistory"
import { normalizeProduct } from "@/lib/productAvailability"
import type { AppSettings, InventoryHistoryEntry, PlaceOrderInput, Product, StoredOrder } from "@/lib/storeTypes"

const CATALOG_VERSION = "2026-03-18-wholesale-refresh-v2"

export type { PlaceOrderInput, Product, StoredOrder } from "@/lib/storeTypes"

type StoreContextType = {
  products: Product[]
  inventoryHistory: InventoryHistoryEntry[]
  appSettings: AppSettings
  addProduct: (p: Product) => Promise<void>
  updateProduct: (id: string, p: Partial<Product>) => Promise<void>
  updateAppSettings: (settings: Partial<AppSettings>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  registerSale: (items: Array<{ productId: string; quantity: number }>) => Promise<void>
  placeOrder: (payload: PlaceOrderInput) => Promise<{ orderId?: string }>
  isAuthenticated: boolean
  isFirebaseEnabled: boolean
  isReady: boolean
  userEmail: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

function mergeCatalogProducts(savedProducts: Product[], preserveSavedCatalogValues: boolean) {
  const normalizedDefaults = DEFAULT_CATALOG.map(normalizeProduct)
  const mergedProducts = new Map<string, Product>()
  const defaultIds = new Set(normalizedDefaults.map((product) => product.id))

  normalizedDefaults.forEach((product) => {
    mergedProducts.set(product.id, product)
  })

  savedProducts.map(normalizeProduct).forEach((product) => {
    if (!preserveSavedCatalogValues && defaultIds.has(product.id)) {
      return
    }
    mergedProducts.set(product.id, product)
  })

  return Array.from(mergedProducts.values())
}

function readLocalProducts() {
  const savedVersion = localStorage.getItem("invictus_catalog_version")
  const preserveSavedCatalogValues = savedVersion === CATALOG_VERSION
  localStorage.setItem("invictus_catalog_version", CATALOG_VERSION)

  const savedProducts = localStorage.getItem("invictus_products")
  if (!savedProducts) {
    const normalizedCatalog = mergeCatalogProducts([], preserveSavedCatalogValues)
    localStorage.setItem("invictus_products", JSON.stringify(normalizedCatalog))
    return normalizedCatalog
  }

  try {
    const parsed = JSON.parse(savedProducts) as Product[]
    const migrated = mergeCatalogProducts(parsed, preserveSavedCatalogValues)
    localStorage.setItem("invictus_products", JSON.stringify(migrated))
    return migrated
  } catch {
    const normalizedCatalog = mergeCatalogProducts([], preserveSavedCatalogValues)
    localStorage.setItem("invictus_products", JSON.stringify(normalizedCatalog))
    return normalizedCatalog
  }
}

function saveLocalOrder(order: StoredOrder) {
  const currentOrders = localStorage.getItem("invictus_orders")
  const parsedOrders = currentOrders ? (JSON.parse(currentOrders) as StoredOrder[]) : []
  localStorage.setItem("invictus_orders", JSON.stringify([order, ...parsedOrders]))
}

function readLocalInventoryHistory() {
  const savedHistory = localStorage.getItem("invictus_inventory_history")

  if (!savedHistory) {
    return [] as InventoryHistoryEntry[]
  }

  try {
    return JSON.parse(savedHistory) as InventoryHistoryEntry[]
  } catch {
    return []
  }
}

function readLocalAppSettings() {
  const savedSettings = localStorage.getItem("invictus_app_settings")

  if (!savedSettings) {
    localStorage.setItem("invictus_app_settings", JSON.stringify(DEFAULT_APP_SETTINGS))
    return DEFAULT_APP_SETTINGS
  }

  try {
    return normalizeAppSettings(JSON.parse(savedSettings) as Partial<AppSettings>)
  } catch {
    localStorage.setItem("invictus_app_settings", JSON.stringify(DEFAULT_APP_SETTINGS))
    return DEFAULT_APP_SETTINGS
  }
}

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [inventoryHistory, setInventoryHistory] = useState<InventoryHistoryEntry[]>([])
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const didBootstrapFirebaseCatalog = useRef(false)
  const didEnsureDefaultCatalogProducts = useRef(false)
  const didEnsureAppSettings = useRef(false)

  useEffect(() => {
    if (!isFirebaseConfigured || !firebaseAuth) {
      queueMicrotask(() => {
        const auth = localStorage.getItem("invictus_auth")
        setProducts(readLocalProducts())
        setInventoryHistory(readLocalInventoryHistory())
        setAppSettings(readLocalAppSettings())
        setIsAuthenticated(auth === "true")
        setUserEmail(auth === "true" ? "admin@mayorista.com" : null)
        setIsReady(true)
      })
      return
    }

    let cancelled = false
    let authResolved = false
    let productsResolved = false
    let historyResolved = false
    let settingsResolved = false
    let unsubscribeProducts: () => void = () => {}
    let unsubscribeHistory: () => void = () => {}
    let unsubscribeSettings: () => void = () => {}

    const markReady = () => {
      if (!cancelled && authResolved && productsResolved && historyResolved && settingsResolved) {
        setIsReady(true)
      }
    }

    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user) => {
      authResolved = true
      setIsAuthenticated(Boolean(user))
      setUserEmail(user?.email ?? null)
      markReady()
    })

    void (async () => {
      try {
        unsubscribeProducts = await subscribeToProducts(
          (nextProducts) => {
            productsResolved = true
            setProducts(nextProducts)
            markReady()
          },
          (error) => {
            console.error("No se pudo sincronizar productos con Firebase", error)
            productsResolved = true
            markReady()
          }
        )

        unsubscribeHistory = await subscribeToInventoryHistory(
          (nextHistory) => {
            historyResolved = true
            setInventoryHistory(nextHistory)
            markReady()
          },
          (error) => {
            console.error("No se pudo sincronizar historial de inventario", error)
            historyResolved = true
            markReady()
          }
        )

        unsubscribeSettings = await subscribeToAppSettings(
          (nextSettings) => {
            settingsResolved = true
            setAppSettings(nextSettings)
            markReady()
          },
          (error) => {
            console.error("No se pudo sincronizar configuracion publica", error)
            settingsResolved = true
            setAppSettings(DEFAULT_APP_SETTINGS)
            markReady()
          }
        )
      } catch (error) {
        console.error("No se pudo inicializar la suscripcion de productos", error)
        productsResolved = true
        historyResolved = true
        settingsResolved = true
        markReady()
      }
    })()

    return () => {
      cancelled = true
      unsubscribeAuth()
      unsubscribeProducts()
      unsubscribeHistory()
      unsubscribeSettings()
    }
  }, [])

  useEffect(() => {
    if (!isReady || isFirebaseConfigured) {
      return
    }

    localStorage.setItem("invictus_products", JSON.stringify(products))
  }, [products, isReady])

  useEffect(() => {
    if (!isReady || isFirebaseConfigured) {
      return
    }

    localStorage.setItem("invictus_auth", isAuthenticated ? "true" : "false")
  }, [isAuthenticated, isReady])

  useEffect(() => {
    if (!isReady || isFirebaseConfigured) {
      return
    }

    localStorage.setItem("invictus_inventory_history", JSON.stringify(inventoryHistory))
  }, [inventoryHistory, isReady])

  useEffect(() => {
    if (!isReady || isFirebaseConfigured) {
      return
    }

    localStorage.setItem("invictus_app_settings", JSON.stringify(appSettings))
  }, [appSettings, isReady])

  useEffect(() => {
    if (
      !isFirebaseConfigured ||
      !isAuthenticated ||
      didBootstrapFirebaseCatalog.current ||
      products.length > 0
    ) {
      return
    }

    didBootstrapFirebaseCatalog.current = true
    void seedCatalogInFirestore().catch((error) => {
      console.error("No se pudo sembrar el catalogo inicial en Firebase", error)
      didBootstrapFirebaseCatalog.current = false
    })
  }, [isAuthenticated, products])

  useEffect(() => {
    if (!isFirebaseConfigured || didEnsureAppSettings.current) {
      return
    }

    didEnsureAppSettings.current = true

    void ensureAppSettingsInFirestore().catch((error) => {
      console.error("No se pudo crear la configuracion publica inicial", error)
      didEnsureAppSettings.current = false
    })
  }, [])

  useEffect(() => {
    if (
      !isFirebaseConfigured ||
      !isAuthenticated ||
      didEnsureDefaultCatalogProducts.current ||
      products.length === 0
    ) {
      return
    }

    didEnsureDefaultCatalogProducts.current = true

    void ensureDefaultCatalogProductsInFirestore().catch((error) => {
      console.error("No se pudieron sincronizar productos base faltantes en Firebase", error)
      didEnsureDefaultCatalogProducts.current = false
    })
  }, [isAuthenticated, products])

  const addProduct = async (product: Product) => {
    const nextProduct = normalizeProduct(product)

    if (!isFirebaseConfigured) {
      setProducts((currentProducts) => [...currentProducts, nextProduct])
      setInventoryHistory((currentHistory) => [
        createInventoryHistoryEntry({
          action: "create",
          nextProduct,
          previousProduct: null,
          userEmail,
        }),
        ...currentHistory,
      ])
      return
    }

    await createProductInFirestore(nextProduct, userEmail)
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!isFirebaseConfigured) {
      setProducts((currentProducts) => {
        const previousProduct = currentProducts.find((product) => product.id === id)

        if (!previousProduct) {
          return currentProducts
        }

        const nextProduct = normalizeProduct({ ...previousProduct, ...updates })

        setInventoryHistory((currentHistory) => [
          createInventoryHistoryEntry({
            action: "update",
            previousProduct,
            nextProduct,
            userEmail,
          }),
          ...currentHistory,
        ])

        return currentProducts.map((product) => (product.id === id ? nextProduct : product))
      })
      return
    }

    await updateProductInFirestore(id, updates, userEmail)
  }

  const deleteProduct = async (id: string) => {
    if (!isFirebaseConfigured) {
      setProducts((currentProducts) => {
        const previousProduct = currentProducts.find((product) => product.id === id)

        if (previousProduct) {
          setInventoryHistory((currentHistory) => [
            createInventoryHistoryEntry({
              action: "delete",
              previousProduct,
              nextProduct: null,
              userEmail,
            }),
            ...currentHistory,
          ])
        }

        return currentProducts.filter((product) => product.id !== id)
      })
      return
    }

    await deleteProductInFirestore(id, userEmail)
  }

  const updateAppSettings = async (settings: Partial<AppSettings>) => {
    const nextSettings = normalizeAppSettings({
      ...appSettings,
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail,
    })

    if (!isFirebaseConfigured) {
      setAppSettings(nextSettings)
      return
    }

    await updateAppSettingsInFirestore(nextSettings)
  }

  const registerSale = async (items: Array<{ productId: string; quantity: number }>) => {
    if (!isFirebaseConfigured) {
      setProducts((currentProducts) => {
        const historyEntries: InventoryHistoryEntry[] = []
        const nextProducts = currentProducts.map((product) => {
          const saleItem = items.find((item) => item.productId === product.id)

          if (!saleItem) {
            return product
          }

          const nextProduct = normalizeProduct({
            ...product,
            stock: Math.max(0, product.stock - saleItem.quantity),
          })

          historyEntries.push(
            createInventoryHistoryEntry({
              action: "sale",
              previousProduct: product,
              nextProduct,
              userEmail,
            })
          )

          return nextProduct
        })

        if (historyEntries.length > 0) {
          setInventoryHistory((currentHistory) => [...historyEntries.reverse(), ...currentHistory])
        }

        return nextProducts
      })
      return
    }

    await registerSaleInFirestore(items, userEmail)
  }

  const placeOrder = async (payload: PlaceOrderInput) => {
    if (!isFirebaseConfigured) {
      await registerSale(
        payload.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
      )

      const orderId = crypto.randomUUID()
      saveLocalOrder({
        id: orderId,
        customer: payload.customer,
        items: payload.items.map(({ product, productId, quantity }) => ({
          productId,
          name: product.name,
          sku: product.sku,
          storage: product.storage,
          condition: product.condition,
          unitPrice: product.price,
          quantity,
          subtotal: product.price * quantity,
        })),
        total: payload.total,
        totalQuantity: payload.items.reduce((acc, item) => acc + item.quantity, 0),
        channel: payload.channel,
        status: "pending",
        createdAt: new Date().toISOString(),
      })

      return { orderId }
    }

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = (await response.json()) as { error?: string; orderId?: string }

    if (!response.ok) {
      throw new Error(data.error ?? "No se pudo registrar el pedido")
    }

    return { orderId: data.orderId }
  }

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase()

    if (!isFirebaseConfigured || !firebaseAuth) {
      if (
        (normalizedEmail === "admin" || normalizedEmail === "admin@mayorista.com") &&
        password === "admin123"
      ) {
        setIsAuthenticated(true)
        setUserEmail("admin@mayorista.com")
        return
      }

      throw new Error("Credenciales inválidas")
    }

    await signInWithEmailAndPassword(firebaseAuth, normalizedEmail, password)
  }

  const logout = async () => {
    if (!isFirebaseConfigured || !firebaseAuth) {
      setIsAuthenticated(false)
      setUserEmail(null)
      return
    }

    await signOut(firebaseAuth)
  }

  if (!isReady) {
    return null
  }

  return (
    <StoreContext.Provider
      value={{
        products,
        inventoryHistory,
        appSettings,
        addProduct,
        updateProduct,
        updateAppSettings,
        deleteProduct,
        registerSale,
        placeOrder,
        isAuthenticated,
        isFirebaseEnabled: isFirebaseConfigured,
        isReady,
        userEmail,
        login,
        logout,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => {
  const context = useContext(StoreContext)
  if (!context) throw new Error("useStore must be used within a StoreProvider")
  return context
}
