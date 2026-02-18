import { motion } from "framer-motion";
import { BrainCircuit, Mic, Route, ShieldCheck, Leaf, Activity } from "lucide-react";

const features = [
  {
    icon: <BrainCircuit className="text-emerald-600" size={24} />,
    bg: "bg-emerald-50",
    title: "Predictive Models",
    desc: "AI anticipates surplus patterns based on season, geography, or event types to dynamically preposition volunteer routing."
  },
  {
    icon: <Mic className="text-orange-600" size={24} />,
    bg: "bg-orange-50",
    title: "Multimodal Interactions",
    desc: "Simplified UI and voice-based listing flows ensure usability among diverse stakeholders, from kitchen staff to NGO coordinators."
  },
  {
    icon: <ShieldCheck className="text-gray-600" size={24} />,
    bg: "bg-gray-100",
    title: "Hygiene Validation",
    desc: "Strict perishability constraints and safety window tracking protect public health and ensure all food is safe-to-consume."
  },
  {
    icon: <Route className="text-blue-600" size={24} />,
    bg: "bg-blue-50",
    title: "Intelligent Matching",
    desc: "Advanced algorithms prioritize dispatch based on distance, NGO need, availability, and verified trust credentials."
  },
  {
    icon: <Activity className="text-yellow-600" size={24} />,
    bg: "bg-yellow-50",
    title: "Real-Time Tracking",
    desc: "Live status updates connect food donors with volunteers. Upload quantities and coordinate pickups with absolute transparency."
  },
  {
    icon: <Leaf className="text-rose-600" size={24} />,
    bg: "bg-rose-50",
    title: "Sustainability Credits",
    desc: "Measure meals recovered and CO₂ saved. Generate transparent impact analytics and certification letters for sustained adoption."
  }
];

export default function TechFeatures() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-orange-700 font-bold tracking-widest uppercase text-xs mb-3">System Architecture</h3>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
          Everything You Need to Redistribute with Confidence
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-16">
          From load-balanced routing to data privacy, we have built the engineering depth required to make food rescue safe, efficient, and deeply impactful.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className={`p-8 rounded-2xl text-left border border-gray-100 hover:shadow-lg hover:shadow-gray-100 transition-all ${feat.bg} bg-opacity-40`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-white shadow-sm`}>
                {feat.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{feat.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}