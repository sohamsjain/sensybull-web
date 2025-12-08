import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Disclaimer
          </h1>
          <p className="text-slate-400">
            Last updated: December 8, 2025
          </p>
        </div>

        <div className="prose prose-invert prose-slate max-w-none">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-white">Investment Disclaimer</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong>Sensybull provides financial news and information for educational purposes only.</strong> 
              This is not investment advice, financial advice, trading advice, or any other sort of advice. 
              You should not treat any of the website&apos;s content as such.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Sensybull does not recommend that any securities should be bought, sold, or held by you. 
              Nothing on our website should be construed as an offer to sell, a solicitation of an offer 
              to buy, or a recommendation for any security by Sensybull or any third party.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong>Do conduct your own due diligence</strong> and consult your licensed financial advisor 
              before making any investment decisions. Past performance is not indicative of future results. 
              Any investment in securities, including the securities mentioned on our website, may result in 
              the loss of your capital.
            </p>
            <p className="text-slate-300 leading-relaxed">
              By using Sensybull, you acknowledge that you have read this disclaimer and agree to be bound 
              by its terms.
            </p>
          </div>

          <section className="mt-12 p-6 bg-slate-900/50 border border-slate-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-white">No Warranties</h2>
            <p className="text-slate-300 leading-relaxed">
              While we strive to provide accurate and timely information, Sensybull makes no representations 
              or warranties of any kind, express or implied, about the completeness, accuracy, reliability, 
              suitability or availability with respect to the website or the information contained on the 
              website for any purpose.
            </p>
          </section>

          <section className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-white">Limitation of Liability</h2>
            <p className="text-slate-300 leading-relaxed">
              In no event will Sensybull be liable for any loss or damage including without limitation, 
              indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss 
              of data or profits arising out of, or in connection with, the use of this website.
            </p>
          </section>

          <section className="mt-12 p-6 bg-slate-900/50 border border-slate-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-white">Contact Information</h2>
            <div className="text-slate-300 space-y-2">
              <p><strong>Soham Siddhesh Jain</strong></p>
              <p>394 Baldwin Ave, Apt 1</p>
              <p>Jersey City, New Jersey 07306</p>
              <p>Email: <a href="mailto:info@sensybull.com" className="text-blue-400 hover:text-blue-300">info@sensybull.com</a></p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}