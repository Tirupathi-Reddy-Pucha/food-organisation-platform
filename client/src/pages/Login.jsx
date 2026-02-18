import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Leaf, Loader2 } from "lucide-react";
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}` || "http://localhost:5000/api";

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      // Store user data in local storage matching your Dashboard's expectations
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user)); // Add full user object for Navbar
      localStorage.setItem('user_id', user.id || user._id);
      localStorage.setItem('user_role', user.role);
      localStorage.setItem('user_name', user.name);
      localStorage.setItem('user_email', user.email || '');
      localStorage.setItem('user_phone', user.phone || '');
      localStorage.setItem('user_address', user.address || '');
      localStorage.setItem('user_verified', user.isVerified);
      localStorage.setItem('user_trained', user.isTrained);
      localStorage.setItem('user_credits', user.credits || 0);
      localStorage.setItem('user_doc', user.verificationDocument || '');
      localStorage.setItem('user_capacity', JSON.stringify(user.ngoCapacity || {}));
      localStorage.setItem('user_notifs', JSON.stringify(user.notifications || {}));
      localStorage.setItem('user_servedGroups', user.servedGroups || 'General');

      // Navigate to dashboard and refresh to update navbar state
      navigate('/dashboard');
      window.location.reload(); 

    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.msg || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col px-8 sm:px-16 md:px-24 py-12 justify-center relative">
        <Link to="/" className="absolute top-8 left-8 sm:left-12 flex items-center text-gray-500 hover:text-emerald-700 transition-colors text-sm font-medium">
          <ArrowLeft size={16} className="mr-2" /> Back to Home
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full mx-auto"
        >
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-gray-500">Log in to your GiveBite dashboard to continue making an impact.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all disabled:opacity-50"
                placeholder="name@organization.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">Password</label>
                <button type="button" className="text-sm text-emerald-600 hover:text-emerald-800 font-semibold transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all pr-12 disabled:opacity-50"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-600 font-bold hover:text-orange-700 transition-colors">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Image Section */}
      <div className="hidden lg:flex w-1/2 bg-emerald-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-800 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-950 rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/3"></div>
        <img 
          src="https://images.unsplash.com/photo-1593113565214-80afcb4a45d7?q=80&w=2070&auto=format&fit=crop" 
          alt="Food Donation" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
        />
        <div className="relative z-10 p-16 flex flex-col justify-end h-full">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl max-w-lg">
            <Leaf className="text-orange-400 mb-6" size={40} />
            <h3 className="text-2xl font-bold text-white mb-4 leading-snug">
              "GiveBite transformed how we handle our surplus. It’s not just a platform; it’s a vital logistics network."
            </h3>
            <p className="text-emerald-100 font-medium">— Sarah Jenkins, Operations Director</p>
          </div>
        </div>
      </div>
    </div>
  );
}