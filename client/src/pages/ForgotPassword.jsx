import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import axios from 'axios';

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1 = Check Email, 2 = Answer & Reset
    const [email, setEmail] = useState("");
    const [securityQuestion, setSecurityQuestion] = useState("");
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const navigate = useNavigate();
    const API_URL = `${import.meta.env.VITE_API_BASE_URL}` || "http://localhost:5000/api";

    const handleCheckEmail = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const res = await axios.post(`${API_URL}/auth/forgot-password/check-email`, { email });
            setSecurityQuestion(res.data.securityQuestion);
            setStep(2);
        } catch (err) {
            console.error("Check email failed:", err);
            setError(err.response?.data?.msg || "Failed to verify email. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMsg(null);

        // Basic frontend validation
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            setIsLoading(false);
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/auth/forgot-password/reset`, {
                email,
                securityAnswer,
                newPassword
            });

            setSuccessMsg(res.data.msg);
            // Wait a moment then redirect to login
            setTimeout(() => {
                navigate("/login");
            }, 3000);

        } catch (err) {
            console.error("Reset failed:", err);
            setError(err.response?.data?.msg || "Failed to reset password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50 flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/login" className="flex items-center text-gray-500 hover:text-emerald-700 transition-colors text-sm font-medium mb-6 justify-center">
                    <ArrowLeft size={16} className="mr-2" /> Back to Login
                </Link>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Reset your password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your details below to reset your password securely.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white py-8 px-4 shadow-xl shadow-emerald-900/5 sm:rounded-2xl sm:px-10 border border-emerald-100"
                >
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                            {error}
                        </motion.div>
                    )}

                    {successMsg && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
                            {successMsg}
                            <p className="text-xs mt-2 opacity-80">Redirecting to login...</p>
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleCheckEmail}
                                className="space-y-6"
                            >
                                <div>
                                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">Registered Email Address</label>
                                    <input
                                        id="email" type="email" required
                                        value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all disabled:opacity-50"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <button
                                    type="submit" disabled={isLoading}
                                    className="w-full flex items-center justify-center bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                                >
                                    {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                                    {isLoading ? "Checking..." : "Confirm Email"}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleResetPassword}
                                className="space-y-6"
                            >
                                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 mb-2">
                                    <p className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-1">Security Question</p>
                                    <p className="text-gray-900 font-medium">{securityQuestion}</p>
                                </div>

                                <div>
                                    <label htmlFor="securityAnswer" className="block text-sm font-bold text-gray-700 mb-2">Your Answer</label>
                                    <input
                                        id="securityAnswer" type="password" required
                                        value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} disabled={isLoading}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all disabled:opacity-50"
                                        placeholder="Type your answer"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                                    <div className="relative">
                                        <input
                                            id="newPassword" type={showPassword ? "text" : "password"} required minLength={6}
                                            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isLoading}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all pr-12 disabled:opacity-50"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Password must be at least 6 characters.</p>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit" disabled={isLoading || successMsg}
                                        className="w-full flex items-center justify-center bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                                        {isLoading ? "Resetting..." : "Reset Password"}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
