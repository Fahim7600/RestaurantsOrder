"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import FoodImage from "@/components/shared/FoodImage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProfileStore } from "@/store/useProfileStore";
import { useBookingStore } from "@/store/useBookingStore";
import { useOrderStore, Order } from "@/store/useOrderStore";
import { resetAllData } from "@/store/resetAll";
import { loadSampleHistory } from "@/lib/sampleData";
import { getBookingDisplayStatus, Booking } from "@/lib/booking";
import { formatBDT } from "@/lib/checkout";
import { formatDateLong, formatTime12h } from "@/lib/date";
import { nameSchema, phoneSchema } from "@/lib/validation";

import OfferBanner from "@/components/booking/OfferBanner";
import BookingCard from "@/components/booking/BookingCard";

import {
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  ChefHat,
  Sparkles,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Utensils,
  ArrowRight,
  Flame,
  AlertTriangle,
  Info,
  ShieldCheck,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Validation schema for Profile Details form
// ---------------------------------------------------------------------------

const profileFormSchema = z.object({
  name: nameSchema,
  email: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Please enter a valid email address.",
    }),
  phone: phoneSchema,
});

type ProfileFormInputs = z.infer<typeof profileFormSchema>;

// ---------------------------------------------------------------------------
// Derived Order Status Helper
// ---------------------------------------------------------------------------

export function getDerivedOrderStatus(
  order: Order,
  now: Date = new Date()
): "In progress" | "Completed" {
  const placedTime = new Date(order.placedAt).getTime();
  if (isNaN(placedTime)) return "Completed";

  const diffMinutes = (now.getTime() - placedTime) / (1000 * 60);

  if (diffMinutes > 60) return "Completed";
  if (diffMinutes < 0) return "In progress";

  try {
    const placedDate = new Date(order.placedAt);
    const parts = order.estimatedReadyTo.trim().split(" ");
    if (parts.length === 2) {
      const [timeStr, period] = parts;
      let h = Number(timeStr.split(":")[0]);
      const m = Number(timeStr.split(":")[1]);
      if (period.toUpperCase() === "PM" && h < 12) h += 12;
      if (period.toUpperCase() === "AM" && h === 12) h = 0;

      const readyTime = new Date(
        placedDate.getFullYear(),
        placedDate.getMonth(),
        placedDate.getDate(),
        h,
        m,
        0,
        0
      );

      if (now.getTime() < readyTime.getTime()) {
        return "In progress";
      }
      return "Completed";
    }
  } catch {
    // fallback
  }

  return diffMinutes <= 45 ? "In progress" : "Completed";
}

// ---------------------------------------------------------------------------
// Profile Skeleton Loader
// ---------------------------------------------------------------------------

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse max-w-6xl mx-auto">
      {/* Header Skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-secondary shrink-0" />
        <div className="space-y-3 text-center sm:text-left flex-1">
          <div className="h-6 w-48 bg-secondary rounded-md mx-auto sm:mx-0" />
          <div className="h-4 w-32 bg-secondary/70 rounded-md mx-auto sm:mx-0" />
          <div className="flex gap-2 justify-center sm:justify-start pt-2">
            <div className="h-6 w-24 bg-secondary rounded-full" />
            <div className="h-6 w-24 bg-secondary rounded-full" />
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="h-12 w-full bg-card rounded-2xl border border-border/80" />

      {/* Content Skeleton */}
      <div className="h-80 w-full bg-card rounded-3xl border border-border/80" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Profile Component (Inner)
