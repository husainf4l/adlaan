import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import TrustedBy from "./components/TrustedBy";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <TrustedBy />
    </div>
  );
}
