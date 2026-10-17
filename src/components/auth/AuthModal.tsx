import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  User,
  Stethoscope,
  Lock,
  Phone,
  Sparkles,
  MapPin,
  Building,
  Award,
  ShieldCheck,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register_patient' | 'register_pt';
  onClose: () => void;
  onSuccess: (role: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
}) => {
  const {
    loginPatientWithMobile,
    loginWithEmail,
    registerPatient,
    registerPhysiotherapist,
    switchDemoRole,
  } = useAuth();

  // Mode: 'login' | 'register_patient' | 'register_pt'
  const [mode, setMode] = useState<'login' | 'register_patient' | 'register_pt'>(initialMode);
  // In login mode: 'patient' or 'therapist'
  const [loginRole, setLoginRole] = useState<'patient' | 'therapist'>('patient');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Patient Mobile Login State
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobilePin, setMobilePin] = useState('');

  // Therapist / Email Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Patient Registration Form State
  const [patName, setPatName] = useState('');
  const [patPhone, setPatPhone] = useState('');
  const [patCity, setPatCity] = useState('Gurugram');

  // Physiotherapist Multi-Step Registration Form State (only used if explicitly opened for therapist)
  const [ptStep, setPtStep] = useState(1);
  const [ptData, setPtData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    practitionerLevel: 'experienced' as 'experienced' | 'fresher',
    city: 'Gurugram',
    state: 'Haryana',
    qualification: 'Master of Physiotherapy (Orthopedics)',
    college: 'Delhi University / NILD',
    graduationYear: 2018,
    experienceYears: 6,
    registrationNumber: 'DCPTOT/2018/8892',
    registrationAuthority: 'Delhi Council for Physiotherapy',
    certificateName: 'State Council Practice License Certificate (DCPTOT/2018/8892.pdf)',
    cvFileName: 'Physiotherapist_Curriculum_Vitae.pdf',
    cvSummary: 'Clinical specialist in rehabilitation, manual therapy, and exercise prescription.',
    supervisingTherapist: 'Dr. Ananya Sharma, MPT',
    specializations: ['Orthopedics', 'Sports Rehabilitation', 'Post-Op Care'],
    consultationFee: 1000,
    sessionDurationMinutes: 45,
    clinicAddress: 'PhysioGo Clinic Center, Sector 44, Gurugram',
    serviceAreas: ['Gurugram', 'South Delhi'],
    offersHomeVisit: true,
    offersClinicVisit: true,
    offersOnline: true,
    bio: 'Dedicated physiotherapist committed to restorative biomechanics and rapid functional recovery.',
  });

  if (!isOpen) return null;

  // Handle Patient Mobile Sign-In (Connected to Firestore)
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
      onClose();
    } catch (err: any) {
      setError(err.message || 'Mobile sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Therapist Email Sign-In
  const handleTherapistEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(loginEmail, loginPassword);
      onSuccess('physiotherapist');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Patient Registration (Connected to Firestore)
  const handlePatientRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!patPhone || patPhone.replace(/[^0-9]/g, '').length < 6) {
      setError('Please enter a valid mobile number.');
      return;
    }
    setLoading(true);
    try {
      // Connect to Firestore via mobile registration
      await loginPatientWithMobile(patPhone);
      onSuccess('patient');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle PT Registration
  const handlePtRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ptStep < 4) {
      setPtStep(ptStep + 1);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await registerPhysiotherapist(ptData);
      onSuccess('physiotherapist');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Professional registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Patient Demo
  const handleQuickPatientDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginPatientWithMobile('+91 98200 44556');
      onSuccess('patient');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const isPatientScope = mode === 'login' || mode === 'register_patient';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Tabs - NO 'Join as Physiotherapist' in patient window! */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              Patient Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register_patient');
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                mode === 'register_patient'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              New Patient
            </button>
            {/* Show PT tab only if opened specifically for PT registration */}
            {mode === 'register_pt' && (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white shadow-sm">
                Practitioner Onboarding
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {loginRole === 'patient' ? 'Patient Sign In' : 'Physiotherapist Sign In'}
                </h3>
                <p className="text-xs text-slate-500">
                  {loginRole === 'patient'
                    ? 'Enter your mobile number to access your care records and rehabilitation data.'
                    : 'Practitioner portal access for verified physiotherapists.'}
                </p>
              </div>

              {/* Simple toggle: Patient vs Therapist */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setLoginRole('patient');
                    setError(null);
                  }}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    loginRole === 'patient'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Patient (Mobile)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginRole('therapist');
                    setError(null);
                  }}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    loginRole === 'therapist'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Physiotherapist</span>
                </button>
              </div>

              {/* PATIENT MOBILE FORM */}
              {loginRole === 'patient' ? (
                <form onSubmit={handlePatientMobileSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
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
                        className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 focus:bg-white font-medium text-slate-900"
                      />
                    </div>
                    <p className="text-[11px] text-teal-700 font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-teal-600" />
                      <span>Connected to Cloud Firestore patient database</span>
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
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
                        className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Verifying with Firestore...' : 'Sign In with Mobile Number'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* 1-Click Test Login for Patient */}
                  <button
                    type="button"
                    onClick={handleQuickPatientDemo}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>1-Click Test: Vikram Malhotra (+91 98200 44556)</span>
                  </button>

                  <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100">
                    <p>
                      First time here?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('register_patient');
                          setError(null);
                        }}
                        className="font-bold text-blue-600 hover:text-blue-800"
                      >
                        Create Patient Profile
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                /* THERAPIST EMAIL FORM */
                <form onSubmit={handleTherapistEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Practitioner Email
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="doctor@physiogo.care"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Signing In...' : 'Sign In as Physiotherapist'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* 1-Click Quick Demo for Therapist */}
                  <button
                    type="button"
                    onClick={async () => {
                      setLoading(true);
                      await switchDemoRole('therapist_ananya');
                      onSuccess('physiotherapist');
                      onClose();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>1-Click Test: Dr. Ananya Sharma, MPT</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* MODE 2: REGISTER PATIENT */}
          {mode === 'register_patient' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Create Patient Profile</h3>
                <p className="text-xs text-slate-500">
                  Register with your mobile number to start managing your physiotherapy and rehabilitation records.
                </p>
              </div>

              <form onSubmit={handlePatientRegister} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={patName}
                    onChange={(e) => setPatName(e.target.value)}
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number (Primary Login ID)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={patPhone}
                      onChange={(e) => setPatPhone(e.target.value)}
                      placeholder="e.g. 98200 44556"
                      className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-teal-700 font-medium mt-1">
                    Your mobile number is your primary identifier in Firestore.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={patCity}
                      onChange={(e) => setPatCity(e.target.value)}
                      placeholder="Gurugram"
                      className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  <span>{loading ? 'Registering with Firestore...' : 'Create Patient Profile & Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100">
                  <p>
                    Already have a profile?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError(null);
                      }}
                      className="font-bold text-blue-600 hover:text-blue-800"
                    >
                      Sign in with Mobile
                    </button>
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* MODE 3: REGISTER PHYSIOTHERAPIST (Only when opened specifically for practitioner) */}
          {mode === 'register_pt' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Physiotherapist Registration</h3>
                <p className="text-xs text-slate-500">
                  Step {ptStep} of 4: {ptStep === 1 ? 'Account & Category' : ptStep === 2 ? 'Credentials & Certificate' : ptStep === 3 ? 'Curriculum Vitae (CV) & Services' : 'Review & Submit'}
                </p>
              </div>

              <form onSubmit={handlePtRegister} className="space-y-3">
                {ptStep === 1 && (
                  <>
                    {/* Practitioner Category Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Register As:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPtData({ ...ptData, practitionerLevel: 'experienced' })}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            ptData.practitionerLevel === 'experienced'
                              ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-sm ring-1 ring-emerald-500'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-bold text-xs block text-slate-900">🎓 Experienced Therapist</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5 leading-snug">
                            2+ years clinical practice & state council certificate
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPtData({ ...ptData, practitionerLevel: 'fresher' })}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            ptData.practitionerLevel === 'fresher'
                              ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-sm ring-1 ring-emerald-500'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-bold text-xs block text-slate-900">🌱 Fresher Graduate</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5 leading-snug">
                            Recent BPT graduate / practicing under senior mentorship
                          </span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name & Professional Title</label>
                      <input
                        type="text"
                        required
                        value={ptData.fullName}
                        onChange={(e) => setPtData({ ...ptData, fullName: e.target.value })}
                        placeholder={ptData.practitionerLevel === 'experienced' ? 'Dr. Rajesh Verma, MPT' : 'Dr. Sneha Kulkarni, BPT'}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Professional Email</label>
                      <input
                        type="email"
                        required
                        value={ptData.email}
                        onChange={(e) => setPtData({ ...ptData, email: e.target.value })}
                        placeholder="doctor@physiogo.care"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={ptData.password}
                        onChange={(e) => setPtData({ ...ptData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        required
                        value={ptData.phone}
                        onChange={(e) => setPtData({ ...ptData, phone: e.target.value })}
                        placeholder="+91 98111 22334"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </>
                )}

                {ptStep === 2 && (
                  <>
                    {ptData.practitionerLevel === 'experienced' ? (
                      /* Experienced Therapist Credentials */
                      <div className="space-y-3">
                        <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                          <strong>Experienced Therapist Verification:</strong> Please provide your State Council Registration and Practice Certificate details.
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Council Registration Number</label>
                          <input
                            type="text"
                            required
                            value={ptData.registrationNumber}
                            onChange={(e) => setPtData({ ...ptData, registrationNumber: e.target.value })}
                            placeholder="e.g. DCPTOT/2018/8892"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Registration Authority / Council</label>
                          <input
                            type="text"
                            required
                            value={ptData.registrationAuthority}
                            onChange={(e) => setPtData({ ...ptData, registrationAuthority: e.target.value })}
                            placeholder="Delhi Council for Physiotherapy (DCPTOT) or State Council"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Years of Clinical Experience</label>
                          <input
                            type="number"
                            required
                            min={2}
                            max={40}
                            value={ptData.experienceYears}
                            onChange={(e) => setPtData({ ...ptData, experienceYears: Number(e.target.value) })}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Practice Certificate Document
                          </label>
                          <input
                            type="text"
                            value={ptData.certificateName}
                            onChange={(e) => setPtData({ ...ptData, certificateName: e.target.value })}
                            placeholder="e.g. DCPTOT_Practice_License_2026.pdf"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-slate-50 font-mono text-xs"
                          />
                          <p className="text-[11px] text-slate-400 mt-1">
                            Certificate document will be verified by the admin before full public listing.
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Fresher Therapist Credentials */
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900">
                          <strong>Fresher Graduate Registration:</strong> Registered as entry-level practitioner practicing under senior clinical mentorship.
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Graduation College / Institute</label>
                          <input
                            type="text"
                            required
                            value={ptData.college}
                            onChange={(e) => setPtData({ ...ptData, college: e.target.value })}
                            placeholder="e.g. Department of Rehabilitation, Delhi University"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Graduation Year</label>
                          <input
                            type="number"
                            required
                            min={2020}
                            max={2026}
                            value={ptData.graduationYear}
                            onChange={(e) => setPtData({ ...ptData, graduationYear: Number(e.target.value) })}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Provisional Registration / Degree Certificate</label>
                          <input
                            type="text"
                            value={ptData.certificateName}
                            onChange={(e) => setPtData({ ...ptData, certificateName: e.target.value })}
                            placeholder="e.g. BPT_Provisional_Degree_Certificate.pdf"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-slate-50 font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Senior Supervising Clinician / Hospital (Mentorship)</label>
                          <input
                            type="text"
                            value={ptData.supervisingTherapist}
                            onChange={(e) => setPtData({ ...ptData, supervisingTherapist: e.target.value })}
                            placeholder="e.g. Dr. Ananya Sharma, MPT / Safdarjung Hospital"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {ptStep === 3 && (
                  <>
                    {/* CV / Resume Attachment & Services */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-700">
                            Curriculum Vitae (CV / Resume)
                          </label>
                          <span className="text-[11px] text-teal-700 font-semibold">Attached to Practitioner Profile</span>
                        </div>
                        <input
                          type="text"
                          required
                          value={ptData.cvFileName}
                          onChange={(e) => setPtData({ ...ptData, cvFileName: e.target.value })}
                          placeholder="e.g. Dr_Rajesh_Verma_Curriculum_Vitae.pdf"
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-slate-50 font-mono text-xs"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">
                          Your CV will be accessible directly in your therapist portal and verification portfolio.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">CV Summary & Key Clinical Experience</label>
                        <textarea
                          rows={2}
                          value={ptData.cvSummary}
                          onChange={(e) => setPtData({ ...ptData, cvSummary: e.target.value })}
                          placeholder="Brief overview of clinical rotations, certifications, and special interests..."
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee (₹)</label>
                          <input
                            type="number"
                            required
                            value={ptData.consultationFee}
                            onChange={(e) => setPtData({ ...ptData, consultationFee: Number(e.target.value) })}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Practice City</label>
                          <input
                            type="text"
                            required
                            value={ptData.city}
                            onChange={(e) => setPtData({ ...ptData, city: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Clinic Center Address</label>
                        <input
                          type="text"
                          required
                          value={ptData.clinicAddress}
                          onChange={(e) => setPtData({ ...ptData, clinicAddress: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>
                  </>
                )}

                {ptStep === 4 && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-2.5">
                    <div className="flex items-center gap-2 pb-2 border-b border-emerald-200">
                      <ShieldCheck className="w-5 h-5 text-emerald-700" />
                      <h4 className="font-bold text-sm text-slate-900">Application Review</h4>
                    </div>

                    <div className="space-y-1.5">
                      <p><strong>Practitioner Level:</strong> {ptData.practitionerLevel === 'experienced' ? '🎓 Experienced Physiotherapist (Council Certified)' : '🌱 Fresher / Graduate Physiotherapist (Supervised Mentorship)'}</p>
                      <p><strong>Name:</strong> {ptData.fullName}</p>
                      <p><strong>Email:</strong> {ptData.email}</p>
                      <p><strong>Certificate on file:</strong> {ptData.certificateName}</p>
                      <p><strong>CV Attached:</strong> <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200">{ptData.cvFileName}</span></p>
                      <p><strong>Consultation Fee:</strong> ₹{ptData.consultationFee}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {ptStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setPtStep(ptStep - 1)}
                      className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : ptStep < 4 ? 'Continue Next Step' : 'Submit Application & Create Account'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
