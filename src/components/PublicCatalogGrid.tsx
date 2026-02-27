"use client"

import React, { useState } from "react"
import { ProductCard } from "@/components/ProductCard"
import { MagnifyingGlass, CaretDown } from "@phosphor-icons/react"
import { Input } from "@/components/ui/Input"
import { useStore } from "@/lib/StoreContext"

export const PublicCatalogGrid = ({ isParts }: { isParts: boolean }) => {
    const { products } = useStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [hideOutOfStock, setHideOutOfStock] = useState(false)

    const filteredProducts = products.filter((product) => {
        // Simple mapping: Repuestos -> parts, others -> phones. 
        // A robust app would use an exact match, but we adapt to the mock category logic.
        const matchesCategory = isParts ? product.category === 'Repuestos' : product.category !== 'Repuestos';
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStock = hideOutOfStock ? product.stock > 0 : true;

        return matchesCategory && matchesSearch && matchesStock;
    })

    // Map the context Product to the format ProductCard expects
    const mapToCardProduct = (p: any) => ({
        id: p.id,
        name: p.name,
        image: p.image,
        specs: [p.category, `SKU: ${p.sku}`], // Adapting specs
        price: p.price,
        status: (p.stock === 0 ? "out_of_stock" : p.stock < 3 ? "low_stock" : "available") as "out_of_stock" | "low_stock" | "available" | "part"
    })

    return (
        <>
            {/* Filter Bar */}
            <div className="sticky top-[144px] z-40 py-4 mb-8 bg-background/95 backdrop-blur border-b border-surface-highlight -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 shadow-glass">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">

                    {/* Search */}
                    <div className="w-full lg:w-96">
                        <Input
                            placeholder="Buscar modelo o SKU..."
                            icon={<MagnifyingGlass size={18} weight="bold" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filters Group */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        {/* Toggle Switch */}
                        <label className="flex items-center gap-3 cursor-pointer group ml-auto lg:ml-4 bg-surface px-4 py-2.5 rounded-lg border border-surface-highlight hover:border-text-muted transition-colors tracking-wide">
                            <div className="relative">
                                <input 
                                    className="sr-only peer" 
                                    type="checkbox" 
                                    checked={hideOutOfStock}
                                    onChange={(e) => setHideOutOfStock(e.target.checked)}
                                />
                                <div className="w-9 h-5 bg-[#D2D2D7] dark:bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                            </div>
                            <span className="text-sm font-bold text-text-muted group-hover:text-foreground transition-colors uppercase">Ocultar Agotados</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={mapToCardProduct(product)} />
                ))}
                {filteredProducts.length === 0 && (
                    <div className="col-span-full py-12 text-center text-text-muted">
                        No se encontraron productos que coincidan con la búsqueda.
                    </div>
                )}
            </div>

            {/* Load More Area */}
            {filteredProducts.length > 0 && (
                <div className="mt-16 text-center">
                    <button className="px-8 py-3 rounded-full border border-[#D2D2D7] text-text-muted hover:text-foreground hover:border-foreground transition-colors text-sm tracking-wide font-bold uppercase active:scale-95 shadow-glass">
                        Cargar más productos
                    </button>
                    <p className="mt-8 text-xs text-text-muted font-mono tracking-wider">
                        INVICTUS MAYORISTA © {new Date().getFullYear()}. STOCK ACTUALIZADO EN TIEMPO REAL.
                    </p>
                </div>
            )}
        </>
    )
}
