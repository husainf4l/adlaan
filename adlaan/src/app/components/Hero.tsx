"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      {/* Refined Apple-style background with depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950/40 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,_transparent_0%,_rgba(0,0,0,0.8)_70%)]"></div>

      {/* Subtle animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/20 rounded-full animate-pulse delay-75"></div>
        <div className="absolute top-3/4 right-1/3 w-0.5 h-0.5 bg-white/30 rounded-full animate-pulse delay-300"></div>
        <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-white/25 rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-6 lg:px-8 pt-20">
        <div
          className={`mx-auto max-w-6xl text-center transition-all duration-1200 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Apple-style pre-headline */}
          <div
            className={`mb-6 transition-all duration-1000 delay-200 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <p className="text-sm font-medium text-white/60 tracking-wider uppercase">
              Introducing Adlaan
            </p>
          </div>

          {/* Refined headline with better spacing */}
          <div
            className={`mb-12 transition-all duration-1000 delay-400 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <h1 className="font-system text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extralight text-white leading-[0.85] tracking-[-0.02em] mb-8">
              <span className="block">Every</span>
              <span className="block text-white/90">Agreement.</span>
            </h1>

            <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mb-8"></div>

            <p className="text-2xl sm:text-3xl lg:text-4xl font-light text-white/80 leading-tight tracking-[-0.01em] italic">
              Legally Sound. Intelligently Reviewed.
            </p>
          </div>

          {/* Enhanced descriptive text */}
          <div
            className={`mb-16 transition-all duration-1000 delay-600 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <p className="text-xl lg:text-2xl font-light text-gray-300 leading-relaxed max-w-4xl mx-auto">
              From sales contracts to HR policies, Adlaan automates
              documentation with{" "}
              <span className="text-white/90 font-normal">
                Arabic-rooted legal AI
              </span>{" "}
              — refined for business, grounded in justice.
            </p>
          </div>

          {/* Apple-style refined CTA buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-6 transition-all duration-1000 delay-800 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <button className="group relative w-full sm:w-auto bg-white text-black px-10 py-4 rounded-full text-lg font-medium hover:bg-gray-50 transition-all duration-300 shadow-2xl shadow-white/10 hover:shadow-white/20 hover:scale-105">
              <span className="relative z-10">Request a Demo</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <button className="group w-full sm:w-auto text-white px-10 py-4 rounded-full text-lg font-medium border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300 backdrop-blur-xl hover:scale-105">
              <span className="relative z-10">Explore Workflows</span>
            </button>
          </div>

          {/* Scroll indicator */}
          <div
            className={`mt-20 transition-all duration-1000 delay-1000 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex flex-col items-center">
              <p className="text-sm text-white/40 mb-4 font-light">
                Scroll to explore
              </p>
              <div className="w-6 h-10 border border-white/20 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/40 rounded-full mt-2 animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
