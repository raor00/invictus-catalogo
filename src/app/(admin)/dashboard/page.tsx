"use client"

import { InventoryManagementView } from "@/components/admin/InventoryManagementView"
import { useStore } from "@/lib/StoreContext"

export default function AdminDashboardPage() {
  const { products } = useStore()

  return (
    <InventoryManagementView
      countLabel="Total inventario"
      description="Administra iPhones y repuestos desde el dashboard principal con filtros por categoria, disponibilidad y edicion rapida."
      enableCategoryFilter
      emptyMessage="No se encontraron productos con esos filtros."
      newButtonLabel="Nuevo producto"
      products={products}
      searchPlaceholder="Buscar iPhone o repuesto..."
      title="Dashboard de inventario con edicion rapida"
    />
  )
}
