"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MenuItem } from "@/lib/types";
import { CATEGORIES, CUISINES } from "@/data/menu";
import { DietaryBadge } from "./MenuCard";
import { X, Utensils, ShoppingBag, Check } from "lucide-react";

interface MenuItemModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export default function MenuItemModal({ item, onClose }: MenuItemModalProps) {
  const [added, setAdded] = useState(false);

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

  const handleAddToCartStub = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

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
          <Image
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

          {/* Action Footer */}
          <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-muted-foreground block">Total Price</span>
              <span className="font-display text-2xl font-bold text-foreground">
                ৳ {item.price.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleAddToCartStub}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-semibold text-sm shadow-lg transition-all duration-300 ${
                added
                  ? "bg-emerald-600 text-white shadow-emerald-600/30"
                  : "bg-gradient-to-r from-primary to-primary-hover text-white shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5 animate-bounce" />
                  <span>Added to Order</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
