"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Flame,
  Clock,
  Utensils,
  ShoppingBag,
  ArrowLeft,
  User,
  MapPin,
} from "lucide-react";

import { useOrderStore, Order } from "@/store/useOrderStore";
import { formatBDT } from "@/lib/checkout";
import { formatDateLong, formatTime12h } from "@/lib/date";

// ---------------------------------------------------------------------------
// Dialog popup (shown on first visit with ?new=1)
// ---------------------------------------------------------------------------

function SuccessDialog({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card border border-border/80 rounded-3xl shadow-2xl z-10 p-6 space-y-5 text-center animate-in zoom-in-95">
        {/* Icon */}
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9 text-emerald-400" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <span className="font-mono text-xs font-bold text-accent px-3 py-1 rounded-md bg-secondary border border-border inline-block">
            {order.id}
          </span>
          <h2 className="font-display text-2xl font-bold text-foreground pt-1">
            Order Confirmed! 🔥
          </h2>
          <p className="text-xs text-muted-foreground">
            {order.type === "dine-in" ? "Dine-in order placed" : "Takeaway order placed"} at Flame &amp; Spice
          </p>
        </div>

        {/* ETA */}
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary font-semibold">
          <Clock className="inline w-4 h-4 mr-1.5 -mt-0.5" />
          Ready {order.estimatedReadyFrom}–{order.estimatedReadyTo}
        </div>

        {/* Pay notice */}
        <p className="text-xs text-emerald-400 font-medium">
          ✓ Pay at the restaurant · No online payment needed
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-colors"
          >
            View Receipt
          </button>
          <Link
            href="/menu"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-sm border border-border transition-colors text-center"
          >
            Order More
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order not found
// ---------------------------------------------------------------------------

function OrderNotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-secondary border border-border flex items-center justify-center mx-auto">
        <ShoppingBag className="w-10 h-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-foreground">Order Not Found</h1>
        <p className="text-muted-foreground text-sm">
          We couldn&apos;t find that order. It may have been cleared, or the link is invalid.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-md transition-all"
        >
          <Utensils className="w-4 h-4" />
          Browse Menu
        </Link>
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-sm border border-border transition-colors"
        >
          <User className="w-4 h-4" />
          My Orders
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Receipt body
// ---------------------------------------------------------------------------

function OrderReceipt({ order }: { order: Order }) {
  const tierColors: Record<string, string> = {
    calm: "text-emerald-400",
    steady: "text-sky-400",
    busy: "text-yellow-400",
    rush: "text-orange-400",
    full: "text-red-400",
    closed: "text-muted-foreground",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Order Confirmed
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
          Your Order Receipt
        </h1>
        <p className="text-muted-foreground text-sm">
          Placed at{" "}
          {new Date(order.placedAt).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}{" "}
          on{" "}
          {new Date(order.placedAt).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Order ID + type */}
      <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Order Reference</p>
            <p className="font-mono font-bold text-accent text-lg">{order.id}</p>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              order.type === "dine-in"
                ? "bg-accent/10 text-accent border border-accent/30"
                : "bg-primary/10 text-primary border border-primary/30"
            }`}
          >
            {order.type === "dine-in" ? "🍽️ Dine-in" : "🥡 Takeaway"}
          </span>
        </div>

        {/* Dine-in details */}
        {order.type === "dine-in" && order.dineIn && (
          <div className="text-sm text-muted-foreground">
            {order.dineIn.tableNumber && (
              <p>
                <MapPin className="inline w-3.5 h-3.5 mr-1 text-accent" />
                Table{" "}
                <span className="font-bold text-foreground">
                  #{order.dineIn.tableNumber}
                </span>
              </p>
            )}
            {order.dineIn.bookingId && (
              <p>
                <CheckCircle2 className="inline w-3.5 h-3.5 mr-1 text-accent" />
                Linked to booking{" "}
                <span className="font-bold text-foreground">
                  {order.dineIn.bookingId}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Takeaway pickup */}
        {order.type === "takeaway" && order.pickup && (
          <div className="text-sm text-muted-foreground">
            <Clock className="inline w-3.5 h-3.5 mr-1 text-accent" />
            Pickup:{" "}
            <span className="font-bold text-foreground">
              {order.pickup.mode === "asap"
                ? "As soon as possible"
                : order.pickup.time
                ? formatTime12h(order.pickup.time)
                : "Scheduled"}
            </span>
          </div>
        )}

        {/* Customer */}
        <div className="text-sm text-muted-foreground border-t border-border pt-3">
          <p>
            <User className="inline w-3.5 h-3.5 mr-1 text-accent" />
            <span className="font-semibold text-foreground">{order.customer.name}</span>
            {order.customer.phone && (
              <span className="ml-2">· {order.customer.phone}</span>
            )}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-4">
        <h2 className="font-display text-lg font-bold text-foreground">Items Ordered</h2>
        <ul className="divide-y divide-border/60">
          {order.items.map((item) => (
            <li key={item.menuItemId} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBDT(item.price)} × {item.qty}
                </p>
                {item.notes && (
                  <p className="text-[11px] text-muted-foreground/70 italic mt-0.5">
                    Note: {item.notes}
                  </p>
                )}
              </div>
              <span className="text-sm font-bold text-foreground flex-shrink-0">
                {formatBDT(item.price * item.qty)}
              </span>
            </li>
          ))}
        </ul>

        {order.note && (
          <div className="p-3 rounded-xl bg-secondary/50 border border-border text-xs text-muted-foreground">
            <strong className="text-foreground">Order note: </strong>
            {order.note}
          </div>
        )}

        {/* Total */}
        <div className="border-t border-border pt-3 flex justify-between items-center">
          <span className="font-display font-bold text-foreground">Total</span>
          <span className="font-display text-xl font-bold text-primary">
            {formatBDT(order.total)}
          </span>
        </div>
      </div>

      {/* ETA + Kitchen */}
      <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-3">
        <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" />
          Estimated Ready Time
        </h2>
        <p className="text-foreground font-semibold">
          Ready around{" "}
          <span className="text-primary">
            {order.estimatedReadyFrom}–{order.estimatedReadyTo}
          </span>
        </p>
        <p className={`text-sm font-medium ${tierColors[order.kitchen.tier] ?? "text-muted-foreground"}`}>
          {order.kitchen.emoji} Placed during {order.kitchen.label} · {order.kitchen.waitRange}
        </p>
      </div>

      {/* Pay at restaurant */}
      <div className="p-4 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-emerald-400">Pay at the restaurant</p>
          <p className="text-xs text-muted-foreground">No online payment needed — settle your bill at the counter.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/menu"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-sm border border-border transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </Link>
        <Link
          href="/profile?tab=orders"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-md shadow-primary/25 transition-all"
        >
          <User className="w-4 h-4" />
          View My Orders
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inner component (uses useSearchParams — must be inside Suspense)
// ---------------------------------------------------------------------------

function OrderConfirmationInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const isNew = searchParams.get("new") === "1";

  const getOrder = useOrderStore((s) => s.getOrder);
  const getLatestOrder = useOrderStore((s) => s.getLatestOrder);

  const [mounted, setMounted] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Strip ?new=1 from URL after first render to prevent re-showing dialog on refresh
  useEffect(() => {
    if (!mounted) return;
    if (isNew) {
      setShowDialog(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("new");
      router.replace(url.pathname + (url.search || ""), { scroll: false });
    }
  }, [mounted, isNew, router]);

  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4 animate-pulse">
        <div className="h-8 bg-secondary rounded-xl w-64" />
        <div className="h-48 bg-secondary rounded-3xl" />
        <div className="h-64 bg-secondary rounded-3xl" />
      </div>
    );
  }

  const order = id ? getOrder(id) : getLatestOrder();

  if (!order) return <OrderNotFound />;

  return (
    <>
      {showDialog && (
        <SuccessDialog order={order} onClose={() => setShowDialog(false)} />
      )}
      <OrderReceipt order={order} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Page export — wraps inner in Suspense (required by Next.js App Router)
// ---------------------------------------------------------------------------

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-4 animate-pulse">
          <div className="h-8 bg-secondary rounded-xl w-64" />
          <div className="h-48 bg-secondary rounded-3xl" />
          <div className="h-64 bg-secondary rounded-3xl" />
        </div>
      }
    >
      <OrderConfirmationInner />
    </Suspense>
  );
}
