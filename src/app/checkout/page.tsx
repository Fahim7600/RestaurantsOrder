import Link from "next/link";
import { ShoppingBag, CreditCard, ArrowLeft } from "lucide-react";

export default function CheckoutPlaceholderPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
        <CreditCard className="w-8 h-8" />
      </div>
      <h1 className="font-display text-4xl font-bold text-foreground">
        Order Checkout
      </h1>
      <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
        This placeholder route confirms seamless transition from the Cart Drawer. The complete order summary, delivery details, and payment checkout flow will be fully wired in Prompt 6.
      </p>
      <div className="pt-4">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-accent font-semibold text-sm border border-border transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Menu</span>
        </Link>
      </div>
    </div>
  );
}
