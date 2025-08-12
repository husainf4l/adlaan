"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo with refined spacing */}
          <div className="flex-shrink-0 order-1">
            <Link href="/" className="flex items-center group">
              <Image
                src="/adlaan-darklogo.png"
                alt="Adlaan Logo"
                width={140}
                height={44}
                className="h-8 lg:h-10 w-auto brightness-0 invert transition-all duration-300 group-hover:scale-105"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation - Apple-style clean spacing */}
          <div className="hidden lg:flex order-2">
            <div className="flex items-center gap-1">
              {[
                { name: "المنصة", href: "#platform" },
                { name: "الحلول", href: "#solutions" },
                { name: "العملاء", href: "#customers" },
                { name: "عن أدلان", href: "#about" },
                { name: "المصادر", href: "#resources" },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white px-4 py-3 text-sm font-normal transition-all duration-200 hover:bg-white/5 rounded-lg"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* CTA Button with Apple-style refinement */}
          <div className="hidden lg:flex items-center gap-4 order-3">
            <button
              onClick={() => {
                window.location.href = "/login";
              }}
              className="text-gray-300 hover:text-white px-4 py-2.5 text-sm font-medium transition-colors duration-200"
            >
              تسجيل الدخول
            </button>
            <button className="group relative bg-white text-black px-6 py-2.5 rounded-full font-medium text-sm hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-lg shadow-white/10">
              <span className="relative z-10">طلب عرض توضيحي</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Mobile menu button with smooth animation */}
          <div className="lg:hidden order-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative text-gray-300 hover:text-white p-2 transition-colors duration-200 focus:outline-none"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 relative">
                <span
                  className={`absolute block w-6 h-0.5 bg-current transform transition-all duration-300 ${
                    isMenuOpen ? "rotate-45 translate-y-2.5" : "translate-y-1"
                  }`}
                ></span>
                <span
                  className={`absolute block w-6 h-0.5 bg-current transform transition-all duration-300 ${
                    isMenuOpen ? "opacity-0" : "translate-y-2.5"
                  }`}
                ></span>
                <span
                  className={`absolute block w-6 h-0.5 bg-current transform transition-all duration-300 ${
                    isMenuOpen ? "-rotate-45 translate-y-2.5" : "translate-y-4"
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation with Apple-style slide animation */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-out ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 pt-4 pb-6 space-y-2 border-t border-white/10">
            {[
              { name: "المنصة", href: "#platform" },
              { name: "الحلول", href: "#solutions" },
              { name: "العملاء", href: "#customers" },
              { name: "عن أدلان", href: "#about" },
              { name: "المصادر", href: "#resources" },
            ].map((item, index) => (
              <a
                key={item.name}
                href={item.href}
                className={`block text-gray-300 hover:text-white px-4 py-3 text-base font-normal transition-all duration-200 hover:bg-white/5 rounded-lg transform ${
                  isMenuOpen
                    ? "translate-x-0 opacity-100"
                    : "translate-x-4 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}

            <div
              className={`pt-4 space-y-3 transform transition-all duration-300 delay-300 ${
                isMenuOpen
                  ? "translate-x-0 opacity-100"
                  : "translate-x-4 opacity-0"
              }`}
            >
              <button
                onClick={() => {
                  window.location.href = "/login";
                  setIsMenuOpen(false);
                }}
                className="w-full text-gray-300 hover:text-white px-6 py-3 rounded-full font-medium text-base border border-gray-600 hover:border-gray-400 transition-colors duration-200"
              >
                تسجيل الدخول
              </button>
              <button className="w-full bg-white text-black px-6 py-3 rounded-full font-medium text-base hover:bg-gray-50 transition-colors duration-200">
                طلب عرض توضيحي
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
