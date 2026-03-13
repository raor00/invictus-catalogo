"use client"

import { InventoryManagementView } from "@/components/admin/InventoryManagementView"
import { useStore } from "@/lib/StoreContext"

export default function PartsDashboardPage() {
    const { products } = useStore()

    // Filter only Repuestos
    const parts = products.filter(p => p.category === 'Repuestos');
    return (
        <InventoryManagementView
            countLabel="Total repuestos"
            description="Los repuestos usan la misma lista compacta y editable del dashboard principal."
            emptyMessage="No se encontraron repuestos registrados."
            newProductDetail={{ defaultCategory: "Repuestos" }}
            newButtonLabel="Nuevo repuesto"
            products={parts}
            searchPlaceholder="Buscar repuesto..."
            title="Gestion de repuestos"
        />
    )
}
