import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import FAQ from '@/components/FAQ';
import DownloadCTA from '@/components/DownloadCTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <FAQ />
      <DownloadCTA />
      <Footer />
    </main>
  );
}
