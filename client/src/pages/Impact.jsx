import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, Heart, Leaf, Droplets, Store, Users, ShieldCheck, TrendingUp, CheckCircle2, Star, ArrowRight } from "lucide-react";

export default function Impact() {
    const [liveStats, setLiveStats] = useState({ total_donations: 0, meals_saved: 0, co2_saved: 0, water_saved: 0 });
    const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${API_URL}/stats/`);
                setLiveStats(res.data);
            } catch (err) { console.error("Error fetching impact stats", err); }
        };
        fetchStats();
    }, [API_URL]);

    // Stats data tailored to GiveBite's metrics
    const stats = [
        {
            icon: <Package className="text-[#5b8c85]" size={28} />,
            iconBg: "bg-[#5b8c85]/10",
            value: liveStats.total_donations.toLocaleString() + "+",
            label: "Donations Successfully Delivered",
            color: "text-[#5b8c85]"
        },
        {
            icon: <Heart className="text-[#e77c5a]" size={28} />,
            iconBg: "bg-[#e77c5a]/10",
            value: liveStats.meals_saved.toLocaleString() + "+",
            label: "Meals Safely Redistributed",
            color: "text-[#e77c5a]"
        },
        {
            icon: <Leaf className="text-[#509e6b]" size={28} />,
            iconBg: "bg-[#509e6b]/10",
            value: liveStats.co2_saved.toLocaleString() + "+",
            label: "kg CO₂e Avoided",
            color: "text-[#509e6b]"
        },
        {
            icon: <Droplets className="text-[#8c7a5b]" size={28} />,
            iconBg: "bg-[#8c7a5b]/10",
            value: liveStats.water_saved.toLocaleString() + "+",
            label: "Liters of Water Saved",
            color: "text-[#8c7a5b]"
        },
        {
            icon: <Store className="text-[#f5b841]" size={28} />,
            iconBg: "bg-[#f5b841]/10",
            value: "2.1K+",
            label: "Institutional Donors",
            color: "text-[#e6a82e]"
        },
        {
            icon: <Users className="text-[#d94f6c]" size={28} />,
            iconBg: "bg-[#d94f6c]/10",
            value: "850+",
            label: "Verified NGOs",
            color: "text-[#d94f6c]"
        }
    ];

    // Success stories tailored to GiveBite's technology
    const stories = [
        {
            tag: "Institutional Kitchen",
            tagColor: "bg-[#5b8c85]/10 text-[#5b8c85]",
            logo: "University Dining", // Text placeholder for logo
            title: "Metro Tech Campus",
            quote: "\"GiveBite's multimodal interaction and voice-based flows allow our busy kitchen staff to log surplus in seconds. The dynamic routing algorithm immediately dispatches volunteers, solving our perishability constraints without interrupting our core operations.\"",
            author: "David Chen, Executive Chef",
            badgeIcon: <TrendingUp size={16} />,
            badgeText: "Zero waste delays",
            borderColor: "border-t-[#5b8c85]"
        },
        {
            tag: "Food Recovery NGO",
            tagColor: "bg-[#e77c5a]/10 text-[#e77c5a]",
            logo: "CommunityBridge", // Text placeholder for logo
            title: "Urban Shelter Network",
            quote: "\"The hygiene validation and trust credentials built into the platform give us absolute confidence in the food we serve. We no longer deal with superficial listings; we are matched with surplus based on our exact real-time capacity and distance.\"",
            author: "Sarah Jenkins, Director of Operations",
            badgeIcon: <ShieldCheck size={16} />,
            badgeText: "100% safety compliance",
            borderColor: "border-t-[#e77c5a]"
        }
    ];

    return (
        <div className="bg-[#f8f9fa] font-sans overflow-hidden">

            {/* 1. HERO SECTION */}
            <section className="relative h-[55vh] min-h-[450px] flex flex-col items-center justify-center">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1593113565214-80afcb4a45d7?q=80&w=2070&auto=format&fit=crop"
                        alt="Volunteers organizing food"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-emerald-950/80 mix-blend-multiply"></div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <h3 className="text-orange-400 font-bold tracking-[0.2em] uppercase text-xs mb-4">
                            Our Impact
                        </h3>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
                            Making a Real Difference
                        </h1>
                        <p className="text-lg text-emerald-50 leading-relaxed font-medium">
                            Every pound of safe-to-consume surplus recovered is a step toward ending hunger and building logistical resilience. See the collective impact of our algorithm-driven network.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 2. STATS GRID SECTION */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            className="bg-white rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300"
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${stat.iconBg}`}>
                                {stat.icon}
                            </div>
                            <h3 className={`text-5xl font-black tracking-tight mb-3 ${stat.color}`}>
                                {stat.value}
                            </h3>
                            <p className="text-gray-600 font-medium">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 3. SUCCESS STORIES SECTION */}
            <section className="py-24 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="text-center mb-16">
                        <h3 className="text-slate-500 font-bold tracking-widest uppercase text-xs mb-3">System Validations</h3>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900">
                            Real Results from Real Partners
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {stories.map((story, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className={`bg-white rounded-3xl p-10 shadow-lg shadow-gray-200/50 border border-gray-100 border-t-4 ${story.borderColor} flex flex-col h-full`}
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${story.tagColor}`}>
                                        {story.tag}
                                    </span>
                                    <span className="font-black text-xl tracking-tighter italic text-gray-800 opacity-60">
                                        {story.logo}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-6">{story.title}</h3>
                                <p className="text-gray-600 text-lg italic leading-relaxed mb-8 flex-grow">
                                    {story.quote}
                                </p>

                                <div className="mt-auto border-t border-gray-100 pt-6">
                                    <p className="text-gray-500 text-sm mb-6">— {story.author}</p>
                                    <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">
                                        <span className="bg-gray-100 p-1.5 rounded-md text-gray-600">
                                            {story.badgeIcon}
                                        </span>
                                        {story.badgeText}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </section>

            {/* 4. SPLIT CTA SECTION */}
            <section className="bg-emerald-900 border-t border-emerald-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Left Content */}
                        <div className="max-w-xl">
                            <h3 className="text-emerald-400 font-bold tracking-widest uppercase text-xs mb-4">For Stakeholders</h3>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                                Integrate with the GiveBite Network Today
                            </h2>
                            <p className="text-emerald-100/90 text-lg mb-10 leading-relaxed">
                                Step beyond superficial listings. Join restaurants, events, and institutional kitchens utilizing our load-balanced routing to eliminate waste and make a measurable impact.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/register" className="flex items-center justify-center bg-white text-emerald-900 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold transition-colors">
                                    Create Free Account <ArrowRight size={18} className="ml-2" />
                                </Link>
                                <Link to="/contact" className="flex items-center justify-center bg-transparent border border-emerald-600 text-white hover:bg-emerald-800 px-8 py-4 rounded-xl font-bold transition-colors">
                                    Contact Support
                                </Link>
                            </div>
                        </div>

                        {/* Right Features Box */}
                        <div className="bg-emerald-800/60 backdrop-blur-md rounded-[2rem] p-8 md:p-10 shadow-2xl border border-emerald-700/50">
                            <h4 className="text-xl font-bold text-white mb-6">Core Logistical Features</h4>

                            <ul className="space-y-4 mb-10">
                                <li className="flex items-start gap-3 text-emerald-50">
                                    <CheckCircle2 className="text-[#509e6b] shrink-0 mt-0.5" fill="currentColor" stroke="white" size={24} />
                                    <span className="font-medium">Predictive supply-demand algorithms</span>
                                </li>
                                <li className="flex items-start gap-3 text-emerald-50">
                                    <CheckCircle2 className="text-[#509e6b] shrink-0 mt-0.5" fill="currentColor" stroke="white" size={24} />
                                    <span className="font-medium">Strict perishability & hygiene validation</span>
                                </li>
                                <li className="flex items-start gap-3 text-emerald-50">
                                    <CheckCircle2 className="text-[#509e6b] shrink-0 mt-0.5" fill="currentColor" stroke="white" size={24} />
                                    <span className="font-medium">Multilingual UI & voice-command listing</span>
                                </li>
                                <li className="flex items-start gap-3 text-emerald-50">
                                    <CheckCircle2 className="text-[#509e6b] shrink-0 mt-0.5" fill="currentColor" stroke="white" size={24} />
                                    <span className="font-medium">Verified trust credentials for all NGOs</span>
                                </li>
                            </ul>

                            <h4 className="text-sm font-bold text-emerald-300 mb-5 uppercase tracking-widest">Enterprise ESG Tracking</h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-emerald-50">
                                    <Star className="text-yellow-400 shrink-0 mt-0.5" fill="currentColor" size={20} />
                                    <span className="font-medium">Transparent impact analytics dashboard</span>
                                </li>
                                <li className="flex items-start gap-3 text-emerald-50">
                                    <Star className="text-yellow-400 shrink-0 mt-0.5" fill="currentColor" size={20} />
                                    <span className="font-medium">Automated sustainability & CO₂ credits</span>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>
            </section>

        </div>
    );
}