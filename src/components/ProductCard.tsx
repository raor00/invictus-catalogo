"use client"

import React, { useRef, useState, useEffect } from "react"
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion"
import { Plus, Minus, ShoppingBag, Cube, ArrowRight, X } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/Badge"
import type { Product } from "@/lib/StoreContext"
import { useCart } from "@/lib/CartContext"
import { MIN_ITEM_QUANTITY } from "@/lib/config"
import { getProductStatus, isProductAvailable } from "@/lib/productAvailability"

import { PhoneModel3D } from "./PhoneModel3D"

const statusConfig = {
  Disponible: { label: "Disponible", variant: "default" as const, pulse: true },
  "No disponible": { label: "No disponible", variant: "critical" as const, pulse: false },
}

const conditionLabel: Record<string, string> = {
  new: "Nuevo",
  refurbished: "Refurbished",
  used: "Usado",
}

export function ProductCard({ product }: { product: Product }) {
  const ref = useRef<HTMLDivElement>(null)
  const { addToCart, openCart, openViewer3D } = useCart()
  const [qty, setQty] = useState(MIN_ITEM_QUANTITY)
  const [showConfirm, setShowConfirm] = useState(false)

  // Mouse tracking for Spotlight effect only (no card tilt)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 })

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  const status = getProductStatus(product)
  const { label, variant, pulse } = statusConfig[status]
  const isUnavailable = !isProductAvailable(product)
  const metaTextClass = isUnavailable ? "text-text-muted dark:text-zinc-400" : "text-text-muted"
  const primaryTextClass = isUnavailable ? "text-foreground/75 dark:text-zinc-200" : "text-foreground"

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, qty)
    setShowConfirm(true)
  }

  function handleQtyDecrease(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setQty(q => Math.max(MIN_ITEM_QUANTITY, q - 1))
  }

  function handleQtyIncrease(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setQty(q => q + 1)
  }

  function handleImageClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    openViewer3D(product)
  }

  function handleGoToCart() {
    setShowConfirm(false)
    openCart()
  }

  function handleContinueShopping() {
    setShowConfirm(false)
  }

  // Auto-dismiss confirm after 8 seconds
  useEffect(() => {
    if (!showConfirm) return
    const t = setTimeout(() => setShowConfirm(false), 8000)
    return () => clearTimeout(t)
  }, [showConfirm])

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Post-add confirmation overlay */}
      {showConfirm && (
        <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/15">
              <ShoppingBag size={22} weight="fill" className="text-primary" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">¡Añadido al carrito!</p>
              <p className="text-white/50 text-xs mt-1">{qty} × {product.name}</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={handleGoToCart}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-strong"
              >
                Ir al Carrito
                <ArrowRight size={16} weight="bold" />
              </button>
              <button
                onClick={handleContinueShopping}
                className="w-full text-white/60 hover:text-white text-xs py-2 transition-colors"
              >
                Seguir comprando
              </button>
            </div>
            <button
              onClick={handleContinueShopping}
              className="absolute top-3 right-3 text-white/30 hover:text-white/70 transition-colors"
            >
              <X size={14} weight="bold" />
            </button>
          </div>
        </div>
      )}

      <motion.article
        onMouseMove={handleMouseMove}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-surface border border-surface-highlight hover:border-[#D2D2D7] transition-colors"
      >
        {/* Spotlight hover refraction */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                600px circle at ${springX}px ${springY}px,
                rgba(47, 91, 255, 0.08),
                transparent 80%
              )
            `,
          }}
        />

        {/* Image Area — clickable to open 3D viewer */}
        <div
          className="relative flex h-[110px] items-center justify-center bg-gradient-to-b from-[#F2F2F7] to-surface p-2 dark:from-[#1a1a1a] dark:to-[#161616] overflow-hidden cursor-pointer"
          onClick={handleImageClick}
        >
          {/* Glow */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-20 transition-opacity duration-500">
            <div className="w-16 h-16 rounded-full bg-primary blur-2xl" />
          </div>

          <motion.div
            className={`relative z-10 w-full h-full flex items-center justify-center transition-transform duration-500 max-h-[140px] px-4 py-2 ${isUnavailable ? "opacity-50 grayscale" : ""}`}
            whileHover={{ scale: 1.15 }}
          >
            <PhoneModel3D modelName={product.name} />
          </motion.div>

          {/* 3D hint — shows on hover */}
          <div className="absolute inset-0 flex items-end justify-center pb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20 pointer-events-none">
            <div className="bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center gap-1 text-white text-[9px] font-bold">
              <Cube size={9} weight="fill" className="text-primary" />
              3D
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-grow flex-col p-2 z-10 bg-surface dark:bg-[#161616]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 flex-wrap">
              <span className={`text-[8px] font-mono font-bold uppercase tracking-wide ${metaTextClass}`}>
                {conditionLabel[product.condition] ?? product.condition}
              </span>
              <span className="text-text-muted/30 dark:text-zinc-500">·</span>
              <span className={`font-mono text-[8px] ${metaTextClass}`}>{product.storage}</span>
            </div>
            <div className="scale-90 origin-right">
              <Badge variant={variant} pulse={pulse}>
                {label}
              </Badge>
            </div>
          </div>

          {/* Model name */}
          <h3 className={`font-heading text-[11px] font-bold leading-tight mb-1 ${primaryTextClass}`}>
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-auto pt-1.5 border-t border-surface-highlight">
            {product.price > 0 ? (
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[8px] font-bold uppercase text-text-muted">c/u</span>
                <span className={`font-mono text-xs font-bold ${primaryTextClass}`}>
                  ${product.price.toFixed(0)}
                </span>
              </div>
            ) : (
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[8px] font-bold uppercase text-text-muted">Precio</span>
                <span className="font-mono text-xs font-bold text-text-muted dark:text-zinc-300">—</span>
              </div>
            )}

            {/* Actions */}
            {isUnavailable ? (
              <div className="w-full rounded-lg border border-red-400/30 py-1 text-center text-[9px] font-bold text-red-500 dark:text-red-300">
                No disponible
              </div>
            ) : (
              <div className="flex flex-col gap-2" onClick={e => e.preventDefault()}>
                {/* Qty selector */}
                <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                  <span className="text-[8px] font-bold uppercase text-text-muted">Cant.</span>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={handleQtyDecrease}
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-surface-highlight text-text-muted transition-colors hover:border-primary hover:text-primary"
                    >
                      <Minus size={8} weight="bold" />
                    </button>
                    <span className="w-6 text-center font-mono text-[11px] font-bold text-foreground">{qty}</span>
                    <button
                      onClick={handleQtyIncrease}
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-surface-highlight text-text-muted transition-colors hover:border-primary hover:text-primary"
                    >
                      <Plus size={8} weight="bold" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-[10px] font-bold text-white transition-colors hover:bg-primary-strong active:scale-95 sm:text-[11px]"
                >
                  <ShoppingBag size={10} weight="fill" />
                  Añadir
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.article>
    </div>
  )
}
