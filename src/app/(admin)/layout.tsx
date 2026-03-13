"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { ProductModal } from "@/components/modals/ProductModal"
import { Lightning, List } from "@phosphor-icons/react"
import { useStore } from "@/lib/StoreContext"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const router = useRouter()
    const { isAuthenticated, isReady } = useStore()

    useEffect(() => {
        if (isReady && !isAuthenticated) {
            router.replace("/login")
        }
    }, [isAuthenticated, isReady, router])

    if (!isReady || !isAuthenticated) {
        return null
    }

    return (
        <div className="flex h-[100dvh] w-full overflow-hidden bg-surface">
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background relative w-full">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 flex items-center justify-between px-6 bg-background border-b border-surface-highlight z-50 flex-shrink-0">
                    <div className="flex gap-2 items-center">
                        <Lightning weight="fill" className="text-black text-2xl" />
                        <span className="font-heading font-bold text-sm tracking-tight text-black">MAYORISTA</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-text-muted hover:text-foreground"
                    >
                        <List size={24} />
                    </button>
                </header>

                {/* Header Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-surface-highlight/30 to-transparent pointer-events-none z-0"></div>

                <div className="flex-1 flex flex-col overflow-hidden relative z-10 w-full">
                    {children}
                </div>
            </main>
            <ProductModal />
        </div>
    )
}
