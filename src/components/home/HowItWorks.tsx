"use client";

import { Utensils, Calendar, ChefHat } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: Utensils,
      title: "Pick Your Favorites",
      description:
        "Browse our artisanal menu of Bangladeshi, Indian, and Italian fusion dishes with clear dietary tags and real photos.",
    },
    {
      num: "02",
      icon: Calendar,
      title: "Order Takeaway or Book",
      description:
        "Place a quick takeaway order with live kitchen ETAs or reserve a table up to 14 days in advance with instant confirmation.",
    },
    {
      num: "03",
      icon: ChefHat,
      title: "Savor & Enjoy",
      description:
        "Experience wood-fired culinary perfection served hot at your table or prepared fresh for pickup. Pay easily at the restaurant.",
    },
  ];

  return (
    <section className="py-12 bg-background border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            Simple &amp; Seamless
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            How Flame &amp; Spice Works
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Three simple steps to experience authentic wood-fired dining.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const IconComp = step.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-card border border-border/80 space-y-4 hover:border-primary/50 transition-all shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className="font-display text-3xl font-extrabold text-accent/20">
                    {step.num}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold font-serif text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
