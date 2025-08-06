'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-black border-b border-white/10 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="flex items-center">
              <Image
                src="/adlaan-darklogo.png"
                alt="Adlaan Logo"
                width={120}
                height={40}
                className="h-8 w-auto brightness-0 invert"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#platform" className="text-gray-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200">
                Platform
              </a>
              <a href="#solutions" className="text-gray-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200">
                Solutions
              </a>
              <a href="#customers" className="text-gray-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200">
                Customers
              </a>
              <a href="#about" className="text-gray-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200">
                About
              </a>
              <a href="#resources" className="text-gray-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200">
                Resources
              </a>
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200">
              Request Demo
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-white p-2 transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-white/10">
              <a href="#platform" className="text-gray-400 hover:text-white block px-3 py-2 text-sm font-medium transition-colors duration-200">
                Platform
              </a>
              <a href="#solutions" className="text-gray-400 hover:text-white block px-3 py-2 text-sm font-medium transition-colors duration-200">
                Solutions
              </a>
              <a href="#customers" className="text-gray-400 hover:text-white block px-3 py-2 text-sm font-medium transition-colors duration-200">
                Customers
              </a>
              <a href="#about" className="text-gray-400 hover:text-white block px-3 py-2 text-sm font-medium transition-colors duration-200">
                About
              </a>
              <a href="#resources" className="text-gray-400 hover:text-white block px-3 py-2 text-sm font-medium transition-colors duration-200">
                Resources
              </a>
              <button className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 w-full mt-2">
                Request Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
