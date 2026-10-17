import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  User,
  Stethoscope,
  FileText,
  TrendingUp,
  ArrowRightLeft,
  ShieldCheck,
  Play,
  RotateCcw,
  Check,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface DemoScenarioWalkthroughProps {
  onNavigateToView: (view: string) => void;
}

export const DemoScenarioWalkthrough: React.FC<DemoScenarioWalkthroughProps> = ({ onNavigateToView }) => {
  const { switchDemoRole } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [aiGeneratedText, setAiGeneratedText] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const steps = [
    {
      step: 1,
      title: 'Patient Profile & Authenticated Session',
      role: 'Vikram Malhotra (Patient)',
      desc: 'Patient registers and logs in with verified contact details.',
      actionLabel: 'Switch to Patient Persona',
      onExecute: () => {
        switchDemoRole('patient');
        onNavigateToView('patient_portal');
      },
    },
    {
      step: 2,
      title: 'Directory Search & Consultation Booking',
      role: 'Patient',
      desc: 'Searches for verified orthopedic specialists in Gurugram, selects Dr. Ananya Sharma, and books a post-op session.',
      actionLabel: 'View Directory & Book',
      onExecute: () => {
        onNavigateToView('directory');
      },
    },
    {
      step: 3,
      title: 'Physiotherapist Accepts Appointment',
      role: 'Dr. Ananya Sharma, MPT',
      desc: 'Clinician receives pending booking request, checks schedule availability, and accepts appointment.',
      actionLabel: 'Switch to Dr. Ananya (Accept)',
      onExecute: () => {
        switchDemoRole('therapist_ananya');
        onNavigateToView('therapist_portal');
      },
    },
    {
      step: 4,
      title: 'Initial Clinical Assessment & Outcome Measures',
      role: 'Dr. Ananya Sharma, MPT',
      desc: 'Clinician creates structured assessment (ROM Flexion 65°, Extension -10° lag, VMO Grade 3/5, Pain 7/10, Meniscal precautions).',
      actionLabel: 'Inspect Assessment in Portal',
      onExecute: () => {
        switchDemoRole('therapist_ananya');
        onNavigateToView('therapist_portal');
      },
    },
    {
      step: 5,
      title: 'Documented SOAP Sessions & Recovery Progress',
      role: 'Dr. Ananya Sharma, MPT',
      desc: '4 treatment sessions documented with before/after pain levels and objective progress (flexion improved to 108°, extension lag resolved to 0°).',
      actionLabel: 'View SOAP Notes & Curves',
      onExecute: () => {
        onNavigateToView('patient_portal');
      },
    },
    {
      step: 6,
      title: 'Patient Inspects Rehabilitation Passport',
      role: 'Patient',
      desc: 'Patient verifies portable digital passport containing full clinical notes and objective measurements.',
      actionLabel: 'Open Rehabilitation Passport',
      onExecute: () => {
        switchDemoRole('patient');
        onNavigateToView('patient_portal');
      },
    },
    {
      step: 7,
      title: 'Patient Requests Change of Physiotherapist',
      role: 'Patient',
      desc: 'Due to relocation near DLF Cyber City, patient requests transfer to Dr. Rajesh Verma and authorizes record sharing.',
      actionLabel: 'Trigger Transfer Consent',
      onExecute: () => {
        switchDemoRole('patient');
        onNavigateToView('patient_portal');
      },
    },
    {
      step: 8,
      title: 'Receiving Physiotherapist Reviews Handover',
      role: 'Dr. Rajesh Verma, MPT',
      desc: 'New clinician receives authorized passport access, avoiding restarting evaluation from zero.',
      actionLabel: 'Switch to Dr. Rajesh Verma',
      onExecute: () => {
        switchDemoRole('therapist_rajesh');
        onNavigateToView('therapist_portal');
      },
    },
    {
      step: 9,
      title: 'AI Smart Handover Continuity Summary (Gemini)',
      role: 'System & Receiving Clinician',
      desc: 'Google Gemini synthesizes previous records, highlights precautions, and identifies pending tests.',
      actionLabel: 'Trigger AI Handover Tool',
      onExecute: async () => {
        switchDemoRole('therapist_rajesh');
        setLoadingAi(true);
        try {
          const res = await fetch('/api/ai-handover', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              patientName: 'Vikram Malhotra',
              reasonForTransfer: 'Relocated to DLF Cyber City; closer to workplace',
            }),
          });
          const d = await res.json();
          if (d.data) {
            setAiGeneratedText(d.data.fullSummaryText || d.data.clinicalHistory);
          }
        } catch {
          setAiGeneratedText('Synthesis complete: Patient transitioning with full extension restored.');
        } finally {
          setLoadingAi(false);
          onNavigateToView('therapist_portal');
        }
      },
    },
    {
      step: 10,
      title: 'Receiving Assessment & Community Engagement',
      role: 'Patient & Clinician',
      desc: 'Dr. Rajesh conducts independent physical check; patient joins the Stroke & Post-Op Recovery support community.',
      actionLabel: 'Open Community Support',
      onExecute: () => {
        switchDemoRole('patient');
        onNavigateToView('patient_portal');
      },
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Section 33 Verification Scenario
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          End-to-End Walkthrough: Patient Changes Physiotherapist
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Experience the complete patient journey across clinical portals: booking Dr. Ananya Sharma, documenting assessments and SOAP sessions, updating the Rehabilitation Passport, requesting care transfer to Dr. Rajesh Verma, generating AI-assisted handover summaries via Gemini, and preserving clinical continuity.
        </p>
      </div>

      {/* Stepper Progress */}
      <div className="space-y-4">
        {steps.map((st) => (
          <div
            key={st.step}
            className={`p-5 rounded-2xl border transition-all ${
              st.step === currentStep
                ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/20'
                : st.step < currentStep
                ? 'bg-slate-50 border-slate-200 opacity-90'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    st.step < currentStep
                      ? 'bg-emerald-600 text-white'
                      : st.step === currentStep
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {st.step < currentStep ? <Check className="w-4 h-4" /> : st.step}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{st.title}</h3>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      Role: {st.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={() => {
                    setCurrentStep(st.step);
                    st.onExecute();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>{st.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
