import { motion } from "framer-motion";

const team = [
  {
    name: "Aisha Patel",
    role: "Lead Logistics Engineer",
    desc: "Specializes in route optimization and volunteer dispatch algorithms, ensuring rapid response to perishability constraints.",
    image: "https://i.pravatar.cc/150?img=47"
  },
  {
    name: "Marcus Johnson",
    role: "Head of Public Health",
    desc: "Oversees hygiene validation, safety windows, and trust credentialing for all NGO partnerships.",
    image: "https://i.pravatar.cc/150?img=11"
  },
  {
    name: "Elena Rodriguez",
    role: "Data & Impact Director",
    desc: "Develops predictive models for surplus patterns and transparent ESG reporting for our corporate donors.",
    image: "https://i.pravatar.cc/150?img=32"
  }
];

export default function Team() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-emerald-800 font-semibold tracking-wide uppercase text-sm mb-3">Our Team</h3>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">The Minds Behind GiveBite</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Combining expertise in supply-chain logistics, public health, and software engineering to build a resilient food rescue ecosystem.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {team.map((member, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-24 h-24 rounded-full mx-auto mb-6 object-cover border-4 border-emerald-50"
              />
              <h4 className="text-xl font-bold text-gray-900">{member.name}</h4>
              <p className="text-emerald-600 text-sm font-medium mb-4">{member.role}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{member.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}