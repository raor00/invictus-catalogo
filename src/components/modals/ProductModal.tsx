"use client"

import React, { useState, useEffect } from "react"
import { X } from "@phosphor-icons/react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useStore, Product } from "@/lib/StoreContext"
import { motion, AnimatePresence } from "framer-motion"

export const ProductModal = () => {
    const { addProduct, updateProduct } = useStore()
    const [isOpen, setIsOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentId, setCurrentId] = useState("")

    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        price: "",
        stock: "",
        image: "",
        category: "Smartphones",
    })

    useEffect(() => {
        const handleOpen = (e: any) => {
            if (e.detail) {
                setIsEditing(true)
                setCurrentId(e.detail.id)
                setFormData({
                    name: e.detail.name,
                    sku: e.detail.sku,
                    price: e.detail.price.toString(),
                    stock: e.detail.stock.toString(),
                    image: e.detail.image,
                    category: e.detail.category,
                })
            } else {
                setIsEditing(false)
                setCurrentId("")
                setFormData({
                    name: "",
                    sku: "",
                    price: "",
                    stock: "",
                    image: "",
                    category: e.detail?.defaultCategory || "Smartphones"
                })
            }
            setIsOpen(true)
        }

        window.addEventListener('open-product-modal', handleOpen)
        return () => window.removeEventListener('open-product-modal', handleOpen)
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const stockNum = parseInt(formData.stock) || 0;
        let status: 'Disponible' | 'Pocas Unidades' | 'Agotado' = 'Disponible';
        if (stockNum === 0) status = 'Agotado';
        else if (stockNum < 3) status = 'Pocas Unidades';

        const productData: Product = {
            id: isEditing ? currentId : Date.now().toString(),
            name: formData.name,
            sku: formData.sku,
            price: parseFloat(formData.price) || 0,
            stock: stockNum,
            image: formData.image || "https://via.placeholder.com/150",
            category: formData.category,
            status
        }

        if (isEditing) {
            updateProduct(currentId, productData)
        } else {
            addProduct(productData)
        }

        setIsOpen(false)
    }

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
                                <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-text-muted">SKU</label>
                                    <Input required value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-text-muted">Categoría</label>
                                    <select
                                        className="h-10 w-full rounded-lg border border-surface-highlight bg-surface px-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Smartphones">Smartphones</option>
                                        <option value="Repuestos">Repuestos</option>
                                        <option value="Accesorios">Accesorios</option>
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
                                <label className="text-sm font-bold text-text-muted">URL de Imagen</label>
                                <Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." />
                            </div>

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
