import { motion } from "framer-motion";
import { Activity, ShieldCheck, Route, BarChart3 } from "lucide-react";

const values = [
  {
    icon: <Route className="text-emerald-700" size={24} />,
    title: "Intelligent Routing",
    desc: "Dynamic load-balanced routing matches surplus with the nearest verified NGOs, ensuring food arrives safely and on time."
  },
  {
    icon: <ShieldCheck className="text-emerald-700" size={24} />,
    title: "Hygiene & Safety First",
    desc: "Strict perishability constraints and safety windows validate that all redistributed food remains safe to consume."
  },
  {
    icon: <Activity className="text-emerald-700" size={24} />,
    title: "Real-Time Logistics",
    desc: "Track statuses instantly. Donors upload quantities, and volunteer dispatch algorithms coordinate pick-ups seamlessly."
  },
  {
    icon: <BarChart3 className="text-emerald-700" size={24} />,
    title: "Impact Analytics",
    desc: "Earn sustainability credits. Track meals recovered, CO2 emissions saved, and generate transparent ESG impact reports."
  }
];

export default function MissionValues() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Mission Text */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-emerald-800 font-semibold tracking-wide uppercase text-sm mb-3">Our Platform</h3>
            <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Bridging the Gap Between Surplus and Scarcity
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              GiveBite goes beyond superficial listing. We tackle the real public health and logistical hurdles of food waste. Our platform accommodates diverse stakeholders with multilingual and multimodal interactions, including voice-based flows for accessibility.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              By leveraging predictive models to anticipate surplus patterns, we empower local communities to act proactively, turning potential waste into immediate relief while maintaining first-class data privacy and accountability.
            </p>
            
            {/* Placeholder for Video/App UI */}
            <div className="bg-gray-100 rounded-2xl h-64 w-full flex items-center justify-center border border-gray-200 relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-emerald-900/10 group-hover:bg-emerald-900/20 transition"></div>
              <div className="bg-white p-4 rounded-full shadow-lg z-10 text-emerald-600">
                <span className="font-bold">▶ Watch How It Works</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Core Values */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-emerald-50 rounded-3xl p-8 md:p-12"
          >
            <h3 className="text-2xl font-bold text-emerald-900 mb-8">System Capabilities</h3>
            <div className="space-y-8">
              {values.map((val, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 bg-white p-3 rounded-xl shadow-sm h-fit">
                    {val.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{val.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{val.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}