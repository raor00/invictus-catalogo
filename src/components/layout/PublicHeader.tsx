"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { UserCircle, ShoppingBag } from "@phosphor-icons/react"
import { useCart } from "@/lib/CartContext"

export function PublicHeader() {
    const searchParams = useSearchParams()
    const currentCategory = searchParams.get("category") || "iphones"
    const isPartsActive = currentCategory === "parts"
    const { cartCount, openCart } = useCart()

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass-panel">
            <div className="max-w-[1440px] mx-auto">
                {/* Top Bar */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-surface-highlight">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
                        <div className="flex items-center justify-center transition-transform group-hover:scale-105">
                            <Image
                                src="/logo-invictus.png"
                                alt="Invictus Phone"
                                width={44}
                                height={44}
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="flex flex-col leading-none">
                            <h1 className="font-heading font-bold text-lg sm:text-xl tracking-wide text-text-main">INVICTUS PHONE</h1>
                            <span className="font-mono text-[9px] sm:text-[10px] text-primary tracking-[0.2em] uppercase">Al Mayor</span>
                        </div>
                    </Link>

                    {/* Ticker (Hidden on mobile) */}
                    <div className="hidden md:flex flex-1 mx-12 overflow-hidden relative h-6 bg-surface-highlight/50 rounded border border-surface-highlight items-center liquid-glass">
                        <div className="whitespace-nowrap animate-ticker font-mono text-xs text-text-muted">
                            PRECIOS SUJETOS A CAMBIO // ACTUALIZADO HOY 09:00 AM // USD TASA DEL DÍA: 36.5 // NUEVO STOCK DE IPHONE 15 PRO MAX // ENVIOS A TODO EL PAÍS
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link href="/login" className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-main transition-colors group">
                            <UserCircle size={24} weight="regular" className="group-hover:text-primary transition-colors" />
                            <span className="hidden sm:inline">Ingresar</span>
                        </Link>

                        <button
                            onClick={openCart}
                            className="relative p-2 text-text-muted hover:text-primary transition-colors active:scale-95"
                            aria-label={`Abrir carrito${cartCount > 0 ? ` (${cartCount} productos)` : ''}`}
                        >
                            <ShoppingBag size={24} weight={cartCount > 0 ? "fill" : "regular"} className={cartCount > 0 ? "text-primary" : ""} />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-mono font-bold text-white shadow-neon">
                                    {cartCount > 99 ? "99+" : cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mega Tabs - Dynamic active state */}
                <div className="flex w-full border-b border-surface-highlight relative z-20">
                    <Link
                        href="/?category=iphones"
                        className={`flex-1 py-3 sm:py-4 text-center font-heading font-bold text-sm sm:text-lg transition-colors ${!isPartsActive
                                ? "text-primary border-b-2 border-primary bg-primary/10"
                                : "text-text-muted border-b-2 border-transparent hover:text-primary hover:border-secondary hover:bg-secondary/5"
                            }`}
                    >
                        IPHONES AL MAYOR
                    </Link>
                    <Link
                        href="/?category=parts"
                        className={`flex-1 py-3 sm:py-4 text-center font-heading font-bold text-sm sm:text-lg transition-colors ${isPartsActive
                                ? "text-primary border-b-2 border-primary bg-primary/10"
                                : "text-text-muted border-b-2 border-transparent hover:text-primary hover:border-secondary hover:bg-secondary/5"
                            }`}
                    >
                        REPUESTOS & PARTES
                    </Link>
                </div>
            </div>
        </header>
    )
}
