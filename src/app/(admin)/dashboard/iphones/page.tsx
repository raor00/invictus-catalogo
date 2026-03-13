"use client"

import { InventoryManagementView } from "@/components/admin/InventoryManagementView"
import { useStore } from "@/lib/StoreContext"

export default function IPhonesDashboardPage() {
    const { products } = useStore()

    // Filter only Smartphones
    const iphones = products.filter(p => p.category === 'Smartphones');
    return (
        <InventoryManagementView
            countLabel="Total equipos"
            description="Gestion centralizada de iPhones con la misma lista rapida del dashboard principal."
            emptyMessage="No se encontraron equipos registrados."
            newProductDetail={{ defaultCategory: "Smartphones" }}
            newButtonLabel="Nuevo iPhone"
            products={iphones}
            searchPlaceholder="Buscar por modelo..."
            title="Gestion de iPhones"
        />
    )
}
