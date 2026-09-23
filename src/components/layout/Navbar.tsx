"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useBookingStore } from "@/store/useBookingStore";
import { Flame, Utensils, Menu, X, ShoppingBag, User } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Menu", href: "/menu" },
  { name: "Book a Table", href: "/book" },
  { name: "Profile", href: "/profile" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Flame className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-wide text-foreground group-hover:text-primary transition-colors">
                FLAME & SPICE
              </span>
              <span className="text-[10px] uppercase tracking-widest text-accent font-semibold -mt-1">
                Artisanal Grill
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-accent transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent hover:after:w-full after:transition-all duration-300"
              >
                {link.name}
                {link.name === "Profile" && showOfferDot && (
                  <span className="absolute -top-0.5 -right-2 w-2 h-2 rounded-full bg-accent animate-ping" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={openDrawer}
              className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors relative group"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-[11px] font-bold text-white flex items-center justify-center shadow-md animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            <Link
              href="/book"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white text-sm font-semibold shadow-md shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200"
            >
              <Utensils className="w-4 h-4" />
              <span>Reserve Table</span>
            </Link>
          </div>

          {/* Mobile Menu & Cart Actions */}
          <div className="flex md:hidden items-center gap-2.5">
            <button
              onClick={openDrawer}
              className="p-2 rounded-lg bg-secondary text-accent relative"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <Link
              href="/profile"
              className="p-2 rounded-lg bg-secondary text-foreground relative"
              aria-label="Profile"
            >
              <User className="w-5 h-5" />
              {showOfferDot && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-secondary text-foreground hover:text-accent transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Links Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card/95 backdrop-blur-lg px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-secondary hover:text-accent transition-colors flex items-center justify-between"
            >
              <span>{link.name}</span>
              {link.name === "Profile" && showOfferDot && (
                <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold">
                  Offer Ready
                </span>
              )}
            </Link>
          ))}
          <div className="pt-2 border-t border-border flex flex-col gap-2.5">
            <Link
              href="/book"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold shadow-md"
            >
              <Utensils className="w-4 h-4" />
              <span>Book a Table</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
