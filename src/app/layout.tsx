import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import Toast from "@/components/ui/Toast";
import StoreSync from "@/components/layout/StoreSync";

const displayFont = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Flame & Spice",
    default: "Flame & Spice | Artisanal Restaurant & Dining",
  },
  description:
    "Experience bold Bangladeshi, Indian, and wood-fired artisanal delicacies with real-time kitchen status, takeaway ordering, and table reservations.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23C1272D'><path d='M12 2c0 3-2 5-2 8 0 2.2 1.8 4 4 4s4-1.8 4-4c0-3-2-5-2-8z'/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${sansFont.variable}`}>
      <body className="antialiased flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white relative">
        <StoreSync />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <Toast />
      </body>
    </html>
  );
}
