"use client";

import { useEffect, useRef, useState } from "react";

export default function Testimonials() {
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

  const testimonials = [
    {
      quote:
        "Adlaan has transformed how we approach contract drafting. The AI understands not just legal requirements, but cultural nuances that are crucial in our region.",
      author: "Sarah Al-Rashid",
      title: "Senior Partner",
      company: "Al-Rashid & Associates",
      location: "Dubai, UAE",
      avatar: "👩‍💼",
    },
    {
      quote:
        "The accuracy and speed of document generation is remarkable. What used to take days now happens in minutes, without compromising on quality or compliance.",
      author: "Ahmed Hassan",
      title: "Legal Director",
      company: "Emirates Financial Group",
      location: "Abu Dhabi, UAE",
      avatar: "👨‍💻",
    },
    {
      quote:
        "Having Arabic legal intelligence built into the AI makes all the difference. It respects our legal traditions while embracing modern business needs.",
      author: "Fatima Al-Zahra",
      title: "Chief Legal Officer",
      company: "MENA Tech Ventures",
      location: "Riyadh, Saudi Arabia",
      avatar: "👩‍⚖️",
    },
  ];

  const stats = [
    { number: "500+", label: "Legal Professionals" },
    { number: "50,000+", label: "Documents Generated" },
    { number: "99.7%", label: "Accuracy Rate" },
    { number: "15min", label: "Average Processing" },
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
            Testimonials
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-gray-900 leading-tight tracking-[-0.02em] mb-8">
            Trusted by Legal Leaders
          </h2>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto mb-8"></div>
          <p className="text-xl lg:text-2xl font-light text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Discover why leading legal professionals across the MENA region
            choose Adlaan for their most critical documentation needs.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`group transition-all duration-1000 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="bg-gray-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                <div className="text-6xl mb-6 opacity-30">&ldquo;</div>
                <blockquote className="text-lg text-gray-700 leading-relaxed mb-8 italic">
                  {testimonial.quote}
                </blockquote>
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.company}
                    </div>
                    <div className="text-xs text-gray-400">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div
          className={`transition-all duration-1000 delay-600 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="bg-gray-900 rounded-3xl p-12 text-white">
            <h3 className="text-3xl font-light text-center mb-12">
              Trusted by the Numbers
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl lg:text-5xl font-extralight mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-300 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div
          className={`text-center mt-16 transition-all duration-1000 delay-800 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-lg text-gray-600 mb-8">
            Join the growing community of legal professionals who trust Adlaan
          </p>
          <button className="group bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-black transition-all duration-300 hover:scale-105">
            <span className="relative z-10">Read More Success Stories</span>
          </button>
        </div>
      </div>
    </section>
  );
}
