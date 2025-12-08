'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-slate-900/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl md:text-3xl font-bold gradient-text">
              Sensybull
            </div>
          </Link>

          {/* Navigation Links - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#faq"
              className="text-slate-300 hover:text-white transition-colors"
            >
              FAQ
            </Link>
          </div>

          {/* CTA Button */}
          <div className="flex items-center space-x-3">
            <a
              href="#download"
              className="px-4 py-2 md:px-6 md:py-2.5 bg-gradient-to-r from-blue-500 to-emerald-500 
                       hover:from-blue-600 hover:to-emerald-600 text-white font-semibold rounded-full 
                       transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
