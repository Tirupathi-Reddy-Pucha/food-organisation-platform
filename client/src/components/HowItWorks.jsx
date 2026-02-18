import { motion } from "framer-motion";
import { Store, Truck, HeartHandshake } from "lucide-react";

const steps = [
  {
    icon: <Store size={32} />,
    title: "1. Donors Post Surplus",
    desc: "Restaurants and events upload surplus food details within safety windows using our quick UI or multimodal voice commands."
  },
  {
    icon: <Truck size={32} />,
    title: "2. Intelligent Dispatch",
    desc: "Our algorithm matches the food with the nearest verified NGO based on perishability constraints and routes a volunteer."
  },
  {
    icon: <HeartHandshake size={32} />,
    title: "3. Safe Redistribution",
    desc: "Volunteers deliver the food. Both parties verify the transfer via QR code, ensuring strict hygiene and safety compliance."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h3 className="text-orange-500 font-bold tracking-wider uppercase text-sm mb-3">The Ecosystem</h3>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Seamless, Real-Time Coordination</h2>
          <p className="text-gray-600 text-lg">A fully integrated logistical network designed to move highly perishable food from source to plate safely and instantly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line for Desktop */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-emerald-200 border-t-2 border-dashed border-emerald-300 z-0"></div>

          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6 group-hover:-translate-y-2 transition-transform duration-300 group-hover:shadow-emerald-200/50">
                {step.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
              <p className="text-gray-600 leading-relaxed max-w-xs">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}