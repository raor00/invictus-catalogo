"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/StoreContext"
import { formatDailyRate } from "@/lib/appSettings"
import { Button } from "@/components/ui/Button"
import {
    User,
    Bell,
    Shield,
    SignOut,
    FloppyDisk,
    CheckCircle,
    Broadcast,
    CurrencyDollar
} from "@phosphor-icons/react"

export default function SettingsPage() {
    const { appSettings, inventoryHistory, logout, updateAppSettings, userEmail } = useStore()
    const router = useRouter()
    const [saved, setSaved] = useState(false)
    const [tickerSaved, setTickerSaved] = useState(false)
    const [notifications, setNotifications] = useState({
        stockAlerts: true,
        weeklyReport: false,
        priceChanges: true,
    })
    const [tickerForm, setTickerForm] = useState({
        tickerMessage: appSettings.tickerMessage,
        dailyRate: appSettings.dailyRate.toString(),
        autoLastInventoryChange: appSettings.autoLastInventoryChange,
    })

    const handleLogout = async () => {
        await logout()
        router.push("/login")
    }

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
    }

    const handleTickerSave = async () => {
        await updateAppSettings({
            tickerMessage: tickerForm.tickerMessage,
            dailyRate: Number.parseFloat(tickerForm.dailyRate) || 0,
            autoLastInventoryChange: tickerForm.autoLastInventoryChange,
        })
        setTickerSaved(true)
        setTimeout(() => setTickerSaved(false), 2500)
    }

    return (
        <div className="flex-1 flex flex-col h-full z-10 w-full overflow-y-auto custom-scrollbar">
            <div className="px-8 py-8 flex flex-col gap-8 max-w-3xl w-full mx-auto">
                {/* Header */}
                <div>
                    <h2 className="text-foreground font-heading font-bold text-3xl tracking-tight">Configuración</h2>
                    <p className="text-text-muted mt-1 text-sm font-body">Gestiona tu perfil, preferencias y seguridad.</p>
                </div>

                {/* Profile Section */}
                <div className="bg-surface border border-surface-highlight rounded-2xl p-6 flex flex-col gap-6 shadow-glass">
                    <div className="flex items-center gap-3 border-b border-surface-highlight pb-4">
                        <User size={20} className="text-primary" weight="fill" />
                        <h3 className="text-foreground font-heading font-bold text-lg">Perfil de Usuario</h3>
                    </div>
                    <div className="flex gap-6 items-center">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-2xl font-bold font-mono text-white shadow-inner flex-shrink-0">
                            AD
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-foreground font-bold font-heading text-xl">Admin User</span>
                            <span className="text-text-muted text-sm font-mono">{userEmail || "admin@mayorista.com"}</span>
                            <span className="mt-1 px-2 py-0.5 bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-bold uppercase tracking-wider rounded-full w-fit">
                                Manager
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-mono uppercase tracking-wider text-text-muted">Nombre Completo</label>
                            <input
                                defaultValue="Admin User"
                                className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-foreground font-body text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-mono uppercase tracking-wider text-text-muted">Email Corporativo</label>
                            <input
                                defaultValue={userEmail || "admin@mayorista.com"}
                                className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-foreground font-body text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button className="gap-2" onClick={handleSave}>
                            {saved ? <CheckCircle size={16} weight="fill" /> : <FloppyDisk size={16} weight="bold" />}
                            {saved ? "¡Guardado!" : "Guardar Perfil"}
                        </Button>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="bg-surface border border-surface-highlight rounded-2xl p-6 flex flex-col gap-6 shadow-glass">
                    <div className="flex items-center gap-3 border-b border-surface-highlight pb-4">
                        <Bell size={20} className="text-primary" weight="fill" />
                        <h3 className="text-foreground font-heading font-bold text-lg">Notificaciones</h3>
                    </div>
                    <div className="flex flex-col gap-4">
                        {[
                            { key: "stockAlerts", label: "Alertas de Stock Crítico", description: "Recibir alertas cuando el stock de un producto baje de 3 unidades." },
                            { key: "weeklyReport", label: "Reporte Semanal", description: "Recibir un resumen del inventario cada lunes." },
                            { key: "priceChanges", label: "Cambios de Precio", description: "Notificaciones cuando se actualicen precios de productos." },
                        ].map(({ key, label, description }) => (
                            <div key={key} className="flex items-center justify-between py-3 border-b border-surface-highlight/50 last:border-0">
                                <div className="flex flex-col">
                                    <span className="text-foreground font-medium font-body text-sm">{label}</span>
                                    <span className="text-text-muted text-xs font-body mt-0.5">{description}</span>
                                </div>
                                <button
                                    onClick={() => setNotifications(n => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${notifications[key as keyof typeof notifications] ? 'bg-primary' : 'bg-surface-highlight'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform duration-200 ${notifications[key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-surface border border-surface-highlight rounded-2xl p-6 flex flex-col gap-6 shadow-glass">
                    <div className="flex items-center gap-3 border-b border-surface-highlight pb-4">
                        <Broadcast size={20} className="text-primary" weight="fill" />
                        <h3 className="text-foreground font-heading font-bold text-lg">Cinta pública</h3>
                    </div>

                    <div className="grid gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-mono uppercase tracking-wider text-text-muted">Texto base de la cinta</label>
                            <textarea
                                value={tickerForm.tickerMessage}
                                onChange={(e) => setTickerForm((current) => ({ ...current, tickerMessage: e.target.value }))}
                                rows={4}
                                className="w-full resize-none bg-background border border-surface-highlight rounded-lg px-4 py-3 text-foreground font-body text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                                placeholder="PRECIOS SUJETOS A CAMBIO // ENVIOS A TODO EL PAIS"
                            />
                            <p className="text-xs text-text-muted">Este texto siempre aparece en la cinta y se combina con la tasa del día.</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-[minmax(0,220px)_1fr]">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-mono uppercase tracking-wider text-text-muted">Tasa del día (USD)</label>
                                <div className="relative">
                                    <CurrencyDollar size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={tickerForm.dailyRate}
                                        onChange={(e) => setTickerForm((current) => ({ ...current, dailyRate: e.target.value }))}
                                        className="w-full bg-background border border-surface-highlight rounded-lg pl-9 pr-4 py-2.5 text-foreground font-body text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                                    />
                                </div>
                                <p className="text-xs text-text-muted">Vista previa: {formatDailyRate(Number.parseFloat(tickerForm.dailyRate) || 0)}</p>
                            </div>

                            <div className="rounded-xl border border-surface-highlight bg-background px-4 py-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium text-foreground">Detectar último cambio automáticamente</span>
                                        <span className="text-xs text-text-muted">La cinta añadirá el movimiento más reciente del inventario.</span>
                                    </div>
                                    <button
                                        onClick={() => setTickerForm((current) => ({
                                            ...current,
                                            autoLastInventoryChange: !current.autoLastInventoryChange,
                                        }))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${tickerForm.autoLastInventoryChange ? 'bg-primary' : 'bg-surface-highlight'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform duration-200 ${tickerForm.autoLastInventoryChange ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                                <p className="mt-3 text-xs text-text-muted">
                                    Último movimiento detectado: {inventoryHistory[0]?.note ?? "Todavía no hay movimientos registrados."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-dashed border-surface-highlight bg-background px-4 py-3">
                        <p className="text-xs font-mono uppercase tracking-wider text-text-muted">Vista previa de la cinta</p>
                        <p className="mt-2 text-sm text-foreground">
                            {tickerForm.tickerMessage.trim() || "PRECIOS SUJETOS A CAMBIO"}
                            {" // "}
                            USD TASA DEL DIA: {formatDailyRate(Number.parseFloat(tickerForm.dailyRate) || 0)}
                            {tickerForm.autoLastInventoryChange
                                ? ` // ULTIMO CAMBIO: ${inventoryHistory[0]?.note ?? "Sin movimientos registrados"}`
                                : ""}
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <Button className="gap-2" onClick={() => void handleTickerSave()}>
                            {tickerSaved ? <CheckCircle size={16} weight="fill" /> : <FloppyDisk size={16} weight="bold" />}
                            {tickerSaved ? "¡Cinta actualizada!" : "Guardar cinta"}
                        </Button>
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-surface border border-surface-highlight rounded-2xl p-6 flex flex-col gap-6 shadow-glass">
                    <div className="flex items-center gap-3 border-b border-surface-highlight pb-4">
                        <Shield size={20} className="text-primary" weight="fill" />
                        <h3 className="text-foreground font-heading font-bold text-lg">Seguridad</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-mono uppercase tracking-wider text-text-muted">Contraseña Actual</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-foreground font-body text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-mono uppercase tracking-wider text-text-muted">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-foreground font-body text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-mono uppercase tracking-wider text-text-muted">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-foreground font-body text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="outline" className="gap-2" onClick={handleSave}>
                            {saved ? <CheckCircle size={16} weight="fill" /> : <FloppyDisk size={16} weight="bold" />}
                            {saved ? "¡Actualizado!" : "Cambiar Contraseña"}
                        </Button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-surface border border-critical/30 rounded-2xl p-6 flex flex-col gap-4 shadow-glass">
                    <div className="flex items-center gap-3 border-b border-surface-highlight pb-4">
                        <SignOut size={20} className="text-critical" weight="fill" />
                        <h3 className="text-foreground font-heading font-bold text-lg">Sesión</h3>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-foreground font-medium font-body text-sm">Cerrar Sesión</span>
                            <span className="text-text-muted text-xs font-body mt-0.5">Salir del sistema y volver a la pantalla de inicio de sesión.</span>
                        </div>
                        <Button
                            variant="outline"
                            className="gap-2 border-critical/50 text-critical hover:bg-critical/10 hover:border-critical"
                            onClick={handleLogout}
                        >
                            <SignOut size={16} weight="bold" />
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
