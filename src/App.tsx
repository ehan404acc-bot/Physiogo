import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { TherapistDirectory } from './components/directory/TherapistDirectory';
import { PatientPortal } from './components/patient/PatientPortal';
import { TherapistPortal } from './components/therapist/TherapistPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { DemoScenarioWalkthrough } from './components/demo/DemoScenarioWalkthrough';
import { AuthModal } from './components/auth/AuthModal';
import { LoginPage } from './components/auth/LoginPage';
import { RentalPortal } from './components/rental/RentalPortal';
import {
  Activity,
  Search,
  FileText,
  ShoppingBag,
  User,
  Stethoscope,
  ShieldCheck,
  LogIn,
} from 'lucide-react';

const MainApp: React.FC = () => {
  const { role } = useAuth();
  const [activeView, setActiveView] = useState<string>('landing');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register_patient' | 'register_pt'>('login');

  const openAuthModal = (mode: 'login' | 'register_patient' | 'register_pt') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (assignedRole: string) => {
    if (assignedRole === 'patient') {
      setActiveView('patient_portal');
    } else if (assignedRole === 'physiotherapist') {
      setActiveView('therapist_portal');
    } else if (assignedRole === 'admin') {
      setActiveView('admin_portal');
    } else {
      setActiveView('patient_portal');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Global Navigation */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        openAuthModal={openAuthModal}
      />

      {/* Main View Switcher */}
      <main className="flex-1 pb-20 md:pb-0">
        {activeView === 'landing' && (
          <LandingPage setActiveView={setActiveView} openAuthModal={openAuthModal} />
        )}

        {activeView === 'directory' && (
          <TherapistDirectory />
        )}

        {activeView === 'patient_portal' && (
          <PatientPortal />
        )}

        {(activeView === 'passport_preview' || activeView === 'patient_data') && (
          <PatientPortal initialTab="patient_data" />
        )}

        {(activeView === 'equipment' || activeView === 'rental_portal') && (
          <RentalPortal />
        )}

        {activeView === 'community' && (
          <PatientPortal initialTab="community" />
        )}

        {activeView === 'therapist_portal' && (
          <TherapistPortal />
        )}

        {activeView === 'admin_portal' && (
          <AdminPortal />
        )}

        {activeView === 'login' && (
          <LoginPage
            onSuccess={handleAuthSuccess}
            onNavigateHome={() => setActiveView('landing')}
            onOpenRegister={(mode) => openAuthModal(mode)}
          />
        )}

        {activeView === 'demo_walkthrough' && (
          <DemoScenarioWalkthrough onNavigateToView={setActiveView} />
        )}
      </main>

      {/* Mobile App Bottom Navigation Bar (Optimized for Smartphone Screens) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-2 flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <button
          onClick={() => setActiveView('landing')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            activeView === 'landing' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => setActiveView('directory')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            activeView === 'directory' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Find PT</span>
        </button>

        <button
          onClick={() => {
            if (role === 'patient') setActiveView('patient_portal');
            else setActiveView('patient_data');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            activeView === 'patient_data' || (activeView === 'patient_portal' && role === 'patient')
              ? 'text-teal-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Patient Data</span>
        </button>

        <button
          onClick={() => setActiveView('rental_portal')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            activeView === 'rental_portal' || activeView === 'equipment'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Rentals</span>
        </button>

        <button
          onClick={() => {
            if (role === 'physiotherapist') setActiveView('therapist_portal');
            else if (role === 'patient') setActiveView('patient_portal');
            else if (role === 'admin') setActiveView('admin_portal');
            else setActiveView('login');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            activeView === 'therapist_portal' || activeView === 'admin_portal' || activeView === 'login'
              ? 'text-emerald-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {role === 'physiotherapist' ? (
            <Stethoscope className="w-5 h-5" />
          ) : role === 'admin' ? (
            <ShieldCheck className="w-5 h-5" />
          ) : role === 'patient' ? (
            <User className="w-5 h-5" />
          ) : (
            <LogIn className="w-5 h-5" />
          )}
          <span className="text-[10px] mt-0.5">
            {role === 'physiotherapist'
              ? 'PT Portal'
              : role === 'admin'
              ? 'Admin'
              : role === 'patient'
              ? 'My Portal'
              : 'Sign In'}
          </span>
        </button>
      </nav>

      {/* Footer */}
      <Footer setActiveView={setActiveView} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
