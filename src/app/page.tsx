import Link from "next/link";
import {
  Flame,
  Utensils,
  ChefHat,
  Clock,
  Users,
  MapPin,
  ShoppingBag,
  Star,
  Phone,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Header */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wider uppercase">
          <Flame className="w-4 h-4 animate-bounce" />
          <span>Design System & Layout Scaffolding</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
          Flame & Spice <span className="text-primary">Design System</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Welcome to the project scaffolding. Below is the visual confirmation of our bold, spicy restaurant theme, featuring custom Tailwind CSS tokens, display typography, and curated restaurant icons.
        </p>

        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/book"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200"
          >
            <Utensils className="w-4 h-4" />
            <span>Test Book CTA</span>
          </Link>
          <a
            href="#tokens"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-sm border border-border transition-all duration-200"
          >
            <span>Explore Palette</span>
            <ArrowRight className="w-4 h-4 text-accent" />
          </a>
        </div>
      </section>

      {/* Color Palette Showcase */}
      <section id="tokens" className="space-y-6">
        <div className="border-b border-border pb-4">
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
            <span className="w-3 h-8 rounded-full bg-primary inline-block"></span>
            Theme Palette & CSS Variables
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configured as Tailwind CSS theme variables in <code className="text-accent">globals.css</code> for effortless adjustments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary Color Card */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-sm hover:border-primary/50 transition-colors">
            <div className="h-24 rounded-xl bg-primary flex items-center justify-center text-white shadow-inner">
              <span className="font-display text-lg font-bold">Chili Red</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-foreground">Primary Token</span>
                <span className="text-accent font-mono text-xs">#C1272D</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Used for primary buttons, active badges, hot highlights, and branding accents.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-primary text-white text-xs font-bold">
                Primary Badge
              </span>
              <span className="px-2.5 py-1 rounded-md bg-primary/15 text-primary text-xs font-bold border border-primary/20">
                Primary Soft
              </span>
            </div>
          </div>

          {/* Secondary / Background Card */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-sm hover:border-accent/50 transition-colors">
            <div className="h-24 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground shadow-inner">
              <span className="font-display text-lg font-bold">Charcoal Base</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-foreground">Secondary / BG Token</span>
                <span className="text-accent font-mono text-xs">#12100E / #2B2420</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Rich dark warm background creating an intimate, premium restaurant atmosphere.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-bold border border-border">
                Charcoal Container
              </span>
            </div>
          </div>

          {/* Accent Color Card */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-sm hover:border-accent/50 transition-colors">
            <div className="h-24 rounded-xl bg-accent flex items-center justify-center text-background shadow-inner">
              <span className="font-display text-lg font-bold text-background">Spicy Gold</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-foreground">Accent Token</span>
                <span className="text-accent font-mono text-xs">#D4A017</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Gold tone used for stars, highlights, pricing emphasis, and section headers.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-accent text-background text-xs font-bold">
                Gold Accent
              </span>
              <span className="px-2.5 py-1 rounded-md bg-accent/15 text-accent text-xs font-bold border border-accent/30">
                Gold Soft
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Typography Hierarchy */}
      <section className="space-y-6">
        <div className="border-b border-border pb-4">
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
            <span className="w-3 h-8 rounded-full bg-accent inline-block"></span>
            Typography System (next/font)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Display font: <span className="text-accent font-display font-semibold">DM Serif Display</span> | Body font: <span className="font-semibold text-foreground">Plus Jakarta Sans</span>
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-card border border-border space-y-6">
          <div className="space-y-2 border-b border-border/60 pb-4">
            <span className="text-xs font-mono text-accent uppercase tracking-widest">Display H1 — Font Display</span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Wood-Fired Steaks & Gourmet Artisan Pizza
            </h1>
          </div>

          <div className="space-y-2 border-b border-border/60 pb-4">
            <span className="text-xs font-mono text-accent uppercase tracking-widest">Display H2 — Font Display</span>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Chef’s Table & Signature Tasting Experience
            </h2>
          </div>

          <div className="space-y-2 border-b border-border/60 pb-4">
            <span className="text-xs font-mono text-accent uppercase tracking-widest">Body Lead — Font Sans</span>
            <p className="text-base text-foreground/90 leading-relaxed max-w-3xl">
              Prepared daily with fresh locally-sourced ingredients, oak wood ember, and hand-selected spices. Experience dining crafted with culinary passion.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono text-accent uppercase tracking-widest">Caption & Details — Font Sans</span>
            <p className="text-xs text-muted-foreground">
              * Note: Please advise your server of any dietary allergies before ordering. All prices include applicable taxes.
            </p>
          </div>
        </div>
      </section>

      {/* Restaurant Icon Library */}
      <section className="space-y-6">
        <div className="border-b border-border pb-4">
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
            <span className="w-3 h-8 rounded-full bg-primary inline-block"></span>
            Curated Restaurant Iconset (Lucide)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Selected specifically for culinary and restaurant workflows.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[
            { icon: Utensils, label: "Utensils", usage: "Table & Dining" },
            { icon: ChefHat, label: "Chef Hat", usage: "Specials & Kitchen" },
            { icon: Flame, label: "Flame", usage: "Grill & Spicy Level" },
            { icon: Clock, label: "Clock", usage: "Hours & Prep Time" },
            { icon: Users, label: "Users", usage: "Party Size" },
            { icon: MapPin, label: "Map Pin", usage: "Location" },
            { icon: ShoppingBag, label: "Shopping Bag", usage: "Takeout Cart" },
            { icon: Star, label: "Star", usage: "Ratings & Favorites" },
            { icon: Phone, label: "Phone", usage: "Reservation Call" },
            { icon: CheckCircle2, label: "Checkmark", usage: "Confirmation" },
          ].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-card border border-border flex flex-col items-center text-center space-y-2.5 hover:border-accent hover:bg-secondary/40 transition-all group"
              >
                <div className="p-3 rounded-lg bg-secondary text-accent group-hover:scale-110 group-hover:text-primary transition-all">
                  <IconComp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">{item.label}</div>
                  <div className="text-[10px] text-muted-foreground">{item.usage}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Component Sandbox Preview */}
      <section className="p-8 rounded-2xl bg-gradient-to-r from-card to-secondary border border-border/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Component Verification
            </span>
            <h3 className="font-display text-2xl font-bold text-foreground">
              Sample Reservation Preview Card
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold border border-accent/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Layout Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80">Party Size</label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground">
              <Users className="w-4 h-4 text-accent" />
              <span>4 Guests</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80">Preferred Time</label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground">
              <Clock className="w-4 h-4 text-accent" />
              <span>7:30 PM (Dinner)</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80">Seating Area</label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground">
              <ChefHat className="w-4 h-4 text-accent" />
              <span>Patio Ember Lounge</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
