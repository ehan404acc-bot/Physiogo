import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  User,
  Stethoscope,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';

interface LoginPageProps {
  onSuccess: (role: string) => void;
  onNavigateHome: () => void;
  onOpenRegister: (mode: 'register_patient' | 'register_pt') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateHome,
  onOpenRegister,
}) => {
  const { loginWithEmail, loginPatientWithMobile, loginWithGoogle, switchDemoRole } = useAuth();

  // Role Toggle: 'patient' | 'therapist'
  const [selectedRole, setSelectedRole] = useState<'patient' | 'therapist'>('patient');

  // Admin section toggle (discreet link at bottom)
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Patient Mobile Form State
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobilePin, setMobilePin] = useState('');

  // Therapist / Admin Email & Password Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Patient Mobile Sign-In
  const handlePatientMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!mobileNumber || mobileNumber.replace(/[^0-9]/g, '').length < 6) {
      setError('Please enter a valid mobile number (e.g. 98200 44556)');
      return;
    }
    setLoading(true);
    try {
      await loginPatientWithMobile(mobileNumber, mobilePin);
      onSuccess('patient');
    } catch (err: any) {
      setError(err.message || 'Mobile login failed. Please check your number.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Therapist / Admin Sign-In
  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      onSuccess(showAdminLogin ? 'admin' : 'physiotherapist');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Quick Demo Login
  const handleQuickDemo = async (type: 'patient' | 'therapist' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      if (type === 'patient') {
        // Log in patient Vikram with mobile via Firestore
        await loginPatientWithMobile('+91 98200 44556');
        onSuccess('patient');
      } else if (type === 'therapist') {
        await switchDemoRole('therapist_ananya');
        onSuccess('physiotherapist');
      } else {
        await switchDemoRole('admin');
        onSuccess('admin');
      }
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 bg-gradient-to-b from-slate-50 via-blue-50/25 to-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 cursor-pointer group mb-1"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              Physio<span className="text-teal-600">Go</span>
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Sign In to PhysioGo
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Your Recovery. Your Records. Your Choice.
          </p>
        </div>

        {/* Clean Main Login Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 sm:p-8 space-y-6">
          {!showAdminLogin ? (
            <>
              {/* Simple Two-Role Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                  Select Account Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('patient');
                      setError(null);
                    }}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      selectedRole === 'patient'
                        ? 'bg-white text-blue-700 shadow-md ring-1 ring-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <User className={`w-4 h-4 ${selectedRole === 'patient' ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span>Patient</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('therapist');
                      setError(null);
                    }}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      selectedRole === 'therapist'
                        ? 'bg-white text-emerald-700 shadow-md ring-1 ring-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Stethoscope className={`w-4 h-4 ${selectedRole === 'therapist' ? 'text-emerald-600' : 'text-slate-500'}`} />
                    <span>Physiotherapist</span>
                  </button>
                </div>
              </div>

              {/* Subtitle Badge */}
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                  selectedRole === 'patient'
                    ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                    : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                }`}
              >
                {selectedRole === 'patient' ? (
                  <>
                    <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Enter your registered mobile number to access your care records.</span>
                  </>
                ) : (
                  <>
                    <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Practitioner portal for appointments, assessments, and SOAP notes.</span>
                  </>
                )}
              </div>

              {/* Error Box */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* OPTION A: PATIENT LOGIN (WITH MOBILE NUMBER) */}
              {selectedRole === 'patient' ? (
                <form onSubmit={handlePatientMobileSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="e.g. 98200 44556 or +91 98200 44556"
                        className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 focus:bg-white transition-colors font-medium text-slate-900"
                      />
                    </div>
                    <p className="text-[11px] text-teal-700 font-semibold mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                      <span>Connected directly to Cloud Firestore patient records</span>
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Security PIN / Verification Code (Optional)
                      </label>
                      <span className="text-[11px] text-slate-400">Default: 1234</span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="password"
                        value={mobilePin}
                        onChange={(e) => setMobilePin(e.target.value)}
                        placeholder="4-digit PIN (e.g. 1234)"
                        maxLength={6}
                        className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Verifying with Firestore...' : 'Sign In with Mobile Number'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* 1-Click Quick Demo Login for Patient */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('patient')}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>1-Click Test: Vikram Malhotra (+91 98200 44556)</span>
                    </button>
                  </div>

                  {/* Patient Registration Link (NO mention of physiotherapist join) */}
                  <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100">
                    <p>
                      New patient?{' '}
                      <button
                        type="button"
                        onClick={() => onOpenRegister('register_patient')}
                        className="font-bold text-blue-600 hover:text-blue-800"
                      >
                        Create Patient Profile
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                /* OPTION B: PHYSIOTHERAPIST LOGIN (WITH EMAIL & PASSWORD) */
                <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Practitioner Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="doctor@physiogo.care"
                        className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50 focus:bg-white transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Signing In...' : 'Sign In as Physiotherapist'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* 1-Click Quick Demo Login for Therapist */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('therapist')}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>1-Click Test: Dr. Ananya Sharma (Verified PT)</span>
                    </button>
                  </div>

                  {/* Practitioner Registration Link */}
                  <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100">
                    <p>
                      New practitioner?{' '}
                      <button
                        type="button"
                        onClick={() => onOpenRegister('register_pt')}
                        className="font-bold text-emerald-600 hover:text-emerald-800"
                      >
                        Join as Verified Physiotherapist
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </>
          ) : (
            /* ADMIN LOGIN MODE (Quietly shown when user clicks the small link at bottom) */
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Administrator Portal Sign-In</h3>
                    <p className="text-[11px] text-slate-500">Authorized platform operations staff only</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Back
                </button>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleEmailPasswordSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@physiogo.care"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Authenticating Admin...' : 'Sign In to Admin Console'}
                </button>
              </form>

              {/* 1-Click Instant Demo Admin Login */}
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                <span>1-Click Test Admin Console (Super Admin)</span>
              </button>
            </div>
          )}
        </div>

        {/* Small, Discreet Admin Access Link at the Very Bottom */}
        {!showAdminLogin && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setShowAdminLogin(true);
                setError(null);
              }}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-200/50"
            >
              <ShieldCheck className="w-3 h-3 text-slate-400" />
              <span>Platform Administration Staff</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
