import { Twitter, Linkedin, Instagram, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          <div className="lg:col-span-2">
            <span className="text-2xl font-bold text-emerald-800 tracking-tight mb-4 block">
              Give<span className="text-orange-500">Bite</span>
            </span>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm">
              Connecting surplus food with communities in need. Together, we can eliminate food waste, reduce CO2 emissions, and fight hunger through smart technology.
            </p>
            <div className="flex gap-4 text-gray-400">
              <a href="#" className="hover:text-emerald-600 transition"><Linkedin size={20}/></a>
              <a href="#" className="hover:text-emerald-600 transition"><Twitter size={20}/></a>
              <a href="#" className="hover:text-emerald-600 transition"><Instagram size={20}/></a>
              <a href="#" className="hover:text-emerald-600 transition"><Mail size={20}/></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-emerald-600 transition">For Donors</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition">For NGOs</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition">Volunteer Dispatch</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition">Impact Analytics</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-emerald-600 transition">How It Works</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition">Safety Guidelines</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition">Sustainability Credits</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition">Support Center</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Stay Updated</h4>
            <p className="text-xs text-gray-500 mb-4">Get the latest on food rescue tech.</p>
            <div className="flex flex-col gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button className="bg-gray-200 hover:bg-emerald-600 hover:text-white text-gray-700 transition rounded-lg px-4 py-2 text-sm font-medium">
                Subscribe
              </button>
            </div>
          </div>

        </div>

        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-100 pt-8 text-xs text-gray-400">
          <p>© 2026 GiveBite. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-600">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}