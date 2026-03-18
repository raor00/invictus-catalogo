"use client"

import React, { useState } from "react"
import { ProductCard } from "@/components/ProductCard"
import { MagnifyingGlass } from "@phosphor-icons/react"
import { Input } from "@/components/ui/Input"
import { useStore } from "@/lib/StoreContext"
import { getSelectedColorOptions } from "@/lib/productColors"
import { isProductAvailable } from "@/lib/productAvailability"

type ConditionFilter = 'all' | 'new' | 'refurbished' | 'used'

const conditionOptions: { value: ConditionFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'new', label: 'Nuevos' },
  { value: 'refurbished', label: 'Refurbished' },
  { value: 'used', label: 'Usados' },
]

export const PublicCatalogGrid = ({ isParts }: { isParts: boolean }) => {
  const { products } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [hideUnavailable, setHideUnavailable] = useState(false)
  const [conditionFilter, setConditionFilter] = useState<ConditionFilter>('all')

  const filteredProducts = products.filter((product) => {
    const matchesCategory = isParts
      ? product.category === 'Repuestos'
      : product.category !== 'Repuestos'
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.storage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSelectedColorOptions(product).some((colorOption) =>
        colorOption.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    const matchesAvailability = hideUnavailable ? isProductAvailable(product) : true
    const matchesCondition = conditionFilter === 'all' ? true : product.condition === conditionFilter

    return matchesCategory && matchesSearch && matchesAvailability && matchesCondition
  })

  const availableCount = products.filter(p =>
    (isParts ? p.category === 'Repuestos' : p.category !== 'Repuestos') && isProductAvailable(p)
  ).length

  return (
    <>
      {/* Filter Bar */}
      <div className="sticky top-[107px] sm:top-[144px] z-40 py-3 mb-6 bg-background/95 backdrop-blur border-b border-surface-highlight -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 shadow-glass">
        <div className="flex flex-col gap-2.5">
          {/* Row 1: Search + toggle */}
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <Input
                placeholder="Buscar modelo o almacenamiento..."
                icon={<MagnifyingGlass size={16} weight="bold" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer group shrink-0 bg-surface px-3 py-2 rounded-lg border border-surface-highlight hover:border-text-muted transition-colors">
              <div className="relative">
                <input
                  className="sr-only peer"
                  type="checkbox"
                  checked={hideUnavailable}
                  onChange={(e) => setHideUnavailable(e.target.checked)}
                />
                <div className="w-8 h-4 bg-[#D2D2D7] dark:bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary" />
              </div>
              <span className="text-xs font-bold text-text-muted group-hover:text-foreground transition-colors uppercase hidden sm:inline">
                No disponibles
              </span>
            </label>
          </div>

          {/* Row 2: Condition filter pills + count */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {conditionOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setConditionFilter(opt.value)}
                className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border transition-all active:scale-95 ${
                  conditionFilter === opt.value
                    ? 'bg-primary text-white border-primary shadow-neon'
                    : 'bg-surface text-text-muted border-surface-highlight hover:border-text-muted hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
            {!isParts && (
              <span className="ml-auto text-[10px] font-mono text-text-muted">
                {availableCount} disponibles
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-16 text-center text-text-muted">
            <p className="font-heading font-bold text-lg">Sin resultados</p>
            <p className="text-sm mt-1">No se encontraron productos con ese filtro.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredProducts.length > 0 && (
        <div className="mt-16 text-center">
          <p className="text-xs text-text-muted font-mono tracking-wider">
            VENTAS AL MAYOR © {new Date().getFullYear()}. STOCK ACTUALIZADO EN TIEMPO REAL.
          </p>
        </div>
      )}
    </>
  )
}
