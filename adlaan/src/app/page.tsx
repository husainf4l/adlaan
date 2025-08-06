import Hero from "./components/Hero";
import About from "./components/About";
import Features from "./components/Features";
import Solutions from "./components/Solutions";
import Testimonials from "./components/Testimonials";
import CTA from "./components/CTA";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <About />
      <Features />
      <Solutions />
      <Testimonials />
      <CTA />
    </main>
  );
}
