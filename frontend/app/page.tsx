import { SmoothScroll } from "@/components/landing/SmoothScroll";
import { ScrollProgress } from "@/components/landing/primitives";
import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { RealPressure } from "@/components/landing/RealPressure";
import { Features } from "@/components/landing/Features";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <div className="bg-ink">
      <SmoothScroll />
      <ScrollProgress />
      <LandingNav />
      <main className="relative overflow-x-clip">
        <Hero />
        <RealPressure />
        <Features />
        <FAQ />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
