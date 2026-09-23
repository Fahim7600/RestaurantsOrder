"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, CalendarDays, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useBookingStore } from "@/store/useBookingStore";

const tabs = [
  { name: "Home", href: "/", icon: Home, id: "tab-home" },
  { name: "Menu", href: "/menu", icon: UtensilsCrossed, id: "tab-menu" },
  { name: "Book", href: "/book", icon: CalendarDays, id: "tab-book" },
  { name: "Cart", href: "#cart", icon: ShoppingBag, id: "tab-cart" },
  { name: "Profile", href: "/profile", icon: User, id: "tab-profile" },
] as const;

export default function MobileTabBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastFocusWasInput = useRef(false);

  const openDrawer = useCartStore((s) => s.openDrawer);
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const hasActiveOffers = useBookingStore((s) => s.hasActiveOffers);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide tab bar when a text input / textarea is focused (on-screen keyboard)
  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        lastFocusWasInput.current = true;
        setHidden(true);
      }
    };
    const onFocusOut = (e: FocusEvent) => {
      const related = (e as FocusEvent).relatedTarget as HTMLElement | null;
      if (
        lastFocusWasInput.current &&
        !(
          related instanceof HTMLInputElement ||
          related instanceof HTMLTextAreaElement ||
          related instanceof HTMLSelectElement
        )
      ) {
        lastFocusWasInput.current = false;
        setHidden(false);
      }
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;
  const showOfferDot = mounted ? hasActiveOffers() : false;

  if (hidden) return null;

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch h-[60px]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isCart = tab.href === "#cart";
          const isActive = !isCart && (tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href));
          const showCartBadge = tab.name === "Cart" && totalItems > 0;
          const showProfileDot = tab.name === "Profile" && showOfferDot;

          const sharedCls = `
            flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px]
            relative transition-colors duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent
            ${isActive
              ? "text-accent"
              : "text-muted-foreground hover:text-foreground"
            }
          `.trim();

          const inner = (
            <>
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
                  aria-hidden="true"
                />
                {showCartBadge && (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center"
                    aria-label={`${totalItems} items in cart`}
                  >
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
                {showProfileDot && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent animate-pulse"
                    aria-label="Active table offer"
                  />
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">{tab.name}</span>
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-accent" />
              )}
            </>
          );

          if (isCart) {
            return (
              <button
                key={tab.id}
                id={tab.id}
                onClick={openDrawer}
                className={sharedCls}
                aria-label={`Open cart${totalItems > 0 ? `, ${totalItems} items` : ""}`}
                type="button"
              >
                {inner}
              </button>
            );
          }

          return (
            <Link
              key={tab.id}
              id={tab.id}
              href={tab.href}
              className={sharedCls}
              aria-current={isActive ? "page" : undefined}
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