// ---------------------------------------------------------------------------

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [ordersVisibleCount, setOrdersVisibleCount] = useState(10);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const { user, updateUser } = useProfileStore();
  const { bookings, hasActiveOffers } = useBookingStore();
  const { orders } = useOrderStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Tab state synced to URL query param ?tab=details|bookings|orders
  const rawTab = searchParams.get("tab");
  const activeTab =
    rawTab === "bookings" || rawTab === "orders" ? rawTab : "details";

  const handleTabChange = (tab: "details" | "bookings" | "orders") => {
    router.replace(`/profile?tab=${tab}`, { scroll: false });
  };

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    },
  });

  // Re-sync form when user store changes
  useEffect(() => {
    if (mounted) {
      reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, reset, mounted]);

  const onSaveProfile = (data: ProfileFormInputs) => {
    updateUser({
      name: data.name.trim(),
      email: data.email?.trim() || "",
      phone: data.phone.trim(),
    });
    showToast("Profile details updated successfully!");
  };

  const handleLoadSample = () => {
    const res = loadSampleHistory();
    showToast(
      `Loaded sample history: ${res.ordersLoaded} orders & ${res.bookingsLoaded} bookings!`
    );
  };

  const handleResetAll = () => {
    const res = resetAllData();
    setShowResetConfirm(false);
    if (res.ok) {
      showToast(res.message);
    }
  };

  if (!mounted) {
    return <ProfileSkeleton />;
  }

  // Derived initials for avatar
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  // Booking categorized lists
  const now = new Date();
  const upcomingBookings = bookings
    .filter((b) => getBookingDisplayStatus(b, now) === "Confirmed")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const waitlistBookings = bookings.filter((b) => {
    const s = getBookingDisplayStatus(b, now);
    return s === "Waitlisted" || s === "Offered";
  });

  const pastBookings = bookings
    .filter((b) => {
      const s = getBookingDisplayStatus(b, now);
      return s === "Completed" || s === "Cancelled" || s === "Expired";
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const hasAnyBookings = bookings.length > 0;
  const hasUpcomingBookings = upcomingBookings.length > 0 || waitlistBookings.length > 0;

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-6xl mx-auto">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-card border border-primary/40 text-foreground shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-md flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent/80 text-white flex items-center justify-center font-extrabold text-2xl shadow-xl ring-4 ring-background shrink-0">
          {initials ? initials : <ChefHat className="w-10 h-10" />}
        </div>

        {/* Info */}
        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <h1 className="text-2xl font-bold font-serif tracking-tight text-foreground">
              {user.name ? user.name : "Guest Diner"}
            </h1>
            {user.name && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 text-xs font-semibold">
                <Sparkles className="w-3 h-3" /> Preferred Diner
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {user.phone ? user.phone : "No phone saved"} {user.email ? `• ${user.email}` : ""}
          </p>

          {/* Stat Chips */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border/80 text-xs font-semibold text-foreground">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Bookings ({bookings.length})
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border/80 text-xs font-semibold text-foreground">
              <ShoppingBag className="w-3.5 h-3.5 text-accent" />
              Orders ({orders.length})
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex p-1.5 rounded-2xl bg-card border border-border/80 shadow-sm gap-1">
        <button
          onClick={() => handleTabChange("details")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "details"
              ? "bg-primary text-white shadow-md shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Details</span>
        </button>

        <button
          onClick={() => handleTabChange("bookings")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "bookings"
              ? "bg-primary text-white shadow-md shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Bookings ({bookings.length})</span>
        </button>

        <button
          onClick={() => handleTabChange("orders")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "orders"
              ? "bg-primary text-white shadow-md shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders ({orders.length})</span>
        </button>
      </div>

      {/* Tab Panels (Kept Mounted in DOM so form state is preserved) */}
      <div className="space-y-6">
        {/* TAB 1: DETAILS */}
        <div className={activeTab === "details" ? "space-y-6" : "hidden"}>
          {!user.name && (
            <div className="p-4 rounded-2xl bg-accent/10 border border-accent/30 text-foreground flex items-center gap-3">
              <Info className="w-5 h-5 text-accent shrink-0" />
              <p className="text-xs font-medium">
                <span className="font-bold text-accent">Tell us who&apos;s dining:</span> Save your contact details below to speed up future table reservations and orders.
              </p>
            </div>
          )}

          {/* Form Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 space-y-6 shadow-md">
            <h2 className="text-lg font-bold font-serif text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Profile & Contact Details
            </h2>

            <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" /> Full Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahat Ahmed"
                    {...register("name")}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  {errors.name && (
                    <p className="text-xs text-rose-400 font-medium">{errors.name.message}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" /> Phone Number <span className="text-primary">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="017XXXXXXXX"
                    {...register("phone")}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  {errors.phone && (
                    <p className="text-xs text-rose-400 font-medium">{errors.phone.message}</p>
                  )}
                </div>

                {/* Email (Optional) */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-accent" /> Email Address <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="rahat@example.com"
                    {...register("email")}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-400 font-medium">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!isDirty || !isValid}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-primary/20 transition-all"
                >
                  Save Profile Details
                </button>
              </div>
            </form>
          </div>

          {/* Demo Tools Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-accent/30 space-y-5 shadow-md relative overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border/60 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/30 text-accent flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground font-serif">
                  🧪 Demo & Testing Tools
                </h3>
                <p className="text-xs text-muted-foreground">
                  Quickly populate realistic sample orders/bookings or reset local storage state for assessment testing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Load Sample History */}
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border/80 space-y-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-accent" /> Load Sample History
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Adds 4 sample orders &amp; 5 sample bookings (past, waitlisted, upcoming) without overwriting your real entries.
                  </p>
                </div>
                <button
                  onClick={handleLoadSample}
                  className="w-full py-2.5 px-4 rounded-xl bg-accent hover:bg-accent-hover text-background text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Load Sample History</span>
                </button>
              </div>

              {/* Reset All Data */}
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Reset All Demo Data
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Destructive reset: clears cart, reservations, order history, profile data, and simulated seat releases.
                  </p>
                </div>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Reset All Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 2: BOOKINGS */}
        <div className={activeTab === "bookings" ? "space-y-6" : "hidden"}>
          {hasActiveOffers() && <OfferBanner />}

          {!hasAnyBookings ? (
            /* Dedicated Reservation Empty State */
            <div className="p-12 rounded-3xl bg-card border border-border/80 text-center space-y-5 max-w-md mx-auto shadow-md">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-serif text-foreground">
                  No Reservations Yet
                </h3>
                <p className="text-xs text-muted-foreground">
                  You haven&apos;t booked a table at Flame &amp; Spice. Join us for wood-fired culinary perfection.
                </p>
              </div>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/25 transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Book a Table Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Inline warning if no upcoming reservations */}
              {!hasUpcomingBookings && (
                <div className="p-4 rounded-2xl bg-secondary/80 border border-border flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <Info className="w-4 h-4 text-accent" />
                    <span>You have no upcoming active reservations.</span>
                  </div>
                  <Link
                    href="/book"
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-all"
                  >
                    Book a Table
                  </Link>
                </div>
              )}

              {/* SECTION: Upcoming */}
              {upcomingBookings.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold font-serif text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Upcoming Reservations ({upcomingBookings.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingBookings.map((b) => (
                      <BookingCard key={b.id} booking={b} />
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: Waitlist & Offers */}
              {waitlistBookings.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold font-serif text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
                    <Sparkles className="w-4 h-4 text-accent" /> Priority Waitlist &amp; Offers ({waitlistBookings.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {waitlistBookings.map((b) => (
                      <BookingCard key={b.id} booking={b} />
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: Past */}
              {pastBookings.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold font-serif text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
                    <Clock className="w-4 h-4 text-muted-foreground" /> Past &amp; Cancelled Reservations ({pastBookings.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pastBookings.map((b) => (
                      <BookingCard key={b.id} booking={b} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* TAB 3: ORDERS */}
        <div className={activeTab === "orders" ? "space-y-6" : "hidden"}>
          {orders.length === 0 ? (
            /* Dedicated Order Empty State */
            <div className="p-12 rounded-3xl bg-card border border-border/80 text-center space-y-5 max-w-md mx-auto shadow-md">
              <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-serif text-foreground">
                  No Orders Placed Yet
                </h3>
                <p className="text-xs text-muted-foreground">
                  Explore our menu of Bangladeshi, Indian, and Italian fusion dishes and order takeaway or dine-in.
                </p>
              </div>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/25 transition-all"
              >
                <Utensils className="w-4 h-4" />
                <span>Explore the Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="text-base font-bold font-serif text-foreground flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-accent" /> Order History ({orders.length})
                </h3>
                <span className="text-xs text-muted-foreground">
                  Showing top {Math.min(ordersVisibleCount, orders.length)} of {orders.length}
                </span>
              </div>

              {orders.slice(0, ordersVisibleCount).map((order) => {
                const derivedStatus = getDerivedOrderStatus(order, now);
                const isExpanded = expandedOrderId === order.id;

                return (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-card border border-border/80 space-y-4 shadow-sm hover:border-accent/40 transition-all"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-accent px-2.5 py-1 rounded-md bg-secondary border border-border">
                          {order.id}
                        </span>
                        {order.isSample && (
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                            Sample
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.placedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Chips & Status */}
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border text-[11px] font-semibold">
                          {order.type === "dine-in"
                            ? order.dineIn?.tableNumber
                              ? `Dine-in · Table ${order.dineIn.tableNumber}`
                              : `Dine-in · Booking ${order.dineIn?.bookingId || ""}`
                            : order.pickup?.mode === "asap"
                            ? "Takeaway · ASAP"
                            : `Takeaway · ${order.pickup?.time || "Scheduled"}`}
                        </span>

                        {derivedStatus === "In progress" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold animate-pulse">
                            <Clock className="w-3.5 h-3.5" /> In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Summary row */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">
                        {order.items.length} {order.items.length === 1 ? "item" : "items"}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-accent text-sm">
                          {formatBDT(order.total)}
                        </span>
                        <button
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="flex items-center gap-1 text-xs text-primary font-bold hover:underline"
                        >
                          <span>{isExpanded ? "Hide Details" : "View Items"}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Accordion */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-border/50 space-y-3 animate-in fade-in duration-200">
                        {/* Kitchen snapshot note */}
                        <div className="p-2.5 rounded-xl bg-secondary/60 border border-border/80 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-primary" /> Kitchen Context:
                          </span>
                          <span className="font-semibold text-foreground">
                            Placed during {order.kitchen.emoji} {order.kitchen.label} ({order.kitchen.waitRange})
                          </span>
                        </div>

                        {/* Item Breakdown */}
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-2 rounded-xl bg-background/50 border border-border/40"
                            >
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0 relative">
                                <FoodImage
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-foreground truncate">
                                  {item.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {item.qty} × {formatBDT(item.price)}
                                </p>
                                {item.notes && (
                                  <p className="text-[10px] text-amber-400 italic">
                                    Note: &quot;{item.notes}&quot;
                                  </p>
                                )}
                              </div>
                              <span className="text-xs font-semibold text-foreground shrink-0">
                                {formatBDT(item.price * item.qty)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Show More Pagination Button */}
              {orders.length > ordersVisibleCount && (
                <div className="pt-4 text-center">
                  <button
                    onClick={() => setOrdersVisibleCount((prev) => prev + 10)}
                    className="px-6 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-bold transition-all shadow-sm"
                  >
                    Show More Orders
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border/80 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold font-serif text-foreground">
                Reset All Demo Data?
              </h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              This action is <span className="font-bold text-rose-400">destructive and irreversible</span>. The following data will be cleared:
            </p>

            <ul className="text-xs text-foreground/90 space-y-1.5 bg-secondary/50 p-3.5 rounded-2xl border border-border/60 list-disc list-inside">
              <li>Active shopping cart items</li>
              <li>All table reservations &amp; waitlist entries</li>
              <li>Simulated table opening seat releases</li>
              <li>All past order receipts</li>
              <li>Saved profile details (name, email, phone)</li>
            </ul>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleResetAll}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Export Page with Suspense boundary
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}
