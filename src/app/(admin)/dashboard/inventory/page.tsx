"use client"

import { InventoryManagementView } from "@/components/admin/InventoryManagementView"
import { useStore } from "@/lib/StoreContext"

export default function InventoryDashboardPage() {
  const { products } = useStore()

  return (
    <InventoryManagementView
      countLabel="Total equipos"
      description="Vista global de inventario con todas las variantes ordenadas por modelo y capacidad."
      emptyMessage="No se encontraron productos con esos filtros."
      newButtonLabel="Nuevo producto"
      products={products}
      searchPlaceholder="Buscar en todo el inventario..."
      title="Inventario global"
    />
  )
}
