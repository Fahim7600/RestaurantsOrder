"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import FoodImage from "@/components/shared/FoodImage";
import {
  ShoppingBag,
  Utensils,
  Clock,
  Users,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Flame,
  MapPin,
  Loader2,
  X,
  ChevronDown,
} from "lucide-react";

import { useCartStore } from "@/store/useCartStore";
import { useBookingStore } from "@/store/useBookingStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useKitchenStatus } from "@/hooks/useKitchenStatus";
import { getKitchenStatus } from "@/lib/kitchenStatus";
import { MENU_ITEMS } from "@/data/menu";
import { TABLE_COUNT, OPENING_HOURS } from "@/lib/config";
import { nameSchema, phoneSchema, orderNoteSchema } from "@/lib/validation";
import {
  formatBDT,
  reconcileCart,
  getEligibleDineInBookings,
  generatePickupSlots,
  computeETA,
  computeSubtotal,
} from "@/lib/checkout";
import { formatDateLong, formatTime12h } from "@/lib/date";
import KitchenStatusBadge from "@/components/layout/KitchenStatusBadge";

// ---------------------------------------------------------------------------
// Form schema
// ---------------------------------------------------------------------------

const checkoutSchema = z
  .object({
    name: nameSchema,
    phone: z.string().optional(),
    note: orderNoteSchema,
    orderType: z.enum(["takeaway", "dine-in"]),
    dineInOption: z.enum(["booking", "table"]).optional(),
    selectedBookingId: z.string().optional(),
    tableNumber: z.string().optional(),
    pickupMode: z.enum(["asap", "scheduled"]).optional(),
    scheduledTime: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.orderType === "takeaway") {
      // Phone required for takeaway
      if (!data.phone || data.phone.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone"],
          message: "Phone number is required for takeaway orders.",
        });
      } else {
        const phoneResult = phoneSchema.safeParse(data.phone);
        if (!phoneResult.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["phone"],
            message: phoneResult.error.issues[0]?.message || "Invalid phone.",
          });
        }
      }
    } else {
      // Dine-in validation
      if (!data.dineInOption) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dineInOption"],
          message: "Please choose how you'd like to dine in.",
        });
      }
      if (data.dineInOption === "booking" && !data.selectedBookingId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["selectedBookingId"],
          message: "Please select your booking.",
        });
      }
      if (data.dineInOption === "table") {
        if (!data.tableNumber || data.tableNumber.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["tableNumber"],
            message: "Table number is required.",
          });
        } else {
          const n = Number(data.tableNumber);
          if (!Number.isInteger(n) || n < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["tableNumber"],
              message: "Table number must be a whole number of at least 1.",
            });
          } else if (n > TABLE_COUNT) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["tableNumber"],
              message: `Table number cannot exceed ${TABLE_COUNT}.`,
            });
          } else if (!Number.isFinite(n)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["tableNumber"],
              message: "Invalid table number.",
            });
          }
        }
      }
      // phone optional for dine-in but validate if filled
      if (data.phone && data.phone.trim() !== "") {
        const phoneResult = phoneSchema.safeParse(data.phone);
        if (!phoneResult.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["phone"],
            message: phoneResult.error.issues[0]?.message || "Invalid phone.",
          });
        }
      }
    }
  });

type CheckoutForm = z.infer<typeof checkoutSchema>;

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function CheckoutSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
      <div className="h-8 bg-secondary rounded-xl w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-secondary rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-64 bg-secondary rounded-2xl" />
          <div className="h-48 bg-secondary rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty cart state
