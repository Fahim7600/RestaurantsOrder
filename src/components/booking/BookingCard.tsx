"use client";

import { useState } from "react";
import { Booking, getBookingDisplayStatus } from "@/lib/booking";
import { formatDateLong, formatTime12h } from "@/lib/date";
import { useBookingStore } from "@/store/useBookingStore";
import { useCartStore } from "@/store/useCartStore";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  Flame,
  User,
  Phone,
} from "lucide-react";

interface BookingCardProps {
  booking: Booking;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const { cancelBooking, acceptOffer, declineOffer, simulateSeatsOpening } =
    useBookingStore();
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const now = new Date();
  const displayStatus = getBookingDisplayStatus(booking, now);

  const handleCancel = () => {
    cancelBooking(booking.id);
    setShowConfirmCancel(false);
  };

  const handleSimulateOpening = () => {
    setSimulating(true);
    const result = simulateSeatsOpening(booking.date, booking.time, 4);
    setTimeout(() => {
      setSimulating(false);
    }, 600);
  };

  const handleAcceptOffer = () => {
    const res = acceptOffer(booking.id);
    if (!res.ok) {
      alert(res.message);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-4 shadow-sm hover:border-primary/40 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-accent px-2.5 py-1 rounded-md bg-secondary border border-border">
            {booking.id}
          </span>
          <span className="text-xs font-semibold text-foreground">
            {booking.name}
          </span>
        </div>

        {/* Status Badge */}
        <div>
          {displayStatus === "Confirmed" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
            </span>
          )}

          {displayStatus === "Offered" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent border border-accent/40 text-xs font-bold animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> Table Opened!
            </span>
          )}

          {displayStatus === "Waitlisted" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5" /> Waitlist
            </span>
          )}

          {displayStatus === "Completed" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-muted-foreground border border-border text-xs font-medium">
              Completed
            </span>
          )}

          {displayStatus === "Cancelled" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-medium">
              <XCircle className="w-3.5 h-3.5" /> Cancelled
            </span>
          )}

          {displayStatus === "Expired" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">
              Expired
            </span>
          )}
        </div>
      </div>

      {/* Booking Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2 text-foreground/90">
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          <span>{formatDateLong(booking.date)}</span>
        </div>

        <div className="flex items-center gap-2 text-foreground/90">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <span>{formatTime12h(booking.time)}</span>
        </div>

        <div className="flex items-center gap-2 text-foreground/90">
          <Users className="w-4 h-4 text-accent shrink-0" />
          <span>{booking.partySize} {booking.partySize === 1 ? "Guest" : "Guests"}</span>
        </div>
      </div>

      {/* Table Offered Alert */}
      {displayStatus === "Offered" && (
        <div className="p-3.5 rounded-xl bg-accent/10 border border-accent/30 space-y-2">
          <p className="text-xs text-accent font-semibold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> A table has opened up for your party!
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAcceptOffer}
              className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md"
            >
              Confirm Now
            </button>
            <button
              onClick={() => declineOffer(booking.id)}
              className="px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground text-xs font-medium"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
        {displayStatus === "Waitlisted" && (
          <button
            onClick={handleSimulateOpening}
            disabled={simulating}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent text-[11px] font-semibold border border-accent/20 transition-all"
            title="Demo tool: release seats to test FIFO waitlist promotion"
          >
            <Flame className={`w-3.5 h-3.5 ${simulating ? "animate-spin" : ""}`} />
            <span>{simulating ? "Releasing seats..." : "Demo: Simulate table opening"}</span>
          </button>
        )}

        {(displayStatus === "Confirmed" || displayStatus === "Waitlisted") && (
          <div className="ml-auto">
            {showConfirmCancel ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-rose-400 font-semibold">Confirm cancel?</span>
                <button
                  onClick={handleCancel}
                  className="px-2.5 py-1 rounded bg-rose-600 text-white text-xs font-bold"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowConfirmCancel(false)}
                  className="px-2.5 py-1 rounded bg-secondary text-foreground text-xs"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmCancel(true)}
                className="text-xs text-muted-foreground hover:text-rose-400 transition-colors font-medium"
              >
                {displayStatus === "Waitlisted" ? "Leave Waitlist" : "Cancel Reservation"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
