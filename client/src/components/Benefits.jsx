import { motion } from "framer-motion";
import { BadgeCheck, Scale, FileBarChart2 } from "lucide-react";

export default function Benefits() {
  return (
    <section className="pt-24 pb-16 bg-white border-t border-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-emerald-700 font-bold tracking-widest uppercase text-xs mb-3">Platform Benefits</h3>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-16">
          Real Impact for Your Organization
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {/* Benefit 1 */}
          <div className="border border-emerald-100 bg-white rounded-2xl p-8 text-left shadow-sm flex flex-col items-start">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg mb-6">
              <Scale size={28} />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Logistical Resilience</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Dynamically match surplus capacity with verified NGOs, drastically reducing waste hauling fees and ensuring swift load-balanced routing.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="border border-yellow-100 bg-white rounded-2xl p-8 text-left shadow-sm flex flex-col items-start">
            <div className="bg-yellow-50 text-yellow-600 p-3 rounded-lg mb-6">
              <BadgeCheck size={28} />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Accountability & Trust</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Every participant operates via verified trust credentials. End-to-end data privacy and public health compliance are treated as first-class concerns.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="border border-gray-200 bg-gray-50 rounded-2xl p-8 text-left shadow-sm flex flex-col items-start">
            <div className="bg-white text-gray-700 p-3 rounded-lg mb-6 shadow-sm border border-gray-100">
              <FileBarChart2 size={28} />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Automated ESG Reporting</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Every donation is automatically logged. Export certified records of meals recovered and emissions avoided to strengthen sustainability portfolios.
            </p>
          </div>
        </div>
      </div>

      {/* Partner Strip */}
      <div className="bg-gray-100 py-16 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h4 className="text-gray-500 font-bold tracking-widest uppercase text-xs mb-8">Ecosystem Partners</h4>
          <h3 className="text-2xl font-bold text-gray-900 mb-10">Join the Movement</h3>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Using typography placeholders for logos to match the greyed-out visual look */}
             <span className="text-2xl font-black font-serif">City Harvest</span>
             <span className="text-xl font-bold tracking-tighter">EventBrite Cares</span>
             <span className="text-2xl font-extrabold italic">FoodCycle</span>
             <span className="text-xl font-bold font-mono">UNIV-KITCHENS</span>
             <span className="text-2xl font-medium tracking-widest">SHELTER+</span>
          </div>
        </div>
      </div>
    </section>
  );
}