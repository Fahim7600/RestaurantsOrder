"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useBookingStore } from "@/store/useBookingStore";
import { Flame, Utensils, ShoppingBag } from "lucide-react";
import KitchenStatusBadge from "@/components/layout/KitchenStatusBadge";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Menu", href: "/menu" },
  { name: "Book a Table", href: "/book" },
  { name: "Profile", href: "/profile" },
];

export default function Navbar() {
  const [mounted, setMounted] = useState(false);

  const openDrawer = useCartStore((state) => state.openDrawer);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const hasActiveOffers = useBookingStore((state) => state.hasActiveOffers);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;
  const showOfferDot = mounted ? hasActiveOffers() : false;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/90 border-b border-border/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="Flame & Spice — Home">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary to-accent/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Flame className="w-5 h-5 md:w-6 md:h-6 text-white animate-pulse" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg md:text-xl font-bold tracking-wide text-foreground group-hover:text-primary transition-colors">
                FLAME &amp; SPICE
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest text-accent font-semibold -mt-1">
                Artisanal Grill
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-accent transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent hover:after:w-full after:transition-all duration-300"
              >
                {link.name}
                {link.name === "Profile" && showOfferDot && (
                  <span className="absolute -top-0.5 -right-2 w-2 h-2 rounded-full bg-accent animate-ping" aria-hidden="true" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Kitchen status badge — live, informational only */}
            <KitchenStatusBadge />

            {/* Divider */}
            <span className="w-px h-6 bg-border/60" aria-hidden="true" />

            <button
              onClick={openDrawer}
              className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors relative group"
              aria-label={`View cart${totalItems > 0 ? `, ${totalItems} items` : ""}`}
            >
              <ShoppingBag className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" aria-hidden="true" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-[11px] font-bold text-white flex items-center justify-center shadow-md animate-pulse" aria-hidden="true">
                  {totalItems}
                </span>
              )}
            </button>

            <Link
              href="/book"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white text-sm font-semibold shadow-md shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200"
            >
              <Utensils className="w-4 h-4" aria-hidden="true" />
              <span>Reserve Table</span>
            </Link>
          </div>

          {/* Mobile: Book CTA only (navigation handled by bottom tab bar) */}
          <div className="flex md:hidden items-center">
            <Link
              href="/book"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/25"
              aria-label="Book a table"
            >
              <Utensils className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Book</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
