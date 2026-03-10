"use client"

import React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

interface PhoneModel3DProps {
    modelName: string
    className?: string
    disableInteractive?: boolean
}

export function PhoneModel3D({ modelName, className = "", disableInteractive = false }: PhoneModel3DProps) {
    // Parse model features
    const name = modelName.toLowerCase()
    const isPro = name.includes("pro")

    let cameraLayout: "pro" | "diagonal" | "vertical" | "pill" = "diagonal"

    if (isPro) {
        cameraLayout = "pro"
    } else if (name.includes("16")) {
        cameraLayout = "pill"
    } else if (name.includes("11") || name.includes("12")) {
        cameraLayout = "vertical"
    }

    // 3D Tilt Hook
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 })
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 })

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [15, -15])
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-15, 15])

    // Shine effect based on rotation
    const shineX = useTransform(mouseXSpring, [-0.5, 0.5], [100, -100])
    const shineY = useTransform(mouseYSpring, [-0.5, 0.5], [100, -100])

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (disableInteractive) return
        const rect = e.currentTarget.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const xPct = mouseX / width - 0.5
        const yPct = mouseY / height - 0.5
        x.set(xPct)
        y.set(yPct)
    }

    function handleMouseLeave() {
        if (disableInteractive) return
        x.set(0)
        y.set(0)
    }

    return (
        <div
            className={`relative flex items-center justify-center perspective-[1000px] ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ width: "100%", height: "100%" }}
        >
            <motion.div
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className="relative w-full h-full flex items-center justify-center drop-shadow-2xl"
            >
                <svg
                    viewBox="0 0 160 330"
                    className="w-full h-full drop-shadow-2xl max-h-[160px]"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        {/* Phone Base Gradients */}
                        <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            {isPro ? (
                                <>
                                    <stop offset="0%" stopColor="#8c8d8f" />
                                    <stop offset="50%" stopColor="#414245" />
                                    <stop offset="100%" stopColor="#252629" />
                                </>
                            ) : (
                                <>
                                    <stop offset="0%" stopColor="#3b3b3d" />
                                    <stop offset="100%" stopColor="#1c1c1e" />
                                </>
                            )}
                        </linearGradient>

                        <linearGradient id="backGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b3c3e" />
                            <stop offset="100%" stopColor="#1a1a1c" />
                        </linearGradient>

                        <linearGradient id="bumpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4a4a4c" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#2a2a2c" stopOpacity="0.6" />
                        </linearGradient>

                        <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#111" />
                            <stop offset="100%" stopColor="#000" />
                        </linearGradient>

                        <radialGradient id="flashGrad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#fdfbd3" />
                            <stop offset="50%" stopColor="#e3dfa4" />
                            <stop offset="100%" stopColor="#605c31" />
                        </radialGradient>

                        <filter id="blurShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" />
                        </filter>
                    </defs>

                    {/* Device Edge (Frame) */}
                    <rect x="18" y="16" width="124" height="268" rx="24" fill="url(#edgeGrad)" />

                    {/* Antenna lines */}
                    <rect x="18" y="45" width="2" height="6" fill="#111" opacity="0.6" />
                    <rect x="140" y="45" width="2" height="6" fill="#111" opacity="0.6" />
                    <rect x="18" y="240" width="2" height="6" fill="#111" opacity="0.6" />
                    <rect x="140" y="240" width="2" height="6" fill="#111" opacity="0.6" />

                    {/* Back Glass */}
                    <rect x="20" y="18" width="120" height="264" rx="22" fill="url(#backGrad)" />

                    {/* Apple Logo Placeholder */}
                    <path
                        d="M84.2 135.5c0-4.1 3.2-7.8 7.3-8.1-1.3-4.5-5.9-7-9.3-7.2-4-0.3-7.8 2.5-9.8 2.5-2.1 0-5.2-2.3-8.6-2.3-4.3 0.1-8.3 2.5-10.5 6.3-4.6 7.9-1.2 19.6 3.2 26 2.2 3.1 4.7 6.6 8 6.5 3.3-0.1 4.6-2.1 8.5-2.1 3.9 0 5.1 2.1 8.6 2.1 3.5 0 5.8-3.3 7.8-6.4 2.5-3.6 3.5-7.1 3.5-7.3-0.1-0.1-8.7-3.3-8.7-10m-1.7-18c1.8-2.1 3-5.1 2.6-8-2.6 0.1-5.8 1.8-7.7 3.9-1.6 1.8-3.1 4.9-2.7 7.7 2.9 0.2 5.9-1.5 7.8-3.6"
                        fill="#ffffff"
                        opacity="0.15"
                    />

                    {/* Camera Bump Map */}
                    {cameraLayout !== "pill" && (
                        <rect
                            x="26"
                            y="26"
                            width="54"
                            height="54"
                            rx="14"
                            fill="url(#bumpGrad)"
                            filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.5))"
                        />
                    )}

                    {cameraLayout === "pill" && (
                        <rect
                            x="30"
                            y="28"
                            width="36"
                            height="66"
                            rx="18"
                            fill="url(#bumpGrad)"
                            filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.6))"
                        />
                    )}

                    {/* Camera Lenses based on layout */}

                    {cameraLayout === "pro" && (
                        <>
                            {/* Lenses */}
                            <circle cx="40" cy="40" r="11" fill="url(#lensGrad)" stroke="#1c1c1e" strokeWidth="1.5" />
                            <circle cx="40" cy="66" r="11" fill="url(#lensGrad)" stroke="#1c1c1e" strokeWidth="1.5" />
                            <circle cx="64" cy="53" r="11" fill="url(#lensGrad)" stroke="#1c1c1e" strokeWidth="1.5" />
                            {/* Lens Inner Glass Reflections */}
                            <circle cx="39" cy="39" r="4" fill="#1e1e24" />
                            <circle cx="39" cy="65" r="4" fill="#1e1e24" />
                            <circle cx="63" cy="52" r="4" fill="#1e1e24" />

                            {/* LiDAR and Flash */}
                            <circle cx="64" cy="70" r="4" fill="#050505" />
                            <circle cx="64" cy="36" r="4" fill="url(#flashGrad)" />
                        </>
                    )}

                    {cameraLayout === "diagonal" && (
                        <>
                            {/* Lenses */}
                            <circle cx="40" cy="40" r="11" fill="url(#lensGrad)" stroke="#1c1c1e" strokeWidth="1.5" />
                            <circle cx="66" cy="66" r="11" fill="url(#lensGrad)" stroke="#1c1c1e" strokeWidth="1.5" />
                            {/* Lens Inner Glass Reflections */}
                            <circle cx="39" cy="39" r="4" fill="#1e1e24" />
                            <circle cx="65" cy="65" r="4" fill="#1e1e24" />

                            {/* Flash & Mic */}
                            <circle cx="66" cy="38" r="4" fill="url(#flashGrad)" />
                            <circle cx="38" cy="68" r="1.5" fill="#000" />
                        </>
                    )}

                    {cameraLayout === "vertical" && (
                        <>
                            {/* Lenses */}
                            <circle cx="40" cy="40" r="11" fill="url(#lensGrad)" stroke="#1c1c1e" strokeWidth="1.5" />
                            <circle cx="40" cy="66" r="11" fill="url(#lensGrad)" stroke="#1c1c1e" strokeWidth="1.5" />
                            {/* Lens Inner Glass Reflections */}
                            <circle cx="39" cy="39" r="4" fill="#1e1e24" />
                            <circle cx="39" cy="65" r="4" fill="#1e1e24" />

                            {/* Flash & Mic */}
                            <circle cx="64" cy="53" r="4" fill="url(#flashGrad)" />
                            <circle cx="64" cy="65" r="1.5" fill="#000" />
                        </>
                    )}

                    {cameraLayout === "pill" && (
                        <>
                            {/* Pill inner bounds */}
                            <rect x="34" y="32" width="28" height="58" rx="14" fill="#111" opacity="0.3" />
                            {/* Lenses */}
                            <circle cx="48" cy="46" r="10" fill="url(#lensGrad)" stroke="#1c1c1e" strokeWidth="1.5" />
                            <circle cx="48" cy="74" r="10" fill="url(#lensGrad)" stroke="#1c1c1e" strokeWidth="1.5" />
                            {/* Flash mapped outside pill like iPhone 16 base */}
                            <circle cx="76" cy="60" r="4" fill="url(#flashGrad)" />
                        </>
                    )}

                    {/* Dynamic Light Reflection Layer */}
                    <motion.div style={{ x: shineX, y: shineY }} className="mix-blend-overlay">
                        <svg viewBox="0 0 160 330" className="w-full h-full absolute inset-0 pointer-events-none">
                            <rect
                                x="-100"
                                y="-100"
                                width="360"
                                height="500"
                                fill="url(#shineGrad)"
                                style={{ mixBlendMode: 'overlay' }}
                            />
                            <defs>
                                <linearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                                    <stop offset="40%" stopColor="#ffffff" stopOpacity="0.03" />
                                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
                                    <stop offset="60%" stopColor="#ffffff" stopOpacity="0.03" />
                                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </motion.div>
                </svg>
            </motion.div>
        </div>
    )
}
