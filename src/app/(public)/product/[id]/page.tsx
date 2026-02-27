"use client"

import React, { use } from "react"
import Link from "next/link"
import { X, LockKey, ChatCircle } from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { useStore } from "@/lib/StoreContext"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const { products } = useStore()

    const product = products.find(p => p.id === resolvedParams.id)

    if (!product) {
        return (
            <div className="min-h-[calc(100dvh-145px)] w-full flex items-center justify-center py-8">
                <div className="text-center text-text-muted">
                    <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
                    <Link href="/" className="text-primary hover:underline">Volver al catálogo</Link>
                </div>
            </div>
        )
    }

    const isAgotado = product.stock === 0;

    return (
        <div className="min-h-[calc(100dvh-145px)] w-full flex items-center justify-center py-8">
            <motion.div
                layoutId={`product-card-${product.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="relative w-full max-w-[900px] bg-surface border border-surface-highlight rounded-[1.5rem] shadow-glass flex flex-col md:flex-row overflow-hidden"
            >
                {/* Close/Back Button */}
                <Link
                    href="/"
                    className="absolute top-4 right-4 z-20 p-2 rounded-full text-text-muted hover:text-foreground hover:bg-surface-highlight transition-colors duration-200 group"
                >
                    <X size={24} weight="bold" className="group-hover:rotate-90 transition-transform" />
                </Link>

                {/* Left: Gallery Section */}
                <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-surface-highlight p-6 flex flex-col gap-4 bg-background">
                    {/* Main Image Stage */}
                    <div className="relative aspect-[4/5] w-full items-center justify-center overflow-hidden group flex bg-surface border border-surface-highlight rounded-2xl">
                        <motion.img
                            layoutId={`product-image-${product.id}`}
                            src={product.image}
                            alt={product.name}
                            className={`w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105 ${isAgotado ? 'grayscale opacity-70' : ''}`}
                        />
                    </div>
                </div>

                {/* Right: Info Section */}
                <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col h-full bg-surface relative">
                    <div className="mb-6 pr-8">
                        <h2 className={`font-heading text-3xl font-bold leading-tight mb-1 ${isAgotado ? 'text-text-muted' : 'text-foreground'}`}>{product.name}</h2>
                        <p className="font-mono text-xs text-text-muted tracking-wide">REF: {product.sku}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-8">
                        <p className={`font-mono text-5xl tracking-tighter font-medium ${isAgotado ? 'text-text-muted' : 'text-foreground'}`}>${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p className="text-text-muted text-sm mt-1">Precio por unidad (Mayorista)</p>
                    </div>

                    {/* Specs Table */}
                    <div className="flex-grow mb-8 rounded-xl border border-surface-highlight overflow-hidden">
                        <div className="grid grid-cols-2 py-3 px-4 border-b border-surface-highlight bg-background">
                            <span className="text-text-muted text-sm font-medium">Categoría</span>
                            <span className="text-foreground text-sm font-bold text-right">{product.category}</span>
                        </div>
                        <div className="grid grid-cols-2 py-3 px-4 border-b border-surface-highlight">
                            <span className="text-text-muted text-sm font-medium">SKU</span>
                            <span className="text-foreground text-sm font-bold text-right">{product.sku}</span>
                        </div>
                    </div>

                    {/* Stock Indicator */}
                    <div className="flex items-center gap-2 mb-6">
                        {isAgotado ? (
                             <span className="text-critical text-sm font-bold tracking-wide">AGOTADO</span>
                        ) : (
                            <>
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary shadow-glow"></span>
                                </span>
                                <span className="text-primary text-sm font-bold tracking-wide">{product.stock} UNIDADES DISPONIBLES</span>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto">
                        {!isAgotado ? (
                            <a
                                href={`https://wa.me/1234567890?text=Me%20interesa%20el%20producto:%20${encodeURIComponent(product.name)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full h-14 bg-primary text-black font-heading font-bold text-lg rounded-xl px-6 flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-neon hover:scale-[1.02] active:scale-[0.98] group"
                            >
                                <ChatCircle weight="fill" size={24} className="group-hover:scale-110 transition-transform" />
                                SOLICITAR AHORA
                            </a>
                        ) : (
                            <button
                                disabled
                                className="w-full h-14 bg-surface-highlight text-text-muted font-heading font-bold text-lg rounded-xl px-6 flex items-center justify-center gap-3 cursor-not-allowed"
                            >
                                SIN STOCK
                            </button>
                        )}
                        <p className="text-center text-xs text-text-muted mt-4 flex items-center justify-center gap-1.5 font-medium">
                            <LockKey weight="regular" size={14} />
                            Transacción segura vía WhatsApp Business
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
