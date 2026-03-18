export type ProductStatus = "Disponible" | "No disponible" | "Pocas Unidades" | "Agotado"
export type ProductCondition = "used" | "refurbished" | "new"
export type ProductColorId = string

export type Product = {
  id: string
  name: string
  sku: string
  storage: string
  condition: ProductCondition
  price: number
  stock: number
  image: string
  category: string
  status: ProductStatus
  isAvailable?: boolean
  availableColors?: ProductColorId[]
}

export type InventoryHistoryAction = "create" | "update" | "sale" | "delete"

export type InventoryHistoryEntry = {
  id: string
  productId: string
  productName: string
  sku: string
  storage: string
  category: string
  action: InventoryHistoryAction
  createdAt: string
  timezone: "America/Caracas"
  userEmail: string | null
  previousStock: number
  nextStock: number
  stockDelta: number
  previousPrice: number
  nextPrice: number
  priceDelta: number
  previousIsAvailable: boolean
  nextIsAvailable: boolean
  note: string
}

export type OrderCustomer = {
  nombre: string
  cedula: string
  telefono: string
}

export type PlaceOrderItem = {
  productId: string
  quantity: number
  product: Product
}

export type PlaceOrderInput = {
  customer: OrderCustomer
  items: PlaceOrderItem[]
  total: number
  channel: "whatsapp"
}

export type StoredOrderItem = {
  productId: string
  name: string
  sku: string
  storage: string
  condition: ProductCondition
  unitPrice: number
  quantity: number
  subtotal: number
}

export type StoredOrder = {
  id: string
  customer: OrderCustomer
  items: StoredOrderItem[]
  total: number
  totalQuantity: number
  channel: "whatsapp"
  status: "pending"
  createdAt: string
}
