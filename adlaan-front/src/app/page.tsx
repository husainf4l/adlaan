import { Navigation } from "../components/sections/Navigation";
import { HeroSection } from "../components/sections/HeroSection";
import { SolutionsSection } from "../components/sections/SolutionsSection";
import { TestimonialsSection } from "../components/sections/TestimonialsSection";
import { CTASection } from "../components/sections/CTASection";
import { Footer } from "../components/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <SolutionsSection />
      <CTASection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}
