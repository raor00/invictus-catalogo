"use client"

import React, { useRef, useState, useEffect } from "react"
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion"
import { Prohibit, Plus, Minus, ShoppingBag, Cube, ArrowRight, X } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import type { Product } from "@/lib/StoreContext"
import { useCart } from "@/lib/CartContext"
import { MIN_ORDER_QUANTITY } from "@/lib/config"

// iPhone SVG silhouette for placeholder images
function IPhoneSilhouette() {
  return (
    <svg
      viewBox="0 0 120 240"
      className="w-full h-full"
      style={{ maxHeight: "180px", maxWidth: "90px" }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="phoneGradC" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1D1D1F" />
          <stop offset="100%" stopColor="#3A3A3C" />
        </linearGradient>
        <linearGradient id="screenGradC" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0A0A0A" />
          <stop offset="100%" stopColor="#1A1A2E" />
        </linearGradient>
        <linearGradient id="limeGradC" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#99CC00" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <rect x="5" y="4" width="110" height="232" rx="22" fill="url(#phoneGradC)" />
      <rect x="10" y="16" width="100" height="208" rx="14" fill="url(#screenGradC)" />
      <rect x="40" y="22" width="40" height="10" rx="5" fill="#0A0A0A" />
      <rect x="41" y="214" width="38" height="5" rx="2.5" fill="#3A3A3C" />
      <rect x="10" y="106" width="100" height="2" rx="1" fill="url(#limeGradC)" opacity="0.5" />
      <rect x="111" y="68" width="4" height="28" rx="2" fill="#2C2C2E" />
      <rect x="5" y="66" width="4" height="18" rx="2" fill="#2C2C2E" />
      <rect x="5" y="90" width="4" height="18" rx="2" fill="#2C2C2E" />
    </svg>
  )
}

const statusConfig = {
  Disponible: { label: "Disponible", variant: "default" as const, pulse: true },
  "Pocas Unidades": { label: "Pocas Unidades", variant: "warning" as const, pulse: false },
  Agotado: { label: "Agotado", variant: "critical" as const, pulse: false },
}

const conditionLabel: Record<string, string> = {
  new: "Nuevo",
  refurbished: "Refurbished",
  used: "Usado",
}

export function ProductCard({ product }: { product: Product }) {
  const ref = useRef<HTMLDivElement>(null)
  const { addToCart, openCart, openViewer3D } = useCart()
  const [qty, setQty] = useState(MIN_ORDER_QUANTITY)
  const [imgError, setImgError] = useState(false)
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

  const status = product.status as keyof typeof statusConfig
  const { label, variant, pulse } = statusConfig[status] ?? statusConfig["Agotado"]
  const isSoldOut = product.status === "Agotado"
  const isPlaceholder = product.image.startsWith("placeholder:") || imgError

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, qty)
    setShowConfirm(true)
  }

  function handleQtyDecrease(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setQty(q => Math.max(MIN_ORDER_QUANTITY, q - 1))
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
            <div className="w-12 h-12 rounded-full bg-[#CCFF00]/20 border border-[#CCFF00]/40 flex items-center justify-center">
              <ShoppingBag size={22} weight="fill" className="text-[#CCFF00]" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">¡Añadido al carrito!</p>
              <p className="text-white/50 text-xs mt-1">{qty} × {product.name}</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={handleGoToCart}
                className="w-full flex items-center justify-center gap-2 bg-[#CCFF00] text-black text-sm font-bold py-2.5 px-4 rounded-xl hover:bg-[#d4ff33] transition-colors"
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
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-surface border border-surface-highlight hover:border-[#D2D2D7] transition-colors"
      >
        {/* Spotlight hover refraction */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                600px circle at ${springX}px ${springY}px,
                rgba(204, 255, 0, 0.07),
                transparent 80%
              )
            `,
          }}
        />

        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-20">
          <Badge variant={variant} pulse={pulse}>
            {label}
          </Badge>
        </div>

        {/* Condition Badge */}
        <div className="absolute top-3 left-3 z-20">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-text-muted border border-surface-highlight">
            {conditionLabel[product.condition] ?? product.condition}
          </span>
        </div>

        {/* Image Area — clickable to open 3D viewer */}
        <div
          className="relative flex h-[220px] items-center justify-center bg-gradient-to-b from-[#F2F2F7] to-surface p-6 dark:from-[#111] dark:to-surface overflow-hidden cursor-pointer"
          onClick={handleImageClick}
        >
          {/* Glow behind image */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-25 transition-opacity duration-700">
            <div className="w-32 h-32 rounded-full bg-primary blur-3xl" />
          </div>

          {/* 3D hint overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <div className="bg-black/40 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 text-white text-xs font-bold shadow-lg">
              <Cube size={16} weight="fill" className="text-[#CCFF00]" />
              Ver en 3D
            </div>
          </div>

          {isPlaceholder ? (
            <motion.div
              className={`relative z-10 flex items-center justify-center transition-transform duration-700 ease-out group-hover:scale-105 ${isSoldOut ? "opacity-50 grayscale" : ""}`}
              style={{ height: "170px" }}
            >
              <IPhoneSilhouette />
            </motion.div>
          ) : (
            <motion.img
              src={product.image}
              alt={product.name}
              onError={() => setImgError(true)}
              className={`h-full w-full object-contain drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-105 relative z-10 select-none ${isSoldOut ? "opacity-60 grayscale" : ""}`}
              draggable={false}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-grow flex-col p-4 z-10 bg-surface">
          {/* Model name */}
          <h3 className={`font-heading text-base font-bold leading-tight ${isSoldOut ? "text-text-muted" : "text-foreground"}`}>
            {product.name}
          </h3>

          {/* Spec tags */}
          <div className="mt-2 mb-3 flex flex-wrap gap-1.5">
            <span className="rounded border border-surface-highlight bg-background px-2 py-0.5 font-mono text-xs text-text-muted">
              {product.storage}
            </span>
            {product.stock > 0 && (
              <span className="rounded border border-surface-highlight bg-background px-2 py-0.5 font-mono text-xs text-text-muted">
                {product.stock} uds. disponibles
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto flex flex-col gap-3 border-t border-surface-highlight pt-3">
            {/* Price block */}
            {product.price > 0 ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Precio c/u
                  </span>
                  <span className={`font-mono text-xl font-bold tracking-tight ${isSoldOut ? "text-text-muted" : "text-foreground"}`}>
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Mínimo 3 uds.
                  </span>
                  <span className="font-mono text-sm font-bold text-primary">
                    ${(product.price * 3).toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Precio</span>
                <span className="font-mono text-xl font-bold text-text-muted">—</span>
              </div>
            )}

            {/* Actions */}
            {isSoldOut ? (
              <Button variant="critical" disabled className="w-full gap-2 text-sm">
                <Prohibit size={16} weight="bold" />
                Agotado
              </Button>
            ) : (
              <div className="flex flex-col gap-2" onClick={e => e.preventDefault()}>
                {/* Quantity selector */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    Cant. (mín. {MIN_ORDER_QUANTITY})
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleQtyDecrease}
                      className="w-7 h-7 rounded border border-surface-highlight hover:border-primary flex items-center justify-center text-text-muted hover:text-primary transition-colors active:scale-95"
                    >
                      <Minus size={12} weight="bold" />
                    </button>
                    <span className="w-7 text-center font-mono text-sm font-bold text-foreground">
                      {qty}
                    </span>
                    <button
                      onClick={handleQtyIncrease}
                      className="w-7 h-7 rounded border border-surface-highlight hover:border-primary flex items-center justify-center text-text-muted hover:text-primary transition-colors active:scale-95"
                    >
                      <Plus size={12} weight="bold" />
                    </button>
                  </div>
                </div>

                {/* Subtotal hint */}
                {product.price > 0 && (
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-text-muted">
                      Subtotal: <span className="text-foreground font-bold">${(product.price * qty).toFixed(2)}</span>
                    </span>
                  </div>
                )}

                {/* Add to cart button */}
                <Button
                  variant="default"
                  className="w-full gap-2 text-sm"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag size={16} weight="fill" />
                  Añadir al Carrito
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.article>
    </div>
  )
}
