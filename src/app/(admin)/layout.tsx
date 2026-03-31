"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { ProductModal } from "@/components/modals/ProductModal"
import { List } from "@phosphor-icons/react"
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
        <div className="flex h-[100dvh] w-full overflow-hidden bg-[var(--surface)]">
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--background)]">
                {/* Mobile Header */}
                <header className="z-50 flex h-16 flex-shrink-0 items-center justify-between border-b border-[var(--surface-highlight)] bg-[var(--background)] px-6 lg:hidden">
                    <div className="flex gap-2 items-center">
                        <Image
                            src="/logo-invictus.png"
                            alt="Invictus Phone"
                            width={28}
                            height={28}
                            className="object-contain"
                            priority
                        />
                        <span className="font-heading text-sm font-bold tracking-tight text-[var(--foreground)]">INVICTUS PHONE</span>
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

                <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
                    {children}
                </div>
            </main>
            <ProductModal />
        </div>
    )
}
