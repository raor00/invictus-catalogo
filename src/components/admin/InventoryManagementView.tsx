"use client"

import React, { useMemo, useState } from "react"
import {
  CheckCircle,
  CurrencyDollar,
  Download,
  FloppyDisk,
  MagnifyingGlass,
  Package,
  Plus,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import { useStore, type Product } from "@/lib/StoreContext"
import {
  getProductStatus,
  hasMissingPrice,
  hasManualAvailability,
  isProductAvailable,
} from "@/lib/productAvailability"

type AvailabilityFilter = "all" | "available" | "unavailable"

type ProductDraft = {
  price: string
  stock: string
  isAvailable: boolean
}

type InventoryManagementViewProps = {
  countLabel: string
  description: string
  emptyMessage: string
  newProductDetail?: { defaultCategory?: string }
  newButtonLabel: string
  products: Product[]
  searchPlaceholder: string
  statsFilter?: (product: Product) => boolean
  title: string
}

const availabilityFilters: { value: AvailabilityFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "available", label: "Disponibles" },
  { value: "unavailable", label: "No disponibles" },
]

const conditionLabel: Record<Product["condition"], string> = {
  new: "Nuevo",
  refurbished: "Refurbished",
  used: "Usado",
}

function getDraftNumber(value: string) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeSearchValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function getStorageOrder(storage: string) {
  const normalized = storage.trim().toUpperCase()

  if (normalized.endsWith("TB")) {
    const value = Number.parseFloat(normalized.replace("TB", ""))
    return Number.isFinite(value) ? value * 1024 : Number.MAX_SAFE_INTEGER
  }

  if (normalized.endsWith("GB")) {
    const value = Number.parseFloat(normalized.replace("GB", ""))
    return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER
  }

  return Number.MAX_SAFE_INTEGER
}

function getIPhoneSortData(name: string) {
  const match = name.match(/^iPhone\s+(\d+)(?:\s+(.*))?$/i)

  if (!match) {
    return null
  }

  const generation = Number.parseInt(match[1], 10)
  const suffix = (match[2] ?? "").trim().toLowerCase()

  const variantOrder: Record<string, number> = {
    "pro max": 0,
    pro: 1,
    air: 2,
    plus: 3,
    "": 4,
    mini: 5,
  }

  return {
    generation,
    suffix,
    variantRank: variantOrder[suffix] ?? 99,
  }
}

function buildDraft(product: Product): ProductDraft {
  return {
    price: product.price.toString(),
    stock: product.stock.toString(),
    isAvailable: hasManualAvailability(product),
  }
}

function getPreviewProduct(product: Product, draft?: ProductDraft): Product {
  if (!draft) {
    return product
  }

  return {
    ...product,
    price: Math.max(0, getDraftNumber(draft.price)),
    stock: Math.max(0, Math.floor(getDraftNumber(draft.stock))),
    isAvailable: draft.isAvailable,
  }
}

