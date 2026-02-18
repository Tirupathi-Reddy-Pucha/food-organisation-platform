import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All Categories");

  // Blog posts tailored strictly to GiveBite's engineering and impact context
  const posts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1593113565214-80afcb4a45d7?q=80&w=800&auto=format&fit=crop",
      topTag: "Product Update",
      title: "GiveBite v2.0: Introducing Predictive Supply-Demand Matching",
      excerpt: "Our latest algorithm update anticipates surplus patterns based on season, geography, and event types to proactively dispatch volunteers before perishability windows close.",
      tags: ["AI", "Routing", "Logistics"],
      date: "Feb 12, 2026",
      readTime: "4 min read"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=800&auto=format&fit=crop",
      topTag: "Engineering",
      title: "How Multimodal Voice UIs are Transforming Kitchen Workflows",
      excerpt: "Addressing digital accessibility: how we built a voice-based listing flow that allows fast-paced institutional kitchen staff to post donations hands-free.",
      tags: ["Voice UI", "Accessibility", "UX"],
      date: "Feb 05, 2026",
      readTime: "3 min read"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1584473457406-6240486418e9?q=80&w=800&auto=format&fit=crop",
      topTag: "Public Health",
      title: "Ensuring Safety: Our New Hygiene Validation Framework",
      excerpt: "Food safety is our first-class design concern. Read about our updated compliance workflows that strictly track temperature and expiration timelines.",
      tags: ["Safety", "Compliance", "Health"],
      date: "Jan 28, 2026",
      readTime: "5 min read"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1518398046578-8cca57782e17?q=80&w=800&auto=format&fit=crop",
      topTag: "Case Study",
      title: "Metro Tech Campus Eliminates Waste with Load-Balanced Routing",
      excerpt: "How a university dining network utilized our dynamic dispatch algorithms to coordinate real-time pickups with three local community kitchens seamlessly.",
      tags: ["Impact", "University", "Routing"],
      date: "Jan 15, 2026",
      readTime: "6 min read"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
      topTag: "Corporate ESG",
      title: "Automated ESG Analytics: Earning Sustainability Credits",
      excerpt: "Learn how enterprise donors are utilizing our transparent impact analytics to automatically measure meals recovered and exact CO₂ emissions saved.",
      tags: ["ESG", "Sustainability", "Data"],
      date: "Jan 04, 2026",
      readTime: "3 min read"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=800&auto=format&fit=crop",
      topTag: "Community",
      title: "Building Trust Credentials for Volunteer Dispatch",
      excerpt: "To maintain accountability, every NGO and volunteer operates through verified trust credentials. Here is how we verify and onboard new partners safely.",
      tags: ["Volunteers", "Trust", "Network"],
      date: "Dec 18, 2025",
      readTime: "4 min read"
    }
  ];

  return (
    <div className="bg-[#f8f9fa] font-sans min-h-screen pb-20">
      
      {/* 1. HERO & SEARCH SECTION */}
      <section className="relative h-[45vh] min-h-[350px] flex flex-col items-center justify-center">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" 
            alt="Corporate office logistics" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#2d5a52]/90 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center mt-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              News & Insights
            </h1>
            <p className="text-emerald-50/90 text-lg mb-10 font-medium">
              Stories and updates from the world of intelligent food rescue.
            </p>

            {/* Search and Filters Bar */}
            <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
              
              {/* Search Input */}
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search size={18} />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..." 
                  className="w-full pl-10 pr-4 py-3.5 bg-white border-none rounded-xl shadow-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm text-gray-700 font-medium transition-shadow"
                />
              </div>

              {/* Category Dropdown */}
              <div className="relative w-full md:w-48">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border-none rounded-xl shadow-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm text-gray-700 font-medium appearance-none cursor-pointer"
                >
                  <option>All Categories</option>
                  <option>Product Update</option>
                  <option>Engineering</option>
                  <option>Public Health</option>
                  <option>Case Study</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>

              {/* Tags Dropdown */}
              <div className="relative w-full md:w-48">
                <select className="w-full px-4 py-3.5 bg-white border-none rounded-xl shadow-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm text-gray-700 font-medium appearance-none cursor-pointer">
                  <option>All Tags</option>
                  <option>AI</option>
                  <option>Logistics</option>
                  <option>ESG</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. BLOG POSTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {posts.map((post, index) => (
            <motion.article 
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer"
            >
              {/* Image Header */}
              <div className="h-52 w-full overflow-hidden relative">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Content Body */}
              <div className="p-8 flex flex-col flex-1">
                
                {/* Top Tag */}
                <div className="mb-4">
                  <span className="inline-block border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                    {post.topTag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-emerald-800 transition-colors">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                  {post.excerpt}
                </p>

                {/* Micro Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map(tag => (
                    <span key={tag} className="border border-gray-100 bg-gray-50 text-gray-500 text-[11px] font-semibold px-2 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                  <span className="text-gray-400 text-[11px] font-semibold px-1 py-1 flex items-center">
                    +1 more
                  </span>
                </div>

                {/* Footer (Date & Time) */}
                <div className="flex justify-between items-center text-xs text-gray-500 font-medium pt-5 border-t border-gray-100 mt-auto">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>

              </div>
            </motion.article>
          ))}

        </div>

        {/* 3. PAGINATION */}
        <div className="mt-20 flex flex-col items-center">
          <p className="text-sm text-gray-500 font-medium mb-6">
            Showing page 1 of 4 (24 posts)
          </p>
          
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-400 cursor-not-allowed bg-white">
              Previous
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-900 text-white text-sm font-bold shadow-sm">
              1
            </button>
            <button className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 text-sm font-bold transition-colors">
              2
            </button>
            <button className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 text-sm font-bold transition-colors">
              3
            </button>
            <button className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 text-sm font-bold transition-colors">
              4
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              Next
            </button>
          </div>
        </div>

      </section>

    </div>
  );
}