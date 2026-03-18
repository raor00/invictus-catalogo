"use client"

import React, { useMemo, useState } from "react"
import { ChartBar, ClockCounterClockwise, DownloadSimple, Package, TrendDown, TrendUp } from "@phosphor-icons/react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Button } from "@/components/ui/Button"
import { formatInventoryHistoryDate, formatInventoryHistoryDelta } from "@/lib/inventoryHistory"
import { useStore } from "@/lib/StoreContext"
import { isProductAvailable } from "@/lib/productAvailability"

function getModelTotals(products: ReturnType<typeof useStore>["products"]) {
  return Object.entries(
    products.reduce<Record<string, number>>((acc, product) => {
      acc[product.name] = (acc[product.name] ?? 0) + product.stock
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])
}

export function ReportsView() {
  const { inventoryHistory, products } = useStore()
  const [isExporting, setIsExporting] = useState(false)

  const totalUnits = products.reduce((acc, product) => acc + product.stock, 0)
  const totalInventoryValue = products.reduce((acc, product) => acc + product.price * product.stock, 0)
  const availableVariants = products.filter((product) => isProductAvailable(product)).length
  const modelTotals = useMemo(() => getModelTotals(products), [products])
  const topModel = modelTotals[0]
  const stockReductions = inventoryHistory
    .filter((entry) => entry.stockDelta < 0)
    .slice(0, 8)
  const recentChanges = inventoryHistory.slice(0, 12)

  async function handleExportPdf() {
    setIsExporting(true)

    try {
      const pdf = new jsPDF({ unit: "pt", format: "a4" })
      const generatedAt = new Intl.DateTimeFormat("es-VE", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "America/Caracas",
      }).format(new Date())

      pdf.setFontSize(22)
      pdf.text("Reporte de inventario mayorista", 40, 48)
      pdf.setFontSize(10)
      pdf.setTextColor(110)
      pdf.text(`Generado: ${generatedAt} (Venezuela)`, 40, 68)

      const kpis = [
        ["Total equipos", `${totalUnits}`],
        ["Variantes disponibles", `${availableVariants}`],
        ["Modelo con mayor stock", topModel ? `${topModel[0]} (${topModel[1]})` : "Sin datos"],
        [
          "Valor inventario",
          `$${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ],
      ]

      autoTable(pdf, {
        startY: 88,
        body: kpis,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 8 },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 170 },
          1: { cellWidth: 330 },
        },
      })

      autoTable(pdf, {
        startY: (pdf as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY
          ? (pdf as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26
          : 220,
        head: [["Fecha", "Producto", "Cambio", "Usuario"]],
        body: recentChanges.map((entry) => [
          formatInventoryHistoryDate(entry.createdAt),
          `${entry.productName} ${entry.storage}`,
          `${entry.previousStock} -> ${entry.nextStock} (${formatInventoryHistoryDelta(entry.stockDelta)})`,
          entry.userEmail ?? "sistema",
        ]),
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [47, 91, 255] },
      })

      autoTable(pdf, {
        startY: (pdf as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY
          ? (pdf as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26
          : 430,
        head: [["Fecha", "Producto", "Antes", "Ahora", "Delta"]],
        body: stockReductions.map((entry) => [
          formatInventoryHistoryDate(entry.createdAt),
          `${entry.productName} ${entry.storage}`,
          `${entry.previousStock}`,
          `${entry.nextStock}`,
          formatInventoryHistoryDelta(entry.stockDelta),
        ]),
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [36, 71, 204] },
      })

      pdf.save("reporte-inventario-mayorista.pdf")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
        <section className="rounded-[2rem] border border-surface-highlight bg-surface p-6 shadow-glass sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-text-muted">
                Analitica operativa
              </p>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Reportes y trazabilidad de inventario
              </h2>
              <p className="mt-3 text-sm text-text-muted sm:text-base">
                Exporta un PDF con KPIs, revisa el modelo con mayor stock y consulta cada movimiento
                guardado del inventario con fecha y hora de Venezuela.
              </p>
            </div>

            <Button className="gap-2 text-xs sm:text-sm" disabled={isExporting} onClick={() => void handleExportPdf()}>
              <DownloadSimple size={16} weight="bold" />
              {isExporting ? "Generando PDF..." : "Exportar PDF"}
            </Button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-[1.6rem] border border-surface-highlight bg-background px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/15 p-3 text-primary">
                  <Package size={20} weight="fill" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-text-muted">
                    Total equipos
                  </p>
                  <p className="font-mono text-3xl font-bold text-foreground">{totalUnits}</p>
                </div>
              </div>
            </article>
            <article className="rounded-[1.6rem] border border-surface-highlight bg-background px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/15 p-3 text-primary">
                  <ChartBar size={20} weight="fill" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-text-muted">
                    Variantes activas
                  </p>
                  <p className="font-mono text-3xl font-bold text-foreground">{availableVariants}</p>
                </div>
              </div>
            </article>
            <article className="rounded-[1.6rem] border border-surface-highlight bg-background px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/15 p-3 text-primary">
                  <TrendUp size={20} weight="bold" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-text-muted">
                    Mayor stock
                  </p>
                  <p className="truncate font-heading text-lg font-bold text-foreground">
                    {topModel?.[0] ?? "Sin datos"}
                  </p>
                  <p className="text-xs text-text-muted">{topModel ? `${topModel[1]} unidades` : "Sin inventario"}</p>
                </div>
              </div>
            </article>
            <article className="rounded-[1.6rem] border border-surface-highlight bg-background px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/15 p-3 text-primary">
                  <ClockCounterClockwise size={20} weight="bold" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-text-muted">
                    Movimientos
                  </p>
                  <p className="font-mono text-3xl font-bold text-foreground">{inventoryHistory.length}</p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <article className="rounded-[2rem] border border-surface-highlight bg-surface p-5 shadow-glass sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <TrendDown size={18} className="text-critical" weight="bold" />
              <h3 className="font-heading text-xl font-bold text-foreground">Reducciones recientes</h3>
            </div>
            <div className="space-y-3">
              {stockReductions.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-surface-highlight bg-background px-4 py-8 text-sm text-text-muted">
                  Aun no hay reducciones registradas.
                </p>
              ) : (
                stockReductions.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-surface-highlight bg-background px-4 py-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-heading text-base font-bold text-foreground">
                          {entry.productName} {entry.storage}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">{formatInventoryHistoryDate(entry.createdAt)}</p>
                      </div>
                      <div className="rounded-full bg-critical/10 px-3 py-1 text-xs font-mono font-bold uppercase tracking-[0.18em] text-critical">
                        {formatInventoryHistoryDelta(entry.stockDelta)}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-text-muted">
                      Antes: <span className="font-mono font-bold text-foreground">{entry.previousStock}</span>
                      {" · "}
                      Ahora: <span className="font-mono font-bold text-foreground">{entry.nextStock}</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-[2rem] border border-surface-highlight bg-surface p-5 shadow-glass sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <ClockCounterClockwise size={18} className="text-primary" weight="bold" />
              <h3 className="font-heading text-xl font-bold text-foreground">Historial interno</h3>
            </div>
            <div className="space-y-3">
              {recentChanges.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-surface-highlight bg-background px-4 py-8 text-sm text-text-muted">
                  Todavia no hay movimientos guardados.
                </p>
              ) : (
                recentChanges.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-surface-highlight bg-background px-4 py-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-heading text-base font-bold text-foreground">
                          {entry.productName} {entry.storage}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">{formatInventoryHistoryDate(entry.createdAt)}</p>
                      </div>
                      <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-mono font-bold uppercase tracking-[0.18em] text-primary">
                        {entry.action}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-text-muted">{entry.note}</p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
      </div>
    </div>
  )
}
