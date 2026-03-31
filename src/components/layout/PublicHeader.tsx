"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { UserCircle, ShoppingBag } from "@phosphor-icons/react"
import { useCart } from "@/lib/CartContext"
import { buildTickerMessage } from "@/lib/appSettings"
import { useStore } from "@/lib/StoreContext"
import { ThemeSwitch } from "@/components/ui/ThemeSwitch"

export function PublicHeader() {
    const searchParams = useSearchParams()
    const currentCategory = searchParams.get("category") || "iphones"
    const isPartsActive = currentCategory === "parts"
    const { cartCount, openCart } = useCart()
    const { appSettings, inventoryHistory } = useStore()
    const tickerMessage = buildTickerMessage({
        baseMessage: appSettings.tickerMessage,
        dailyRate: appSettings.dailyRate,
        inventoryHistory,
        includeLastChange: appSettings.autoLastInventoryChange,
        updatedAt: appSettings.updatedAt,
    })

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass-panel">
            <div className="max-w-[1440px] mx-auto">
                {/* Top Bar */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--glass-border)]">

                    {/* Logo — más grande, con imagen y texto en columna */}
                    <Link href="/" className="flex items-center gap-3 sm:gap-4 group">
                        <div className="relative flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                            <Image
                                src="/logo-invictus.png"
                                alt="Invictus Phone"
                                width={64}
                                height={64}
                                className="object-contain dark:invert"
                                priority
                            />
                        </div>
                        <div className="flex flex-col leading-none gap-0.5">
                            <h1 className="font-heading font-black text-xl sm:text-2xl tracking-widest text-[var(--foreground)] uppercase">
                                INVICTUS PHONE
                            </h1>
                            <span className="font-mono text-[10px] sm:text-[11px] text-primary tracking-[0.3em] uppercase font-bold">
                                Al Mayor
                            </span>
                        </div>
                    </Link>

                    {/* Ticker (Hidden on mobile) */}
                    <div className="hidden md:flex flex-1 mx-10 overflow-hidden relative h-6 rounded border border-[var(--glass-border)] items-center liquid-glass">
                        <div className="whitespace-nowrap animate-ticker font-mono text-xs text-[var(--text-muted)]">
                            {`${tickerMessage} // ${tickerMessage}`}
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-2 sm:gap-3">

                        {/* Theme Switch */}
                        <ThemeSwitch />

                        <Link
                            href="/login"
                            className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors group"
                        >
                            <UserCircle size={22} weight="regular" className="group-hover:text-primary transition-colors" />
                            <span className="hidden sm:inline">Ingresar</span>
                        </Link>

                        <button
                            onClick={openCart}
                            className="relative p-2 text-[var(--text-muted)] hover:text-primary transition-colors active:scale-95"
                            aria-label={`Abrir carrito${cartCount > 0 ? ` (${cartCount} productos)` : ''}`}
                        >
                            <ShoppingBag size={22} weight={cartCount > 0 ? "fill" : "regular"} className={cartCount > 0 ? "text-primary" : ""} />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-mono font-bold text-white shadow-neon">
                                    {cartCount > 99 ? "99+" : cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mega Tabs */}
                <div className="flex w-full border-b border-[var(--glass-border)] relative z-20">
                    <Link
                        href="/?category=iphones"
                        className={`flex-1 py-3 sm:py-4 text-center font-heading font-bold text-sm sm:text-base tracking-wider transition-colors ${
                            !isPartsActive
                                ? "text-primary border-b-2 border-primary bg-primary/10"
                                : "text-[var(--text-muted)] border-b-2 border-transparent hover:text-primary hover:bg-primary/5"
                        }`}
                    >
                        IPHONES AL MAYOR
                    </Link>
                    <Link
                        href="/?category=parts"
                        className={`flex-1 py-3 sm:py-4 text-center font-heading font-bold text-sm sm:text-base tracking-wider transition-colors ${
                            isPartsActive
                                ? "text-primary border-b-2 border-primary bg-primary/10"
                                : "text-[var(--text-muted)] border-b-2 border-transparent hover:text-primary hover:bg-primary/5"
                        }`}
                    >
                        REPUESTOS & PARTES
                    </Link>
                </div>
            </div>
        </header>
    )
}
