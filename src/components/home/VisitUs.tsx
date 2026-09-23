import { OPENING_HOURS, LARGE_GROUP_PHONE, RESTAURANT_ADDRESS } from "@/lib/config";
import { MapPin, Clock, Phone, Utensils } from "lucide-react";

export default function VisitUs() {
  return (
    <section className="py-12 bg-card/40 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            Find &amp; Contact Us
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Visit Flame &amp; Spice
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            We look forward to welcoming you for an unforgettable dining experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Address */}
          <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-3 shadow-sm hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 text-accent border border-accent/30 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-serif text-foreground">Location</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {RESTAURANT_ADDRESS}
            </p>
          </div>

          {/* Opening Hours */}
          <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-3 shadow-sm hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-serif text-foreground">Opening Hours</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><span className="font-bold text-foreground">Lunch:</span> {OPENING_HOURS.displayLunch}</p>
              <p><span className="font-bold text-foreground">Dinner:</span> {OPENING_HOURS.displayDinner}</p>
              <p className="text-[11px] text-accent font-semibold pt-1">Open 7 days a week</p>
            </div>
          </div>

          {/* Contact & Phone Link */}
          <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-3 shadow-sm hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-serif text-foreground">Reservations &amp; Help</h3>
            <p className="text-xs text-muted-foreground">
              For large groups over 12 guests or special events:
            </p>
            <a
              href={`tel:${LARGE_GROUP_PHONE.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-accent hover:text-accent-hover transition-colors pt-1"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{LARGE_GROUP_PHONE}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
