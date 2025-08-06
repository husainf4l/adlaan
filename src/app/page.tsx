import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import TrustedBy from "./components/TrustedBy";
import Features from "./components/Features";
import Solutions from "./components/Solutions";
import Testimonials from "./components/Testimonials";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <TrustedBy />
      <Features />
      <Solutions />
      <Testimonials />
      <CTA />
    </div>
  );
}
