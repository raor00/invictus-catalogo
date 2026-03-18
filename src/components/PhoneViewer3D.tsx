"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { X, ArrowCounterClockwise } from "@phosphor-icons/react"
import type { Product } from "@/lib/StoreContext"
import { useCart } from "@/lib/CartContext"

import { PhoneModel3D } from "./PhoneModel3D"

interface ViewerContentProps {
  product: Product
  onClose: () => void
}

function ViewerContent({ product, onClose }: ViewerContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

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



  return (
    <div
      className="relative pointer-events-auto flex flex-col items-center gap-4 sm:gap-6 w-full max-w-lg"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h3 className="font-heading font-bold text-white text-xl">{product.name}</h3>
          <p className="mt-0.5 font-mono text-xs text-primary">
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
        style={{ height: "min(420px, 50vh)", perspective: "800px", perspectiveOrigin: "50% 50%", cursor: isDragging ? "grabbing" : "grab" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* Floor reflection */}
        <div className="absolute bottom-0 left-1/2 h-12 w-48 -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />

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
            <div className="w-[140px] sm:w-[200px] h-[280px] sm:h-[400px] drop-shadow-2xl">
              <PhoneModel3D modelName={product.name} disableInteractive className="pointer-events-none" />
            </div>

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
                    "inset -4px 0 16px rgba(79,167,116,0.16), -8px 0 32px rgba(79,167,116,0.1)",
                    "inset 0 0 0 rgba(79,167,116,0)",
                    "inset 4px 0 16px rgba(79,167,116,0.16), 8px 0 32px rgba(79,167,116,0.1)",
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
            <p className="mt-1 font-mono text-2xl font-bold text-primary">
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
            className="fixed inset-0 z-[71] flex items-center justify-center p-4 sm:p-6 pointer-events-none overflow-y-auto"
          >
            <ViewerContent product={viewer3DProduct} onClose={closeViewer3D} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
