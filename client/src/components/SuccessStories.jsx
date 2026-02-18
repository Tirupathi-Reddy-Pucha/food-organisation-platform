import { motion } from "framer-motion";
import { TrendingUp, Award, Clock } from "lucide-react";

export default function SuccessStories() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-emerald-700 font-bold tracking-widest uppercase text-xs mb-3">Case Studies</h3>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
          Real Results, Real Impact
        </h2>
        <p className="text-gray-600 mb-16">See how organizations utilize intelligent supply-demand matching.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          
          {/* Card 1 */}
          <div className="bg-white rounded-xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 border-l-4 border-l-emerald-600 flex flex-col h-full">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full w-fit mb-6">Community NGO</span>
            <h4 className="text-xl font-bold text-gray-900 mb-4">ShelterLink Networks</h4>
            <p className="text-gray-600 italic mb-8 flex-grow">
              "GiveBite has played a pivotal role in helping our community kitchens scale. The volunteer dispatch algorithms connect us with university canteens instantly, eliminating logistics bottlenecks while guaranteeing food safety."
            </p>
            <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-auto">
               <div>
                 <p className="font-bold text-gray-900 text-sm">Sarah Jenkins</p>
                 <p className="text-gray-500 text-xs">Operations Director</p>
               </div>
               <div className="flex items-center gap-1 text-emerald-700 text-sm font-bold">
                 <TrendingUp size={16} /> Scaled Operations
               </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 border-l-4 border-l-orange-500 flex flex-col h-full">
            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full w-fit mb-6">Institutional Kitchen</span>
            <h4 className="text-xl font-bold text-gray-900 mb-4">Metro University Dining</h4>
            <p className="text-gray-600 italic mb-8 flex-grow">
              "Managing surplus from huge university halls was a nightmare due to perishability constraints. The platform's voice-based UI lets our kitchen staff log surplus in seconds, ensuring it gets to the hungry, not the landfill."
            </p>
            <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-auto">
               <div>
                 <p className="font-bold text-gray-900 text-sm">David Chen</p>
                 <p className="text-gray-500 text-xs">Head Chef</p>
               </div>
               <div className="flex items-center gap-1 text-orange-600 text-sm font-bold">
                 <Clock size={16} /> Zero Waste Delays
               </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 border-l-4 border-l-stone-700 flex flex-col h-full">
            <span className="bg-stone-200 text-stone-800 text-xs font-bold px-3 py-1 rounded-full w-fit mb-6">Large-Scale Events</span>
            <h4 className="text-xl font-bold text-gray-900 mb-4">Summit Banquet Halls</h4>
            <p className="text-gray-600 italic mb-8 flex-grow">
              "Their predictive models anticipated our surplus patterns perfectly. Earning sustainability credits and generating transparent ESG reports has completely transformed our corporate responsibility profile."
            </p>
            <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-auto">
               <div>
                 <p className="font-bold text-gray-900 text-sm">Elena Rostova</p>
                 <p className="text-gray-500 text-xs">VP Event Logistics</p>
               </div>
               <div className="flex items-center gap-1 text-stone-700 text-sm font-bold">
                 <Award size={16} /> Certified Impact
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}