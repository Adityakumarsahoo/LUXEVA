import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { assets } from '../assets/assets';
import { 
  X, User, ShieldCheck, ShoppingBag, Truck, Headset, 
  Mail, Lock, Phone, ArrowRight, Eye, EyeOff, CheckCircle2,
  ChevronLeft, Loader2
} from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const roles = [
  { id: 'customer', title: 'User Login', icon: User, color: 'from-blue-500 to-cyan-400', desc: 'Browse and shop products' },
  { id: 'admin', title: 'Admin Login', icon: ShieldCheck, color: 'from-purple-600 to-indigo-500', desc: 'Platform management' },
  { id: 'seller', title: 'Seller Login', icon: ShoppingBag, color: 'from-orange-500 to-amber-400', desc: 'Sell your products' },
  { id: 'delivery', title: 'Delivery Partner', icon: Truck, color: 'from-green-500 to-emerald-400', desc: 'Deliver orders' },
  { id: 'support', title: 'Customer Support', icon: Headset, color: 'from-rose-500 to-pink-400', desc: 'Help customers' },
];

const AuthModal = () => {
  const { showAuthModal, setShowAuthModal, backendUrl, setToken, navigate } = useContext(ShopContext);
  const [step, setStep] = useState('role'); // role, login, register, forgot, otp, reset
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentState, setCurrentState] = useState('Login'); // Login or Sign Up
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    otp: '',
    newPassword: ''
  });

  const resetAuth = () => {
    setStep('role');
    setSelectedRole(null);
    setCurrentState('Login');
    setFormData({ name: '', email: '', password: '', phone: '', otp: '', newPassword: '' });
  };

  useEffect(() => {
    if (!showAuthModal) {
      resetAuth();
    }
  }, [showAuthModal]);

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    if (roleId === 'admin') setCurrentState('Login')
    setStep('auth');
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const checkPasswordStrength = (pass) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
    return strength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (step === 'auth') {
        if (selectedRole === 'admin') {
          const response = await axios.post(backendUrl + '/api/user/admin', {
            email: formData.email,
            password: formData.password,
          })
          if (response.data.success) {
            localStorage.setItem('adminToken', response.data.token)
            localStorage.setItem('adminRole', response.data.role || 'admin')
            toast.success((response.data.role || 'admin').toUpperCase() + ' login successful')
            setShowAuthModal(false)
            navigate('/admin')
          } else {
            toast.error(response.data.message)
          }
        } else if (currentState === 'Sign Up') {
          const response = await axios.post(backendUrl + '/api/user/register', {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            role: selectedRole
          });
          if (response.data.success) {
            if (response.data.token) {
              setToken(response.data.token);
              localStorage.setItem('token', response.data.token);
            }

            const role = response.data.user?.role || selectedRole
            const status = response.data.user?.status

            if (role === 'seller' && status === 'pending') toast.success('Seller registration submitted. Awaiting admin approval.')
            else if (role === 'delivery' && status === 'pending') toast.success('Delivery partner registration submitted. Awaiting admin approval.')
            else if (role === 'support' && status === 'pending') toast.success('Support registration submitted. Awaiting admin approval.')
            else toast.success(`Welcome ${response.data.user?.name || ''}!`)

            setShowAuthModal(false);

            if (role === 'seller') navigate('/seller')
            else if (role === 'delivery') navigate('/delivery')
            else if (role === 'support') navigate('/support')
            else navigate('/collection')
          } else {
            toast.error(response.data.message);
          }
        } else {
          // Login
          const response = await axios.post(backendUrl + '/api/user/login', {
            email: formData.email,
            password: formData.password,
            role: selectedRole
          });
          if (response.data.success) {
            setToken(response.data.token);
            localStorage.setItem('token', response.data.token);
            toast.success(`Welcome back, ${response.data.user?.name || ''}!`);
            setShowAuthModal(false);
            
            // Redirect based on role
            if (response.data.user.role === 'admin') navigate('/admin');
            else if (response.data.user.role === 'seller') navigate('/seller');
            else if (response.data.user.role === 'delivery') navigate('/delivery');
            else if (response.data.user.role === 'support') navigate('/support');
            else navigate('/collection');
          } else {
            toast.error(response.data.message);
          }
        }
      } else if (step === 'forgot') {
        const response = await axios.post(backendUrl + '/api/user/forgot-password', { email: formData.email });
        if (response.data.success) {
          toast.success(response.data.message);
          setStep('otp');
        } else {
          toast.error(response.data.message);
        }
      } else if (step === 'otp') {
        const response = await axios.post(backendUrl + '/api/user/verify-otp', { email: formData.email, otp: formData.otp });
        if (response.data.success) {
          toast.success(response.data.message);
          setStep('reset');
        } else {
          toast.error(response.data.message);
        }
      } else if (step === 'reset') {
        const response = await axios.post(backendUrl + '/api/user/reset-password', { 
          email: formData.email, 
          otp: formData.otp, 
          newPassword: formData.newPassword 
        });
        if (response.data.success) {
          toast.success(response.data.message);
          setStep('auth');
          setCurrentState('Login');
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowAuthModal(false)}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xl transition-all duration-700"
      />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
      >
        <button 
          onClick={() => setShowAuthModal(false)}
          className="absolute top-8 right-8 p-2 rounded-full hover:bg-slate-100 transition-colors z-20"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        <div className="flex flex-col md:flex-row h-full min-h-[600px]">
          {/* Left Side - Visuals */}
          <div className="hidden md:flex md:w-2/5 bg-sky-600 p-12 text-white flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full -ml-40 -mb-40 blur-[100px]" />
            
            <div className="relative z-10">
              <div className="flex items-center mb-10">
                <img src={assets.logo} className="w-32" alt="Logo" />
              </div>
              <h2 className="text-4xl font-black mb-6 tracking-tighter uppercase leading-[0.9]">
                {step === 'role' ? 'Elevate Your \n Experience' : selectedRole ? roles.find(r => r.id === selectedRole)?.title : 'Security First'}
              </h2>
              <p className="text-sky-100 font-medium leading-relaxed">
                {step === 'role' ? 'Join thousands of premium users enjoying exclusive deals and seamless shopping.' : 'Access your personalized dashboard with secure multi-role authentication.'}
              </p>
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg shadow-sky-700/20">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black tracking-widest uppercase">Secure Access</p>
                  <p className="text-[11px] text-sky-200 font-bold uppercase tracking-widest">End-to-End Encryption</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Forms */}
          <div className="flex-1 p-8 sm:p-16 flex flex-col justify-center max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Logo for mobile */}
            <div className="md:hidden flex justify-center mb-10">
              <img src={assets.logo} className="w-28" alt="Logo" />
            </div>

            <AnimatePresence mode="wait">
              {step === 'role' ? (
                <motion.div 
                  key="role-step"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Select Your Role</h3>
                    <p className="text-slate-500">Choose how you want to access the platform</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => handleRoleSelect(role.id)}
                        className="group relative flex flex-col p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 text-left"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <role.icon className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1">{role.title}</h4>
                        <p className="text-xs text-slate-500">{role.desc}</p>
                        <ArrowRight className="absolute bottom-5 right-5 w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="form-step"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="w-full max-w-md mx-auto"
                >
                  <button 
                    onClick={() => step === 'auth' ? setStep('role') : setStep('auth')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back</span>
                  </button>

                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                      {step === 'auth' ? (currentState === 'Login' ? 'Welcome Back' : 'Create Account') : 
                       step === 'forgot' ? 'Forgot Password' :
                       step === 'otp' ? 'OTP Verification' : 'Reset Password'}
                    </h3>
                    <p className="text-slate-500">
                      {step === 'auth' ? `Access your ${selectedRole} account` : 
                       step === 'forgot' ? "We'll send you an OTP to reset your password" :
                       step === 'otp' ? 'Enter the 6-digit code sent to your email' : 'Set your new secure password'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {step === 'auth' && (
                      <>
                        {currentState === 'Sign Up' && (
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                              <input 
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                type="text" 
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                placeholder="John Doe" 
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                              required
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              type="email" 
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                              placeholder="name@example.com" 
                            />
                          </div>
                        </div>

                        {currentState === 'Sign Up' && (
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                              <input 
                                required
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                type="tel" 
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                placeholder="+91 98765 43210" 
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                              required
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              type={showPassword ? "text" : "password"} 
                              className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                              placeholder="••••••••" 
                            />
                            <button 
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          {currentState === 'Sign Up' && (
                            <div className="mt-2">
                              <div className="flex gap-1 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${
                                    checkPasswordStrength(formData.password) <= 25 ? 'bg-rose-500 w-1/4' :
                                    checkPasswordStrength(formData.password) <= 50 ? 'bg-amber-500 w-2/4' :
                                    checkPasswordStrength(formData.password) <= 75 ? 'bg-blue-500 w-3/4' : 'bg-emerald-500 w-full'
                                  }`}
                                />
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {checkPasswordStrength(formData.password) <= 25 ? 'Weak password' :
                                 checkPasswordStrength(formData.password) <= 50 ? 'Medium strength' :
                                 checkPasswordStrength(formData.password) <= 75 ? 'Strong password' : 'Very secure password'}
                              </p>
                            </div>
                          )}
                        </div>

                        {currentState === 'Login' && (
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" id="remember" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                              <label htmlFor="remember" className="text-slate-500 cursor-pointer">Remember me</label>
                            </div>
                            {selectedRole !== 'admin' && (
                              <button type="button" onClick={() => setStep('forgot')} className="text-blue-600 font-semibold hover:underline">Forgot Password?</button>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {step === 'forgot' && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input 
                            required
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            type="email" 
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                            placeholder="name@example.com" 
                          />
                        </div>
                      </div>
                    )}

                    {step === 'otp' && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">6-Digit OTP</label>
                        <div className="relative">
                          <input 
                            required
                            name="otp"
                            value={formData.otp}
                            onChange={handleInputChange}
                            type="text" 
                            maxLength={6}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center text-2xl tracking-[1em] font-bold" 
                            placeholder="000000" 
                          />
                        </div>
                      </div>
                    )}

                    {step === 'reset' && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input 
                            required
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            type="password" 
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                            placeholder="••••••••" 
                          />
                        </div>
                      </div>
                    )}

                    <button 
                      disabled={loading}
                      type="submit" 
                      className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        step === 'auth' ? (currentState === 'Login' ? 'Sign In' : 'Create Account') : 
                        step === 'forgot' ? 'Send OTP' :
                        step === 'otp' ? 'Verify OTP' : 'Update Password'
                      )}
                    </button>
                  </form>

                  {step === 'auth' && selectedRole !== 'admin' && (
                    <div className="mt-8 text-center">
                      <p className="text-slate-500 text-sm">
                        {currentState === 'Login' ? "Don't have an account?" : "Already have an account?"}
                        <button 
                          onClick={() => setCurrentState(currentState === 'Login' ? 'Sign Up' : 'Login')}
                          className="ml-1 text-blue-600 font-bold hover:underline"
                        >
                          {currentState === 'Login' ? 'Sign Up' : 'Login'}
                        </button>
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
