'use client';

import { useState } from 'react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-900">
                عدلان
              </div>
              <div className="ml-2 text-sm text-gray-600 font-medium">
                ADLAAN
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#platform" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                Platform
              </a>
              <a href="#solutions" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                Solutions
              </a>
              <a href="#customers" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                Customers
              </a>
              <a href="#about" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                About
              </a>
              <a href="#resources" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                Resources
              </a>
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Request Demo
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900 p-2"
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-100">
              <a href="#platform" className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-sm font-medium">
                Platform
              </a>
              <a href="#solutions" className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-sm font-medium">
                Solutions
              </a>
              <a href="#customers" className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-sm font-medium">
                Customers
              </a>
              <a href="#about" className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-sm font-medium">
                About
              </a>
              <a href="#resources" className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-sm font-medium">
                Resources
              </a>
              <button className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors w-full mt-2">
                Request Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
