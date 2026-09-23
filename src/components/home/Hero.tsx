"use client";

import Link from "next/link";
import FoodImage from "@/components/shared/FoodImage";
import KitchenStatusBadge from "@/components/layout/KitchenStatusBadge";
import { Utensils, Calendar, Flame, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 bg-gradient-to-b from-card via-background to-background border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4 text-primary animate-pulse" />
                Artisanal Wood-Fired Kitchen
              </span>
              <KitchenStatusBadge />
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Bold Flavors. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-400 to-accent">
                Spicy Excellence.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Immerse your senses in authentic Bangladeshi, Indian, and artisanal wood-fired delicacies crafted daily with hand-picked spices and oak embers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/menu"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-xl shadow-primary/30 hover:scale-105 transition-all duration-200"
              >
                <Utensils className="w-4 h-4" />
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/book"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-sm border border-border/80 hover:border-accent/50 transition-all duration-200"
              >
                <Calendar className="w-4 h-4 text-accent" />
                <span>Book a Table</span>
              </Link>
            </div>
          </div>

          {/* Right Column: LCP Hero Photo */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full aspect-[4/3] sm:aspect-square rounded-3xl overflow-hidden border border-border/80 shadow-2xl shadow-primary/10 group">
              <FoodImage
                src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80"
                alt="Old Dhaka Kacchi Biryani cooked over oak wood embers"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60" />

              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-background/85 backdrop-blur-md border border-border/80 shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Chef&apos;s Special Kacchi</p>
                  <p className="text-[11px] text-muted-foreground">Slow-cooked Kalijira Rice &amp; Mutton</p>
                </div>
                <span className="font-display font-bold text-accent text-sm">৳ 850</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
