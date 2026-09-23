import Link from "next/link";
import { Flame, MapPin, Phone, Clock, Globe, Share2, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold tracking-wide text-foreground">
                FLAME & SPICE
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Crafting fiery gourmet experiences, wood-fired cuts, and authentic artisan dishes tailored for food enthusiasts.
            </p>
            <div className="flex items-center gap-3 text-accent pt-1">
              <a href="#" className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-white transition-colors" aria-label="Website">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-white transition-colors" aria-label="Share">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-white transition-colors" aria-label="Favorites">
                <Heart className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-display text-sm font-semibold text-accent uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-foreground transition-colors">
                  Menu & Specialties
                </Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-foreground transition-colors">
                  Book a Table
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-foreground transition-colors">
                  User Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours & Info */}
          <div>
            <h4 className="font-display text-sm font-semibold text-accent uppercase tracking-wider mb-4">
              Opening Hours
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Mon - Thu: 11:30 AM - 10:00 PM</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Fri - Sun: 11:00 AM - 11:00 PM</span>
              </li>
              <li className="pt-2 text-[11px] text-accent font-medium">
                ★ Happy Hour Daily: 4:00 PM - 6:00 PM
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-display text-sm font-semibold text-accent uppercase tracking-wider mb-4">
              Contact & Location
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>452 Culinary Avenue, Gourmet District, NY 10012</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+1 (555) 839-4720</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} Flame & Spice Restaurant. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Assessment Scaffold</span>
            <span>•</span>
            <span className="text-accent">Deployment Target: Vercel</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