function ProductQuickCard({
  draft,
  onChange,
  onDelete,
  onSave,
  product,
}: {
  draft: ProductDraft
  onChange: (id: string, field: keyof ProductDraft, value: string | boolean) => void
  onDelete: (product: Product) => Promise<void> | void
  onSave: (product: Product) => Promise<void> | void
  product: Product
}) {
  const previewProduct = getPreviewProduct(product, draft)
  const draftPrice = previewProduct.price
  const draftStock = previewProduct.stock
  const availableNow = isProductAvailable(previewProduct)
  const missingPrice = hasMissingPrice(previewProduct)
  const currentStatus = getProductStatus(previewProduct)
  const manualCatalogEnabled = draft.isAvailable
  const dirty =
    draft.price !== product.price.toString() ||
    draft.stock !== product.stock.toString() ||
    draft.isAvailable !== hasManualAvailability(product)

  return (
    <article className="group w-full overflow-hidden rounded-[1.05rem] border border-surface-highlight bg-surface px-3 py-2 shadow-glass transition-all duration-300 hover:border-text-muted sm:px-3.5 sm:py-2.5">
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.65fr)_minmax(92px,0.62fr)_minmax(92px,0.62fr)_minmax(108px,0.72fr)_minmax(168px,0.95fr)_auto] xl:items-center">
        <div className="min-w-0 text-center md:col-span-2 xl:col-span-1 xl:text-left">
          <div className="mb-0.5 flex flex-wrap items-center justify-center gap-1.5 xl:justify-start">
            <h3
              className={`font-heading text-[15px] font-bold leading-tight ${
                availableNow ? "text-foreground" : "text-text-muted"
              }`}
            >
              {product.name}
            </h3>
            <Badge
              className="min-h-[18px] px-2 py-0.5 text-[8px] tracking-[0.16em]"
              variant={availableNow ? "default" : "critical"}
              pulse={availableNow}
            >
              {currentStatus}
            </Badge>
            {missingPrice && <Badge className="min-h-[18px] px-2 py-0.5 text-[8px] tracking-[0.16em]" variant="warning">Sin precio</Badge>}
          </div>
          <p className="text-[9px] font-mono uppercase tracking-[0.14em] text-text-muted">
            {product.storage} · {conditionLabel[product.condition]}
          </p>
          {missingPrice && (
            <p className="mt-0.5 text-[10px] font-medium text-orange-500 xl:max-w-[28ch]">
              Tiene stock disponible, pero falta asignar precio.
            </p>
          )}
        </div>

        <div className="flex min-h-[68px] flex-col justify-center rounded-lg border border-surface-highlight bg-background px-2.5 py-1.5 text-center xl:text-left">
          <label className="mb-0.5 block text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-text-muted">
            Precio
          </label>
          <input
            className="w-full bg-transparent text-center font-mono text-sm font-bold text-foreground outline-none xl:text-left"
            min="0"
            step="0.01"
            type="number"
            value={draft.price}
            onChange={(e) => onChange(product.id, "price", e.target.value)}
          />
        </div>

        <div className="flex min-h-[68px] flex-col justify-center rounded-lg border border-surface-highlight bg-background px-2.5 py-1.5 text-center xl:text-left">
          <label className="mb-0.5 block text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-text-muted">
            Stock
          </label>
          <input
            className="w-full bg-transparent text-center font-mono text-sm font-bold text-foreground outline-none xl:text-left"
            min="0"
            step="1"
            type="number"
            value={draft.stock}
            onChange={(e) => onChange(product.id, "stock", e.target.value)}
          />
        </div>

        <div className="flex min-h-[68px] flex-col justify-center rounded-lg border border-surface-highlight bg-background px-2.5 py-1.5 text-center xl:text-left">
          <p className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-text-muted">
            Valor
          </p>
          <p className="mt-0.5 font-mono text-sm font-bold text-foreground">
            ${(draftPrice * draftStock).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="grid min-h-[68px] grid-cols-[minmax(0,1fr)_44px] items-center gap-2 rounded-lg border border-surface-highlight bg-background px-2.5 py-1.5 text-center xl:text-left">
          <div className="min-w-0">
            <p className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-text-muted">
              Catalogo
            </p>
            <p className="mt-0.5 text-[13px] font-semibold text-foreground">
              {manualCatalogEnabled ? "Visible" : "Oculto"}
            </p>
            <p className="mt-0.5 text-[10px] text-text-muted">
              {availableNow
                ? "Estado actual: disponible"
                : draftStock > 0
                  ? "Estado actual: no disponible"
                  : "Sin stock: no disponible"}
            </p>
          </div>
          <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-self-center xl:justify-self-end">
            <input
              checked={draft.isAvailable}
              className="peer sr-only"
              type="checkbox"
              onChange={(e) => onChange(product.id, "isAvailable", e.target.checked)}
            />
            <div className="relative h-6 w-11 rounded-full bg-surface-highlight transition-colors peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
          </label>
        </div>

        <div className="flex min-w-0 flex-col-reverse gap-1 md:col-span-2 sm:flex-row sm:items-center sm:justify-center xl:col-span-1 xl:justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 self-end text-critical hover:bg-critical/10 sm:self-auto"
            onClick={() => void onDelete(product)}
          >
            <Trash size={14} />
          </Button>
          <Button
            size="sm"
            className="w-full gap-1.5 rounded-lg sm:w-auto sm:min-w-[118px]"
            disabled={!dirty}
            onClick={() => void onSave(product)}
          >
            <FloppyDisk size={14} weight="fill" />
            Guardar
          </Button>
        </div>
      </div>
    </article>
  )
}

