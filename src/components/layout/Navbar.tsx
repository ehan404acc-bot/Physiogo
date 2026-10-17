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
  Menu,
  X,
  Search,
  Dumbbell,
} from 'lucide-react';

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  openAuthModal: (mode: 'login' | 'register_patient' | 'register_pt') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView, openAuthModal }) => {
  const { currentUser, userProfile, role, logout, switchDemoRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: string) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner for Demo switcher & Scenario Walkthrough */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-teal-900 text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Brand Tagline in top bar */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-200 text-[11px] sm:text-xs">
              PhysioGo • <span className="text-teal-300 font-semibold">Your Recovery. Your Records. Your Choice.</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-slate-300 text-[11px] hidden sm:inline">Test Persona:</span>
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs px-2.5 py-1 rounded-lg font-medium border border-white/20 flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3 h-3 text-teal-300" />
                <span className="truncate max-w-[120px] sm:max-w-none">
                  {role === 'patient'
                    ? 'Patient (Vikram)'
                    : currentUser?.uid === 'pt-ananya-sharma'
                    ? 'Therapist (Dr. Ananya)'
                    : currentUser?.uid === 'pt-sneha-kulkarni'
                    ? 'Fresher PT (Dr. Sneha)'
                    : currentUser?.uid === 'pt-rajesh-verma'
                    ? 'Receiving PT (Dr. Rajesh)'
                    : role === 'admin'
                    ? 'Platform Admin'
                    : 'Switch Persona'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-300" />
              </button>

              {demoMenuOpen && (
                <div
                  className="absolute right-0 mt-1 w-64 rounded-xl bg-white text-slate-800 shadow-xl ring-1 ring-black/5 z-50 py-1.5 border border-slate-100"
                  onMouseLeave={() => setDemoMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Instant Demo Switcher
                  </div>
                  <button
                    onClick={() => {
                      switchDemoRole('patient');
                      handleNavClick('patient_portal');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">Vikram Malhotra</p>
                      <p className="text-slate-500 text-[11px]">Patient • Post-Op ACL Recovery</p>
                    </div>
                    {role === 'patient' && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                        Active
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      switchDemoRole('therapist_ananya');
                      handleNavClick('therapist_portal');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">Dr. Ananya Sharma, MPT</p>
                      <p className="text-slate-500 text-[11px]">🎓 Experienced PT (Council Certified)</p>
                    </div>
                    {currentUser?.uid === 'pt-ananya-sharma' && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                        Active
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      switchDemoRole('therapist_sneha');
                      handleNavClick('therapist_portal');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-teal-50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">Dr. Sneha Kulkarni, BPT</p>
                      <p className="text-slate-500 text-[11px]">🌱 Fresher PT (Degree Cert & CV)</p>
                    </div>
                    {currentUser?.uid === 'pt-sneha-kulkarni' && (
                      <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-bold">
                        Active
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      switchDemoRole('therapist_rajesh');
                      handleNavClick('therapist_portal');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">Dr. Rajesh Verma, MPT</p>
                      <p className="text-slate-500 text-[11px]">Receiving PT (Smart Handover)</p>
                    </div>
                    {currentUser?.uid === 'pt-rajesh-verma' && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                        Active
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      switchDemoRole('admin');
                      handleNavClick('admin_portal');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50 flex items-center justify-between border-t border-slate-100"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">Administrator</p>
                      <p className="text-slate-500 text-[11px]">Verification, Complaints & Operations</p>
                    </div>
                    {role === 'admin' && (
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                        Active
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('demo_walkthrough')}
              className="bg-teal-500/25 hover:bg-teal-500/40 text-teal-200 hover:text-white px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3 h-3 text-teal-300" />
              <span className="hidden sm:inline">Handover Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => handleNavClick('landing')}
          >
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-teal-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold text-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">Physio</span>
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
                  Go
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Care
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
              onClick={() => handleNavClick('landing')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeView === 'landing'
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNavClick('directory')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeView === 'directory'
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4 text-blue-600" />
              <span>Find Physiotherapist</span>
            </button>

            <button
              onClick={() => {
                if (role === 'patient') handleNavClick('patient_portal');
                else handleNavClick('patient_data');
              }}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeView === 'patient_data' || (activeView === 'patient_portal' && role === 'patient')
                  ? 'text-teal-700 bg-teal-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Patient Data</span>
            </button>

            {/* SEPARATE RENTAL PORTAL LINK */}
            <button
              onClick={() => handleNavClick('rental_portal')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeView === 'rental_portal' || activeView === 'equipment'
                  ? 'text-teal-700 bg-teal-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <span>Equipment Rental</span>
            </button>

            <button
              onClick={() => handleNavClick('community')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeView === 'community'
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Community</span>
            </button>
          </nav>

          {/* Right Actions & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Portal Shortcuts */}
            {role === 'patient' && (
              <button
                onClick={() => handleNavClick('patient_portal')}
                className="hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-colors items-center gap-1.5"
              >
                <User className="w-4 h-4" />
                <span>Patient Portal</span>
              </button>
            )}

            {role === 'physiotherapist' && (
              <button
                onClick={() => handleNavClick('therapist_portal')}
                className="hidden sm:flex bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-colors items-center gap-1.5"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Therapist Portal</span>
              </button>
            )}

            {role === 'admin' && (
              <button
                onClick={() => handleNavClick('admin_portal')}
                className="hidden sm:flex bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-colors items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Portal</span>
              </button>
            )}

            {/* User Dropdown / Sign In */}
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-800 max-w-[90px] sm:max-w-[120px] truncate">
                    {userProfile?.fullName || currentUser.email.split('@')[0]}
                  </span>
                  <div className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {(userProfile?.fullName || currentUser.email)[0]}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 z-50 py-2 border border-slate-100 animate-in fade-in zoom-in-95"
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
                        if (role === 'patient') handleNavClick('patient_portal');
                        else if (role === 'physiotherapist') handleNavClick('therapist_portal');
                        else handleNavClick('admin_portal');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>My Portal Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        handleNavClick('rental_portal');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-teal-600" />
                      <span>Equipment Rental Portal</span>
                    </button>

                    <button
                      onClick={() => {
                        handleNavClick('login');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <LogIn className="w-4 h-4 text-indigo-600" />
                      <span>Switch Account / Sign In</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        handleNavClick('login');
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
                  type="button"
                  onClick={() => openAuthModal('register_pt')}
                  className="hidden sm:flex text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-2 rounded-xl transition-colors items-center gap-1.5 shadow-sm"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Register as Physiotherapist</span>
                </button>
                <button
                  onClick={() => handleNavClick('login')}
                  className="text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            <button
              onClick={() => handleNavClick('landing')}
              className={`p-2.5 rounded-xl text-xs font-bold text-left transition-colors flex items-center gap-2 ${
                activeView === 'landing' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Home</span>
            </button>

            <button
              onClick={() => handleNavClick('directory')}
              className={`p-2.5 rounded-xl text-xs font-bold text-left transition-colors flex items-center gap-2 ${
                activeView === 'directory' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4 text-blue-600" />
              <span>Directory</span>
            </button>

            <button
              onClick={() => handleNavClick('patient_portal')}
              className={`p-2.5 rounded-xl text-xs font-bold text-left transition-colors flex items-center gap-2 ${
                activeView === 'patient_portal'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Dumbbell className="w-4 h-4 text-emerald-600" />
              <span>Home Exercises</span>
            </button>

            <button
              onClick={() => handleNavClick('rental_portal')}
              className={`p-2.5 rounded-xl text-xs font-bold text-left transition-colors flex items-center gap-2 ${
                activeView === 'rental_portal' || activeView === 'equipment'
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <span>Equipment Rental</span>
            </button>
          </div>

          {/* Quick Portal Shortcuts on Mobile */}
          <div className="pt-2 space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Portals & Accounts
            </p>

            <button
              onClick={() => handleNavClick('patient_portal')}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-left bg-blue-50/70 hover:bg-blue-100 text-blue-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Patient Portal</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-blue-400" />
            </button>

            <button
              onClick={() => handleNavClick('therapist_portal')}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-left bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                <span>Therapist Portal</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-emerald-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                openAuthModal('register_pt');
                setMobileMenuOpen(false);
              }}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-left bg-emerald-600 text-white flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-200" />
                <span>Register as Physiotherapist (OTP Verified)</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-emerald-200" />
            </button>

            <button
              onClick={() => handleNavClick('login')}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-left bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4 text-slate-600" />
                <span>Sign In / Switch Role</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-400" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
