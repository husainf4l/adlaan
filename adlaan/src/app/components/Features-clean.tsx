"use client";

import { useEffect, useRef, useState } from "react";

export default function Features() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: "🤖",
      title: "AI Legal Assistant",
      description:
        "Advanced AI that understands legal context, Arabic legal traditions, and modern business requirements to generate precise documentation.",
      highlight: "99.7% accuracy rate",
    },
    {
      icon: "⚖️",
      title: "Justice-First Framework",
      description:
        "Built on the principle of ʿAdl (justice), ensuring every document balances fairness, compliance, and commercial viability.",
      highlight: "Cultural intelligence",
    },
    {
      icon: "🔍",
      title: "Real-Time Review",
      description:
        "Instant document analysis with risk assessment, compliance checking, and improvement suggestions powered by legal AI.",
      highlight: "15-second analysis",
    },
    {
      icon: "🌐",
      title: "Multi-Language Support",
      description:
        "Seamless Arabic-English document creation with proper legal terminology preservation and cultural context awareness.",
      highlight: "Bilingual expertise",
    },
    {
      icon: "🔒",
      title: "Enterprise Security",
      description:
        "SOC 2 Type II certified platform with end-to-end encryption, ensuring your legal data remains confidential and secure.",
      highlight: "Zero data training",
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description:
        "Comprehensive insights into document performance, compliance metrics, and legal risk assessment across your organization.",
      highlight: "Real-time insights",
    },
  ];

  return (
    <section ref={sectionRef} className="relative bg-white py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`mx-auto max-w-4xl text-center mb-20 transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <p className="text-sm font-medium text-gray-500 tracking-wider uppercase mb-4">
            Core Features
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-gray-900 leading-tight tracking-[-0.02em] mb-8">
            Intelligent Legal Technology
          </h2>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto mb-8"></div>
          <p className="text-xl lg:text-2xl font-light text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Discover how Adlaan transforms legal document creation with AI that
            understands both modern law and timeless principles of justice.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group transition-all duration-1000 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="bg-gray-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                <div className="text-4xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-light text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed mb-4">
                  {feature.description}
                </p>
                <div className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-2 rounded-full inline-block">
                  {feature.highlight}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className={`text-center mt-20 transition-all duration-1000 delay-800 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-lg text-gray-600 mb-8">
            Experience the future of legal AI technology
          </p>
          <button className="group bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-black transition-all duration-300 hover:scale-105">
            <span className="relative z-10">Explore All Features</span>
          </button>
        </div>
      </div>
    </section>
  );
}
