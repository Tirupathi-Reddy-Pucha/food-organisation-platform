import { motion } from "framer-motion";
import { Play, ShieldCheck, Activity, BrainCircuit, Route, Leaf, Database, Mic } from "lucide-react";

export default function About() {
  return (
    <div className="bg-white font-sans overflow-hidden">
      
      {/* 1. HERO SECTION (Reference: Image 1 - Dark overlay, bold centered text) */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1593113565214-80afcb4a45d7?q=80&w=2070&auto=format&fit=crop" 
            alt="Volunteers loading food" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-emerald-950/75 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-orange-400 font-bold tracking-[0.2em] uppercase text-sm mb-6">
              Our Mission
            </h3>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Ending Food Waste, <br />
              <span className="text-orange-400">Fighting Hunger</span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-50/90 leading-relaxed max-w-2xl mx-auto font-medium">
              GiveBite was founded with a complex engineering goal: build a technology-enabled ecosystem that goes beyond superficial listings to solve the real logistical challenges of food redistribution.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. MISSION & VALUES SPLIT (Reference: Image 3 - Left text/video, Right green values box) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left Column: Mission & Video */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-emerald-800 font-bold tracking-widest uppercase text-xs mb-4">Our Mission</h3>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                Connecting Surplus Food with Communities in Need
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                GiveBite is advanced food donation technology empowering local NGOs with equal access to surplus resources. We tackle the public health hurdles of perishability constraints, hygiene validation, and location-based pickup coordination.
              </p>
              <p className="text-gray-600 mb-10 leading-relaxed">
                Our platform creates a seamless, multimodal marketplace that connects corporate canteens, banquet halls, and restaurants with hunger-relief organizations—turning potential waste into immediate relief while tracking transparent impact analytics.
              </p>

              {/* Video Placeholder Box */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer border border-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1518398046578-8cca57782e17?q=80&w=2000&auto=format&fit=crop" 
                  alt="App interface preview" 
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center group-hover:bg-gray-900/50 transition-colors">
                  <div className="bg-orange-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="ml-1" fill="currentColor" size={24} />
                  </div>
                </div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-bold text-gray-900 shadow-sm">
                  GiveBite Logistics Platform
                </div>
              </div>
            </motion.div>

            {/* Right Column: Core Values Box */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#f2f7f5] rounded-[2rem] p-8 md:p-12 shadow-sm border border-emerald-50"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-8">System Core Pillars</h3>
              
              <div className="space-y-8">
                <div className="flex gap-4 items-start">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm text-emerald-700 shrink-0">
                    <Route size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Load-Balanced Routing</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Dynamic algorithms match donors to NGOs based on distance, availability, and verified trust credentials.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm text-emerald-700 shrink-0">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Hygiene & Safety</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Strict enforcement of perishability windows and compliance workflows to protect public health.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm text-emerald-700 shrink-0">
                    <Mic size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Multimodal Usability</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Voice-based flows and simplified UI elements ensure accessibility for all stakeholders in fast-paced kitchens.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm text-emerald-700 shrink-0">
                    <Leaf size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Transparent Impact</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Incentivize adoption with sustainability credits, measuring meals recovered and exact CO₂ emissions saved.</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. CAPABILITIES / RECOGNITION (Reference: Image 4 - White cards with tags, adapting to platform tech capabilities) */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-emerald-800 font-bold tracking-widest uppercase text-xs mb-4">Engineering Capabilities</h3>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
            Technology Highlights
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-16">
            Our platform goes far beyond basic listing interfaces, integrating deep engineering concepts to build a resilient humanitarian network.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative text-center hover:-translate-y-1 transition-transform duration-300"
            >
              <span className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">v2.0</span>
              <div className="mx-auto w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-6 text-orange-500">
                <BrainCircuit size={36} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Predictive Matching</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Anticipating surplus patterns based on season, geography, and event types to proactively dispatch volunteers.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative text-center hover:-translate-y-1 transition-transform duration-300"
            >
              <span className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">Live</span>
              <div className="mx-auto w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6 text-emerald-600">
                <Database size={36} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Trust Credentials</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Rigorous data privacy and accountability workflows ensure every donor and NGO is verified before matching.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative text-center hover:-translate-y-1 transition-transform duration-300"
            >
              <span className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">ESG</span>
              <div className="mx-auto w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6 text-blue-600">
                <Activity size={36} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Impact Analytics</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Automated certification letters and dashboards that measure the exact number of meals recovered and CO₂ diverted.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 4. TEAM SECTION (Reference: Image 5 - Clean cards, circle images, colored role titles) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-emerald-800 font-bold tracking-widest uppercase text-xs mb-4">Our Team</h3>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Meet the People Behind GiveBite
          </h2>
          <p className="text-gray-600 mb-16 max-w-2xl mx-auto">
            Our team combines expertise in software engineering, supply-chain logistics, and public health to build the most resilient food rescue platform possible.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Team Member 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border border-gray-100 text-center flex flex-col items-center"
            >
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop" 
                alt="Aisha Patel" 
                className="w-28 h-28 rounded-full object-cover mb-6 border-4 border-emerald-50"
              />
              <h4 className="text-xl font-bold text-gray-900 mb-1">Aisha Patel</h4>
              <p className="text-emerald-700 text-sm font-bold mb-4">Lead Logistics Engineer</p>
              <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                Developed the technical processes and dispatch algorithms necessary to coordinate location-based pickups under strict perishability constraints.
              </p>
            </motion.div>

            {/* Team Member 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border border-gray-100 text-center flex flex-col items-center"
            >
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop" 
                alt="Marcus Johnson" 
                className="w-28 h-28 rounded-full object-cover mb-6 border-4 border-emerald-50"
              />
              <h4 className="text-xl font-bold text-gray-900 mb-1">Marcus Johnson</h4>
              <p className="text-emerald-700 text-sm font-bold mb-4">Head of Public Health</p>
              <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                Brings deep expertise in food policy, ensuring that our hygiene validation workflows and safety windows meet the highest regulatory standards.
              </p>
            </motion.div>

            {/* Team Member 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border border-gray-100 text-center flex flex-col items-center"
            >
              <img 
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop" 
                alt="Elena Rodriguez" 
                className="w-28 h-28 rounded-full object-cover mb-6 border-4 border-emerald-50"
              />
              <h4 className="text-xl font-bold text-gray-900 mb-1">Elena Rodriguez</h4>
              <p className="text-emerald-700 text-sm font-bold mb-4">Data & ESG Director</p>
              <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                Dedicated to building our predictive surplus models and ensuring our corporate partners have transparent, certified sustainability analytics.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
}