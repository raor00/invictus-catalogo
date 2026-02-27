"use client"

import React, { useState, useEffect } from "react"
import { Download, Plus, Package, CurrencyDollar, WarningCircle, MagnifyingGlass, Faders, SortAscending, PencilSimple, Trash } from "@phosphor-icons/react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import { useStore, Product } from "@/lib/StoreContext"

export default function AdminDashboardPage() {
    const { products, deleteProduct } = useStore()
    const [searchTerm, setSearchTerm] = useState("")

    const totalSKUs = products.length;
    const inventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const criticalStock = products.filter(p => p.stock < 3).length;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex-1 flex flex-col h-full z-10 w-full">
            {/* Top Header & Stats */}
            <div className="px-8 py-8 z-10 flex flex-col gap-8 flex-shrink-0">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-foreground font-heading font-bold text-3xl tracking-tight">Panel de Control</h2>
                        <p className="text-text-muted mt-1 text-sm font-body">Visión general del inventario y alertas en tiempo real.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2">
                            <Download size={16} weight="bold" />
                            Exportar Reporte
                        </Button>
                        <Button className="gap-2" onClick={() => window.dispatchEvent(new CustomEvent('open-product-modal'))}>
                            <Plus size={16} weight="bold" />
                            Nuevo Producto
                        </Button>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat Card 1 */}
                    <div className="bg-surface border border-surface-highlight p-6 rounded-2xl flex flex-col justify-between h-36 hover:border-text-muted transition-colors shadow-glass group">
                        <div className="flex justify-between items-start">
                            <span className="text-text-muted text-xs font-mono font-bold uppercase tracking-wider">Total SKUs</span>
                            <Package size={20} className="text-text-muted group-hover:text-foreground transition-colors" />
                        </div>
                        <div>
                            <span className="text-foreground text-4xl font-mono font-bold tracking-tight">{totalSKUs}</span>
                        </div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-surface border border-surface-highlight p-6 rounded-2xl flex flex-col justify-between h-36 hover:border-text-muted transition-colors shadow-glass group">
                        <div className="flex justify-between items-start">
                            <span className="text-text-muted text-xs font-mono font-bold uppercase tracking-wider">Valor Inventario</span>
                            <CurrencyDollar size={20} className="text-text-muted group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                            <span className="text-foreground text-3xl font-mono font-bold tracking-tight">${inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-surface border border-surface-highlight p-6 rounded-2xl flex flex-col justify-between h-36 border-l-4 border-l-critical hover:border-text-muted transition-colors shadow-glass group">
                        <div className="flex justify-between items-start">
                            <span className="text-text-muted text-xs font-mono font-bold uppercase tracking-wider">Alertas Stock</span>
                            <WarningCircle size={20} className="text-text-muted group-hover:text-critical transition-colors" weight="fill" />
                        </div>
                        <div className="flex items-baseline gap-3">
                            <span className="text-critical text-4xl font-mono font-bold animate-pulse">{criticalStock}</span>
                            <span className="text-text-muted text-xs font-mono font-bold uppercase tracking-wider">Items críticos</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 px-8 pb-8 overflow-hidden flex flex-col z-10 w-full max-w-[1400px] mx-auto">
                <div className="bg-surface border border-surface-highlight rounded-2xl flex flex-col h-full overflow-hidden shadow-glass">

                    {/* Table Toolbar */}
                    <div className="p-4 border-b border-surface-highlight flex justify-between items-center bg-surface">
                        <div className="w-96">
                            <Input
                                placeholder="Buscar por nombre, SKU o categoría..."
                                icon={<MagnifyingGlass size={18} weight="bold" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="gap-2">
                                <Faders size={16} weight="bold" /> Filtros
                            </Button>
                            <Button variant="outline" className="gap-2">
                                <SortAscending size={16} weight="bold" /> Ordenar
                            </Button>
                        </div>
                    </div>

                    {/* Scrollable Container Wrapper for Mobile */}
                    <div className="overflow-x-auto w-full flex-1">
                        <div className="min-w-[900px] h-full flex flex-col">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-highlight/30 border-b border-surface-highlight text-xs font-mono uppercase tracking-wider text-text-muted font-bold sticky top-0">
                                <div className="col-span-4 pl-2">Producto</div>
                                <div className="col-span-2 text-right">Precio</div>
                                <div className="col-span-2 text-center">Stock</div>
                                <div className="col-span-2 text-right">Estado</div>
                                <div className="col-span-2 text-right pr-2">Acciones</div>
                            </div>

                            {/* Table Body (Scrollable) */}
                            <div className="overflow-y-auto flex-1 custom-scrollbar">
                                {filteredProducts.length === 0 ? (
                                    <div className="p-8 text-center text-text-muted">No se encontraron productos.</div>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <div key={product.id} className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-surface-highlight items-center hover:bg-surface-highlight/20 group transition-all duration-200 ${product.stock === 0 ? 'opacity-70 hover:opacity-100' : ''}`}>
                                            <div className="col-span-4 flex gap-4 items-center pl-2">
                                                <div className="h-12 w-12 rounded bg-background border border-surface-highlight flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                                                    <img src={product.image || 'https://via.placeholder.com/150'} alt="Product" className={`h-full w-full object-contain ${product.stock === 0 ? 'grayscale' : ''}`} />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className={`text-foreground font-bold truncate font-heading ${product.stock === 0 ? 'line-through decoration-surface-highlight text-text-muted' : ''}`}>{product.name}</span>
                                                    <span className="text-text-muted text-xs font-mono truncate">SKU: {product.sku}</span>
                                                </div>
                                            </div>
                                            <div className="col-span-2 flex justify-end">
                                                <span className={`font-mono font-bold ${product.stock === 0 ? 'text-text-muted' : 'text-foreground'}`}>${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="col-span-2 flex justify-center">
                                                <div className={`px-4 py-1.5 rounded font-mono text-sm tracking-wide font-bold ${product.stock === 0 ? 'bg-critical/10 border border-critical/30 text-critical' :
                                                        product.stock < 3 ? 'bg-orange-500/10 border border-orange-500/30 text-orange-500' :
                                                            'bg-surface-highlight/50 border border-surface-highlight text-foreground'
                                                    }`}>
                                                    {product.stock} Un.
                                                </div>
                                            </div>
                                            <div className="col-span-2 flex justify-end">
                                                <Badge variant={product.stock === 0 ? 'critical' : product.stock < 3 ? 'warning' : 'default'} pulse={product.stock > 0}>
                                                    {product.stock === 0 ? 'Agotado' : product.stock < 3 ? 'Pocas Unidades' : 'Disponible'}
                                                </Badge>
                                            </div>
                                            <div className="col-span-2 flex justify-end gap-2 pr-2">
                                                <Button variant="ghost" size="icon" onClick={() => window.dispatchEvent(new CustomEvent('open-product-modal', { detail: product }))}>
                                                    <PencilSimple size={18} />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-critical hover:bg-critical/10" onClick={() => { if (confirm('¿Eliminar producto?')) deleteProduct(product.id) }}>
                                                    <Trash size={18} />
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
