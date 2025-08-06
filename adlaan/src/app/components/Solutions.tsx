'use client';

import { useEffect, useRef, useState } from 'react';

export default function Solutions() {
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

  const solutions = [
    {
      icon: "🏢",
      title: "Corporate Law Firms",
      description: "Streamline contract drafting, due diligence, and legal documentation with AI that understands complex commercial relationships.",
      features: ["Contract Generation", "Due Diligence Reports", "Corporate Governance"]
    },
    {
      icon: "🏛️",
      title: "Government & Public Sector",
      description: "Create policy documents, regulations, and public agreements that balance legal requirements with cultural sensitivity.",
      features: ["Policy Drafting", "Regulatory Compliance", "Public Agreements"]
    },
    {
      icon: "🏪",
      title: "Small & Medium Enterprises",
      description: "Access enterprise-level legal AI without the complexity, perfect for growing businesses in the MENA region.",
      features: ["Employee Contracts", "Vendor Agreements", "Compliance Checks"]
    },
    {
      icon: "🏥",
      title: "Healthcare & Life Sciences",
      description: "Navigate complex healthcare regulations while maintaining patient privacy and cultural healthcare practices.",
      features: ["HIPAA Compliance", "Research Agreements", "Patient Consent Forms"]
    }
  ];

  const industries = [
    { name: "Banking & Finance", growth: "+34%" },
    { name: "Real Estate", growth: "+28%" },
    { name: "Technology", growth: "+42%" },
    { name: "Healthcare", growth: "+31%" },
    { name: "Manufacturing", growth: "+25%" },
    { name: "Education", growth: "+38%" }
  ];

  return (
    <section ref={sectionRef} className="relative bg-gray-50 py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Section Header */}
        <div className={`mx-auto max-w-4xl text-center mb-20 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}>
          <p className="text-sm font-medium text-gray-500 tracking-wider uppercase mb-4">
            Solutions
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-gray-900 leading-tight tracking-[-0.02em] mb-8">
            Built for Every Legal Need
          </h2>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto mb-8"></div>
          <p className="text-xl lg:text-2xl font-light text-gray-600 leading-relaxed max-w-3xl mx-auto">
            From startups to enterprises, Adlaan scales with your organization while maintaining the highest standards of legal accuracy and cultural intelligence.
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className={`group transition-all duration-1000 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="bg-white rounded-3xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                <div className="text-4xl mb-6">{solution.icon}</div>
                <h3 className="text-2xl font-light text-gray-900 mb-4">
                  {solution.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  {solution.description}
                </p>
                <div className="space-y-2">
                  {solution.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Industry Growth Stats */}
        <div className={`transition-all duration-1000 delay-600 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
            <h3 className="text-2xl font-light text-gray-900 mb-8 text-center">
              Industry Growth with Adlaan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {industries.map((industry, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-light text-gray-900 mb-2">
                    {industry.growth}
                  </div>
                  <div className="text-sm text-gray-600">
                    {industry.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regional Focus */}
        <div className={`mt-16 text-center transition-all duration-1000 delay-800 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h3 className="text-2xl font-light text-gray-900 mb-4">
            Trusted Across the MENA Region
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Supporting legal professionals from Dubai to Riyadh, from Cairo to Casablanca
          </p>
          <button className="group bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-black transition-all duration-300 hover:scale-105">
            <span className="relative z-10">Find Your Solution</span>
          </button>
        </div>
      </div>
    </section>
  );
}
