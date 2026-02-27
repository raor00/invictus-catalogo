"use client"

import React, { useState } from "react"
import { Download, Plus, Package, MagnifyingGlass, Faders, SortAscending, PencilSimple, Trash } from "@phosphor-icons/react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import { useStore } from "@/lib/StoreContext"

export default function InventoryDashboardPage() {
    const { products, deleteProduct } = useStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [filterCategory, setFilterCategory] = useState<string | "all">("all")

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "all" || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex-1 flex flex-col h-full z-10 w-full">
            {/* Top Header */}
            <div className="px-4 sm:px-8 py-6 sm:py-8 z-10 flex flex-col gap-8 flex-shrink-0">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-foreground font-heading font-bold text-3xl tracking-tight">Inventario Global</h2>
                        <p className="text-text-muted mt-1 text-sm font-body">Catálogo completo de todos los productos y variaciones.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2">
                            <Download size={16} weight="bold" />
                            Exportar Todo
                        </Button>
                        <Button className="gap-2" onClick={() => window.dispatchEvent(new CustomEvent('open-product-modal'))}>
                            <Plus size={16} weight="bold" />
                            Añadir a Inventario
                        </Button>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 px-4 sm:px-8 pb-8 overflow-hidden flex flex-col z-10 w-full max-w-[1400px] mx-auto">
                <div className="bg-surface border border-surface-highlight rounded-2xl flex flex-col h-full overflow-hidden shadow-glass">

                    {/* Table Toolbar */}
                    <div className="p-4 border-b border-surface-highlight flex justify-between items-center bg-surface gap-4 flex-wrap">
                        <div className="w-96 flex-grow max-w-md">
                            <Input
                                placeholder="Buscar en todo el inventario..."
                                icon={<MagnifyingGlass size={18} weight="bold" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3 items-center">
                            <div className="flex bg-background rounded-lg p-1 border border-surface-highlight">
                                <button
                                    onClick={() => setFilterCategory("all")}
                                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all ${filterCategory === 'all' ? 'bg-surface shadow-sm text-foreground' : 'text-text-muted hover:text-foreground'}`}
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => setFilterCategory("Smartphones")}
                                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all ${filterCategory === 'Smartphones' ? 'bg-surface shadow-sm text-foreground' : 'text-text-muted hover:text-foreground'}`}
                                >
                                    Smartphones
                                </button>
                                <button
                                    onClick={() => setFilterCategory("Repuestos")}
                                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all ${filterCategory === 'Repuestos' ? 'bg-surface shadow-sm text-foreground' : 'text-text-muted hover:text-foreground'}`}
                                >
                                    Repuestos
                                </button>
                            </div>

                            <Button variant="outline" className="gap-2 h-9">
                                <Faders size={16} weight="bold" /> Filtros
                            </Button>
                            <Button variant="outline" className="gap-2 h-9">
                                <SortAscending size={16} weight="bold" /> Ordenar
                            </Button>
                        </div>
                    </div>

                    {/* Scrollable Container Wrapper for Mobile */}
                    <div className="overflow-x-auto w-full flex-1">
                        <div className="min-w-[1000px] h-full flex flex-col">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-highlight/30 border-b border-surface-highlight text-xs font-mono uppercase tracking-wider text-text-muted font-bold sticky top-0">
                                <div className="col-span-4 pl-2">Producto</div>
                                <div className="col-span-2">Categoría</div>
                                <div className="col-span-2 text-right">Precio Unitario</div>
                                <div className="col-span-1 text-center">Stock</div>
                                <div className="col-span-2 text-right">Estado</div>
                                <div className="col-span-1 text-right pr-2">Acciones</div>
                            </div>

                            {/* Table Body (Scrollable) */}
                            <div className="overflow-y-auto flex-1 custom-scrollbar">
                                {filteredProducts.length === 0 ? (
                                    <div className="p-12 flex flex-col items-center justify-center text-center">
                                        <Package size={48} className="text-surface-highlight mb-4" />
                                        <h3 className="text-foreground font-heading font-bold text-xl mb-2">No hay resultados</h3>
                                        <p className="text-text-muted font-body">No se encontraron productos que coincidan con tu búsqueda o filtros.</p>
                                    </div>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <div key={product.id} className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-surface-highlight items-center hover:bg-surface-highlight/20 group transition-all duration-200 ${product.stock === 0 ? 'opacity-70 hover:opacity-100' : ''}`}>
                                            <div className="col-span-4 flex gap-4 items-center pl-2">
                                                <div className="h-10 w-10 rounded bg-background border border-surface-highlight flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                                                    <img src={product.image || 'https://via.placeholder.com/150'} alt="Product" className={`h-full w-full object-contain ${product.stock === 0 ? 'grayscale' : ''}`} />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className={`text-foreground font-bold truncate text-sm font-heading ${product.stock === 0 ? 'line-through decoration-surface-highlight text-text-muted' : ''}`}>{product.name}</span>
                                                    <span className="text-text-muted text-[10px] font-mono truncate">SKU: {product.sku}</span>
                                                </div>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <span className="text-text-muted text-xs font-mono uppercase tracking-wider bg-surface-highlight/30 px-2 py-1 rounded">
                                                    {product.category}
                                                </span>
                                            </div>
                                            <div className="col-span-2 flex justify-end">
                                                <span className={`font-mono font-bold text-sm ${product.stock === 0 ? 'text-text-muted' : 'text-foreground'}`}>${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="col-span-1 flex justify-center">
                                                <div className={`px-3 py-1 rounded font-mono text-xs tracking-wide font-bold ${product.stock === 0 ? 'bg-critical/10 border border-critical/30 text-critical' :
                                                    product.stock < 3 ? 'bg-orange-500/10 border border-orange-500/30 text-orange-500' :
                                                        'bg-surface-highlight/50 border border-surface-highlight text-foreground'
                                                    }`}>
                                                    {product.stock}
                                                </div>
                                            </div>
                                            <div className="col-span-2 flex justify-end">
                                                <Badge variant={product.stock === 0 ? 'critical' : product.stock < 3 ? 'warning' : 'default'} pulse={product.stock > 0}>
                                                    {product.stock === 0 ? 'Agotado' : product.stock < 3 ? 'Pocas Unidades' : 'Disponible'}
                                                </Badge>
                                            </div>
                                            <div className="col-span-1 flex justify-end gap-1 pr-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.dispatchEvent(new CustomEvent('open-product-modal', { detail: product }))}>
                                                    <PencilSimple size={14} />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-critical hover:bg-critical/10" onClick={() => { if (confirm('¿Eliminar producto del inventario?')) deleteProduct(product.id) }}>
                                                    <Trash size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
