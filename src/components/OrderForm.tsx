"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, User, IdentificationCard, Phone } from "@phosphor-icons/react"
import { useCart } from "@/lib/CartContext"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { WHATSAPP_NUMBER, APP_NAME, MIN_ORDER_TOTAL_QUANTITY } from "@/lib/config"
import { useStore } from "@/lib/StoreContext"
import { isProductAvailable } from "@/lib/productAvailability"

interface OrderFormProps {
  isOpen: boolean
  onClose: () => void
}

interface FormData {
  nombre: string
  cedula: string
  telefono: string
}

interface FormErrors {
  nombre?: string
  cedula?: string
  telefono?: string
  cart?: string
}

function generateWhatsAppMessage(
  formData: FormData,
  cartItems: ReturnType<typeof useCart>["cartItems"],
  cartTotal: number
): string {
  const date = new Date().toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  const itemLines = cartItems
    .map(item => {
      const subtotal = item.product.price * item.quantity
      return `- ${item.product.name} ${item.product.storage} x${item.quantity} - $${item.product.price.toFixed(2)} c/u = $${subtotal.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`
    })
    .join("\n")

  return `*PEDIDO ${APP_NAME}*

*DATOS DEL CLIENTE:*
- Nombre: ${formData.nombre}
- Cédula/RIF: ${formData.cedula}
- Teléfono: ${formData.telefono}

*PRODUCTOS SOLICITADOS:*
${itemLines}

*TOTAL DEL PEDIDO: $${cartTotal.toLocaleString("es-VE", { minimumFractionDigits: 2 })}*

Fecha: ${date}`
}

export function OrderForm({ isOpen, onClose }: OrderFormProps) {
  const { cartItems, cartTotal, cartCount, clearCart, closeCart } = useCart()
  const { placeOrder, products } = useStore()
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    cedula: "",
    telefono: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (cartCount < MIN_ORDER_TOTAL_QUANTITY) {
      newErrors.cart = `Debes seleccionar al menos ${MIN_ORDER_TOTAL_QUANTITY} equipos en total para hacer el pedido`
    }
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido"
    if (!formData.cedula.trim()) newErrors.cedula = "La cédula/RIF es requerida"
    if (!formData.telefono.trim()) newErrors.telefono = "El teléfono es requerido"

    for (const item of cartItems) {
      const currentProduct = products.find(product => product.id === item.product.id)

      if (!currentProduct) {
        newErrors.cart = `El producto ${item.product.name} ya no existe en inventario`
        break
      }

      if (!isProductAvailable(currentProduct)) {
        newErrors.cart = `El producto ${item.product.name} ya no esta disponible`
        break
      }

      if (item.quantity > currentProduct.stock) {
        newErrors.cart = `Solo quedan ${currentProduct.stock} unidades de ${item.product.name}`
        break
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    const message = generateWhatsAppMessage(formData, cartItems, cartTotal)
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

    const whatsappWindow = window.open("", "_blank", "noreferrer")

    if (!whatsappWindow) {
      setSubmitting(false)
      setErrors({
        cart: "Debes permitir ventanas emergentes para continuar con WhatsApp",
      })
      return
    }

    try {
      await placeOrder({
        customer: formData,
        items: cartItems.map((item) => ({
          product: item.product,
          productId: item.product.id,
          quantity: item.quantity,
        })),
        total: cartTotal,
        channel: "whatsapp",
      })

      whatsappWindow.location.href = url
      clearCart()
      closeCart()
      onClose()
      setFormData({ nombre: "", cedula: "", telefono: "" })
      setErrors({})
    } catch (error) {
      whatsappWindow.close()
      setErrors({
        cart:
          error instanceof Error
            ? error.message
            : "No se pudo registrar el pedido en inventario",
      })
    } finally {
      setSubmitting(false)
    }
  }

  function handleChange(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="order-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="order-modal"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full max-w-sm bg-surface rounded-2xl border border-surface-highlight shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-surface-highlight">
                <div>
                  <h2 className="font-heading font-bold text-lg text-foreground">
                    Confirmar Pedido
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5 font-mono">
                    {cartCount} equipo{cartCount !== 1 ? "s" : ""} · ${cartTotal.toLocaleString("es-VE", { minimumFractionDigits: 2 })} total
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-foreground hover:bg-background transition-colors"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
                <p className="text-sm text-text-muted">
                  Ingresa tus datos para enviar el pedido vía WhatsApp.
                </p>

                {errors.cart && (
                  <p className="rounded-xl border border-critical/30 bg-critical/10 px-3 py-2 text-xs font-mono text-critical">
                    {errors.cart}
                  </p>
                )}

                {/* Nombre */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Nombre Completo *
                  </label>
                  <Input
                    placeholder="Ej: Juan Pérez"
                    icon={<User size={16} weight="bold" />}
                    value={formData.nombre}
                    onChange={handleChange("nombre")}
                    className={errors.nombre ? "border-critical" : ""}
                  />
                  {errors.nombre && (
                    <p className="text-xs text-critical font-mono">{errors.nombre}</p>
                  )}
                </div>

                {/* Cédula */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Cédula / RIF *
                  </label>
                  <Input
                    placeholder="Ej: V-12345678"
                    icon={<IdentificationCard size={16} weight="bold" />}
                    value={formData.cedula}
                    onChange={handleChange("cedula")}
                    className={errors.cedula ? "border-critical" : ""}
                  />
                  {errors.cedula && (
                    <p className="text-xs text-critical font-mono">{errors.cedula}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Teléfono *
                  </label>
                  <Input
                    placeholder="Ej: 04141234567"
                    icon={<Phone size={16} weight="bold" />}
                    value={formData.telefono}
                    onChange={handleChange("telefono")}
                    className={errors.telefono ? "border-critical" : ""}
                  />
                  {errors.telefono && (
                    <p className="text-xs text-critical font-mono">{errors.telefono}</p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full gap-2 h-12 text-sm font-bold uppercase tracking-wider mt-1"
                  disabled={submitting}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  {submitting ? "Enviando..." : "Enviar Pedido"}
                </Button>

                <p className="text-[10px] text-text-muted text-center font-mono">
                  Se abrirá WhatsApp con tu pedido listo para enviar
                </p>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
