import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import LandingIllustration from "../assets/LandingIllustration.png";

export default function Hero() {
  return (
    <section className="pt-32 pb-0 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
          
          {/* Left: Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15] mb-6">
              Connecting Surplus Food with <span className="text-emerald-700">Communities in Need</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed pr-8">
              GiveBite creates a technology-enabled ecosystem to reduce food wastage. We tackle real logistical and public health challenges to safely redistribute surplus from restaurants, events, and institutional kitchens.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-8 py-3.5 rounded-lg font-semibold transition-colors">
                Start Donating <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="flex items-center justify-center bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-8 py-3.5 rounded-lg font-semibold transition-colors shadow-sm">
                See How It Works
              </Link>
            </div>
          </motion.div>

          {/* Right: Graphic & Stats */}
          <motion.div 
  initial={{ opacity: 0, x: 30 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.6, delay: 0.2 }}
  className="flex flex-col items-center"
>
  {/* Plain Floating Image */}
  <img 
    src={LandingIllustration}
    alt="Food Community" 
    className="w-full max-w-md h-auto mb-10 drop-shadow-xl z-10"
  />

  {/* Stats Row */}
  <div className="grid grid-cols-4 w-full gap-4 text-center divide-x divide-gray-200">
    <div>
      <div className="text-2xl font-bold text-emerald-800">220M+</div>
      <div className="text-xs text-gray-500 font-medium uppercase mt-1 tracking-wider">Lbs Diverted</div>
    </div>
    <div>
      <div className="text-2xl font-bold text-emerald-800">480K+</div>
      <div className="text-xs text-gray-500 font-medium uppercase mt-1 tracking-wider">Tons CO₂e</div>
    </div>
    <div>
      <div className="text-2xl font-bold text-emerald-800">13.8B+</div>
      <div className="text-xs text-gray-500 font-medium uppercase mt-1 tracking-wider">Liters Saved</div>
    </div>
    <div>
      <div className="text-2xl font-bold text-emerald-800">184M+</div>
      <div className="text-xs text-gray-500 font-medium uppercase mt-1 tracking-wider">Meals Served</div>
    </div>
  </div>
</motion.div>
        </div>
      </div>

      {/* Bottom Compliance Banner */}
      <div className="bg-emerald-900 py-5 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-800 p-2.5 rounded-lg text-emerald-100">
              <FileText size={24} />
            </div>
            <div>
              <h4 className="text-white font-semibold">Food Safety & Hygiene Compliance Guide</h4>
              <p className="text-emerald-200 text-sm">Learn how GiveBite meets strict perishability constraints and validates credentials.</p>
            </div>
          </div>
          <Link to="/compliance" className="flex items-center gap-2 bg-emerald-800/50 hover:bg-emerald-800 text-white border border-emerald-700 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
            Read Guide <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}