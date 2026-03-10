"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { X, ArrowCounterClockwise } from "@phosphor-icons/react"
import type { Product } from "@/lib/StoreContext"
import { useCart } from "@/lib/CartContext"

// iPhone silhouette fallback
function IPhoneSilhouetteLarge() {
  return (
    <svg viewBox="0 0 240 480" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bodyG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2C2C2E" />
          <stop offset="50%" stopColor="#1C1C1E" />
          <stop offset="100%" stopColor="#3A3A3C" />
        </linearGradient>
        <linearGradient id="screenG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0A0A0F" />
          <stop offset="100%" stopColor="#1A1A2E" />
        </linearGradient>
        <linearGradient id="limeG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#99CC00" stopOpacity="0.3" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Body */}
      <rect x="10" y="8" width="220" height="464" rx="36" fill="url(#bodyG)" />
      {/* Screen bezel */}
      <rect x="18" y="24" width="204" height="432" rx="28" fill="url(#screenG)" />
      {/* Dynamic Island */}
      <rect x="84" y="38" width="72" height="20" rx="10" fill="#0A0A0A" />
      {/* Front camera */}
      <circle cx="134" cy="48" r="5" fill="#1C1C1E" />
      <circle cx="134" cy="48" r="2" fill="#3A3A3C" />
      {/* Neon accent glow line */}
      <rect x="18" y="200" width="204" height="3" rx="1.5" fill="url(#limeG)" filter="url(#glow)" />
      {/* Home indicator */}
      <rect x="88" y="434" width="64" height="5" rx="2.5" fill="#3A3A3C" />
      {/* Side button */}
      <rect x="226" y="120" width="6" height="52" rx="3" fill="#3A3A3C" />
      {/* Volume buttons */}
      <rect x="8" y="116" width="6" height="32" rx="3" fill="#3A3A3C" />
      <rect x="8" y="158" width="6" height="32" rx="3" fill="#3A3A3C" />
      {/* Camera module */}
      <rect x="144" y="40" width="62" height="62" rx="18" fill="#1C1C1E" opacity="0.5" />
      <circle cx="162" cy="58" r="12" fill="#0A0A0A" />
      <circle cx="162" cy="58" r="7" fill="#1C1C1E" />
      <circle cx="185" cy="58" r="12" fill="#0A0A0A" />
      <circle cx="185" cy="58" r="7" fill="#1C1C1E" />
      <circle cx="162" cy="82" r="12" fill="#0A0A0A" />
      <circle cx="162" cy="82" r="7" fill="#1C1C1E" />
      {/* Screen content hint */}
      <rect x="36" y="120" width="168" height="12" rx="6" fill="#CCFF00" opacity="0.08" />
      <rect x="36" y="144" width="120" height="8" rx="4" fill="#CCFF00" opacity="0.05" />
      <rect x="36" y="162" width="144" height="8" rx="4" fill="#CCFF00" opacity="0.05" />
    </svg>
  )
}

interface ViewerContentProps {
  product: Product
  onClose: () => void
}

