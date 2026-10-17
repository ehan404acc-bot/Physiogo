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
      <main className="flex-1">
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

        {activeView === 'equipment' && (
          <PatientPortal initialTab="marketplace" />
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
