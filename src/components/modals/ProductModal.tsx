"use client"

import React, { useState, useEffect } from "react"
import { X } from "@phosphor-icons/react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useStore, Product } from "@/lib/StoreContext"
import { motion, AnimatePresence } from "framer-motion"
import { hasManualAvailability } from "@/lib/productAvailability"

function isProductDetail(detail: Product | { defaultCategory?: string } | undefined): detail is Product {
    return Boolean(detail && "id" in detail)
}

function generateSku({
    category,
    condition,
    name,
    storage,
}: {
    category: string
    condition: Product["condition"]
    name: string
    storage: string
}) {
    const categoryCode = category.slice(0, 3).toUpperCase()
    const conditionCode = condition.slice(0, 3).toUpperCase()
    const nameCode = name
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 24)

    return [categoryCode, nameCode || "PRODUCTO", storage.toUpperCase(), conditionCode]
        .filter(Boolean)
        .join("-")
}

export const ProductModal = () => {
    const { addProduct, updateProduct } = useStore()
    const [isOpen, setIsOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentId, setCurrentId] = useState("")
    const [submitError, setSubmitError] = useState("")

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        stock: "",
        image: "",
        category: "Smartphones",
        storage: "128GB",
        condition: "used" as Product['condition'],
        isAvailable: true,
    })

    useEffect(() => {
        const handleOpen = (event: Event) => {
            const e = event as CustomEvent<Product | { defaultCategory?: string } | undefined>
            if (isProductDetail(e.detail)) {
                setSubmitError("")
                setIsEditing(true)
                setCurrentId(e.detail.id)
                setFormData({
                    name: e.detail.name,
                    price: e.detail.price.toString(),
                    stock: e.detail.stock.toString(),
                    image: e.detail.image.startsWith('placeholder:') ? '' : e.detail.image,
                    category: e.detail.category,
                    storage: e.detail.storage || '128GB',
                    condition: e.detail.condition || 'used',
                    isAvailable: hasManualAvailability(e.detail),
                })
            } else {
                const defaultCategory = isProductDetail(e.detail) ? undefined : e.detail?.defaultCategory
                setSubmitError("")
                setIsEditing(false)
                setCurrentId("")
                setFormData({
                    name: "",
                    price: "",
                    stock: "",
                    image: "",
                    category: defaultCategory || "Smartphones",
                    storage: "128GB",
                    condition: "used",
                    isAvailable: true,
                })
            }
            setIsOpen(true)
        }

        window.addEventListener('open-product-modal', handleOpen)
        return () => window.removeEventListener('open-product-modal', handleOpen)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError("")

        const stockNum = parseInt(formData.stock) || 0
        const status: 'Disponible' | 'No disponible' =
            formData.isAvailable && stockNum > 0 ? 'Disponible' : 'No disponible'

        const productData: Product = {
            id: isEditing ? currentId : Date.now().toString(),
            name: formData.name,
            sku: generateSku(formData),
            price: parseFloat(formData.price) || 0,
            stock: stockNum,
            image: formData.image || `placeholder:${formData.name.toLowerCase().replace(/\s+/g, '-')}`,
            category: formData.category,
            storage: formData.storage,
            condition: formData.condition,
            isAvailable: formData.isAvailable,
            status
        }

        try {
            if (isEditing) {
                await updateProduct(currentId, productData)
            } else {
                await addProduct(productData)
            }

            setIsOpen(false)
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "No se pudo guardar el producto")
        }
    }

    const selectClass = "h-10 w-full rounded-lg border border-surface-highlight bg-surface px-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-surface border border-surface-highlight rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
                    >
                        <div className="flex justify-between items-center p-6 border-b border-surface-highlight">
                            <h3 className="text-xl font-heading font-bold">{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                            <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-foreground">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-text-muted">Nombre del Producto</label>
                                <Input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-text-muted">Categoría</label>
                                <select
                                    className={selectClass}
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Smartphones">Smartphones</option>
                                    <option value="Repuestos">Repuestos</option>
                                    <option value="Accesorios">Accesorios</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-text-muted">Almacenamiento</label>
                                    <select
                                        className={selectClass}
                                        value={formData.storage}
                                        onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                                    >
                                        <option value="64GB">64GB</option>
                                        <option value="128GB">128GB</option>
                                        <option value="256GB">256GB</option>
                                        <option value="512GB">512GB</option>
                                        <option value="1TB">1TB</option>
                                        <option value="2TB">2TB</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-text-muted">Condición</label>
                                    <select
                                        className={selectClass}
                                        value={formData.condition}
                                        onChange={(e) => setFormData({ ...formData, condition: e.target.value as Product['condition'] })}
                                    >
                                        <option value="new">Nuevo</option>
                                        <option value="refurbished">Refurbished</option>
                                        <option value="used">Usado</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-text-muted">Precio ($)</label>
                                    <Input type="number" step="0.01" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-text-muted">Stock</label>
                                    <Input type="number" required value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-text-muted">URL de Imagen (opcional)</label>
                                <Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://... (dejar vacío para silhouette)" />
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-surface-highlight bg-background px-4 py-3">
                                <div className="pr-4">
                                    <p className="text-sm font-bold text-foreground">Disponible en catálogo</p>
                                    <p className="text-xs text-text-muted">
                                        Si lo desactivas, el modelo se mostrará como no disponible.
                                    </p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={formData.isAvailable}
                                        onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                    />
                                    <div className="relative h-6 w-11 rounded-full bg-surface-highlight transition-colors peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
                                </label>
                            </div>

                            {submitError && (
                                <p className="rounded-xl border border-critical/30 bg-critical/10 px-4 py-3 text-sm text-critical">
                                    {submitError}
                                </p>
                            )}

                            <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-surface-highlight">
                                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
                                <Button type="submit">{isEditing ? 'Guardar Cambios' : 'Crear Producto'}</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
