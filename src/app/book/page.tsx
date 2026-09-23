"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingDetailsSchema, BookingDetailsInput } from "@/lib/validation";
import {
  toLocalISODate,
  addDays,
  formatDateLong,
  formatTime12h,
  isPastSlot,
} from "@/lib/date";
import { getSlotStatus, Booking } from "@/lib/booking";
import {
  MIN_PARTY_SIZE,
  MAX_PARTY_SIZE,
  STEPPER_LIMIT,
  BOOKING_WINDOW_DAYS,
} from "@/lib/config";
import { generateAvailabilityData } from "@/data/availability";
import { useBookingStore } from "@/store/useBookingStore";
import { useProfileStore } from "@/store/useProfileStore";
import BookingCard from "@/components/booking/BookingCard";
import WaitlistModal from "@/components/booking/WaitlistModal";
import LargeGroupCard from "@/components/booking/LargeGroupCard";
import OfferBanner from "@/components/booking/OfferBanner";
import KitchenStatusPanel from "@/components/booking/KitchenStatusPanel";
import {
  Calendar,
  Clock,
  Users,
  Utensils,
  Flame,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  User,
  Phone,
} from "lucide-react";

export default function BookPage() {
  const [mounted, setMounted] = useState(false);
  const todayStr = useMemo(() => toLocalISODate(new Date()), []);
  const maxDateStr = useMemo(
    () => addDays(todayStr, BOOKING_WINDOW_DAYS - 1),
    [todayStr]
  );

  const [partySize, setPartySize] = useState<number>(2);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [revalNotice, setRevalNotice] = useState<string>("");

  const [waitlistSlot, setWaitlistSlot] = useState<{
    date: string;
    time: string;
    reason?: string;
  } | null>(null);

  const [successBooking, setSuccessBooking] = useState<Booking | null>(null);
  const [submitError, setSubmitError] = useState<{
    reason: string;
    message: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { bookings, released, confirmBooking } = useBookingStore();
  const { user, updateUser } = useProfileStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookingDetailsInput>({
    resolver: zodResolver(bookingDetailsSchema),
    defaultValues: {
      name: user.name || "",
      phone: user.phone || "",
    },
  });

  // Prefill when profile loads
  useEffect(() => {
    if (user.name) setValue("name", user.name);
    if (user.phone) setValue("phone", user.phone);
  }, [user, setValue]);

  // Compute availability grid for chosen date
  const availabilityGrid = useMemo(() => {
    if (!mounted) return { lunch: [], dinner: [] };
    const availData = generateAvailabilityData();
    const dayData = availData.find((d) => d.date === selectedDate);
    if (!dayData) return { lunch: [], dinner: [] };

    const lunch: { time: string; status: ReturnType<typeof getSlotStatus> }[] = [];
    const dinner: { time: string; status: ReturnType<typeof getSlotStatus> }[] = [];

    dayData.slots.forEach((slot) => {
      const slotKey = `${selectedDate}|${slot.time}`;
      const releasedCount = released[slotKey] || 0;
      const status = getSlotStatus(
        selectedDate,
        slot.time,
        partySize,
        slot.totalSeats,
        slot.bookedSeats,
        releasedCount,
        bookings
      );

      const hour = parseInt(slot.time.split(":")[0], 10);
      if (hour < 16) {
        lunch.push({ time: slot.time, status });
      } else {
        dinner.push({ time: slot.time, status });
      }
    });

    return { lunch, dinner };
  }, [selectedDate, partySize, released, bookings, mounted]);

  // Live Re-validation on partySize or date change
  useEffect(() => {
    if (selectedTime && mounted) {
      const availData = generateAvailabilityData();
      const dayData = availData.find((d) => d.date === selectedDate);
      const slotData = dayData?.slots.find((s) => s.time === selectedTime);

      if (slotData) {
        const slotKey = `${selectedDate}|${selectedTime}`;
        const releasedCount = released[slotKey] || 0;
        const status = getSlotStatus(
          selectedDate,
          selectedTime,
          partySize,
          slotData.totalSeats,
          slotData.bookedSeats,
          releasedCount,
          bookings
        );

        if (status.state === "full" || status.state === "insufficient" || status.state === "past") {
          const formattedTime = formatTime12h(selectedTime);
          setRevalNotice(`${formattedTime} no longer fits a party of ${partySize}.`);
          setSelectedTime("");
          setTimeout(() => setRevalNotice(""), 4000);
        }
      }
    }
  }, [partySize, selectedDate, selectedTime, released, bookings, mounted]);

  // Quick 14-day date chips generator
  const dateOptions = useMemo(() => {
    const list = [];
    for (let i = 0; i < BOOKING_WINDOW_DAYS; i++) {
      const d = addDays(todayStr, i);
      list.push(d);
    }
    return list;
  }, [todayStr]);

  const handleTimeSlotClick = (time: string, statusState: string, reason?: string) => {
    setSubmitError(null);
    if (statusState === "past" || statusState === "too-late") return;

    if (statusState === "full" || statusState === "insufficient") {
      setWaitlistSlot({ date: selectedDate, time, reason });
      return;
    }

    setSelectedTime(time);
  };

  const onSubmit = async (data: BookingDetailsInput) => {
    if (isSubmitting || !selectedTime) return;
    setIsSubmitting(true);
    setSubmitError(null);

    // Simulate 600ms processing delay with spinner
    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = confirmBooking({
      date: selectedDate,
      time: selectedTime,
      partySize,
      name: data.name,
      phone: data.phone,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      if (result.reason === "PAST" || result.reason === "TOO_LATE") {
        setSelectedTime("");
      }
      setSubmitError({ reason: result.reason, message: result.message });
      return;
    }

    // Auto-save user profile details if empty
    if (!user.name || !user.phone) {
      updateUser({
        name: user.name || data.name,
        phone: user.phone || data.phone,
      });
    }

    setSuccessBooking(result.booking);
  };

  // Find alternative slots for WaitlistModal
  const waitlistAlternatives = useMemo(() => {
    if (!waitlistSlot || !mounted) return [];
    const availData = generateAvailabilityData();
    return availData
      .flatMap((day) =>
        day.slots.map((s) => ({
          date: day.date,
          time: s.time,
          seatsLeft: getSlotStatus(
            day.date,
            s.time,
            partySize,
            s.totalSeats,
            s.bookedSeats,
            released[`${day.date}|${s.time}`] || 0,
            bookings
          ).seatsLeft,
          state: getSlotStatus(
            day.date,
            s.time,
            partySize,
            s.totalSeats,
            s.bookedSeats,
            released[`${day.date}|${s.time}`] || 0,
            bookings
          ).state,
        }))
      )
      .filter(
        (slot) =>
          (slot.state === "available" || slot.state === "limited") &&
          !(slot.date === waitlistSlot.date && slot.time === waitlistSlot.time)
      )
      .slice(0, 3);
  }, [waitlistSlot, partySize, released, bookings, mounted]);

  const userBookings = bookings.filter((b) => b.status !== "cancelled");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Active Offer Notification Banner */}
      <OfferBanner />

      {/* Page Heading */}
      <div className="space-y-2 text-center sm:text-left border-b border-border pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
          <Utensils className="w-3.5 h-3.5" />
          <span>Table Reservation</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
          Book a Table at Flame & Spice
        </h1>
        <p className="text-sm text-muted-foreground">
          Reserve your culinary experience. Instant confirmation with live table availability.
        </p>
      </div>

      {/* Main Grid (Form Left, Summary Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Container Left */}
        <div className="lg:col-span-2 space-y-8">
          {/* STEP 1: Party Size Stepper */}
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                <span>1. Party Size</span>
              </label>
              <span className="text-xs text-muted-foreground font-medium">
                Max {MAX_PARTY_SIZE} guests per online table
              </span>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => setPartySize((prev) => Math.max(MIN_PARTY_SIZE, prev - 1))}
                disabled={partySize <= MIN_PARTY_SIZE}
                className="w-12 h-12 rounded-2xl bg-secondary hover:bg-secondary/80 disabled:opacity-40 text-foreground flex items-center justify-center border border-border transition-all"
                aria-label="Decrease party size"
              >
                <Minus className="w-5 h-5" />
              </button>

              <div className="flex-1 text-center py-3 rounded-2xl bg-background border border-border">
                <span className="font-display text-2xl font-bold text-foreground">
                  {partySize} {partySize === 1 ? "Guest" : "Guests"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setPartySize((prev) => Math.min(STEPPER_LIMIT, prev + 1))}
                disabled={partySize >= STEPPER_LIMIT}
                className="w-12 h-12 rounded-2xl bg-secondary hover:bg-secondary/80 disabled:opacity-40 text-foreground flex items-center justify-center border border-border transition-all"
                aria-label="Increase party size"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {partySize >= STEPPER_LIMIT && (
              <p className="text-xs text-amber-400 font-medium pt-1">
                Maximum stepper limit of {STEPPER_LIMIT} reached. Please call our host team for larger banquets.
              </p>
            )}
          </div>

          {/* Large Group Card Override */}
          {partySize > MAX_PARTY_SIZE ? (
            <LargeGroupCard onReduceTo12={() => setPartySize(12)} />
          ) : (
            <>
              {/* STEP 2: Date Selector */}
              <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-accent" />
                    <span>2. Date Selection</span>
                  </label>
                  <span className="text-xs text-accent font-medium">
                    Bookings open 14 days ahead
                  </span>
                </div>

                {/* Horizontal Date Chips Carousel */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
                  {dateOptions.map((dateStr) => {
                    const isSelected = selectedDate === dateStr;
                    const dateObj = new Date(dateStr);
                    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                    const monthDay = dateObj.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => setSelectedDate(dateStr)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/25 scale-105 font-bold"
                            : "bg-secondary/60 border-border/80 text-foreground/80 hover:border-accent hover:text-foreground"
                        }`}
                      >
                        <div className="text-[11px] uppercase tracking-wider opacity-80">
                          {dayName}
                        </div>
                        <div className="text-xs font-bold pt-0.5">{monthDay}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: Time Slot Selection */}
              <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    <span>3. Preferred Time Slot</span>
                  </label>

                  {revalNotice && (
                    <span
                      aria-live="polite"
                      className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20 animate-pulse"
                    >
                      {revalNotice}
                    </span>
                  )}
                </div>

                {/* Lunch Group */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-accent uppercase tracking-wider">
                    Lunch Service (11:30 AM - 3:00 PM)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {availabilityGrid.lunch.map(({ time, status }) => {
                      const isSelected = selectedTime === time;
                      const isPastOrLate = status.state === "past" || status.state === "too-late";
                      const isFullOrInsuff = status.state === "full" || status.state === "insufficient";

                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={isPastOrLate}
                          onClick={() => handleTimeSlotClick(time, status.state, status.reason)}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            isPastOrLate
                              ? "bg-muted/40 border-border/40 text-muted-foreground/50 cursor-not-allowed opacity-60"
                              : isSelected
                              ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-102"
                              : isFullOrInsuff
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 cursor-pointer"
                              : "bg-secondary/60 border-border/80 text-foreground hover:border-accent"
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-sm">
                            <span>{formatTime12h(time)}</span>
                            {isFullOrInsuff && (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20">
                                Waitlist
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-[11px] font-medium pt-1 ${
                              isSelected
                                ? "text-white/90"
                                : isFullOrInsuff
                                ? "text-amber-400"
                                : status.state === "limited"
                                ? "text-accent font-semibold"
                                : "text-muted-foreground"
                            }`}
                          >
                            {status.reason}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dinner Group */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-accent uppercase tracking-wider">
                    Dinner Service (6:00 PM - 11:00 PM)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {availabilityGrid.dinner.map(({ time, status }) => {
                      const isSelected = selectedTime === time;
                      const isPastOrLate = status.state === "past" || status.state === "too-late";
                      const isFullOrInsuff = status.state === "full" || status.state === "insufficient";

                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={isPastOrLate}
                          onClick={() => handleTimeSlotClick(time, status.state, status.reason)}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            isPastOrLate
                              ? "bg-muted/40 border-border/40 text-muted-foreground/50 cursor-not-allowed opacity-60"
                              : isSelected
                              ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-102"
                              : isFullOrInsuff
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 cursor-pointer"
                              : "bg-secondary/60 border-border/80 text-foreground hover:border-accent"
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-sm">
                            <span>{formatTime12h(time)}</span>
                            {isFullOrInsuff && (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20">
                                Waitlist
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-[11px] font-medium pt-1 ${
                              isSelected
                                ? "text-white/90"
                                : isFullOrInsuff
                                ? "text-amber-400"
                                : status.state === "limited"
                                ? "text-accent font-semibold"
                                : "text-muted-foreground"
                            }`}
                          >
                            {status.reason}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* STEP 4: Guest Details Form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 space-y-6 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <label className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-accent" />
                    <span>4. Guest Information</span>
                  </label>
                </div>

                {submitError && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> {submitError.message}
                    </div>
                    {submitError.reason === "DUPLICATE" && (
                      <Link
                        href="/profile"
                        className="text-accent underline font-semibold block pt-1"
                      >
                        View active bookings in your profile →
                      </Link>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">Guest Name</label>
                    <input
                      type="text"
                      {...register("name")}
                      placeholder="e.g., Arfan Ahmed"
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-accent"
                    />
                    {errors.name && (
                      <p className="text-[11px] text-rose-400 font-medium">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">
                      Bangladeshi Mobile Phone
                    </label>
                    <input
                      type="tel"
                      {...register("phone")}
                      placeholder="01700000000"
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-accent"
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-rose-400 font-medium">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedTime || isSubmitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-hover disabled:opacity-50 text-white font-semibold text-sm shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Flame className="w-5 h-5 text-white animate-spin" />
                      <span>Confirming Table...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Confirm Table Reservation</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Sticky Reservation Summary Right */}
        <aside className="lg:col-span-1 sticky top-28 space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-md space-y-6">
            <h3 className="font-display text-lg font-bold text-foreground border-b border-border pb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Your Reservation Summary
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/60 border border-border">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" /> Party Size
                </span>
                <span className="font-bold text-foreground text-sm">
                  {partySize} {partySize === 1 ? "Guest" : "Guests"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/60 border border-border">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Date
                </span>
                <span className="font-semibold text-foreground">
                  {formatDateLong(selectedDate)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/60 border border-border">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" /> Time Slot
                </span>
                <span
                  className={`font-bold ${
                    selectedTime ? "text-primary text-sm" : "text-muted-foreground italic"
                  }`}
                >
                  {selectedTime ? formatTime12h(selectedTime) : "Not selected yet"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-primary leading-relaxed space-y-1">
              <span className="font-bold block">✓ No Booking Fee Required</span>
              <p className="text-[11px] text-muted-foreground">
                We hold tables for up to 15 minutes past your reserved time. Please notify us if running late.
              </p>
            </div>
          </div>

          {/* Kitchen Status — live, informational only */}
          <KitchenStatusPanel />
        </aside>
      </div>

      {/* User's Existing Reservations Listing Below */}
      <section className="pt-8 border-t border-border space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Utensils className="w-6 h-6 text-primary" /> Your Active Reservations
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            {userBookings.length} {userBookings.length === 1 ? "booking" : "bookings"}
          </span>
        </div>

        {userBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userBookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-card border border-border/80 text-center space-y-3 max-w-md mx-auto">
            <Flame className="w-8 h-8 text-accent mx-auto" />
            <h4 className="font-display text-base font-bold text-foreground">
              No Active Table Bookings
            </h4>
            <p className="text-xs text-muted-foreground">
              When you reserve a table or join a waitlist, your confirmation cards will appear here.
            </p>
          </div>
        )}
      </section>

      {/* Waitlist Modal */}
      {waitlistSlot && (
        <WaitlistModal
          date={waitlistSlot.date}
          time={waitlistSlot.time}
          partySize={partySize}
          reason={waitlistSlot.reason}
          alternatives={waitlistAlternatives}
          onClose={() => setWaitlistSlot(null)}
          onSelectAlternative={(altDate, altTime) => {
            setSelectedDate(altDate);
            setSelectedTime(altTime);
            setWaitlistSlot(null);
          }}
        />
      )}

      {/* Success Modal */}
      {successBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md" />

          <div className="relative w-full max-w-md bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden z-10 p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-accent px-3 py-1 rounded-md bg-secondary border border-border inline-block">
                REF: {successBooking.id}
              </span>
              <h3 className="font-display text-2xl font-bold text-foreground pt-2">
                Table Reserved!
              </h3>
              <p className="text-xs text-muted-foreground">
                We look forward to hosting you at Flame & Spice.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/60 border border-border text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Guest Name:</span>
                <span className="font-bold text-foreground">{successBooking.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-bold text-foreground">{formatDateLong(successBooking.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-bold text-foreground">{formatTime12h(successBooking.time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Party Size:</span>
                <span className="font-bold text-foreground">{successBooking.partySize} Guests</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/profile"
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>View My Bookings</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSuccessBooking(null);
                  setSelectedTime("");
                }}
                className="w-full py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs border border-border transition-colors"
              >
                Book Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
