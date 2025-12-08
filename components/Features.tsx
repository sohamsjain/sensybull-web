'use client';

import { motion } from 'framer-motion';
import { Zap, TrendingUp, Eye, Target } from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Swipe Through News Like Social Media',
    description: 'Instagram Reels-style interface makes staying informed addictive. Swipe through curated financial insights designed for modern investors.',
  },
  {
    icon: Zap,
    title: '60-Second Summaries',
    description: 'No more endless articles. Get the key facts from earnings calls, SEC filings, and press releases in just 60 words.',
  },
  {
    icon: Eye,
    title: 'Discover Hidden Gems',
    description: 'Our AI filters market noise to surface overlooked opportunities. Find the next big thing before the crowd.',
  },
  {
    icon: TrendingUp,
    title: 'Personalized to Your Watchlist',
    description: 'Track the stocks you care about. Get prioritized updates on your portfolio companies and discover related opportunities.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Feature - Personalization */}
        <div className="max-w-6xl mx-auto mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Create Your Personalized{' '}
              <span className="gradient-text">News Feed</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              No generic feeds. Track your favorite stocks and sectors. 
              Get news that matters to your investment strategy.
            </p>
          </motion.div>

          {/* App Demo Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-8 items-center"
          >
            {/* Left: Feature Description */}
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-300">Live News Feed</span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold">
                Tesla Q4 Earnings Beat Expectations
              </h3>
              
              <p className="text-slate-300 leading-relaxed">
                Revenue up 25% YoY driven by Model Y sales surge. Energy storage deployment doubled. 
                Cybertruck production ramping as planned. Stock up 8% in after-hours trading on 
                positive guidance for 2024 deliveries.
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                  Earnings
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">
                  Electric Vehicles
                </span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                  Technology
                </span>
              </div>

              <div className="pt-4 flex items-center space-x-4 text-sm text-slate-400">
                <span>From: Bloomberg, Reuters</span>
                <span>•</span>
                <span>2 hours ago</span>
              </div>
            </div>

            {/* Right: App Screenshot */}
            <div className="relative">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl">
                <div className="aspect-[9/16] bg-slate-950 rounded-xl flex items-center justify-center">
                  <p className="text-slate-500 text-center px-8">
                    Your app screenshot showing the swipeable card interface
                  </p>
                </div>
              </div>
              
              {/* Floating element */}
              <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg animate-float">
                <p className="text-sm font-semibold">60 seconds</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 
                         transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl 
                              flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Secondary Feature - Read Less, Know More */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-32 text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Read Less, <span className="gradient-text">Know More</span>
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            No more doomscrolling through redundant articles. Our AI-powered summaries 
            cut through the noise and deliver only what moves markets.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
              <div className="text-4xl font-bold gradient-text mb-2">60s</div>
              <p className="text-slate-400">Average read time</p>
            </div>
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
              <div className="text-4xl font-bold gradient-text mb-2">100%</div>
              <p className="text-slate-400">Verified sources</p>
            </div>
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
              <div className="text-4xl font-bold gradient-text mb-2">0</div>
              <p className="text-slate-400">Market speculation</p>
            </div>
          </div>
        </motion.div>

        {/* Target Audience */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-32 text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Built for <span className="gradient-text">Serious Investors</span>
          </h2>
          <p className="text-xl text-slate-300">
            Designed exclusively for accredited equity investors in the USA. 
            Get institutional-quality insights in a consumer-friendly format.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
