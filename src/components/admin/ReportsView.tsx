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
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 40
      const contentWidth = pageWidth - margin * 2
      const blue: [number, number, number] = [47, 91, 255]
      const blueDark: [number, number, number] = [36, 71, 204]
      const blueSoft: [number, number, number] = [236, 241, 255]
      const textDark: [number, number, number] = [24, 24, 27]
      const textMuted: [number, number, number] = [107, 114, 128]
      const border: [number, number, number] = [222, 226, 230]
      const generatedAt = new Intl.DateTimeFormat("es-VE", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "America/Caracas",
      }).format(new Date())
      const topModels = modelTotals.slice(0, 5)

      const drawMetricCard = (
        x: number,
        y: number,
        width: number,
        height: number,
        label: string,
        value: string,
        detail?: string
      ) => {
        pdf.setFillColor(...blueSoft)
        pdf.setDrawColor(...border)
        pdf.roundedRect(x, y, width, height, 16, 16, "FD")
        pdf.setTextColor(...textMuted)
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(9)
        pdf.text(label.toUpperCase(), x + 16, y + 20)
        pdf.setTextColor(...textDark)
        pdf.setFontSize(22)
        pdf.text(value, x + 16, y + 48)

        if (detail) {
          pdf.setTextColor(...textMuted)
          pdf.setFont("helvetica", "normal")
          pdf.setFontSize(9)
          pdf.text(detail, x + 16, y + 66)
        }
      }

      const drawSectionTitle = (title: string, subtitle: string, y: number) => {
        pdf.setTextColor(...textDark)
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(16)
        pdf.text(title, margin, y)
        pdf.setTextColor(...textMuted)
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(10)
        pdf.text(subtitle, margin, y + 16)
      }

      pdf.setFillColor(...blue)
      pdf.rect(0, 0, pageWidth, 132, "F")
      pdf.setTextColor(255, 255, 255)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(26)
      pdf.text("Reporte de inventario mayorista", margin, 50)
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(11)
      pdf.text("KPIs, cambios recientes y trazabilidad del stock", margin, 72)
      pdf.setFontSize(10)
      pdf.text(`Generado: ${generatedAt} (Venezuela)`, margin, 92)
      pdf.setFillColor(255, 255, 255)
      pdf.roundedRect(margin, 106, contentWidth, 56, 18, 18, "F")
      pdf.setTextColor(...textDark)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(12)
      pdf.text("Resumen ejecutivo", margin + 18, 128)
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      pdf.setTextColor(...textMuted)
      pdf.text(
        "Este documento resume el estado actual del inventario, los modelos con mayor presencia y los ultimos movimientos registrados.",
        margin + 18,
        146,
        { maxWidth: contentWidth - 36 }
      )

      const cardY = 188
      const cardGap = 12
      const cardWidth = (contentWidth - cardGap) / 2
      drawMetricCard(margin, cardY, cardWidth, 82, "Total equipos", `${totalUnits}`, "Unidades sumadas en todo el inventario")
      drawMetricCard(margin + cardWidth + cardGap, cardY, cardWidth, 82, "Variantes activas", `${availableVariants}`, "SKUs con stock y disponibilidad")
      drawMetricCard(
        margin,
        cardY + 94,
        cardWidth,
        82,
        "Modelo con mayor stock",
        topModel ? `${topModel[1]}` : "0",
        topModel?.[0] ?? "Sin datos"
      )
      drawMetricCard(
        margin + cardWidth + cardGap,
        cardY + 94,
        cardWidth,
        82,
        "Valor inventario",
        `$${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        "Valorizacion actual del stock"
      )

      drawSectionTitle("Modelos con mayor stock", "Ranking resumido por unidades acumuladas", 310)
      autoTable(pdf, {
        startY: 336,
        head: [["Posicion", "Modelo", "Unidades"]],
        body: topModels.map(([name, units], index) => [`#${index + 1}`, name, `${units}`]),
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 7, textColor: textDark },
        headStyles: { fillColor: blue, textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 300 },
          2: { halign: "right" },
        },
      })

      drawSectionTitle("Movimientos recientes", "Ultimos cambios guardados en el historial interno", 500)
      autoTable(pdf, {
        startY: 526,
        head: [["Fecha", "Producto", "Cambio", "Usuario"]],
        body: recentChanges.map((entry) => [
          formatInventoryHistoryDate(entry.createdAt),
          `${entry.productName} ${entry.storage}`,
          `${entry.previousStock} -> ${entry.nextStock} (${formatInventoryHistoryDelta(entry.stockDelta)})`,
          entry.userEmail ?? "sistema",
        ]),
        styles: { fontSize: 8.5, cellPadding: 6, textColor: textDark },
        headStyles: { fillColor: blue, textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: margin, right: margin },
      })

      pdf.addPage()
      pdf.setFillColor(...blueDark)
      pdf.rect(0, 0, pageWidth, 86, "F")
      pdf.setTextColor(255, 255, 255)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(22)
      pdf.text("Analisis de reducciones", margin, 48)
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      pdf.text("Comparativo de stock antes y despues de cada ajuste a la baja", margin, 66)

      autoTable(pdf, {
        startY: 108,
        head: [["Fecha", "Producto", "Antes", "Ahora", "Delta"]],
        body: stockReductions.map((entry) => [
          formatInventoryHistoryDate(entry.createdAt),
          `${entry.productName} ${entry.storage}`,
          `${entry.previousStock}`,
          `${entry.nextStock}`,
          formatInventoryHistoryDelta(entry.stockDelta),
        ]),
        styles: { fontSize: 9, cellPadding: 7, textColor: textDark },
        headStyles: { fillColor: blueDark, textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          2: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "right" },
        },
        margin: { left: margin, right: margin },
      })

      const pageCount = pdf.getNumberOfPages()
      for (let page = 1; page <= pageCount; page += 1) {
        pdf.setPage(page)
        pdf.setDrawColor(...border)
        pdf.line(margin, pageHeight - 28, pageWidth - margin, pageHeight - 28)
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(9)
        pdf.setTextColor(...textMuted)
        pdf.text("Invictus Mayorista", margin, pageHeight - 12)
        pdf.text(`Pagina ${page} de ${pageCount}`, pageWidth - margin - 58, pageHeight - 12)
      }

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
