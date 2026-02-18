import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Building2, User, Truck, Loader2 } from "lucide-react";
import axios from 'axios';

export default function Register() {
  const [role, setRole] = useState("Donor");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}` || "http://localhost:5000/api";

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "", address: "", ngoNumb: "", agreeTerms: false, agreeConduct: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // Frontend Validation
    if (!formData.agreeTerms) return setError("You must agree to the Terms & Conditions.");
    if (role === 'NGO' && !formData.ngoNumb) return setError("NGOs must provide a Registration Number.");
    if (role === 'Volunteer' && !formData.agreeConduct) return setError("You must agree to the Volunteer Code of Conduct.");

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name, 
        email: formData.email, 
        password: formData.password, 
        role: role,
        phone: formData.phone, 
        address: formData.address, 
        ngoRegNumber: formData.ngoNumb
      };

      const res = await axios.post(`${API_URL}/auth/register`, payload);
      
      // Store user data in local storage mimicking your Dashboard logic
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('user_id', user.id || user._id);
      localStorage.setItem('user_role', user.role);
      localStorage.setItem('user_name', user.name);
      localStorage.setItem('user_email', user.email || '');
      localStorage.setItem('user_phone', user.phone || '');
      localStorage.setItem('user_address', user.address || '');
      localStorage.setItem('user_verified', user.isVerified);
      localStorage.setItem('user_trained', user.isTrained);
      localStorage.setItem('user_credits', user.credits || 0);

      // Navigate to dashboard and refresh to update navbar state
      navigate('/dashboard');
      window.location.reload(); 

    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.response?.data?.msg || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { id: "Donor", icon: <Building2 size={18} />, label: "Donor" },
    { id: "NGO", icon: <User size={18} />, label: "NGO" },
    { id: "Volunteer", icon: <Truck size={18} />, label: "Volunteer" }
  ];

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* Left Image Section */}
      <div className="hidden lg:flex w-5/12 bg-emerald-950 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2074&auto=format&fit=crop" 
          alt="Community Kitchen" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
        />
        <div className="relative z-10 p-16 flex flex-col h-full justify-between">
          <Link to="/" className="flex items-center text-emerald-100 hover:text-white transition-colors text-sm font-bold w-fit">
            <ArrowLeft size={16} className="mr-2" /> Home
          </Link>
          
          <div>
            <h2 className="text-4xl font-extrabold text-white mb-4">Join the Ecosystem.</h2>
            <p className="text-emerald-200 text-lg leading-relaxed max-w-sm">
              Connect surplus food with those who need it most. Our intelligent dispatch system ensures safety, speed, and transparency.
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-7/12 flex flex-col px-8 sm:px-16 md:px-24 py-12 justify-center overflow-y-auto">
        <Link to="/" className="lg:hidden absolute top-8 left-8 flex items-center text-gray-500 hover:text-emerald-700 transition-colors text-sm font-medium">
          <ArrowLeft size={16} className="mr-2" /> Home
        </Link>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl w-full mx-auto"
        >
          <div className="mb-8 mt-8 lg:mt-0">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
              Create an account
            </h2>
            <p className="text-gray-500">Select your role to get started with GiveBite.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            
            {/* Role Selector */}
            <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center justify-between mb-8">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => { setRole(r.id); setError(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                    role === r.id 
                      ? "bg-white text-emerald-900 shadow-sm border border-gray-200" 
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {r.icon} {r.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name / Org Name</label>
                <input 
                  type="text" name="name" required value={formData.name} onChange={handleChange} disabled={isLoading}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all disabled:opacity-50"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" name="email" required value={formData.email} onChange={handleChange} disabled={isLoading}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all disabled:opacity-50"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="tel" name="phone" required value={formData.phone} onChange={handleChange} disabled={isLoading}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all disabled:opacity-50"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleChange} disabled={isLoading}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all pr-12 disabled:opacity-50"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Address / Location</label>
              <input 
                type="text" name="address" required value={formData.address} onChange={handleChange} disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all disabled:opacity-50"
                placeholder="123 Main St, City, Zip"
              />
            </div>

            <AnimatePresence mode="popLayout">
              {role === "NGO" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Govt. Registration Number <span className="text-red-500">*</span></label>
                  <input 
                    type="text" name="ngoNumb" required={role === "NGO"} value={formData.ngoNumb} onChange={handleChange} disabled={isLoading}
                    className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all disabled:opacity-50"
                    placeholder="e.g., NGO-12345678"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" name="agreeTerms" required checked={formData.agreeTerms} onChange={handleChange} disabled={isLoading} className="mt-1 w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">I agree to the <a href="#" className="text-emerald-700 font-bold hover:underline">Terms of Service</a>.</span>
              </label>

              <AnimatePresence>
                {role === "Volunteer" && (
                  <motion.label initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" name="agreeConduct" required={role === "Volunteer"} checked={formData.agreeConduct} onChange={handleChange} disabled={isLoading} className="mt-1 w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500" />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">I agree to the <span className="font-bold text-orange-600">Volunteer Code of Conduct</span>.</span>
                  </motion.label>
                )}
              </AnimatePresence>
            </div>

            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5 mt-4 disabled:opacity-70 disabled:hover:translate-y-0">
              {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
              {isLoading ? "Creating Account..." : `Create ${role} Account`}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-700 font-bold hover:text-emerald-800 transition-colors">Log in here</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}