import { motion } from "framer-motion";
import { CheckCircle2, Store, HeartHandshake, Truck } from "lucide-react";

export default function HowItWorks() {
  
  // Timeline Step Data mapping to GiveBite's specific architecture
  const steps = [
    {
      number: "01",
      color: "bg-[#5b8c85]", // Teal/Blue for Donor
      textColor: "text-[#5b8c85]",
      bgColor: "bg-[#5b8c85]/5",
      borderColor: "border-[#5b8c85]/20",
      tag: "Donor",
      tagBg: "bg-[#5b8c85]/10",
      title: "Donor Posts Surplus",
      description: "Restaurants, events, and institutional kitchens upload surplus food details within strict safety windows. The process is simplified to accommodate fast-paced environments.",
      bullets: [
        "Multimodal & voice-based input flows",
        "Specify perishability constraints",
        "Input hygiene validation details",
        "Set container types and quantity"
      ]
    },
    {
      number: "02",
      color: "bg-[#f5b841]", // Yellow for Platform
      textColor: "text-[#f5b841]",
      bgColor: "bg-[#f5b841]/5",
      borderColor: "border-[#f5b841]/20",
      tag: "Platform",
      tagBg: "bg-[#f5b841]/10",
      title: "Intelligent Matching",
      description: "GiveBite's predictive algorithms dynamically match the surplus food with the most appropriate receiving organization in real-time.",
      bullets: [
        "Load-balanced routing optimization",
        "Prioritization based on need and distance",
        "Anticipates seasonal surplus patterns",
        "Verifies NGO trust credentials instantly"
      ]
    },
    {
      number: "03",
      color: "bg-[#e77c5a]", // Orange for NGO
      textColor: "text-[#e77c5a]",
      bgColor: "bg-[#e77c5a]/5",
      borderColor: "border-[#e77c5a]/20",
      tag: "NGO",
      tagBg: "bg-[#e77c5a]/10",
      title: "NGO Claims & Accepts",
      description: "Food-insecure populations are served faster as verified shelters and community kitchens receive alerts and claim matched donations.",
      bullets: [
        "Real-time push notifications",
        "Accept assigned donations instantly",
        "Visibility into food safety timelines",
        "Multilingual interface for diverse staff"
      ]
    },
    {
      number: "04",
      color: "bg-[#509e6b]", // Green for Volunteer/Both
      textColor: "text-[#509e6b]",
      bgColor: "bg-[#509e6b]/5",
      borderColor: "border-[#509e6b]/20",
      tag: "Volunteer",
      tagBg: "bg-[#509e6b]/10",
      title: "Dispatch & Coordination",
      description: "Once claimed, volunteer dispatch algorithms coordinate the location-based pickup, ensuring food stays within safety parameters during transit.",
      bullets: [
        "Automated volunteer dispatch algorithms",
        "Real-time status tracking",
        "Optimized routing to reduce transit time",
        "In-app coordination messaging"
      ]
    },
    {
      number: "05",
      color: "bg-[#509e6b]", 
      textColor: "text-[#509e6b]",
      bgColor: "bg-[#509e6b]/5",
      borderColor: "border-[#509e6b]/20",
      tag: "Both Parties",
      tagBg: "bg-[#509e6b]/10",
      title: "Safe Redistribution Handoff",
      description: "The volunteer delivers the food to the NGO. Both parties confirm the transfer digitally, completing the rescue and ensuring accountability.",
      bullets: [
        "QR-based digital pickup confirmation",
        "Food-safety compliance workflows",
        "Data privacy and resilience maintained",
        "Immediate community nourishment"
      ]
    },
    {
      number: "06",
      color: "bg-[#f5b841]",
      textColor: "text-[#e6a82e]",
      bgColor: "bg-[#f5b841]/5",
      borderColor: "border-[#f5b841]/20",
      tag: "Platform",
      tagBg: "bg-[#f5b841]/10",
      title: "Impact & ESG Analytics",
      description: "Every rescue is automatically logged. The platform measures the exact environmental and social impact to encourage sustained adoption.",
      bullets: [
        "Automated meals recovered calculations",
        "CO₂ emissions saved tracking",
        "Sustainability credits issued",
        "Certification letters generated"
      ]
    }
  ];

  return (
    <div className="bg-white font-sans overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[55vh] min-h-[450px] flex flex-col items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1593113630400-ea4288922497?q=80&w=2070&auto=format&fit=crop" 
            alt="Food sorting process" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h3 className="text-orange-400 font-bold tracking-[0.2em] uppercase text-xs mb-4">
              The Process
            </h3>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
              How GiveBite Works
            </h1>
            <p className="text-lg text-slate-200 leading-relaxed font-medium">
              Follow the journey of rescued food from surplus to community impact. See how our intelligent matching and logistics algorithms work together.
            </p>
          </motion.div>
        </div>

        {/* Legend Bar (Positioned at bottom of hero) */}
        <div className="absolute bottom-0 w-full bg-[#f8f9fa] py-4 border-b border-gray-200 z-10">
          <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-gray-700">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#5b8c85]"></span> Donor</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#f5b841]"></span> Platform</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#e77c5a]"></span> NGO</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#509e6b]"></span> Volunteer / Both</div>
          </div>
        </div>
      </section>

      {/* 2. TIMELINE SECTION */}
      <section className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-20">
            <h3 className="text-slate-500 font-bold tracking-widest uppercase text-xs mb-3">The Food Rescue Journey</h3>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">From Surplus to Impact</h2>
          </div>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[23px] md:left-[39px] top-4 bottom-4 w-[2px] bg-gray-100 z-0"></div>

            <div className="space-y-12">
              {steps.map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5 }}
                  className="relative flex items-start gap-6 md:gap-10 z-10"
                >
                  {/* Number Circle */}
                  <div className={`shrink-0 w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white font-black text-lg md:text-2xl shadow-md ${step.color}`}>
                    {step.number}
                  </div>

                  {/* Content Card */}
                  <div className={`flex-1 rounded-2xl p-6 md:p-8 border ${step.borderColor} ${step.bgColor}`}>
                    
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-white shadow-sm ${step.textColor}`}>
                          {idx === 0 ? <Store size={20} /> : idx === 1 ? <HeartHandshake size={20} /> : <Truck size={20} />}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${step.textColor} ${step.tagBg} whitespace-nowrap w-fit`}>
                        {step.tag}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed">
                      {step.description}
                    </p>

                    {/* Bullet Points Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                      {step.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2">
                          <CheckCircle2 className={`shrink-0 w-5 h-5 ${step.textColor}`} />
                          <span className="text-sm text-gray-700 font-medium leading-tight">{bullet}</span>
                        </div>
                      ))}
                    </div>
                    
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 3. AUDIENCE BREAKDOWN SECTION */}
      <section className="py-24 bg-[#f8f9fa] border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h3 className="text-slate-500 font-bold tracking-widest uppercase text-xs mb-3">For All Stakeholders</h3>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Coordinated Ecosystem
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              GiveBite is designed to support varying levels of digital accessibility, ensuring smooth coordination across the entire network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#5b8c85]/10 text-[#5b8c85] flex items-center justify-center mb-6 shadow-sm">
                <Store size={32} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">For Donors</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Post donations using voice-commands, get matched with verified local NGOs, and receive transparent ESG analytics and sustainability credits automatically.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#e77c5a]/10 text-[#e77c5a] flex items-center justify-center mb-6 shadow-sm">
                <HeartHandshake size={32} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">For Nonprofits</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Receive real-time capacity-based notifications, accept safe-to-consume surplus instantly, and track community impact without heavy digital friction.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#509e6b]/10 text-[#509e6b] flex items-center justify-center mb-6 shadow-sm">
                <Truck size={32} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">For Volunteers</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Utilize load-balanced routing and multilingual interaction to coordinate location-based pickups seamlessly, ensuring hygiene validation during transit.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
}