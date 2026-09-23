"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingDetailsSchema, BookingDetailsInput } from "@/lib/validation";
import { formatDateLong, formatTime12h } from "@/lib/date";
import { useBookingStore } from "@/store/useBookingStore";
import { useProfileStore } from "@/store/useProfileStore";
import {
  X,
  Clock,
  Calendar,
  Users,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Flame,
} from "lucide-react";

interface WaitlistModalProps {
  date: string;
  time: string;
  partySize: number;
  reason?: string;
  alternatives: { date: string; time: string; seatsLeft: number }[];
  onClose: () => void;
  onSelectAlternative: (altDate: string, altTime: string) => void;
}

export default function WaitlistModal({
  date,
  time,
  partySize,
  reason,
  alternatives,
  onClose,
  onSelectAlternative,
}: WaitlistModalProps) {
  const { user, updateUser } = useProfileStore();
  const { joinWaitlist } = useBookingStore();
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingDetailsInput>({
    resolver: zodResolver(bookingDetailsSchema),
    defaultValues: {
      name: user.name || "",
      phone: user.phone || "",
    },
  });

  const onSubmit = (data: BookingDetailsInput) => {
    setErrorMsg("");
    const res = joinWaitlist({
      date,
      time,
      partySize,
      name: data.name,
      phone: data.phone,
    });

    if (!res.ok) {
      setErrorMsg(res.message);
      return;
    }

    // Auto update profile if user fields were empty
    if (!user.name || !user.phone) {
      updateUser({
        name: user.name || data.name,
        phone: user.phone || data.phone,
      });
    }

    setSuccessMsg(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-md"
      />

      <div className="relative w-full max-w-lg bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden z-10 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">
                Join Slot Waitlist
              </h3>
              <p className="text-xs text-muted-foreground">
                {formatDateLong(date)} at {formatTime12h(time)} ({partySize} guests)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reason Explanation */}
        <div className="p-3.5 rounded-xl bg-secondary/60 border border-border text-xs text-foreground/90 space-y-1">
          <span className="font-semibold text-accent block">
            Why Waitlist?
          </span>
          <p className="text-muted-foreground">
            {reason || "This slot is currently at full capacity for your party size."} If a table opens up or a guest cancels, you will receive first priority!
          </p>
        </div>

        {/* Alternative Suggestions */}
        {alternatives.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Alternative Available Slots
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {alternatives.map((alt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectAlternative(alt.date, alt.time)}
                  className="p-2.5 rounded-xl bg-background hover:bg-primary/10 border border-border hover:border-primary/50 text-left transition-all group"
                >
                  <div className="text-[11px] font-bold text-foreground group-hover:text-primary">
                    {formatTime12h(alt.time)}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {alt.date === date ? "Same Day" : formatDateLong(alt.date)}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-medium pt-0.5">
                    {alt.seatsLeft} seats left
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Success Feedback */}
        {successMsg ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
            <Flame className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-display text-lg font-bold text-emerald-400">
              Added to Waitlist!
            </h4>
            <p className="text-xs text-muted-foreground">
              We have saved your request. If a table opens up, we will notify you immediately.
            </p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80">Guest Name</label>
              <input
                type="text"
                {...register("name")}
                placeholder="Full Name"
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-accent"
              />
              {errors.name && (
                <p className="text-[11px] text-rose-400">{errors.name.message}</p>
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
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-accent"
              />
              {errors.phone && (
                <p className="text-[11px] text-rose-400">{errors.phone.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white font-semibold text-xs shadow-md hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Join Waitlist Priority</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
