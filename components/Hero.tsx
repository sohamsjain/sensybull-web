'use client';

import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-transparent" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Discover Hidden Gems in{' '}
              <span className="gradient-text">Financial Markets</span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto"
          >
            No noise. No fluff. Just actionable insights in 60 seconds.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <a
              href="#download"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-emerald-500 
                       hover:from-blue-600 hover:to-emerald-600 text-white font-semibold rounded-full 
                       transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105
                       flex items-center justify-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <button
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white 
                       font-semibold rounded-full transition-all duration-300 border border-slate-700
                       flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
            </button>
          </motion.div>

          {/* App Screenshot Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              {/* Placeholder for app screenshots */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 aspect-video flex items-center justify-center">
                <div className="text-center p-8">
                  <p className="text-slate-400 text-lg mb-4">
                    Place your app screenshots or demo video here
                  </p>
                  <p className="text-slate-500 text-sm">
                    Recommended: 1920x1080px image or embedded video
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
