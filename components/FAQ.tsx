'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What is Sensybull?',
    answer: 'Sensybull is a financial news app designed for accredited equity investors in the USA. We deliver personalized, AI-powered summaries of news, earnings calls, SEC filings, and press releases in an engaging, swipeable card format. Think Instagram Reels for financial news - but focused on facts, not speculation.',
  },
  {
    question: 'How is Sensybull different from other financial news apps?',
    answer: 'Unlike traditional news aggregators, Sensybull focuses on actionable insights delivered in 60-word summaries. We prioritize your watchlist companies, filter out market noise, and present information in a modern, addictive interface. No clickbait, no speculation - just the facts that matter.',
  },
  {
    question: 'What sources does Sensybull use?',
    answer: 'We aggregate content from verified, institutional-quality sources including Yahoo Finance, Reuters, Bloomberg, CNBC, SEC filings, and company press releases. All sources are approved and factual - we never rely on social media speculation or unverified content.',
  },
  {
    question: 'Is Sensybull free to use?',
    answer: 'Yes! Sensybull offers a free tier to get started. You can track your favorite stocks, get daily news summaries, and explore market insights. Premium features for advanced investors will be available in the future.',
  },
  {
    question: 'How does the personalization work?',
    answer: 'Simply add stocks to your watchlist, and Sensybull will prioritize news related to those companies. Our AI also surfaces related opportunities and sector trends that match your investment interests. The more you use the app, the better it understands what matters to you.',
  },
  {
    question: 'Can I customize my news sources?',
    answer: 'Currently, all content comes from our curated list of verified financial sources. This ensures quality and accuracy. We may add source customization options based on user feedback in future updates.',
  },
  {
    question: 'Who can use Sensybull?',
    answer: 'Sensybull is designed for accredited equity investors in the United States. Whether you\'re an active trader, long-term investor, or financial professional, our platform helps you stay informed efficiently.',
  },
  {
    question: 'How do I provide feedback or report issues?',
    answer: 'We love hearing from our users! You can reach us at contact@sensybull.com or use the feedback feature within the app. Your input helps us improve and add features that matter most to investors.',
  },
];

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-800/30">
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
      >
        <span className="font-semibold text-lg pr-8">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-5 text-slate-300 leading-relaxed">
          {answer}
        </div>
      </motion.div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 md:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Everything you need to know about Sensybull
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <FAQItem
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
