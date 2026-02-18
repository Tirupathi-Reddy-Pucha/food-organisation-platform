import Hero from '../components/Hero';
import TechFeatures from '../components/TechFeatures';
import Benefits from '../components/Benefits';
import SuccessStories from '../components/SuccessStories';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

export default function Landing() {
  return (
    <div className="bg-white overflow-hidden font-sans">
      <Hero />
      <TechFeatures />
      <Benefits />
      <SuccessStories />
      <CTASection />
      <Footer />
    </div>
  );
}