import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // State for the Solutions dropdown hover
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect for navbar shadow/blur
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize Google Translate when component mounts
  useEffect(() => {
    const initTranslate = () => {
      if (window.google && window.google.translate && window.googleTranslateElementInit) {
        window.googleTranslateElementInit();
      } else if (!window.googleTranslateElementInit) {
        window.googleTranslateElementInit = function () {
          new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,hi,mr,bn,ta,te',
            layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
            autoDisplay: false
          }, 'google_translate_element');
        };
        if (window.google && window.google.translate) window.googleTranslateElementInit();
      }
    };
    const timer = setTimeout(initTranslate, 1500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Get user data safely
  let user = null;
  try {
    const userString = localStorage.getItem('user');
    user = userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error("Failed to parse user data", error);
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  // Define standard navigation links
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    // Solutions is handled separately for dropdown
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Impact', path: '/impact' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  // Custom NavLink Component for consistent active state styling
  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;

    return (
      <Link to={to} className="relative group flex items-center">
        {/* Active Dot Indicator */}
        <AnimatePresence>
          {isActive && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -left-3 w-1.5 h-1.5 bg-orange-500 rounded-full"
            />
          )}
        </AnimatePresence>

        <motion.span
          className={`text-sm lg:text-base transition-colors duration-300 ${isActive
            ? "text-emerald-900 font-extrabold"
            : "text-gray-600 font-medium group-hover:text-emerald-700"
            }`}
          whileHover={{ x: 2 }}
        >
          {children}
        </motion.span>
      </Link>
    );
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
        ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-emerald-100/50 h-20"
        : "bg-white border-b border-transparent h-24"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              {/* Simple Carrot Icon placeholder matching brand colors */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-orange-500 group-hover:rotate-12 transition-transform">
                <path d="M15.91 2.18c-.41-.41-1.06-.41-1.47 0l-1.82 1.82c-.41.41-.41 1.06 0 1.47.41.41 1.06.41 1.47 0l1.82-1.82c.41-.41.41-1.06 0-1.47zM13.72 6.42l1.82-1.82c.41-.41.41-1.06 0-1.47-.41-.41-1.06-.41-1.47 0l-1.82 1.82c-.41.41-.41 1.06 0 1.47.41.41 1.06.41 1.47 0zM21.82 6.28c.41.41.41 1.06 0 1.47l-1.82 1.82c-.41.41-1.06.41-1.47 0-.41-.41-.41-1.06 0-1.47l1.82-1.82c.41-.41 1.06-.41 1.47 0zM17.58 10.53l1.82-1.82c.41-.41.41-1.06 0-1.47-.41-.41-1.06-.41-1.47 0l-1.82 1.82c-.41.41-.41 1.06 0 1.47.41.41 1.06.41 1.47 0zM3.7 21.47l5.68-5.68c.38.26.82.43 1.3.48l.34.03c3.61.34 6.62-2.31 6.65-5.95v-.06C17.64 6.59 14.93 4 11.67 4c-.02 0-.04 0-.06.01v.01c-3.63.03-6.28 3.05-5.95 6.65l.03.34c.05.48.22.92.48 1.3L.53 18.3c-.41.41-.41 1.06 0 1.47l1.7 1.7c.41.41 1.06.41 1.47 0z" />
              </svg>
              <span className="text-2xl font-black text-emerald-950 tracking-tight">
                Give<span className="text-orange-500">Bite</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">

            {/* Standard Links */}
            {navLinks.map((link) => (
              <NavLink key={link.name} to={link.path}>{link.name}</NavLink>
            ))}

            {/* Solutions Dropdown */}
            <div
              className="relative group h-full flex items-center"
              onMouseEnter={() => setIsSolutionsOpen(true)}
              onMouseLeave={() => setIsSolutionsOpen(false)}
            >
              <button className="flex items-center gap-1 text-gray-600 font-medium group-hover:text-emerald-700 transition-colors">
                Solutions
                <motion.div animate={{ rotate: isSolutionsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={16} />
                </motion.div>
              </button>

              {/* Dropdown Menu with Smooth Transition */}
              <AnimatePresence>
                {isSolutionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-[calc(100%-1rem)] pt-4 -left-4 w-56 z-50"
                  >
                    <div className="bg-white rounded-2xl shadow-xl border border-emerald-100/50 overflow-hidden p-2">
                      <Link to="/solutions/restaurants" className="block px-4 py-3 rounded-xl hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 transition-colors font-medium">
                        For Restaurants
                      </Link>
                      <Link to="/solutions/ngos" className="block px-4 py-3 rounded-xl hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 transition-colors font-medium">
                        For NGOs
                      </Link>
                      <Link to="/solutions/corporate" className="block px-4 py-3 rounded-xl hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 transition-colors font-medium">
                        Corporate ESG
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dashboard Link (If logged in) */}
            {user && (
              <NavLink to="/dashboard">Dashboard</NavLink>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div id="google_translate_element" className="block shrink-0 mr-2 min-h-[38px] min-w-[170px] border border-gray-100 rounded-lg overflow-hidden"></div>
            <div className="hidden lg:flex items-center space-x-4">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="text-emerald-900 font-bold hover:text-orange-600 transition-colors px-4 py-2"
                  >
                    Log in
                  </Link>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/register"
                      className="bg-emerald-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-900 transition-all shadow-md shadow-emerald-800/20 hover:shadow-lg hover:shadow-emerald-800/30"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-emerald-900">
                    Hi, {user.name.split(' ')[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 font-medium hover:text-red-600 transition px-4 py-2 border border-gray-200 hover:border-red-200 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 px-4 pt-4 pb-6 shadow-xl overflow-hidden"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map(link => (
                <Link key={link.name} to={link.path} className={`px-4 py-3 rounded-xl font-medium ${location.pathname === link.path ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {link.name}
                </Link>
              ))}
              {/* Mobile Solutions items flattened for simplicity */}
              <div className="px-4 py-3 font-bold text-gray-400 text-sm uppercase tracking-wider mt-2">Solutions</div>
              <Link to="/solutions/restaurants" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl ml-2">For Restaurants</Link>
              <Link to="/solutions/ngos" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl ml-2">For NGOs</Link>

              {user && <Link to="/dashboard" className="px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50 mt-2">Dashboard</Link>}
            </div>

            <div className="px-4 py-3 border-t border-gray-100 mt-2">
              <div id="google_translate_element" className="min-h-[38px]"></div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3">
              {!user ? (
                <>
                  <Link to="/login" className="w-full text-center py-3 text-emerald-900 font-bold border border-emerald-100 rounded-xl hover:bg-emerald-50">
                    Log in
                  </Link>
                  <Link to="/register" className="w-full text-center py-3 bg-emerald-800 text-white font-bold rounded-xl hover:bg-emerald-900 shadow-md">
                    Get Started
                  </Link>
                </>
              ) : (
                <button onClick={handleLogout} className="w-full text-center py-3 text-red-600 font-medium border border-red-100 rounded-xl hover:bg-red-50">
                  Logout ({user.name})
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}