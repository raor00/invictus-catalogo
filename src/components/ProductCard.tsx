"use client"

import React, { useRef } from "react"
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion"
import { ChatCircle, Prohibit } from "@phosphor-icons/react"
import Link from "next/link"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"

export interface Product {
    id: string
    name: string
    image: string
    specs: string[]
    price: number
    originalPrice?: number
    status: "available" | "low_stock" | "out_of_stock" | "part"
}

export function ProductCard({ product }: { product: Product }) {
    const ref = useRef<HTMLDivElement>(null)

    // Mouse tracking for fluid Spotlight/Refraction effect
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Spring physics for smooth hover feeling
    const springX = useSpring(mouseX, { stiffness: 100, damping: 20 })
    const springY = useSpring(mouseY, { stiffness: 100, damping: 20 })

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
    }

    const statusConfig = {
        available: { label: "Disponible", variant: "default" as const, pulse: true },
        low_stock: { label: "Pocas Unidades", variant: "warning" as const, pulse: false },
        out_of_stock: { label: "Agotado", variant: "critical" as const, pulse: false },
        part: { label: "Repuesto", variant: "secondary" as const, pulse: true },
    }

    const { label, variant, pulse } = statusConfig[product.status]

    const isSoldOut = product.status === "out_of_stock"

    return (
        <motion.article
            ref={ref}
            onMouseMove={handleMouseMove}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-surface border border-surface-highlight hover:border-[#D2D2D7] transition-colors"
            style={{
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            }}
        >
            {/* Spotlight Hover Effect */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${springX}px ${springY}px,
              rgba(204, 255, 0, 0.05),
              transparent 80%
            )
          `,
                }}
            />

            {/* Clickable Overlay */}
            <Link href={`/product/${product.id}`} className="absolute inset-0 z-10" prefetch={false}>
                <span className="sr-only">Ver detalle de {product.name}</span>
            </Link>

            {/* Badge */}
            <div className="absolute top-4 right-4 z-10">
                <Badge variant={variant} pulse={pulse}>
                    {label}
                </Badge>
            </div>

            {/* Image Area */}
            <div className="relative flex h-[240px] items-center justify-center bg-gradient-to-b from-[#F2F2F7] to-surface p-6 dark:from-[#111] dark:to-surface">
                <motion.img
                    src={product.image}
                    alt={product.name}
                    className={`h-full w-full object-contain drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-105 ${isSoldOut ? "opacity-60 grayscale" : ""
                        }`}
                />
            </div>

            {/* Content */}
            <div className="flex flex-grow flex-col p-6 z-10 bg-surface">
                <h3 className={`font-heading text-lg font-bold leading-tight ${isSoldOut ? "text-text-muted" : "text-foreground"}`}>
                    {product.name}
                </h3>

                {/* Specs Bento Tags */}
                <div className="mb-6 mt-3 flex flex-wrap gap-2">
                    {product.specs.map((spec, i) => (
                        <span
                            key={i}
                            className="rounded border border-surface-highlight bg-background px-2 py-1 font-mono text-xs text-text-muted"
                        >
                            {spec}
                        </span>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="mt-auto flex flex-col gap-4 border-t border-surface-highlight pt-5 relative z-20">
                    <div className="flex items-baseline justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                            Precio Mayorista
                        </span>
                        <div className="flex items-baseline gap-2">
                            {product.originalPrice && (
                                <span className="font-mono text-lg text-text-muted font-bold line-through decoration-critical">
                                    ${product.originalPrice.toFixed(2)}
                                </span>
                            )}
                            <span className={`font-mono text-2xl font-bold tracking-tight ${isSoldOut ? "text-text-muted" : "text-foreground"}`}>
                                ${product.price.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {isSoldOut ? (
                        <Button variant="critical" disabled className="w-full gap-2">
                            <Prohibit size={18} weight="bold" />
                            Sin Stock
                        </Button>
                    ) : (
                        <Button variant="outline" asChild className="w-full gap-2 group-hover:bg-primary group-hover:text-black">
                            <a
                                href={`https://wa.me/1234567890?text=Hola%20Invictus,%20me%20interesa:%20${encodeURIComponent(product.name)}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <ChatCircle size={18} weight="fill" className="text-current" />
                                Consultar
                            </a>
                        </Button>
                    )}
                </div>
            </div>
        </motion.article>
    )
}