function ViewerContent({ product, onClose }: ViewerContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [imgError, setImgError] = useState(false)

  const rotateY = useMotionValue(20)
  const rotateX = useMotionValue(-8)

  const springRotateY = useSpring(rotateY, { stiffness: 120, damping: 20 })
  const springRotateX = useSpring(rotateX, { stiffness: 120, damping: 20 })

  const shadowX = useTransform(springRotateY, [-60, 60], [-30, 30])

  const lastX = useRef(0)
  const lastY = useRef(0)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true)
    lastX.current = e.clientX
    lastY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    const dx = e.clientX - lastX.current
    const dy = e.clientY - lastY.current
    lastX.current = e.clientX
    lastY.current = e.clientY
    rotateY.set(Math.max(-70, Math.min(70, rotateY.get() + dx * 0.5)))
    rotateX.set(Math.max(-30, Math.min(30, rotateX.get() + dy * 0.3)))
  }, [isDragging, rotateX, rotateY])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const lastTouchX = useRef(0)
  const lastTouchY = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    lastTouchX.current = e.touches[0].clientX
    lastTouchY.current = e.touches[0].clientY
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - lastTouchX.current
    const dy = e.touches[0].clientY - lastTouchY.current
    lastTouchX.current = e.touches[0].clientX
    lastTouchY.current = e.touches[0].clientY
    rotateY.set(Math.max(-70, Math.min(70, rotateY.get() + dx * 0.6)))
    rotateX.set(Math.max(-30, Math.min(30, rotateX.get() + dy * 0.3)))
  }, [rotateX, rotateY])

  // Auto-spin intro
  useEffect(() => {
    rotateY.set(20)
    rotateX.set(-8)
    const t1 = setTimeout(() => rotateY.set(-15), 400)
    const t2 = setTimeout(() => rotateY.set(20), 1200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [rotateX, rotateY])

  function handleReset() {
    rotateY.set(20)
    rotateX.set(-8)
  }

  const isPlaceholder = product.image.startsWith('placeholder:') || imgError

  return (
    <div
      className="relative pointer-events-auto flex flex-col items-center gap-6 w-full max-w-lg"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h3 className="font-heading font-bold text-white text-xl">{product.name}</h3>
          <p className="font-mono text-xs text-[#CCFF00] mt-0.5">
            {product.storage} · {product.condition === 'new' ? 'Nuevo' : product.condition === 'refurbished' ? 'Refurbished' : 'Usado'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            title="Resetear vista"
          >
            <ArrowCounterClockwise size={18} weight="bold" />
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>
      </div>

      {/* 3D Viewer */}
      <div
        ref={containerRef}
        className="relative flex items-center justify-center w-full"
        style={{ height: "420px", perspective: "800px", perspectiveOrigin: "50% 50%", cursor: isDragging ? "grabbing" : "grab" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* Floor reflection */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-12 rounded-full bg-[#CCFF00]/10 blur-3xl" />

        {/* Shadow */}
        <motion.div
          className="absolute bottom-4 left-1/2 rounded-full bg-black/50 blur-2xl"
          style={{ width: "160px", height: "30px", x: shadowX, translateX: "-50%" }}
        />

        {/* The 3D phone */}
        <motion.div
          style={{
            rotateY: springRotateY,
            rotateX: springRotateX,
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
          className="relative"
        >
          <div className="relative" style={{ transformStyle: "preserve-3d" }}>
            {isPlaceholder ? (
              <div className="w-[200px] h-[400px] drop-shadow-2xl">
                <IPhoneSilhouetteLarge />
              </div>
            ) : (
              <motion.img
                src={product.image}
                alt={product.name}
                onError={() => setImgError(true)}
                className="object-contain drop-shadow-2xl select-none"
                style={{ height: "400px", maxWidth: "220px", pointerEvents: "none" }}
                draggable={false}
              />
            )}

            {/* Right edge depth illusion */}
            <motion.div
              className="absolute top-[5%] right-[-10px] h-[90%] rounded-r-[16px]"
              style={{
                width: "10px",
                background: "linear-gradient(to right, rgba(80,80,80,0.6), rgba(40,40,40,0.3))",
                transform: "rotateY(90deg) translateZ(-5px)",
                transformOrigin: "left center",
                opacity: useTransform(springRotateY, [-10, 30], [0, 1]),
              }}
            />

            {/* Neon rim highlight */}
            <motion.div
              className="absolute inset-0 rounded-[32px] pointer-events-none"
              style={{
                boxShadow: useTransform(
                  springRotateY,
                  [-60, 0, 60],
                  [
                    "inset -4px 0 16px rgba(204,255,0,0.15), -8px 0 32px rgba(204,255,0,0.1)",
                    "inset 0 0 0 rgba(204,255,0,0)",
                    "inset 4px 0 16px rgba(204,255,0,0.15), 8px 0 32px rgba(204,255,0,0.1)",
                  ]
                ),
              }}
            />

            {/* Reflection overlay */}
            <div
              className="absolute inset-0 rounded-[32px] pointer-events-none"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)" }}
            />
          </div>
        </motion.div>
      </div>

      {/* Instructions */}
      <p className="text-white/40 text-xs font-mono text-center">
        Arrastra para rotar · Toca y desliza en móvil
      </p>

      {/* Price info */}
      {product.price > 0 && (
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between backdrop-blur-sm">
          <div>
            <p className="text-white/50 text-[10px] font-mono uppercase tracking-wider">Precio unitario</p>
            <p className="text-white font-mono font-bold text-2xl mt-1">${product.price.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-[10px] font-mono uppercase tracking-wider">Mínimo 3 unidades</p>
            <p className="text-[#CCFF00] font-mono font-bold text-2xl mt-1">
              ${(product.price * 3).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Global viewer — rendered at layout level, reads from CartContext
export function PhoneViewer3DGlobal() {
  const { viewer3DProduct, closeViewer3D } = useCart()

  return (
    <AnimatePresence>
      {viewer3DProduct && (
        <>
          {/* Backdrop */}
          <motion.div
            key="viewer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-xl"
            onClick={closeViewer3D}
          />

          {/* Viewer container */}
          <motion.div
            key="viewer-modal"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed inset-0 z-[71] flex items-center justify-center p-6 pointer-events-none"
          >
            <ViewerContent product={viewer3DProduct} onClose={closeViewer3D} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
