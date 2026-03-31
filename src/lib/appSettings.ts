import type { AppSettings, InventoryHistoryEntry } from "@/lib/storeTypes"

export const DEFAULT_APP_SETTINGS: AppSettings = {
  tickerMessage: "PRECIOS SUJETOS A CAMBIO // ENVIOS A TODO EL PAIS",
  dailyRate: 36.5,
  autoLastInventoryChange: true,
  updatedAt: new Date(0).toISOString(),
  updatedBy: null,
}

export function normalizeAppSettings(settings?: Partial<AppSettings> | null): AppSettings {
  return {
    tickerMessage: settings?.tickerMessage?.trim() || DEFAULT_APP_SETTINGS.tickerMessage,
    dailyRate:
      typeof settings?.dailyRate === "number" && Number.isFinite(settings.dailyRate)
        ? settings.dailyRate
        : DEFAULT_APP_SETTINGS.dailyRate,
    autoLastInventoryChange:
      typeof settings?.autoLastInventoryChange === "boolean"
        ? settings.autoLastInventoryChange
        : DEFAULT_APP_SETTINGS.autoLastInventoryChange,
    updatedAt: settings?.updatedAt || DEFAULT_APP_SETTINGS.updatedAt,
    updatedBy: settings?.updatedBy ?? DEFAULT_APP_SETTINGS.updatedBy,
  }
}

export function formatDailyRate(value: number) {
  return value.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatTickerTimestamp(value: string) {
  return new Intl.DateTimeFormat("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Caracas",
  }).format(new Date(value))
}

export function buildTickerMessage({
  baseMessage,
  dailyRate,
  inventoryHistory,
  includeLastChange,
  updatedAt,
}: {
  baseMessage: string
  dailyRate: number
  inventoryHistory: InventoryHistoryEntry[]
  includeLastChange: boolean
  updatedAt: string
}) {
  const segments = [
    baseMessage.trim(),
    `ACTUALIZADO ${formatTickerTimestamp(updatedAt)}`,
    `USD TASA DEL DIA: ${formatDailyRate(dailyRate)}`,
  ]

  if (includeLastChange && inventoryHistory[0]?.note) {
    segments.push(`ULTIMO CAMBIO: ${inventoryHistory[0].note}`)
  }

  return segments.filter(Boolean).join(" // ")
}
