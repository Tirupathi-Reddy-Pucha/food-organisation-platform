import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mic, CheckCircle2, DollarSign, ShieldCheck, Leaf, Clock, ChefHat, Package, Utensils, ArrowRight } from "lucide-react";

export default function Restaurants() {
  
  const benefits = [
    {
      icon: <Mic className="text-emerald-600" size={24} />,
      bg: "bg-emerald-50",
      title: "Voice-Activated Logging",
      desc: "Kitchens are busy. Don't type—just speak. Our multimodal UI lets staff log surplus quantity and type in seconds using voice commands."
    },
    {
      icon: <DollarSign className="text-orange-600" size={24} />,
      bg: "bg-orange-50",
      title: "Enhanced Tax Deductions",
      desc: "Automated documentation helps you claim deductions under IRC 170(e)(3), covering up to twice the cost basis of donated food."
    },
    {
      icon: <ShieldCheck className="text-blue-600" size={24} />,
      bg: "bg-blue-50",
      title: "Liability Protection",
      desc: "We ensure full compliance with the Good Samaritan Food Donation Act, protecting your business from civil and criminal liability."
    },
    {
      icon: <Leaf className="text-green-600" size={24} />,
      bg: "bg-green-50",
      title: "ESG & Sustainability Goals",
      desc: "Track Scope 3 emissions reductions. Get certified reports on CO₂ diverted and meals saved for your corporate sustainability profile."
    },
    {
      icon: <Clock className="text-purple-600" size={24} />,
      bg: "bg-purple-50",
      title: "Optimized Pickup Windows",
      desc: "Our predictive algorithms dispatch volunteers immediately based on your specified perishability safety windows."
    },
    {
      icon: <CheckCircle2 className="text-teal-600" size={24} />,
      bg: "bg-teal-50",
      title: "Hygiene Validation",
      desc: "Built-in checklists ensure food safety compliance before pickup, maintaining your reputation for quality and safety."
    }
  ];

  const processSteps = [
    { icon: <ChefHat size={28} />, title: "Log Surplus", desc: "Use voice or photo to log items." },
    { icon: <Clock size={28} />, title: "Set Window", desc: "Define pickup time & safety limits." },
    { icon: <CheckCircle2 size={28} />, title: "Get Matched", desc: "Algorithm finds nearest verified NGO." },
    { icon: <Package size={28} />, title: "Track Pickup", desc: "Volunteer arrives with digital ID." }
  ];

  return (
    <div className="bg-white font-sans overflow-hidden">
      
      {/* 1. HERO SECTION (Reference: Dark green background, split layout with card on right) */}
      <section className="bg-[#2d4a45] pt-32 pb-20 lg:pt-40 lg:pb-32 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#3e5f58] rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Text */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <h4 className="text-emerald-400 font-bold tracking-widest uppercase text-xs mb-4">For Food Businesses</h4>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                Turn Surplus Food Into <br />
                <span className="text-emerald-200">Community Impact</span>
              </h1>
              <p className="text-emerald-50/90 text-lg mb-8 leading-relaxed max-w-lg">
                Join thousands of restaurants, canteens, and caterers reducing waste. GiveBite makes it easy to donate safe surplus food while earning tax deductions and meeting sustainability goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="flex items-center justify-center bg-white text-[#2d4a45] hover:bg-gray-100 px-8 py-4 rounded-xl font-bold transition-colors">
                  Create Free Account <ArrowRight size={18} className="ml-2" />
                </Link>
                <Link to="/contact" className="flex items-center justify-center bg-transparent border border-emerald-400 text-white hover:bg-[#3e5f58] px-8 py-4 rounded-xl font-bold transition-colors">
                  Contact Sales
                </Link>
              </div>
            </motion.div>

            {/* Right Card (Reference: "Free for All Businesses" card style) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#3e5f58]/40 backdrop-blur-md border border-[#5b8c85]/30 rounded-2xl p-8 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-6 border-b border-emerald-500/30 pb-4">
                Built for High-Volume Kitchens
              </h3>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-emerald-50">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" fill="currentColor" stroke="#2d4a45" size={22} />
                  <span><strong>Multimodal Entry:</strong> Voice commands for hands-free logging</span>
                </li>
                <li className="flex items-start gap-3 text-emerald-50">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" fill="currentColor" stroke="#2d4a45" size={22} />
                  <span><strong>Instant Dispatch:</strong> Predictive matching within minutes</span>
                </li>
                <li className="flex items-start gap-3 text-emerald-50">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" fill="currentColor" stroke="#2d4a45" size={22} />
                  <span><strong>Liability Shield:</strong> Full Good Samaritan protection</span>
                </li>
                <li className="flex items-start gap-3 text-emerald-50">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" fill="currentColor" stroke="#2d4a45" size={22} />
                  <span><strong>ESG Dashboard:</strong> Real-time waste reduction analytics</span>
                </li>
              </ul>

              <div className="bg-[#2d4a45]/60 rounded-xl p-4 flex items-center gap-3">
                <div className="bg-orange-500 rounded-full p-1.5"><ArrowRight size={16} className="text-white"/></div>
                <div>
                  <p className="text-xs text-emerald-200 uppercase font-bold">Pro Feature</p>
                  <p className="text-white text-sm font-bold">Automated Itemized Tax Receipts</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. PARTNERS BAR (Reference: Grey background with logos) */}
      <div className="bg-gray-100 py-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 font-bold text-xs tracking-widest uppercase mb-6">Trusted by Leading Kitchens & Caterers</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <span className="text-2xl font-black text-gray-700 font-serif">RedRobin</span>
             <span className="text-xl font-bold text-gray-700 tracking-tighter">SPROUTS</span>
             <span className="text-2xl font-extrabold text-gray-700 italic">WholeFoods</span>
             <span className="text-xl font-bold text-gray-700 font-mono">Levy</span>
             <span className="text-2xl font-medium text-gray-700 tracking-widest">Sodexo</span>
          </div>
        </div>
      </div>

      {/* 3. PROCESS TIMELINE (Reference: Horizontal steps with icons) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-emerald-600 font-bold tracking-widest uppercase text-xs mb-3">Simple Workflow</h3>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-16">How to Donate</h2>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-[2px] bg-gray-100 -z-10"></div>

            {processSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm mb-6 border border-orange-100">
                  {step.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed max-w-[200px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ACCEPTED ITEMS (Reference: 4 cards with pill tags) */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-emerald-600 font-bold tracking-widest uppercase text-xs mb-3">Accepted Donations</h3>
            <h2 className="text-3xl font-extrabold text-gray-900">What Can You Rescue?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6"><Utensils size={24}/></div>
              <h4 className="font-bold text-gray-900 mb-4">Prepared Foods</h4>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Catered meals</span>
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Buffet items</span>
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Hot surplus</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 mx-auto bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-6"><Package size={24}/></div>
              <h4 className="font-bold text-gray-900 mb-4">Packaged Goods</h4>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Canned goods</span>
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Dry goods</span>
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Frozen items</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 mx-auto bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6"><Leaf size={24}/></div>
              <h4 className="font-bold text-gray-900 mb-4">Fresh Produce</h4>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Vegetables</span>
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Fruits</span>
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Dairy</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 mx-auto bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mb-6"><ChefHat size={24}/></div>
              <h4 className="font-bold text-gray-900 mb-4">Raw Ingredients</h4>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Meat & Seafood</span>
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Baking supplies</span>
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Grains</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BENEFITS GRID (Reference: 3x2 grid with colored icons) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-emerald-600 font-bold tracking-widest uppercase text-xs mb-3">Benefits</h3>
            <h2 className="text-3xl font-extrabold text-gray-900">Why Kitchens Choose GiveBite</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${item.bg}`}>
                  {item.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SAFETY / LIABILITY (Reference: Split layout, text left, list right) */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div>
              <h4 className="text-emerald-600 font-bold tracking-widest uppercase text-xs mb-3">Food Safety</h4>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Donate With Confidence</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                The Federal <strong>Bill Emerson Good Samaritan Food Donation Act</strong> protects food donors from civil and criminal liability when donating to nonprofit organizations in good faith.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                GiveBite adds an extra layer of security by helping you ensure compliance with FDA Food Code guidelines and state regulations through our hygiene validation workflow.
              </p>
              <Link to="/blog" className="text-emerald-700 font-bold hover:underline flex items-center gap-2">
                Learn About Food Donation Laws <ArrowRight size={16}/>
              </Link>
            </div>

            <div className="bg-[#eef6f5] rounded-3xl p-10 border border-[#dcebe8]">
              <h3 className="text-xl font-bold text-[#2d4a45] mb-6">Your Protection Includes:</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#5b8c85] shrink-0 mt-0.5" fill="#5b8c85" stroke="white" size={24} />
                  <span className="text-gray-700 text-sm font-medium">Federal Good Samaritan Act coverage</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#5b8c85] shrink-0 mt-0.5" fill="#5b8c85" stroke="white" size={24} />
                  <span className="text-gray-700 text-sm font-medium">State-level liability protections</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#5b8c85] shrink-0 mt-0.5" fill="#5b8c85" stroke="white" size={24} />
                  <span className="text-gray-700 text-sm font-medium">Digital hygiene validation records</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#5b8c85] shrink-0 mt-0.5" fill="#5b8c85" stroke="white" size={24} />
                  <span className="text-gray-700 text-sm font-medium">Temperature & handling tracking</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}