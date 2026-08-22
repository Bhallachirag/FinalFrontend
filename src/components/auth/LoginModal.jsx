import React, { useState, useContext } from "react";
import { X, Mail, Lock, Phone, Eye, EyeOff, Syringe, ArrowRight } from "lucide-react";
import { AuthContext } from '../../stores/authStore.js';
import { ADMIN_EMAIL } from '../../utils/constants.js';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", mobileNumber: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const authContext = useContext(AuthContext);

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    if (!isLogin) {
      if (!formData.mobileNumber || formData.mobileNumber.trim().length !== 10) {
        setError("Mobile number must be exactly 10 digits (e.g. 9876543210).");
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      let result;
      if (isLogin) {
        result = await authContext.login(formData.email, formData.password);
        if (result.success) {
          localStorage.setItem('userEmail', formData.email);
          if (formData.email === ADMIN_EMAIL || formData.email === 'chiragbhalla03@gmail.com') {
            onClose();
            if (onLoginSuccess) onLoginSuccess();
            setTimeout(() => { window.location.href = '/admin'; }, 200);
            return;
          }
        }
      } else {
        result = await authContext.register(formData.email, formData.password, formData.mobileNumber);
        if (result.success) {
          const loginResult = await authContext.login(formData.email, formData.password);
          if (loginResult.success) localStorage.setItem('userEmail', formData.email);
          result = loginResult;
        }
      }

      if (result.success) {
        onClose();
        if (onLoginSuccess) onLoginSuccess();
        setFormData({ email: "", password: "", mobileNumber: "" });
      } else {
        setError(result.message || "Authentication failed. Please check credentials.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-sans">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">

        {/* Top CivicPulse Emerald accent bar */}
        <div className="h-1.5 bg-emerald-600" />

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-600/30">
            <Syringe className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isLogin ? "Welcome Back!" : "Create Account"}
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {isLogin ? "Sign in to your Bhalla Distributors account" : "Join Bhalla Distributors today"}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Form */}
        <div className="px-8 pb-8 space-y-4">
          {/* Error Message Pill */}
          {error && (
            <div className="flex items-center justify-between bg-red-50 border border-red-100 text-red-700 p-3 rounded-2xl text-xs font-bold">
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs transition-all bg-slate-50 focus:bg-white"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs transition-all bg-slate-50 focus:bg-white"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile (only signup) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Number (10 digits)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  name="mobileNumber"
                  maxLength={10}
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs transition-all bg-slate-50 focus:bg-white"
                  placeholder="9876543210"
                />
              </div>
            </div>
          )}

          {/* Submit Button (CivicPulse Emerald Green) */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98] mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{isLogin ? "Sign In" : "Create Account"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Toggle */}
          <div className="text-center pt-2">
            <span className="text-xs text-slate-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
            >
              {isLogin ? "Sign up free" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;