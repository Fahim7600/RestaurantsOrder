"use client";

import { useBookingStore } from "@/store/useBookingStore";
import { formatDateLong, formatTime12h } from "@/lib/date";
import { Sparkles, Check, X } from "lucide-react";

export default function OfferBanner() {
  const { bookings, acceptOffer, declineOffer } = useBookingStore();
  const activeOffer = bookings.find((b) => b.status === "offered");

  if (!activeOffer) return null;

  const handleAccept = () => {
    const res = acceptOffer(activeOffer.id);
    if (!res.ok) {
      alert(res.message);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-accent/20 via-primary/15 to-accent/20 border border-accent/40 text-foreground shadow-lg animate-in slide-in-from-top-3 duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-accent text-background flex items-center justify-center shrink-0 font-bold shadow-md">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-accent uppercase tracking-wider">
              Waitlist Table Offer Available!
            </h4>
            <p className="text-xs text-foreground font-medium">
              A table opened up for <span className="font-bold text-accent">{formatDateLong(activeOffer.date)}</span> at{" "}
              <span className="font-bold text-accent">{formatTime12h(activeOffer.time)}</span> (Party of {activeOffer.partySize}).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleAccept}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/30 hover:scale-105 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Table Now</span>
          </button>
          <button
            onClick={() => declineOffer(activeOffer.id)}
            className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground text-xs transition-colors"
            aria-label="Decline offer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
