import { motion } from "framer-motion";

const stats = [
  { label: "Meals Recovered", value: "124K+", color: "text-emerald-400" },
  { label: "CO2 Saved (kg)", value: "50K+", color: "text-orange-400" },
  { label: "Partner NGOs", value: "350+", color: "text-emerald-400" },
  { label: "Active Volunteers", value: "1.2K+", color: "text-orange-400" },
];

export default function StatsBanner() {
  return (
    <div className="bg-emerald-950 py-16 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-32 bg-emerald-800/30 blur-3xl rounded-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-emerald-800/50">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="text-center px-4"
            >
              <div className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-2 ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-emerald-100/70 text-sm md:text-base font-medium tracking-wide">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}