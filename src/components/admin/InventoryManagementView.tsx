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
  getColorOptionsForProduct,
  getSelectedColorOptions,
} from "@/lib/productColors"
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
  availableColors: string[]
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
    availableColors: product.availableColors ?? [],
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
    availableColors: draft.availableColors,
  }
}

function serializeColorSelection(colorIds: string[]) {
  return [...colorIds].sort().join("|")
}

function ProductQuickCard({
  draft,
  onChange,
  onDelete,
  onSave,
  product,
}: {
  draft: ProductDraft
  onChange: (id: string, field: keyof ProductDraft, value: string | boolean | string[]) => void
  onDelete: (product: Product) => Promise<void> | void
  onSave: (product: Product) => Promise<void> | void
  product: Product
}) {
  const previewProduct = getPreviewProduct(product, draft)
  const colorOptions = getColorOptionsForProduct(product)
  const selectedColorIds = new Set(draft.availableColors)
  const draftPrice = previewProduct.price
  const draftStock = previewProduct.stock
  const availableNow = isProductAvailable(previewProduct)
  const missingPrice = hasMissingPrice(previewProduct)
  const currentStatus = getProductStatus(previewProduct)
  const manualCatalogEnabled = draft.isAvailable
  const dirty =
    draft.price !== product.price.toString() ||
    draft.stock !== product.stock.toString() ||
    draft.isAvailable !== hasManualAvailability(product) ||
    serializeColorSelection(draft.availableColors) !==
      serializeColorSelection(product.availableColors ?? [])

  return (
    <article className="group rounded-[1.3rem] border border-surface-highlight bg-surface px-4 py-3 shadow-glass transition-all duration-300 hover:border-text-muted">
      <div className="grid gap-3 lg:grid-cols-[minmax(260px,1.7fr)_repeat(4,minmax(100px,1fr))_auto] lg:items-center">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <h3
              className={`font-heading text-base font-bold leading-tight ${
                availableNow ? "text-foreground" : "text-text-muted"
              }`}
            >
              {product.name}
            </h3>
            <Badge variant={availableNow ? "default" : "critical"} pulse={availableNow}>
              {currentStatus}
            </Badge>
            {missingPrice && <Badge variant="warning">Sin precio</Badge>}
          </div>
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-text-muted">
            {product.storage} · {conditionLabel[product.condition]}
          </p>
          <div className="mt-3">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-text-muted">
              Colores visibles
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {colorOptions.map((colorOption) => {
                const selected = selectedColorIds.has(colorOption.id)

                return (
                  <button
                    key={colorOption.id}
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.14em] transition-all ${
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-surface-highlight bg-background text-text-muted hover:border-text-muted hover:text-foreground"
                    }`}
                    onClick={() =>
                      onChange(
                        product.id,
                        "availableColors",
                        selected
                          ? draft.availableColors.filter((colorId) => colorId !== colorOption.id)
                          : [...draft.availableColors, colorOption.id]
                      )
                    }
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-black/10"
                      style={{ backgroundColor: colorOption.swatch }}
                    />
                    {colorOption.label}
                  </button>
                )
              })}
            </div>
            {draft.availableColors.length === 0 && (
              <p className="mt-2 text-xs text-text-muted">
                Sin colores seleccionados. No se mostraran chips de color en el catalogo.
              </p>
            )}
          </div>
          {missingPrice && (
            <p className="mt-1 text-xs font-medium text-orange-500">
              Tiene stock disponible, pero falta asignar precio.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-surface-highlight bg-background px-3 py-2.5">
          <label className="mb-1.5 block text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-text-muted">
            Precio
          </label>
          <input
            className="w-full bg-transparent font-mono text-base font-bold text-foreground outline-none"
            min="0"
            step="0.01"
            type="number"
            value={draft.price}
            onChange={(e) => onChange(product.id, "price", e.target.value)}
          />
        </div>

        <div className="rounded-xl border border-surface-highlight bg-background px-3 py-2.5">
          <label className="mb-1.5 block text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-text-muted">
            Stock
          </label>
          <input
            className="w-full bg-transparent font-mono text-base font-bold text-foreground outline-none"
            min="0"
            step="1"
            type="number"
            value={draft.stock}
            onChange={(e) => onChange(product.id, "stock", e.target.value)}
          />
        </div>

        <div className="rounded-xl border border-surface-highlight bg-background px-3 py-2.5">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-text-muted">
            Valor
          </p>
          <p className="mt-1.5 font-mono text-base font-bold text-foreground">
            ${(draftPrice * draftStock).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-surface-highlight bg-background px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-text-muted">
              Catalogo
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {manualCatalogEnabled ? "Visible" : "Oculto"}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">
              {availableNow
                ? "Estado actual: disponible"
                : draftStock > 0
                  ? "Estado actual: no disponible"
                  : "Sin stock: no disponible"}
            </p>
          </div>
          <label className="relative inline-flex shrink-0 cursor-pointer items-center self-start">
            <input
              checked={draft.isAvailable}
              className="peer sr-only"
              type="checkbox"
              onChange={(e) => onChange(product.id, "isAvailable", e.target.checked)}
            />
            <div className="relative h-6 w-11 rounded-full bg-surface-highlight transition-colors peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-critical hover:bg-critical/10"
            onClick={() => void onDelete(product)}
          >
            <Trash size={16} />
          </Button>
          <Button className="gap-2" disabled={!dirty} onClick={() => void onSave(product)}>
            <FloppyDisk size={16} weight="fill" />
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
  const totalCount = statProducts.reduce((acc, product) => acc + product.stock, 0)
  const availableCount = statProducts
    .filter((product) => isProductAvailable(product))
    .reduce((acc, product) => acc + product.stock, 0)
  const unavailableCount = statProducts.filter((product) => !isProductAvailable(product)).length
  const inventoryValue = statProducts.reduce((acc, product) => acc + product.price * product.stock, 0)

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
          ...getSelectedColorOptions(product).map((option) => option.label),
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
    value: string | boolean | string[]
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
        availableColors: draft.availableColors,
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
    <div className="flex-1 overflow-y-auto">
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

          <div className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="rounded-[1.6rem] border border-surface-highlight bg-background px-5 py-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-primary/15 p-3 text-primary">
                  <Package size={20} weight="fill" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-text-muted">
                    {countLabel}
                  </p>
                  <p className="font-mono text-4xl font-bold text-foreground">{totalCount}</p>
                </div>
              </div>
              <p className="text-sm text-text-muted">
                La lista inferior permite editar sin abrir formularios adicionales.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-surface-highlight bg-background p-3">
              <ul className="divide-y divide-surface-highlight">
                <li className="flex items-center justify-between gap-3 px-2 py-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-primary" weight="fill" />
                    <span className="text-sm font-semibold text-foreground">Disponibles</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-foreground">{availableCount}</span>
                </li>
                <li className="flex items-center justify-between gap-3 px-2 py-3">
                  <div className="flex items-center gap-3">
                    <WarningCircle size={18} className="text-critical" weight="fill" />
                    <span className="text-sm font-semibold text-foreground">No disponibles</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-critical">{unavailableCount}</span>
                </li>
                <li className="flex items-center justify-between gap-3 px-2 py-3">
                  <div className="flex items-center gap-3">
                    <CurrencyDollar size={18} className="text-text-muted" />
                    <span className="text-sm font-semibold text-foreground">Valor inventario</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-foreground">
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

        <section className="rounded-[2rem] border border-surface-highlight bg-surface p-5 shadow-glass sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full max-w-xl">
              <Input
                placeholder={searchPlaceholder}
                icon={<MagnifyingGlass size={18} weight="bold" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {availabilityFilters.map((filter) => (
                <button
                  key={filter.value}
                  className={`rounded-full border px-4 py-2 text-xs font-mono font-bold uppercase tracking-[0.18em] transition-all ${
                    availabilityFilter === filter.value
                      ? "border-primary bg-primary text-black shadow-neon"
                      : "border-surface-highlight bg-background text-text-muted hover:border-text-muted hover:text-foreground"
                  }`}
                  onClick={() => setAvailabilityFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
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
