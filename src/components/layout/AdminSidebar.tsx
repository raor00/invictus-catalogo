"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useStore } from "@/lib/StoreContext"
import { cn } from "@/components/ui/Button"

const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { name: "iPhones", href: "/dashboard/iphones", icon: "smartphone" },
    { name: "Repuestos", href: "/dashboard/parts", icon: "build" },
    { name: "Inventario", href: "/dashboard/inventory", icon: "inventory_2" },
]

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { logout } = useStore()

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[60] lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "fixed inset-y-0 left-0 z-[70] w-[280px] bg-background border-r border-surface-highlight flex flex-col justify-between transition-transform duration-300 lg:relative lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col gap-6 p-6">
                    {/* Brand & Close Button */}
                    <div className="flex justify-between items-center">
                        <div className="flex gap-3 items-center">
                            <span className="material-symbols-outlined text-black text-4xl">bolt</span>
                            <div className="flex flex-col">
                                <span className="font-heading font-bold text-xl tracking-tight leading-none text-black">INVICTUS</span>
                                <span className="font-mono text-black text-[8px] tracking-[0.3em] leading-none mt-1 font-bold">MAYORISTA</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="lg:hidden text-text-muted hover:text-foreground"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-1 mt-4">
                        {navLinks.map((link) => {
                            const isActive = link.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname.startsWith(link.href)
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-r-lg group transition-all",
                                        isActive
                                            ? "bg-primary/10 border-l-2 border-primary text-foreground"
                                            : "text-text-muted hover:text-foreground hover:bg-surface-highlight/30"
                                    )}
                                >
                                    <span className={cn(
                                        "material-symbols-outlined text-[20px]",
                                        isActive ? "text-primary" : "group-hover:text-foreground transition-colors"
                                    )} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                                        {link.icon}
                                    </span>
                                    <span className="text-sm font-medium font-heading tracking-wide">{link.name}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom Settings & User */}
                <div className="p-4 border-t border-surface-highlight flex flex-col gap-2">
                    <Link
                        href="/dashboard/settings"
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
                            pathname === "/dashboard/settings"
                                ? "bg-primary/10 border-l-2 border-primary text-foreground"
                                : "text-text-muted hover:text-foreground hover:bg-surface-highlight/30"
                        )}
                    >
                        <span className={cn(
                            "material-symbols-outlined text-[20px]",
                            pathname === "/dashboard/settings" ? "text-primary" : "group-hover:text-foreground"
                        )} style={{ fontVariationSettings: pathname === "/dashboard/settings" ? "'FILL' 1" : "'FILL' 0" }}>
                            settings
                        </span>
                        <span className="text-sm font-medium font-heading tracking-wide">Configuración</span>
                    </Link>

                    <div
                        className="flex items-center gap-3 px-4 py-3 mt-2 rounded-lg bg-surface border border-surface-highlight hover:border-text-muted transition-colors cursor-pointer active:scale-95"
                        onClick={handleLogout}
                        title="Cerrar sesión"
                    >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold font-mono text-white shadow-inner">
                            AD
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-foreground text-sm font-medium leading-none">Admin User</span>
                            <span className="text-text-muted text-xs mt-1">Manager</span>
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-text-muted group-hover:text-critical transition-colors">
                            logout
                        </span>
                    </div>
                </div>
            </aside>
        </>
    )
}
