import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/admin';

  // If already authenticated, redirect
  if (isAuthenticated) {
    navigate('/admin', { replace: true });
    return null;
  }

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.message);
        setIsLoading(false);
      }
    }, 400);
  };

  const handleFillDemo = () => {
    setEmail('admin@getchasma.com');
    setPassword('chasma@admin2026');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0a0c0f] text-white flex items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#0f766e]/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center mx-auto mb-4 font-serif font-bold text-2xl shadow-xl shadow-white/5">
            G
          </div>
          <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-amber-400 block mb-1">
            Enterprise Security Portal
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
            GetChasma Operations
          </h1>
          <p className="text-xs text-neutral-400 mt-2">
            Restricted access for store managers, inventory control, and fulfillment dispatch.
          </p>
        </div>

        {/* Login Form Box */}
        <div className="bg-[#12151b] border border-neutral-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 text-neutral-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@getchasma.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-neutral-900/90 border border-neutral-700/80 rounded-2xl text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-2">
                Security Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-3.5 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-neutral-900/90 border border-neutral-700/80 rounded-2xl text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-neutral-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2"
              >
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-white text-black font-semibold text-xs uppercase tracking-widest rounded-2xl hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In To Console</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Demo Shortcut Box */}
          <div className="mt-6 pt-6 border-t border-neutral-800 text-center">
            <p className="text-[11px] text-neutral-400 mb-2">
              Default Enterprise Credentials:
            </p>
            <div className="bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800 font-mono text-[11px] text-amber-300/90 mb-3 flex items-center justify-around">
              <span>admin@getchasma.com</span>
              <span className="text-neutral-600">|</span>
              <span>chasma@admin2026</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-semibold text-neutral-300 hover:text-white underline"
            >
              Autofill Demo Credentials
            </button>
          </div>
        </div>

        {/* Security watermark */}
        <div className="mt-8 text-center text-xs text-neutral-600 flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>256-Bit Encrypted Administrative Session Guard</span>
        </div>
      </motion.div>
    </div>
  );
}
