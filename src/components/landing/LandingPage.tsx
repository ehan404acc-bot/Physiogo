import React from 'react';
import {
  Activity,
  ShieldCheck,
  FileText,
  ArrowRightLeft,
  Calendar,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  Users,
  CheckCircle2,
  MapPin,
  Star,
  Award,
  ArrowRight,
  HeartHandshake,
  Clock,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import { INITIAL_PHYSIOTHERAPISTS } from '../../data/seedData';

interface LandingPageProps {
  setActiveView: (view: string) => void;
  openAuthModal: (mode: 'login' | 'register_patient' | 'register_pt') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveView, openAuthModal }) => {
  const verifiedTherapists = INITIAL_PHYSIOTHERAPISTS.filter((pt) => pt.verificationStatus === 'verified');

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50 to-white pt-12 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Next-Gen Healthcare Innovation • State Council Verified</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
                Your Recovery.{' '}
                <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-teal-600 bg-clip-text text-transparent">
                  Your Records.
                </span>{' '}
                Your Choice.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Find trusted physiotherapists, book personalized rehabilitation services, securely manage your recovery history, and experience the groundbreaking <strong>Rehabilitation Passport & Smart Therapist Handover System</strong>.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => setActiveView('directory')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 group text-sm sm:text-base"
                >
                  <span>Find a Physiotherapist</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => openAuthModal('register_pt')}
                  className="bg-white hover:bg-slate-50 text-slate-800 font-bold px-5 py-3.5 rounded-xl border border-slate-300 shadow-sm transition-all text-sm sm:text-base flex items-center gap-2"
                >
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Join as Physiotherapist</span>
                </button>

                <button
                  onClick={() => setActiveView('demo_walkthrough')}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold px-5 py-3.5 rounded-xl shadow-md transition-all text-sm sm:text-base flex items-center gap-2"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Test End-to-End Handover</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-left max-w-lg mx-auto lg:mx-0">
                <div>
                  <p className="text-2xl font-black text-slate-900">100%</p>
                  <p className="text-xs text-slate-500 font-medium">Verified Credentials</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">Zero-Loss</p>
                  <p className="text-xs text-slate-500 font-medium">Record Portability</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-teal-700">AI-Assisted</p>
                  <p className="text-xs text-slate-500 font-medium">Continuity Summaries</p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Rehabilitation Passport Card Preview */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-teal-400 rounded-3xl blur-lg opacity-30 group-hover:opacity-100 transition duration-1000"></div>

                <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200/80 p-5 space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Rehabilitation Passport</h4>
                        <p className="text-[11px] text-teal-700 font-semibold">Patient: Vikram Malhotra (ACL Post-Op)</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active Sync
                    </span>
                  </div>

                  {/* Summary Metric Pills */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <p className="text-slate-500 text-[10px]">Knee Extension Lag</p>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        -10° <span className="text-emerald-600 text-xs">→ 0° (Restored)</span>
                      </p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <p className="text-slate-500 text-[10px]">Pain Level (NPRS)</p>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        7/10 <span className="text-teal-600 text-xs">→ 3/10</span>
                      </p>
                    </div>
                  </div>

                  {/* Handover Grant Banner */}
                  <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-teal-200 p-3 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center gap-1.5 text-teal-800">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        Smart Handover Transfer
                      </span>
                      <span className="text-[10px] bg-teal-200/70 text-teal-900 px-1.5 py-0.2 rounded font-semibold">
                        Authorized
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Historical records from <strong>Dr. Ananya Sharma</strong> safely transferred to receiving specialist <strong>Dr. Rajesh Verma</strong> with zero loss of clinical data.
                    </p>
                  </div>

                  {/* Recent SOAP Note Snippet */}
                  <div className="border border-slate-100 rounded-xl p-2.5 text-[11px] space-y-1 bg-slate-50/50">
                    <div className="flex justify-between text-slate-500 text-[10px]">
                      <span>Documented SOAP Session #4</span>
                      <span>22 March 2026</span>
                    </div>
                    <p className="text-slate-700 font-medium">
                      <strong>Assessment:</strong> Full active extension restored. Ready for closed-chain functional progression.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveView('demo_walkthrough')}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Inspect Live Handover Journey</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Primary Innovation: Rehabilitation Passport & Smart Handover */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              The PhysioGo Core Innovation
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              No More Restarting From Zero When Changing Physiotherapists
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Traditional physiotherapy leaves patient records trapped in isolated clinics. If you relocate, change work hours, or need a different specialist, you lose your documented range-of-motion progress, surgical precautions, and intervention history.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 relative z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">1. Portable Passport</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Patients maintain full ownership of their structured clinical assessments, objective ROM & strength tables, and chronological SOAP notes.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">2. Explicit Consent Handover</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                When transferring care, patients selectively grant time-bound access to receiving therapists. Access can be revoked anytime with one click.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">3. AI Smart Handover Summary</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Powered by Google Gemini, the system provides a structured clinical synthesis with clear source record references, pending tests, and safety precautions.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Strict Patient-First Security • Zero Public QR Exposure • Indian Healthcare Compliant
            </div>
            <button
              onClick={() => setActiveView('demo_walkthrough')}
              className="bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-2"
            >
              <span>See Handover Workflow in Action</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. How PhysioGo Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-3xl font-black text-slate-900">How PhysioGo Works</h2>
          <p className="text-slate-600 text-sm">Four seamless steps to structured, transparent, and continuous rehabilitation</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 relative">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900">Discover & Match</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Search verified physiotherapists by specialty, fee, home-visit availability, and verified council credentials.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 relative">
            <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900">Book & Consult</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Request appointments for clinic consultations, home visits, or tele-rehab with real-time schedule conflict prevention.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 relative">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900">Documented Passport</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your therapist enters structured assessments, exercise sets/reps, and objective outcome measures saved directly to your passport.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 relative">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
              04
            </div>
            <h3 className="text-base font-bold text-slate-900">Seamless Transfer</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Need to relocate? Request a therapist transfer and authorize your new doctor to review your complete clinical journey instantly.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Featured Verified Physiotherapists */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              Council-Verified Professionals
            </div>
            <h2 className="text-3xl font-black text-slate-900">Featured Physiotherapists</h2>
            <p className="text-slate-600 text-sm">Only verified practitioners with state registration credentials appear in our directory</p>
          </div>
          <button
            onClick={() => setActiveView('directory')}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>View All Professionals</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {verifiedTherapists.slice(0, 3).map((pt) => (
            <div key={pt.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <img
                    src={pt.photoUrl}
                    alt={pt.fullName}
                    className="h-14 w-14 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-slate-900">{pt.fullName}</h3>
                      <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{pt.qualification}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                        {pt.rating}
                      </span>
                      <span>•</span>
                      <span>{pt.experienceYears} yrs exp</span>
                      <span>•</span>
                      <span className="text-teal-700 font-semibold">{pt.totalReviews} reviews</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {pt.specializations.slice(0, 3).map((spec, idx) => (
                    <span key={idx} className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {spec}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{pt.bio}</p>

                <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {pt.serviceAreas[0]}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    ₹{pt.consultationFee} <span className="text-[10px] font-normal text-slate-500">/ session</span>
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 flex gap-2">
                <button
                  onClick={() => setActiveView('directory')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl text-xs transition-colors"
                >
                  Book Consultation
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Integrated Marketplace & Community Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Marketplace Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-8 border border-indigo-100 shadow-sm space-y-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Rehabilitation Equipment Marketplace</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Buy or rent verified clinical recovery equipment including digital TENS units, wobble balance boards, calibrated goniometers, and ergonomic crutches with maintenance readiness records.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveView('equipment')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Browse Equipment Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Community Card */}
          <div className="bg-gradient-to-br from-teal-50 to-white rounded-3xl p-8 border border-teal-100 shadow-sm space-y-4">
            <div className="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Rehabilitation Peer Support Communities</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Connect with stroke survivors, post-op knee/hip recovery patients, and licensed therapists in moderated peer support groups. Share practical recovery milestones without compromising private clinical records.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveView('community')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Join Stroke & Post-Op Communities</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
          <p className="text-slate-600 text-xs sm:text-sm">Everything you need to know about PhysioGo and clinical record portability</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-1">What is the Rehabilitation Passport?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              The Rehabilitation Passport is a patient-controlled digital clinical file that aggregates your formal physiotherapy assessments, objective range-of-motion measurements, strength grades, and chronological SOAP session notes. It belongs to you, not an individual clinic.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-1">How does the Smart Therapist Handover work?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              When you need to change physiotherapists (due to relocation, scheduling, or condition change), you request a transfer through your portal and grant explicit record access. The receiving physiotherapist can review your documented clinical history, view an AI-synthesized handover summary, and continue your rehabilitation without restarting from zero.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Does AI make medical diagnoses?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              No. PhysioGo strictly uses Google Gemini to summarize existing clinician-authored documentation. The AI never independently diagnoses, never prescribes exercises, and always highlights missing information for human clinician review.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
