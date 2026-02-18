import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Linkedin, Facebook, Instagram, Twitter } from "lucide-react";

export default function Contact() {
  return (
    <div className="bg-white font-sans overflow-hidden min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[45vh] min-h-[350px] flex flex-col items-center justify-center">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" 
            alt="Corporate office logistics" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#2d4a45]/90 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h3 className="text-orange-400 font-bold tracking-[0.2em] uppercase text-xs mb-4">
              Get In Touch
            </h3>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
              Contact Us
            </h1>
            <p className="text-lg text-emerald-50 leading-relaxed font-medium max-w-2xl mx-auto">
              Have questions about GiveBite's dispatch algorithms? Want to learn how to integrate our surplus ecosystem into your kitchen? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. CONTACT FORM & INFO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20">
          
          {/* Left: Contact Form (Takes up 3 columns on large screens) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-3 flex flex-col"
          >
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
              Send Us a Message
            </h2>

            <form className="space-y-6 flex-grow">
              <div>
                <label className="sr-only">Name</label>
                <input 
                  type="text" 
                  placeholder="Name" 
                  className="w-full bg-[#f4f6f5] border-transparent text-gray-900 rounded-xl px-5 py-4 focus:ring-2 focus:ring-emerald-700 focus:bg-white outline-none transition-all font-medium placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="sr-only">Email</label>
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="w-full bg-[#f4f6f5] border-transparent text-gray-900 rounded-xl px-5 py-4 focus:ring-2 focus:ring-emerald-700 focus:bg-white outline-none transition-all font-medium placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="sr-only">Message</label>
                <textarea 
                  placeholder="Message" 
                  rows="6"
                  className="w-full bg-[#f4f6f5] border-transparent text-gray-900 rounded-xl px-5 py-4 focus:ring-2 focus:ring-emerald-700 focus:bg-white outline-none transition-all font-medium placeholder:text-gray-400 resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="bg-[#3e5f58] hover:bg-[#2c4741] text-white font-bold px-8 py-3.5 rounded-lg transition-colors shadow-sm"
              >
                Send Message
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-8">
              This site is protected by reCAPTCHA and the Google <a href="#" className="underline hover:text-gray-800">Privacy Policy</a> and <a href="#" className="underline hover:text-gray-800">Terms of Service</a> apply.
            </p>
          </motion.div>

          {/* Right: Contact Information Card (Takes up 2 columns on large screens) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 bg-[#eef5f4] rounded-[2rem] p-8 md:p-10 flex flex-col h-full"
          >
            <h3 className="text-2xl font-extrabold text-[#3e5f58] mb-10">
              Contact Information
            </h3>

            <div className="space-y-8 flex-grow">
              
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm text-[#3e5f58] shrink-0 mt-1">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Email</h4>
                  <a href="mailto:partnerships@givebite.org" className="text-gray-600 hover:text-emerald-700 font-medium transition-colors">
                    partnerships@givebite.org
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm text-[#3e5f58] shrink-0 mt-1">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Phone</h4>
                  <p className="text-gray-600 font-medium">1-800-GIVE-BITE</p>
                  <p className="text-gray-600 font-medium">1-833-366-3365</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm text-[#3e5f58] shrink-0 mt-1">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Mailing Address</h4>
                  <p className="text-gray-600 font-medium leading-relaxed">
                    123 Innovation Hub Road<br />
                    Suite 400-Logistics<br />
                    San Francisco, CA 94107
                  </p>
                </div>
              </div>

            </div>

            {/* Follow Us */}
            <div className="mt-12 pt-8 border-t border-emerald-900/10">
              <h4 className="font-bold text-gray-900 text-sm mb-4">Follow Us</h4>
              <div className="flex items-center gap-3">
                <a href="#" className="bg-white p-2.5 rounded-lg text-gray-600 hover:text-[#3e5f58] hover:shadow-md transition-all">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="bg-white p-2.5 rounded-lg text-gray-600 hover:text-[#3e5f58] hover:shadow-md transition-all">
                  <Facebook size={20} />
                </a>
                <a href="#" className="bg-white p-2.5 rounded-lg text-gray-600 hover:text-[#3e5f58] hover:shadow-md transition-all">
                  <Instagram size={20} />
                </a>
                <a href="#" className="bg-white p-2.5 rounded-lg text-gray-600 hover:text-[#3e5f58] hover:shadow-md transition-all">
                  <Twitter size={20} />
                </a>
              </div>
            </div>

          </motion.div>

        </div>
      </section>

    </div>
  );
}