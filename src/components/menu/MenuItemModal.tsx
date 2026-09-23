"use client";

import { useEffect, useState } from "react";
import FoodImage from "@/components/shared/FoodImage";
import { MenuItem } from "@/lib/types";
import { CATEGORIES, CUISINES } from "@/data/menu";
import { DietaryBadge } from "./MenuCard";
import { useCartStore } from "@/store/useCartStore";
import { X, ShoppingBag, Check, Plus, Minus, MessageSquare } from "lucide-react";

interface MenuItemModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export default function MenuItemModal({ item, onClose }: MenuItemModalProps) {
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (item) {
      setQty(1);
      setNotes("");
      setAdded(false);
    }
  }, [item]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (item) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  if (!item) return null;

  const cuisine = CUISINES.find((c) => c.id === item.cuisineId);
  const category = CATEGORIES.find((cat) => cat.id === item.categoryId);

  const handleAddToCart = () => {
    addItem(
      {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
      },
      qty,
      notes
    );

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  const totalPrice = item.price * qty;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-background/80 backdrop-blur-md text-foreground/80 hover:text-foreground hover:bg-background border border-border/80 transition-all shadow-md"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Image */}
        <div className="relative w-full h-64 sm:h-80 bg-secondary shrink-0">
          <FoodImage
            src={item.image}
            alt={item.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 700px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-background/90 backdrop-blur-md text-accent text-xs font-semibold border border-border/80 shadow-md">
                {cuisine?.name}
              </span>
              <span className="px-3 py-1 rounded-xl bg-secondary/90 backdrop-blur-md text-foreground/80 text-xs font-medium border border-border/80">
                {category?.name}
              </span>
            </div>
            <span className="px-4 py-1.5 rounded-2xl bg-primary text-white font-display text-xl font-bold shadow-xl shadow-primary/30">
              ৳ {item.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {item.name}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Dietary Tags */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-accent uppercase tracking-wider">
              Dietary Information
            </h4>
            <div className="flex flex-wrap gap-2">
              {item.dietaryTags.map((tag) => (
                <DietaryBadge key={tag} tag={tag} />
              ))}
            </div>
          </div>

          {/* Quantity & Notes Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
            {/* Quantity Stepper */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80">Quantity</label>
              <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-secondary border border-border">
                <button
                  type="button"
                  onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-foreground text-sm font-mono">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((prev) => prev + 1)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Special Instructions Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-accent" /> Special Instructions
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Extra spicy, sauce on side..."
                className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-muted-foreground block">Total Amount</span>
              <span className="font-display text-2xl font-bold text-foreground">
                ৳ {totalPrice.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-semibold text-sm shadow-lg transition-all duration-300 ${
                added
                  ? "bg-emerald-600 text-white shadow-emerald-600/30 scale-105"
                  : "bg-gradient-to-r from-primary to-primary-hover text-white shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5 animate-bounce" />
                  <span>Added ({qty}x)</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Add to Cart — ৳ {totalPrice.toLocaleString()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
