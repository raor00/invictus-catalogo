import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { ProductModal } from "@/components/modals/ProductModal"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-[100dvh] w-full overflow-hidden bg-surface">
            <AdminSidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background relative">
                {/* Header Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-surface-highlight/30 to-transparent pointer-events-none z-0"></div>
                {children}
            </main>
            <ProductModal />
        </div>
    )
}
