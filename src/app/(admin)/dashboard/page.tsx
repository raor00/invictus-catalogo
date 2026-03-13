"use client"

import { InventoryManagementView } from "@/components/admin/InventoryManagementView"
import { useStore } from "@/lib/StoreContext"

export default function AdminDashboardPage() {
  const { products } = useStore()

  return (
    <InventoryManagementView
      countLabel="Total equipos"
      description="Ajusta precio, stock y disponibilidad directo desde la lista principal. El catalogo publico solo muestra disponible o no disponible."
      emptyMessage="No se encontraron productos con esos filtros."
      newButtonLabel="Nuevo producto"
      products={products}
      searchPlaceholder="Buscar por producto..."
      statsFilter={(product) => product.category !== "Repuestos"}
      title="Dashboard de inventario con edicion rapida"
    />
  )
}