// ---------------------------------------------------------------------------
function CheckoutEmptyState() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
        <Flame className="w-10 h-10 text-primary animate-pulse" />
      </div>
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Your plate is empty
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Looks like you haven&apos;t added anything to your order yet. Browse our menu and find something delicious.
        </p>
      </div>
      <Link
        href="/menu"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-md shadow-primary/25 transition-all"
      >
        <Utensils className="w-4 h-4" />
        Browse Menu
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  const rawItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const groupSession = useCartStore((s) => s.groupSession);
  const getPerMemberBreakdown = useCartStore((s) => s.getPerMemberBreakdown);
  const { bookings } = useBookingStore();
  const { user, updateUser } = useProfileStore();
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const kitchenStatus = useKitchenStatus();

  // Reconcile cart against live menu on mount
  const { reconciledItems, notices } = useMemo(() => {
    if (!mounted) return { reconciledItems: rawItems, notices: [] };
    const result = reconcileCart(rawItems, MENU_ITEMS);
    return { reconciledItems: result.items, notices: result.notices };
  }, [mounted, rawItems]);

  // Today's eligible dine-in bookings
  const eligibleBookings = useMemo(() => {
    if (!mounted) return [];
    return getEligibleDineInBookings(bookings, new Date());
  }, [mounted, bookings]);

  // Pickup slots
  const pickupSlots = useMemo(() => {
    if (!mounted) return [];
    return generatePickupSlots(new Date(), kitchenStatus);
  }, [mounted, kitchenStatus]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user.name || "",
      phone: user.phone || "",
      note: "",
      orderType: "takeaway",
      pickupMode: "asap",
      dineInOption: undefined,
      selectedBookingId: undefined,
      tableNumber: undefined,
      scheduledTime: undefined,
    },
  });

  // useWatch at component level — avoids calling watch() inside JSX callbacks (react-hooks/incompatible-library)
  const orderType = useWatch({ control, name: "orderType" });
  const dineInOption = useWatch({ control, name: "dineInOption" });
  const pickupMode = useWatch({ control, name: "pickupMode" });
  const scheduledTime = useWatch({ control, name: "scheduledTime" });
  const noteValue = useWatch({ control, name: "note" }) ?? "";
  const selectedBookingId = useWatch({ control, name: "selectedBookingId" });

  // Prefill contact from profile
  useEffect(() => {
    if (user.name) setValue("name", user.name);
    if (user.phone) setValue("phone", user.phone);
  }, [user, setValue]);

  // When switching dine-in option, clear the other value
  const handleDineInOptionChange = useCallback(
    (option: "booking" | "table") => {
      setValue("dineInOption", option);
      if (option === "booking") setValue("tableNumber", undefined);
      else setValue("selectedBookingId", undefined);
    },
    [setValue]
  );

  const subtotal = useMemo(
    () => computeSubtotal(reconciledItems),
    [reconciledItems]
  );

  const eta = useMemo(() => {
    return computeETA(
      orderType === "takeaway" ? (pickupMode ?? "asap") : "asap",
      scheduledTime,
      kitchenStatus,
      new Date()
    );
  }, [orderType, pickupMode, scheduledTime, kitchenStatus]);

  const onSubmit = async (data: CheckoutForm) => {
    if (submitting) return;
    setSubmitting(true);
    setStorageError(null);

    // Simulate 900ms processing
    await new Promise((r) => setTimeout(r, 900));

    const now = new Date();
    const snapshot = getKitchenStatus(now);
    const etaFinal = computeETA(
      data.orderType === "takeaway" ? (data.pickupMode ?? "asap") : "asap",
      data.scheduledTime,
      snapshot,
      now
    );

    let phone: string | undefined = data.phone?.trim() || undefined;
    if (phone === "") phone = undefined;

    const result = placeOrder({
      type: data.orderType,
      dineIn:
        data.orderType === "dine-in"
          ? {
              bookingId: data.selectedBookingId,
              tableNumber: data.tableNumber
                ? parseInt(data.tableNumber, 10)
                : undefined,
            }
          : undefined,
      pickup:
        data.orderType === "takeaway"
          ? { mode: data.pickupMode ?? "asap", time: data.scheduledTime }
          : undefined,
      items: reconciledItems,
      customer: { name: data.name, phone },
      note: data.note || undefined,
      kitchen: {
        tier: snapshot.tier,
        label: snapshot.label,
        waitRange: snapshot.waitRange,
        emoji: snapshot.emoji,
      },
      estimatedReadyFrom: etaFinal.from,
      estimatedReadyTo: etaFinal.to,
    });

    setSubmitting(false);

    if (!result.ok) {
      if (result.reason === "STORAGE_ERROR") {
        setStorageError(result.message);
      }
      return;
    }

    // Save blank profile fields (never overwrite existing)
    if (!user.name && data.name) updateUser({ name: data.name });
    if (!user.phone && phone) updateUser({ phone });

    // Clear cart ONLY after confirmed save
    clearCart();

    router.replace(`/order-confirmation?id=${result.order.id}&new=1`);
  };

  // Not mounted yet → show skeleton
  if (!mounted) return <CheckoutSkeleton />;

  // Empty cart
  if (reconciledItems.length === 0) return <CheckoutEmptyState />;

  const isOpen = kitchenStatus.tier !== "closed";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
          <ShoppingBag className="w-3.5 h-3.5" />
          Place Your Order
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Checkout
          </h1>
          <KitchenStatusBadge />
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Pay at the restaurant — no online payment needed.
        </p>
      </div>

      {/* Reconciliation notices */}
      {notices.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 space-y-2">
          <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Your cart was updated
          </div>
          <ul className="space-y-1">
            {notices.map((n, i) => (
              <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                • {n.detail}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Storage error */}
      {storageError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{storageError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* ---- LEFT: Form ---- */}
          <div className="lg:col-span-2 space-y-6">

            {/* Order type */}
            <section className="p-6 rounded-3xl bg-card border border-border/80 space-y-4">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Utensils className="w-5 h-5 text-accent" />
                Order Type
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {(["takeaway", "dine-in"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValue("orderType", t)}
                    className={`py-3 px-4 rounded-xl font-semibold text-sm border transition-all ${
                      orderType === t
                        ? "bg-primary text-white border-primary shadow-md shadow-primary/25"
                        : "bg-secondary/60 text-foreground/70 border-border hover:border-primary/40"
                    }`}
                  >
                    {t === "takeaway" ? "🥡 Takeaway" : "🍽️ Dine-in"}
                  </button>
                ))}
              </div>
            </section>

            {/* Dine-in section */}
            {orderType === "dine-in" && (
              <section className="p-6 rounded-3xl bg-card border border-border/80 space-y-5">
                <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  Dine-in Details
                </h2>

                {/* Option selector */}
                <div className="grid grid-cols-2 gap-3">
                  {(["booking", "table"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleDineInOptionChange(opt)}
                      className={`py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                        dineInOption === opt
                          ? "bg-accent/10 text-accent border-accent/40"
                          : "bg-secondary/60 text-foreground/60 border-border hover:border-accent/30"
                      }`}
                    >
                      {opt === "booking" ? "📋 I have a booking" : "🔢 I'm at a table"}
                    </button>
                  ))}
                </div>
                {errors.dineInOption && (
                  <p className="text-xs text-red-400">{errors.dineInOption.message}</p>
                )}

                {/* Booking list */}
                {dineInOption === "booking" && (
                  <div className="space-y-3">
                    {eligibleBookings.length === 0 ? (
                      <div className="p-4 rounded-xl bg-secondary/50 border border-border text-sm text-muted-foreground space-y-2">
                        <p>You have no confirmed table bookings for today.</p>
                        <p>
                          <Link href="/book" className="text-accent underline underline-offset-2">
                            Book a table
                          </Link>
                          {" "}or use a table number below.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {eligibleBookings.map(({ booking, eligible, disabledReason }) => {
                          const selected = selectedBookingId === booking.id;
                          return (
                            <button
                              key={booking.id}
                              type="button"
                              disabled={!eligible}
                              onClick={() => eligible && setValue("selectedBookingId", booking.id)}
                              className={`w-full text-left p-4 rounded-xl border text-sm transition-all ${
                                !eligible
                                  ? "opacity-40 cursor-not-allowed bg-secondary/30 border-border"
                                  : selected
                                  ? "bg-accent/10 border-accent/50 text-accent"
                                  : "bg-secondary/50 border-border hover:border-accent/30"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-foreground">
                                    {formatDateLong(booking.date)} · {formatTime12h(booking.time)}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {booking.partySize} guests · Ref: {booking.id}
                                  </p>
                                  {!eligible && disabledReason && (
                                    <p className="text-xs text-yellow-500 mt-1">{disabledReason}</p>
                                  )}
                                </div>
                                {selected && <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {errors.selectedBookingId && (
                      <p className="text-xs text-red-400">{errors.selectedBookingId.message}</p>
                    )}
                  </div>
                )}

                {/* Table number */}
                {dineInOption === "table" && (
                  <div className="space-y-2">
                    <label htmlFor="tableNumber" className="text-sm font-medium text-foreground">
                      Table Number
                      <span className="text-muted-foreground font-normal ml-1">(1–{TABLE_COUNT})</span>
                    </label>
                    <input
                      id="tableNumber"
                      type="number"
                      min={1}
                      max={TABLE_COUNT}
                      step={1}
                      placeholder="e.g. 5"
                      {...register("tableNumber")}
                      className={`w-full px-4 py-3 rounded-xl bg-background border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition ${
                        errors.tableNumber ? "border-red-500/60" : "border-border focus:border-accent/40"
                      }`}
                    />
                    {errors.tableNumber && (
                      <p className="text-xs text-red-400">{errors.tableNumber.message}</p>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Takeaway pickup */}
            {orderType === "takeaway" && (
              <section className="p-6 rounded-3xl bg-card border border-border/80 space-y-4">
                <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Pickup Time
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  {(["asap", "scheduled"] as const).map((mode) => {
                    const disabled = mode === "scheduled" && pickupSlots.length === 0;
                    return (
                      <button
                        key={mode}
                        type="button"
                        disabled={disabled}
                        onClick={() => setValue("pickupMode", mode)}
                        className={`py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                          disabled
                            ? "opacity-40 cursor-not-allowed bg-secondary/30 border-border"
                            : pickupMode === mode
                            ? "bg-accent/10 text-accent border-accent/40"
                            : "bg-secondary/60 text-foreground/60 border-border hover:border-accent/30"
                        }`}
                      >
                        {mode === "asap" ? "⚡ As soon as possible" : "🕐 Schedule"}
                      </button>
                    );
                  })}
                </div>

                {pickupMode === "asap" && (
                  <div className="p-3 rounded-xl bg-secondary/50 border border-border text-sm text-muted-foreground">
                    {isOpen ? (
                      <>
                        <Clock className="inline w-3.5 h-3.5 mr-1 -mt-0.5 text-accent" />
                        Estimated wait:{" "}
                        <span className="font-semibold text-foreground">{kitchenStatus.waitRange}</span>
                        {" "}({kitchenStatus.label})
                      </>
                    ) : (
                      <>
                        <Flame className="inline w-3.5 h-3.5 mr-1 -mt-0.5 text-primary" />
                        We&apos;ll start on your order when we open at{" "}
                        <span className="font-semibold text-foreground">
                          {OPENING_HOURS.displayFull?.split(" - ")[0] ?? "11:00 AM"}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {pickupMode === "scheduled" && pickupSlots.length > 0 && (
                  <div className="relative">
                    <select
                      {...register("scheduledTime")}
                      defaultValue={pickupSlots[0]}
                      className="w-full px-4 py-3 pr-10 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40 appearance-none"
                    >
                      {pickupSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {formatTime12h(slot)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                )}

                {pickupMode === "scheduled" && pickupSlots.length === 0 && (
                  <p className="text-xs text-muted-foreground p-3 rounded-xl bg-secondary/40 border border-border">
                    No more scheduled slots available today. Use ASAP instead.
                  </p>
                )}
              </section>
            )}

            {/* Contact */}
            <section className="p-6 rounded-3xl bg-card border border-border/80 space-y-4">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                Contact Details
              </h2>

              <div className="space-y-3">
                <div>
                  <label htmlFor="checkout-name" className="block text-sm font-medium text-foreground mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    placeholder="Your name"
                    {...register("name")}
                    className={`w-full px-4 py-3 rounded-xl bg-background border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition ${
                      errors.name ? "border-red-500/60" : "border-border focus:border-primary/40"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="checkout-phone" className="block text-sm font-medium text-foreground mb-1.5">
                    Phone Number{" "}
                    {orderType === "takeaway"
                      ? <span className="text-red-400">*</span>
                      : <span className="text-muted-foreground font-normal">(optional for dine-in)</span>}
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    placeholder="01700000000"
                    {...register("phone")}
                    className={`w-full px-4 py-3 rounded-xl bg-background border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition ${
                      errors.phone ? "border-red-500/60" : "border-border focus:border-primary/40"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Order note */}
            <section className="p-6 rounded-3xl bg-card border border-border/80 space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">
                Order Note
                <span className="text-muted-foreground font-normal text-sm ml-2">(optional)</span>
              </h2>
              <div>
                <textarea
                  id="checkout-note"
                  rows={3}
                  maxLength={200}
                  placeholder="Any special instructions for the kitchen..."
                  {...register("note")}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 resize-none transition"
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.note && (
                    <p className="text-xs text-red-400">{errors.note.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground ml-auto">
                    {noteValue?.length ?? 0}/200
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* ---- RIGHT: Summary ---- */}
          <aside className="sticky top-28 space-y-4">
            {/* Order summary card */}
            <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-md space-y-4">
              <h3 className="font-display text-lg font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-accent" />
                Order Summary
              </h3>

              {/* Items */}
              <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {reconciledItems.map((item) => (
                  <li key={item.menuItemId} className="flex gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
                      <FoodImage
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBDT(item.price)} × {item.qty}
                      </p>
                      {item.addedBy && (
                        <p className="text-[10px] text-accent font-medium">
                          Added by {item.addedBy}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-[11px] text-muted-foreground/70 italic truncate mt-0.5">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-foreground flex-shrink-0">
                      {formatBDT(item.price * item.qty)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Group Order Bill Breakdown */}
              {groupSession && (
                <div className="p-3 rounded-2xl bg-accent/10 border border-accent/30 space-y-1.5 text-xs">
                  <div className="font-bold text-accent text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Group Order ({groupSession.code})
                  </div>
                  <div className="space-y-1 divide-y divide-border/40 text-[11px]">
                    {Object.entries(getPerMemberBreakdown()).map(([diner, sum]) => (
                      <div key={diner} className="pt-1 flex justify-between text-muted-foreground">
                        <span>{diner}</span>
                        <span className="font-bold text-foreground">{formatBDT(sum)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatBDT(subtotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-foreground text-base">
                  <span>Total</span>
                  <span className="text-primary">{formatBDT(subtotal)}</span>
                </div>
              </div>

              {/* ETA */}
              <div className="p-3 rounded-xl bg-primary/8 border border-primary/20 text-xs space-y-1">
                <p className="font-semibold text-primary flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {eta.label}
                </p>
              </div>

              {/* Pay at restaurant notice */}
              <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-xs text-emerald-400 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Pay at the restaurant.</strong> No online payment needed.
                </span>
              </div>
            </div>

            {/* Place order button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-hover text-white font-bold text-sm shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Firing up your order...
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4" />
                  Place Order · {formatBDT(subtotal)}
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-muted-foreground">
              By placing an order you agree to our house rules.
            </p>
          </aside>
        </div>
      </form>
    </div>
  );
}
