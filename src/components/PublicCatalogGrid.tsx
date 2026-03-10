"use client"

import React, { useState } from "react"
import { ProductCard } from "@/components/ProductCard"
import { MagnifyingGlass } from "@phosphor-icons/react"
import { Input } from "@/components/ui/Input"
import { useStore } from "@/lib/StoreContext"

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
  const [hideOutOfStock, setHideOutOfStock] = useState(false)
  const [conditionFilter, setConditionFilter] = useState<ConditionFilter>('all')

  const filteredProducts = products.filter((product) => {
    const matchesCategory = isParts
      ? product.category === 'Repuestos'
      : product.category !== 'Repuestos'
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.storage.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStock = hideOutOfStock ? product.stock > 0 : true
    const matchesCondition = conditionFilter === 'all' ? true : product.condition === conditionFilter

    return matchesCategory && matchesSearch && matchesStock && matchesCondition
  })

  const inStockCount = products.filter(p =>
    (isParts ? p.category === 'Repuestos' : p.category !== 'Repuestos') && p.stock > 0
  ).length

  return (
    <>
      {/* Filter Bar */}
      <div className="sticky top-[144px] z-40 py-4 mb-8 bg-background/95 backdrop-blur border-b border-surface-highlight -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 shadow-glass">
        <div className="flex flex-col gap-3">
          {/* Row 1: Search + toggle */}
          <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
            <div className="w-full lg:w-96">
              <Input
                placeholder="Buscar modelo, almacenamiento o SKU..."
                icon={<MagnifyingGlass size={18} weight="bold" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer group ml-auto lg:ml-4 bg-surface px-4 py-2.5 rounded-lg border border-surface-highlight hover:border-text-muted transition-colors tracking-wide shrink-0">
              <div className="relative">
                <input
                  className="sr-only peer"
                  type="checkbox"
                  checked={hideOutOfStock}
                  onChange={(e) => setHideOutOfStock(e.target.checked)}
                />
                <div className="w-9 h-5 bg-[#D2D2D7] dark:bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
              </div>
              <span className="text-sm font-bold text-text-muted group-hover:text-foreground transition-colors uppercase">
                Ocultar Agotados
              </span>
            </label>
          </div>

          {/* Row 2: Condition filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {conditionOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setConditionFilter(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all active:scale-95 ${
                  conditionFilter === opt.value
                    ? 'bg-primary text-black border-primary shadow-neon'
                    : 'bg-surface text-text-muted border-surface-highlight hover:border-text-muted hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
            {!isParts && (
              <span className="ml-auto text-xs font-mono text-text-muted">
                {inStockCount} en stock
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            INVICTUS MAYORISTA © {new Date().getFullYear()}. STOCK ACTUALIZADO EN TIEMPO REAL.
          </p>
        </div>
      )}
    </>
  )
}
