"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, X, Plus, Minus, Trash } from "@phosphor-icons/react"
import { useCart, type CartItem } from "@/lib/CartContext"
import { Button } from "@/components/ui/Button"
import { OrderForm } from "@/components/OrderForm"
import { MIN_ITEM_QUANTITY, MIN_ORDER_TOTAL_QUANTITY } from "@/lib/config"

function CartItemRow({ item }: { item: CartItem }) {
  const { removeFromCart, updateQuantity } = useCart()
  const subtotal = item.product.price * item.quantity

  return (
    <div className="flex gap-3 p-3 rounded-xl bg-background border border-surface-highlight">
      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-sm text-foreground leading-tight truncate">
          {item.product.name}
        </p>
        <p className="font-mono text-xs text-text-muted mt-0.5">
          {item.product.storage} · {item.product.condition === 'new' ? 'Nuevo' : item.product.condition === 'refurbished' ? 'Refurbished' : 'Usado'}
        </p>
        <p className="font-mono text-xs text-primary font-bold mt-1">
          ${item.product.price.toFixed(2)} c/u
        </p>
      </div>

      {/* Right side: qty + subtotal + remove */}
      <div className="flex flex-col items-end gap-2">
        {/* Remove */}
        <button
          onClick={() => removeFromCart(item.product.id)}
          className="text-text-muted hover:text-critical transition-colors"
        >
          <Trash size={14} weight="bold" />
        </button>

        {/* Qty controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
            disabled={item.quantity <= MIN_ITEM_QUANTITY}
            className="w-6 h-6 rounded border border-surface-highlight hover:border-primary flex items-center justify-center text-text-muted hover:text-primary transition-colors active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus size={10} weight="bold" />
          </button>
          <span className="w-6 text-center font-mono text-xs font-bold text-foreground">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
            className="w-6 h-6 rounded border border-surface-highlight hover:border-primary flex items-center justify-center text-text-muted hover:text-primary transition-colors active:scale-95"
          >
            <Plus size={10} weight="bold" />
          </button>
        </div>

        {/* Subtotal */}
        <span className="font-mono text-sm font-bold text-foreground">
          ${subtotal.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  )
}

function EmptyCartState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-background border border-surface-highlight flex items-center justify-center">
        <ShoppingBag size={28} className="text-text-muted" weight="duotone" />
      </div>
      <div>
        <p className="font-heading font-bold text-foreground">Carrito vacío</p>
        <p className="text-sm text-text-muted mt-1">Agrega productos para continuar</p>
      </div>
    </div>
  )
}

export function CartPanel() {
  const { cartItems, cartTotal, cartCount, isCartOpen, closeCart, clearCart } = useCart()
  const [orderFormOpen, setOrderFormOpen] = useState(false)
  const missingItems = Math.max(0, MIN_ORDER_TOTAL_QUANTITY - cartCount)

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="cart-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={closeCart}
            />

            {/* Panel */}
            <motion.div
              key="cart-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm z-50 bg-surface border-l border-surface-highlight flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-surface-highlight shrink-0">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag size={22} weight="fill" className="text-primary" />
                  <h2 className="font-heading font-bold text-lg text-foreground">Carrito</h2>
                  {cartCount > 0 && (
                    <span className="min-w-[20px] rounded-full bg-primary px-1.5 py-0.5 text-center text-[10px] font-mono font-bold text-white shadow-neon">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={closeCart}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-foreground hover:bg-background transition-colors"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {cartItems.length === 0 ? (
                  <EmptyCartState />
                ) : (
                  cartItems.map(item => (
                    <CartItemRow key={item.product.id} item={item} />
                  ))
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="px-5 py-5 border-t border-surface-highlight flex flex-col gap-3 shrink-0 bg-surface">
                  {/* Order total */}
                  <div className="flex items-baseline justify-between">
                    <span className="text-text-muted font-bold uppercase text-xs tracking-wider">
                      Total del Pedido
                    </span>
                    <span className="font-mono text-2xl font-bold text-foreground">
                      ${cartTotal.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-text-muted">
                    Pedido mínimo: {MIN_ORDER_TOTAL_QUANTITY} equipos en total.
                    {missingItems > 0 ? ` Te faltan ${missingItems}.` : " Listo para enviar."}
                  </p>

                  {/* WhatsApp order button */}
                  <Button
                    className="w-full gap-2 h-12 text-sm font-bold uppercase tracking-wider"
                    disabled={cartCount < MIN_ORDER_TOTAL_QUANTITY}
                    onClick={() => setOrderFormOpen(true)}
                  >
                    {/* WhatsApp icon */}
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    Pedir vía WhatsApp
                  </Button>

                  {/* Clear cart */}
                  <button
                    onClick={clearCart}
                    className="text-xs text-text-muted hover:text-critical text-center transition-colors font-mono uppercase tracking-wider"
                  >
                    Vaciar carrito
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Order form modal */}
      <OrderForm isOpen={orderFormOpen} onClose={() => setOrderFormOpen(false)} />
    </>
  )
}
