import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  User,
  ShieldCheck,
  Stethoscope,
  LogOut,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  Users,
  FileText,
  Calendar,
  Layers,
  ArrowRightLeft,
  LogIn,
} from 'lucide-react';

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  openAuthModal: (mode: 'login' | 'register_patient' | 'register_pt') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView, openAuthModal }) => {
  const { currentUser, userProfile, role, logout, switchDemoRole, isDemoUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner for Demo switcher & Status */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-teal-900 text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span className="font-medium text-slate-200">
              Healthcare Hackathon Prototype • <strong className="text-white">Firestore & Gemini AI Connected</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-300 hidden md:inline">Quick Test Persona:</span>
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1 rounded-md font-medium border border-white/20 flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                <span>
                  {role === 'patient'
                    ? 'Patient (Vikram)'
                    : currentUser?.uid === 'pt-ananya-sharma'
                    ? 'Therapist (Dr. Ananya)'
                    : currentUser?.uid === 'pt-rajesh-verma'
                    ? 'Receiving PT (Dr. Rajesh)'
                    : role === 'admin'
                    ? 'Platform Admin'
                    : 'Select Persona'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-300" />
              </button>

              {demoMenuOpen && (
                <div
                  className="absolute right-0 mt-1 w-64 rounded-lg bg-white text-slate-800 shadow-xl ring-1 ring-black/5 z-50 py-1.5"
                  onMouseLeave={() => setDemoMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Instant Demo Switcher
                  </div>
                  <button
                    onClick={() => {
                      switchDemoRole('patient');
                      setActiveView('patient_portal');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">Vikram Malhotra</p>
                      <p className="text-slate-500 text-[11px]">Patient • Post-Op ACL Rehab</p>
                    </div>
                    {role === 'patient' && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Active</span>}
                  </button>

                  <button
                    onClick={() => {
                      switchDemoRole('therapist_ananya');
                      setActiveView('therapist_portal');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">Dr. Ananya Sharma, MPT</p>
                      <p className="text-slate-500 text-[11px]">Primary Treating Physiotherapist</p>
                    </div>
                    {currentUser?.uid === 'pt-ananya-sharma' && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Active</span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      switchDemoRole('therapist_rajesh');
                      setActiveView('therapist_portal');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">Dr. Rajesh Verma, MPT</p>
                      <p className="text-slate-500 text-[11px]">Receiving PT (Smart Handover)</p>
                    </div>
                    {currentUser?.uid === 'pt-rajesh-verma' && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Active</span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      switchDemoRole('admin');
                      setActiveView('admin_portal');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50 flex items-center justify-between border-t border-slate-100"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">Administrator</p>
                      <p className="text-slate-500 text-[11px]">Verification, Complaints & Analytics</p>
                    </div>
                    {role === 'admin' && (
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Active</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveView('demo_walkthrough')}
              className="bg-teal-500/30 hover:bg-teal-500/40 text-teal-200 hover:text-white px-2.5 py-1 rounded font-semibold text-xs transition-colors flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3 h-3 text-teal-300" />
              <span>Section 33 Scenario Walkthrough</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('landing')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-teal-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold text-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">Physio</span>
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
                  Go
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Care+
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Your Recovery. Your Records. Your Choice.
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveView('landing')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'landing' ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setActiveView('directory')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'directory' ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Find Physiotherapist
            </button>

            <button
              onClick={() => {
                if (role === 'patient') setActiveView('patient_portal');
                else setActiveView('patient_data');
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'patient_data' || (activeView === 'patient_portal' && role === 'patient')
                  ? 'text-teal-700 bg-teal-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Patient Data</span>
            </button>

            <button
              onClick={() => setActiveView('equipment')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'equipment' ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <span>Marketplace</span>
            </button>

            <button
              onClick={() => setActiveView('community')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'community' ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Community</span>
            </button>

            <button
              onClick={() => setActiveView('login')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'login' ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LogIn className="w-4 h-4 text-blue-600" />
              <span>Sign In</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Portal CTA Button */}
            {role === 'patient' && (
              <button
                onClick={() => setActiveView('patient_portal')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <User className="w-4 h-4" />
                <span>Patient Portal</span>
              </button>
            )}

            {role === 'physiotherapist' && (
              <button
                onClick={() => setActiveView('therapist_portal')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Therapist Portal</span>
              </button>
            )}

            {role === 'admin' && (
              <button
                onClick={() => setActiveView('admin_portal')}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Portal</span>
              </button>
            )}

            {/* Profile Menu or Login Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 transition-colors"
                >
                  <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate hidden sm:inline">
                    {userProfile?.fullName || currentUser.email.split('@')[0]}
                  </span>
                  <div className="h-7 w-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {(userProfile?.fullName || currentUser.email)[0]}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl ring-1 ring-black/5 z-50 py-2 border border-slate-100"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{userProfile?.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {role || 'User'}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (role === 'patient') setActiveView('patient_portal');
                        else if (role === 'physiotherapist') setActiveView('therapist_portal');
                        else setActiveView('admin_portal');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>My Portal Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveView('login');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <LogIn className="w-4 h-4 text-teal-600" />
                      <span>Switch Account / Sign In</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setActiveView('login');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView('login')}
                  className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuthModal('register_patient')}
                  className="text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-lg shadow-sm transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
