'use client';

import { useEffect, useRef, useState } from 'react';

export default function CTA() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-black py-32 lg:py-40 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/50 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.8)_70%)]"></div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Main CTA Content */}
        <div className={`mx-auto max-w-4xl text-center mb-16 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-white leading-tight tracking-[-0.02em] mb-8">
            Ready to Transform Your
            <span className="block text-white/80">Legal Workflow?</span>
          </h2>
          
          <p className="text-xl lg:text-2xl font-light text-gray-300 leading-relaxed mb-12 max-w-3xl mx-auto">
            Join leading organizations who trust Adlaan to create legally sound, 
            culturally intelligent documentation with AI that embodies justice.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="group relative w-full sm:w-auto bg-white text-black px-10 py-4 rounded-full text-lg font-medium hover:bg-gray-50 transition-all duration-300 shadow-2xl shadow-white/10 hover:shadow-white/20 hover:scale-105">
              <span className="relative z-10">Start Free Trial</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button className="group w-full sm:w-auto text-white px-10 py-4 rounded-full text-lg font-medium border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300 backdrop-blur-xl hover:scale-105">
              <span className="relative z-10">Schedule Demo</span>
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 delay-300 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-white font-semibold mb-1">99.7% Accuracy</div>
            <div className="text-gray-400 text-sm">AI-verified legal precision</div>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="text-white font-semibold mb-1">Enterprise Security</div>
            <div className="text-gray-400 text-sm">SOC 2 Type II certified</div>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-white font-semibold mb-1">15min Setup</div>
            <div className="text-gray-400 text-sm">Ready to use instantly</div>
          </div>

        </div>

        {/* Additional Information */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-500 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <p className="text-gray-500 text-sm">
            Trusted by legal professionals across the Middle East and beyond
          </p>
        </div>
      </div>
    </section>
  );
}
