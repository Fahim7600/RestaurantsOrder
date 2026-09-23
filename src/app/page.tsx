import Hero from "@/components/home/Hero";
import CuisineStrip from "@/components/home/CuisineStrip";
import SignatureDishes from "@/components/home/SignatureDishes";
import HowItWorks from "@/components/home/HowItWorks";
import VisitUs from "@/components/home/VisitUs";
import ClosingCta from "@/components/home/ClosingCta";

export default function Home() {
  return (
    <div className="space-y-0">
      <Hero />
      <CuisineStrip />
      <SignatureDishes />
      <HowItWorks />
      <VisitUs />
      <ClosingCta />
    </div>
  );
}
