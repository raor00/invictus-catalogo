// Configuración global de la tienda mayorista
export const WHATSAPP_NUMBER = "584249409783"
export const MIN_ITEM_QUANTITY = 1
export const MIN_ORDER_TOTAL_QUANTITY = 3
export const APP_NAME = "VENTAS AL MAYOR"

export function getWhatsAppUrl(message?: string) {
  const baseUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}`

  if (!message) {
    return baseUrl
  }

  return `${baseUrl}&text=${encodeURIComponent(message)}`
}