export function InventoryManagementView({
  countLabel,
  description,
  emptyMessage,
  newProductDetail,
  newButtonLabel,
  products,
  searchPlaceholder,
  statsFilter,
  title,
}: InventoryManagementViewProps) {
  const { deleteProduct, updateProduct } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all")
  const [drafts, setDrafts] = useState<Record<string, ProductDraft>>({})
  const productMap = useMemo(
    () =>
      products.reduce<Record<string, Product>>((acc, product) => {
        acc[product.id] = product
        return acc
      }, {}),
    [products]
  )
  const resolvedDrafts = useMemo(
    () =>
      products.reduce<Record<string, ProductDraft>>((acc, product) => {
        acc[product.id] = drafts[product.id] ?? buildDraft(product)
        return acc
      }, {}),
    [drafts, products]
  )
  const previewProducts = products.map((product) => getPreviewProduct(product, resolvedDrafts[product.id]))
  const statProducts = statsFilter ? previewProducts.filter(statsFilter) : previewProducts
  const totalUnits = statProducts.reduce((acc, product) => acc + product.stock, 0)
  const totalVariants = statProducts.length
  const totalModels = new Set(statProducts.map((product) => product.name)).size
  const availableCount = statProducts
    .filter((product) => isProductAvailable(product))
    .reduce((acc, product) => acc + product.stock, 0)
  const unavailableCount = statProducts.filter((product) => !isProductAvailable(product)).length
  const inventoryValue = statProducts.reduce((acc, product) => acc + product.price * product.stock, 0)
  const topModelByUnits = Object.entries(
    statProducts.reduce<Record<string, number>>((acc, product) => {
      acc[product.name] = (acc[product.name] ?? 0) + product.stock
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])[0]

  const normalizedSearch = normalizeSearchValue(searchTerm)
  const searchTerms = normalizedSearch.split(" ").filter(Boolean)

  const filteredProducts = previewProducts
    .filter((product) => {
      const searchableValue = normalizeSearchValue(
        [
          product.name,
          product.sku,
          product.storage,
          conditionLabel[product.condition],
          product.category,
        ].join(" ")
      )
      const matchesSearch =
        searchTerms.length === 0 ||
        searchTerms.every((term) => searchableValue.includes(term))

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && isProductAvailable(product)) ||
        (availabilityFilter === "unavailable" && !isProductAvailable(product))

      return matchesSearch && matchesAvailability
    })
    .sort((a, b) => {
      const aIPhone = getIPhoneSortData(a.name)
      const bIPhone = getIPhoneSortData(b.name)

      if (aIPhone && bIPhone) {
        const generationComparison = bIPhone.generation - aIPhone.generation
        if (generationComparison !== 0) {
          return generationComparison
        }

        const variantComparison = aIPhone.variantRank - bIPhone.variantRank
        if (variantComparison !== 0) {
          return variantComparison
        }
      } else {
        const nameComparison = a.name.localeCompare(b.name, "es", { sensitivity: "base" })
        if (nameComparison !== 0) {
          return nameComparison
        }
      }

      const storageComparison = getStorageOrder(b.storage) - getStorageOrder(a.storage)
      if (storageComparison !== 0) {
        return storageComparison
      }

      return a.condition.localeCompare(b.condition, "es", { sensitivity: "base" })
    })

  function handleDraftChange(
    id: string,
    field: keyof ProductDraft,
    value: string | boolean
  ) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? buildDraft(productMap[id])),
        [field]: value,
      },
    }))
  }

  async function handleSave(product: Product) {
    const draft = resolvedDrafts[product.id]

    if (!draft) {
      return
    }

    try {
      await updateProduct(product.id, {
        price: Math.max(0, Number.parseFloat(draft.price) || 0),
        stock: Math.max(0, Number.parseInt(draft.stock, 10) || 0),
        isAvailable: draft.isAvailable,
      })
      setDrafts((current) => {
        const nextDrafts = { ...current }
        delete nextDrafts[product.id]
        return nextDrafts
      })
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo guardar el producto")
    }
  }

  async function handleDelete(product: Product) {
    if (confirm(`¿Eliminar ${product.name}?`)) {
      try {
        await deleteProduct(product.id)
        setDrafts((current) => {
          const nextDrafts = { ...current }
          delete nextDrafts[product.id]
          return nextDrafts
        })
      } catch (error) {
        alert(error instanceof Error ? error.message : "No se pudo eliminar el producto")
      }
    }
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
        <section className="rounded-[2rem] border border-surface-highlight bg-surface p-6 shadow-glass sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-text-muted">
                Centro operativo
              </p>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h2>
              <p className="mt-3 text-sm text-text-muted sm:text-base">{description}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2 text-xs sm:text-sm">
                <Download size={16} weight="bold" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
              <Button
                className="gap-2 text-xs sm:text-sm"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("open-product-modal", {
                      detail: newProductDetail,
                    })
                  )
                }
              >
                <Plus size={16} weight="bold" />
                {newButtonLabel}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="rounded-[1.4rem] border border-surface-highlight bg-background px-4 py-4 sm:px-5 sm:py-4">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="rounded-xl bg-primary/15 p-2.5 text-primary">
                  <Package size={20} weight="fill" />
                </div>
                <div>
                  <p className="text-[9px] font-mono font-bold uppercase tracking-[0.16em] text-text-muted">
                    {countLabel}
                  </p>
                  <p className="font-mono text-3xl font-bold text-foreground sm:text-[2rem]">{totalUnits}</p>
                </div>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-3">
                <div className="rounded-xl border border-surface-highlight bg-surface px-3 py-3">
                  <p className="text-[9px] font-mono font-bold uppercase tracking-[0.16em] text-text-muted">
                    Variantes
                  </p>
                  <p className="mt-1.5 font-mono text-xl font-bold text-foreground">{totalVariants}</p>
                  <p className="mt-0.5 text-[11px] text-text-muted">SKUs visibles dentro del inventario.</p>
                </div>
                <div className="rounded-xl border border-surface-highlight bg-surface px-3 py-3">
                  <p className="text-[9px] font-mono font-bold uppercase tracking-[0.16em] text-text-muted">
                    Modelos
                  </p>
                  <p className="mt-1.5 font-mono text-xl font-bold text-foreground">{totalModels}</p>
                  <p className="mt-0.5 text-[11px] text-text-muted">Modelos distintos cargados actualmente.</p>
                </div>
                <div className="rounded-xl border border-surface-highlight bg-surface px-3 py-3">
                  <p className="text-[9px] font-mono font-bold uppercase tracking-[0.16em] text-text-muted">
                    Mayor stock
                  </p>
                  <p className="mt-1.5 truncate font-heading text-[15px] font-bold text-foreground">
                    {topModelByUnits?.[0] ?? "Sin datos"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-text-muted">
                    {topModelByUnits ? `${topModelByUnits[1]} unidades acumuladas.` : "Sin inventario registrado."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-surface-highlight bg-background p-2.5 sm:p-3">
              <ul className="divide-y divide-surface-highlight">
                <li className="flex items-center justify-between gap-2 px-2 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle size={16} className="text-primary" weight="fill" />
                    <span className="text-[13px] font-semibold text-foreground">Disponibles</span>
                  </div>
                  <span className="font-mono text-base font-bold text-foreground">{availableCount}</span>
                </li>
                <li className="flex items-center justify-between gap-2 px-2 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <WarningCircle size={16} className="text-critical" weight="fill" />
                    <span className="text-[13px] font-semibold text-foreground">No disponibles</span>
                  </div>
                  <span className="font-mono text-base font-bold text-critical">{unavailableCount}</span>
                </li>
                <li className="flex items-center justify-between gap-2 px-2 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <CurrencyDollar size={16} className="text-text-muted" />
                    <span className="text-[13px] font-semibold text-foreground">Valor inventario</span>
                  </div>
                  <span className="font-mono text-base font-bold text-foreground">
                    ${inventoryValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-[1.6rem] border border-surface-highlight bg-surface p-4 shadow-glass sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full max-w-lg">
              <Input
                className="h-9 rounded-xl text-[13px]"
                placeholder={searchPlaceholder}
                icon={<MagnifyingGlass size={16} weight="bold" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

          <div className="flex flex-wrap justify-center gap-1.5 lg:justify-end">
              {availabilityFilters.map((filter) => (
                <button
                  key={filter.value}
                  className={`rounded-full border px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.16em] transition-all ${
                    availabilityFilter === filter.value
                      ? "border-primary bg-primary text-white shadow-neon"
                      : "border-surface-highlight bg-background text-text-muted hover:border-text-muted hover:text-foreground"
                  }`}
                  onClick={() => setAvailabilityFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            {filteredProducts.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-surface-highlight bg-background px-6 py-16 text-center text-text-muted">
                {emptyMessage}
              </div>
            ) : (
              filteredProducts.map((product) => (
                <ProductQuickCard
                  key={product.id}
                  draft={resolvedDrafts[product.id] ?? buildDraft(product)}
                  product={productMap[product.id] ?? product}
                  onChange={handleDraftChange}
                  onDelete={handleDelete}
                  onSave={handleSave}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
