"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Flame,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQty,
    updateNotes,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCartStore();

  const [activeNotesId, setActiveNotesId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity"
      />

      {/* Slide-over Drawer Panel */}
      <aside className="fixed inset-y-0 right-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-border/80 flex items-center justify-between bg-card/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                Your Order Cart
              </h2>
              <p className="text-xs text-muted-foreground">
                {totalItems} {totalItems === 1 ? "item" : "items"} selected
              </p>
            </div>
          </div>

          <button
            onClick={closeDrawer}
            className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-12">
              <div className="w-20 h-20 rounded-3xl bg-secondary border border-border flex items-center justify-center text-accent shadow-inner">
                <Flame className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <div className="space-y-2 max-w-xs">
                <h3 className="font-display text-xl font-bold text-foreground">
                  Your Cart is Empty
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Looks like you haven&apos;t added any delicious dishes yet. Explore our artisanal menu to craft your meal.
                </p>
              </div>
              <Link
                href="/menu"
                onClick={closeDrawer}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-md shadow-primary/25 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse Menu</span>
              </Link>
            </div>
          ) : (
            /* Cart Items List */
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.menuItemId}
                  className="p-4 rounded-2xl bg-secondary/50 border border-border/80 space-y-3 hover:border-primary/40 transition-colors"
                >
                  <div className="flex gap-3">
                    {/* Item Image */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-secondary shrink-0 border border-border">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-foreground truncate">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.menuItemId)}
                          className="text-muted-foreground hover:text-primary transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-display font-bold text-accent">
                          ৳ {item.price.toLocaleString()}
                        </span>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2.5 px-2 py-1 rounded-lg bg-background border border-border text-xs font-semibold">
                          <button
                            onClick={() => updateQty(item.menuItemId, item.qty - 1)}
                            className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-4 text-center text-foreground font-bold">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQty(item.menuItemId, item.qty + 1)}
                            className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes / Special Requests Input */}
                  <div className="pt-2 border-t border-border/50">
                    {activeNotesId === item.menuItemId || item.notes ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-accent" /> Special Note:
                          </span>
                        </div>
                        <input
                          type="text"
                          value={item.notes || ""}
                          onChange={(e) => updateNotes(item.menuItemId, e.target.value)}
                          placeholder="e.g., Extra spicy, no onions..."
                          className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveNotesId(item.menuItemId)}
                        className="text-[11px] text-accent hover:underline flex items-center gap-1 font-medium"
                      >
                        <Sparkles className="w-3 h-3" /> Add special instruction...
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-2 text-right">
                <button
                  onClick={clearCart}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  Clear all items
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-6 border-t border-border bg-card/90 backdrop-blur-md space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>৳ {totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Taxes & Service Charge</span>
                <span className="text-emerald-400 font-medium">Included</span>
              </div>
              <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border/60">
                <span>Total Amount</span>
                <span className="font-display text-xl text-primary">
                  ৳ {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white font-semibold text-sm shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.01] transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
