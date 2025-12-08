'use client';

import Link from 'next/link';
import { Mail, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="text-2xl font-bold gradient-text mb-4">
              Sensybull
            </div>
            <p className="text-slate-400 max-w-md mb-4">
              Smart financial news for accredited investors. Discover hidden gems 
              and stay informed with personalized 60-second insights.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="mailto:contact@sensybull.com"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-slate-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#faq" className="text-slate-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#download" className="text-slate-400 hover:text-white transition-colors">
                  Download
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-slate-400 hover:text-white transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © {currentYear} Sensybull. All rights reserved.
            </p>
            <p className="text-slate-500 text-sm">
              Designed for accredited investors in the USA
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
          <p className="text-slate-400 text-xs leading-relaxed">
            <strong>Disclaimer:</strong> Sensybull provides financial news and information for 
            educational purposes only. This is not investment advice. Always conduct your own 
            research and consult with licensed financial advisors before making investment decisions. 
            Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
  );
}
