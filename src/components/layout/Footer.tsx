import React from 'react';
import { Activity, ShieldCheck, Heart, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  setActiveView: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveView }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 flex items-center justify-center text-white">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Physio<span className="text-teal-400">Go</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Your Recovery. Your Records. Your Choice. An integrated digital physiotherapy ecosystem
              connecting patients with verified physiotherapists with patient-controlled Rehabilitation Passports.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Council Verified Clinicians
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-400" />
                Continuity of Care First
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => setActiveView('directory')} className="hover:text-teal-300 transition-colors">
                  Find Physiotherapists
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('equipment')} className="hover:text-teal-300 transition-colors">
                  Equipment Marketplace
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('community')} className="hover:text-teal-300 transition-colors">
                  Rehab Community
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('demo_walkthrough')} className="hover:text-teal-300 transition-colors text-teal-400 font-medium">
                  End-to-End Walkthrough
                </button>
              </li>
            </ul>
          </div>

          {/* Clinical Innovation */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Continuity</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-slate-400">Rehabilitation Passport</span>
              </li>
              <li>
                <span className="text-slate-400">Smart Therapist Handover</span>
              </li>
              <li>
                <span className="text-slate-400">AI Handover Synthesis</span>
              </li>
              <li>
                <span className="text-slate-400">SOAP Session Records</span>
              </li>
              <li>
                <span className="text-slate-400">Objective ROM Tracking</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400" />
                <span>+91 1800-PHYSIO-GO</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400" />
                <span>support@physiogo.care</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>Gurugram & Delhi NCR, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="border-t border-slate-800 mt-10 pt-6 text-xs text-slate-500 space-y-2">
          <p className="leading-relaxed">
            <strong>Clinical Safety Disclaimer:</strong> PhysioGo is a healthcare coordination and rehabilitation continuity platform. 
            AI-assisted record summaries are generated for clinician documentation support only and do not constitute independent medical 
            diagnoses, treatment prescriptions, or emergency triage. Always seek direct clinical assessment from a licensed healthcare practitioner.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[11px]">
            <p>© {new Date().getFullYear()} PhysioGo Technologies Private Limited. All rights reserved.</p>
            <p className="text-slate-400">Compliant with Indian Healthcare Data Protection & Tele-rehabilitation Guidelines</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
