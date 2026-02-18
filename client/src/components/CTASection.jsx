import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Star } from "lucide-react";

export default function CTASection() {
  return (
    <section className="bg-white">
      <div className="bg-emerald-900 py-20 relative overflow-hidden">
        {/* Soft subtle circles for background texture matching the reference */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-800/40 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-950/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div>
              <h3 className="text-emerald-400 font-bold tracking-widest uppercase text-xs mb-4">For Stakeholders</h3>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                Start Redistributing Surplus Food Today
              </h2>
              <p className="text-emerald-100/90 text-lg mb-8 leading-relaxed max-w-lg">
                Joining the GiveBite ecosystem empowers restaurants, canteens, and NGOs to collaboratively eliminate waste. Step beyond superficial listings and engage with robust logistical engineering.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="flex items-center justify-center bg-white text-emerald-900 hover:bg-gray-100 px-6 py-3.5 rounded-lg font-bold transition-colors">
                  Create Free Account <ArrowRight size={18} className="ml-2" />
                </Link>
                <Link to="/contact" className="flex items-center justify-center bg-transparent border border-emerald-500 text-white hover:bg-emerald-800 px-6 py-3.5 rounded-lg font-bold transition-colors">
                  Contact Support
                </Link>
              </div>
            </div>

            {/* Right Card */}
            <div className="bg-emerald-800/40 backdrop-blur-md border border-emerald-700/50 rounded-2xl p-8 lg:p-10 shadow-2xl">
              <h4 className="text-xl font-bold text-white mb-6 border-b border-emerald-700/50 pb-4">Core Ecosystem Features</h4>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-emerald-100">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                  <span>Dynamic routing & location-based pickup</span>
                </li>
                <li className="flex items-start gap-3 text-emerald-100">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                  <span>Strict perishability & hygiene validation</span>
                </li>
                <li className="flex items-start gap-3 text-emerald-100">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                  <span>Multilingual UI & voice-based input flows</span>
                </li>
                <li className="flex items-start gap-3 text-emerald-100">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                  <span>Verified trust credentials for volunteers</span>
                </li>
              </ul>

              <h5 className="text-sm font-bold text-emerald-300 mb-4 uppercase tracking-wider">Enterprise & Corporate</h5>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-emerald-100">
                  <Star className="text-orange-400 shrink-0 mt-0.5 fill-orange-400/20" size={20} />
                  <span>Automated ESG & CO₂ saved analytics</span>
                </li>
                <li className="flex items-start gap-3 text-emerald-100">
                  <Star className="text-orange-400 shrink-0 mt-0.5 fill-orange-400/20" size={20} />
                  <span>Earn official sustainability credits</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}