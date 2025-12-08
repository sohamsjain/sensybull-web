'use client';

import { motion } from 'framer-motion';
import { Smartphone, ArrowRight } from 'lucide-react';

export default function DownloadCTA() {
  return (
    <section id="download" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl mb-8">
            <Smartphone className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Discover Your Next{' '}
            <span className="gradient-text">Big Investment?</span>
          </h2>

          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Join thousands of investors who are staying ahead of the market 
            with Sensybull's personalized financial insights.
          </p>

          {/* App Store Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href="#"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-emerald-500 
                       hover:from-blue-600 hover:to-emerald-600 text-white font-semibold rounded-full 
                       transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105
                       flex items-center justify-center space-x-2"
            >
              <span>Download on iOS</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            
            <a
              href="#"
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white 
                       font-semibold rounded-full transition-all duration-300 border border-slate-700
                       flex items-center justify-center space-x-2"
            >
              <span>Download on Android</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>Free to Start</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>USA Investors Only</span>
            </div>
          </div>

          {/* Coming Soon Badge */}
          <div className="mt-12 inline-block">
            <div className="bg-slate-800 border border-slate-700 rounded-full px-6 py-3">
              <span className="text-slate-300">
                🚀 Launching on Google Play Store Soon
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
