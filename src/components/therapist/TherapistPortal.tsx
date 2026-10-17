import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope,
  Users,
  Calendar,
  Clock,
  FileText,
  Activity,
  Plus,
  TrendingUp,
  Sparkles,
  ArrowRightLeft,
  CheckCircle,
  AlertTriangle,
  Lock,
  Download,
  AlertCircle,
  Check,
  X,
  ChevronRight,
  ShieldCheck,
  Layers,
  Edit3,
  Award,
  GraduationCap,
  UploadCloud,
  FileCheck,
  ExternalLink,
  Dumbbell,
  Trash2,
} from 'lucide-react';
import {
  Appointment,
  ClinicalAssessment,
  TreatmentSession,
  RehabilitationPlan,
  ExerciseItem,
  ProgressMeasurement,
  TherapistTransferRequest,
  RecordAccessGrant,
  AiHandoverSummary,
  Physiotherapist,
  PractitionerLevel,
} from '../../types';
import {
  SAMPLE_ASSESSMENT,
  SAMPLE_TREATMENT_SESSIONS,
  SAMPLE_PROGRESS_MEASUREMENTS,
  SAMPLE_REHAB_PLAN,
  SAMPLE_PATIENT,
  INITIAL_PHYSIOTHERAPISTS,
} from '../../data/seedData';
import { db, collection, getDocs, doc, setDoc, updateDoc, getDoc } from '../../lib/firebase';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const TherapistPortal: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'appointments'
    | 'patients'
    | 'assessments'
    | 'soap_sessions'
    | 'rehab_plans'
    | 'prescribe_exercises'
    | 'transfers'
  >('dashboard');

  // Active Therapist Profile (Experienced vs Fresher)
  const [therapistProfile, setTherapistProfile] = useState<Physiotherapist>(() => {
    if (currentUser?.uid === 'pt-sneha-kulkarni') return INITIAL_PHYSIOTHERAPISTS[2];
    if (currentUser?.uid === 'pt-rajesh-verma') return INITIAL_PHYSIOTHERAPISTS[1];
    return INITIAL_PHYSIOTHERAPISTS[0];
  });

  // CV & Certificate Modals
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [updateCvModalOpen, setUpdateCvModalOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [cvUpdateSuccess, setCvUpdateSuccess] = useState(false);
  const [cvFormData, setCvFormData] = useState({
    cvFileName: therapistProfile.cvFileName || 'Dr_Ananya_Sharma_CV_Ortho_2026.pdf',
    cvSummary: therapistProfile.cvSummary || 'Experienced physiotherapist specializing in musculoskeletal rehabilitation.',
    qualification: therapistProfile.qualification || 'Master of Physiotherapy (Orthopedics & Sports)',
    practitionerLevel: therapistProfile.practitionerLevel || 'experienced',
    certificateName: therapistProfile.certificateName || 'State Council Practice License (DCPTOT/2016/5412.pdf)',
    supervisingTherapist: therapistProfile.supervisingTherapist || '',
    experienceYears: therapistProfile.experienceYears || 8,
    college: therapistProfile.college || 'Department of Rehabilitation Sciences',
    graduationYear: therapistProfile.graduationYear || 2016,
  });

  // Toggle between Experienced and Fresher modes for immediate hackathon demonstration
  const handleSwitchLevel = (level: PractitionerLevel) => {
    if (level === 'fresher') {
      const fresherPt = INITIAL_PHYSIOTHERAPISTS[2];
      setTherapistProfile(fresherPt);
      setCvFormData({
        cvFileName: fresherPt.cvFileName || 'Sneha_Kulkarni_Fresher_Physiotherapist_Resume.pdf',
        cvSummary: fresherPt.cvSummary || 'Recent 2025 BPT graduate with 6-month clinical internship at Safdarjung Hospital. Practicing under senior clinical mentorship.',
        qualification: fresherPt.qualification,
        practitionerLevel: 'fresher',
        certificateName: fresherPt.certificateName || 'Provisional Practice Registration Certificate & BPT Degree.pdf',
        supervisingTherapist: fresherPt.supervisingTherapist || 'Dr. Ananya Sharma, MPT',
        experienceYears: 1,
        college: fresherPt.college || 'Department of Rehabilitation Sciences',
        graduationYear: 2025,
      });
    } else {
      const expPt = INITIAL_PHYSIOTHERAPISTS[0];
      setTherapistProfile(expPt);
      setCvFormData({
        cvFileName: expPt.cvFileName || 'Dr_Ananya_Sharma_CV_Ortho_2026.pdf',
        cvSummary: expPt.cvSummary || 'Senior Orthopedic Physiotherapist with 9+ years clinical excellence in post-op knee/hip rehab.',
        qualification: expPt.qualification,
        practitionerLevel: 'experienced',
        certificateName: expPt.certificateName || 'State Council Practice License (DCPTOT/2016/5412.pdf)',
        supervisingTherapist: '',
        experienceYears: expPt.experienceYears || 9,
        college: expPt.college || 'All India Institute of Physical Medicine & Rehabilitation',
        graduationYear: 2016,
      });
    }
  };

  // Save / Update CV & Credentials to Firestore
  const handleSaveCv = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Physiotherapist = {
      ...therapistProfile,
      practitionerLevel: cvFormData.practitionerLevel as PractitionerLevel,
      cvFileName: cvFormData.cvFileName,
      cvSummary: cvFormData.cvSummary,
      qualification: cvFormData.qualification,
      certificateName: cvFormData.certificateName,
      supervisingTherapist: cvFormData.supervisingTherapist,
      experienceYears: Number(cvFormData.experienceYears),
      college: cvFormData.college,
      graduationYear: Number(cvFormData.graduationYear),
    };

    setTherapistProfile(updated);
    try {
      await updateDoc(doc(db, 'physiotherapists', therapistProfile.id), {
        practitionerLevel: updated.practitionerLevel,
        cvFileName: updated.cvFileName,
        cvSummary: updated.cvSummary,
        qualification: updated.qualification,
        certificateName: updated.certificateName,
        supervisingTherapist: updated.supervisingTherapist,
        experienceYears: updated.experienceYears,
        college: updated.college,
        graduationYear: updated.graduationYear,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Saved CV locally (Firestore update note):', err);
    }

    setCvUpdateSuccess(true);
    setTimeout(() => {
      setCvUpdateSuccess(false);
      setUpdateCvModalOpen(false);
    }, 1200);
  };

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [declineReasonModalOpen, setDeclineReasonModalOpen] = useState(false);
  const [selectedApptForDecline, setSelectedApptForDecline] = useState<Appointment | null>(null);
  const [declineReasonText, setDeclineReasonText] = useState('Outside service area');

  // Assessments
  const [assessments, setAssessments] = useState<ClinicalAssessment[]>([SAMPLE_ASSESSMENT]);
  const [newAssessmentModalOpen, setNewAssessmentModalOpen] = useState(false);
  const [newAssessmentData, setNewAssessmentData] = useState({
    patientName: 'Vikram Malhotra',
    assessmentType: 'followup' as ClinicalAssessment['assessmentType'],
    chiefComplaint: 'Post-op knee flexion progression and closed chain stability',
    painIntensity: 3,
    painLocation: 'Peripatellar fat pad',
    postureObservation: 'Symmetric stance phase, minimal antalgic lean',
    activeRomFlexion: 110,
    activeRomExtension: 0,
    quadStrengthGrade: 4,
    clinicalImpression: 'Excellent post-op progress. Full extension locked, ready for proprioceptive board work.',
    shortTermGoals: 'Achieve 120° knee flexion with pain < 2/10',
    precautions: 'Do not overload patellar tendon past 90 degrees in loaded lunges.',
  });

  // SOAP Sessions
  const [treatmentSessions, setTreatmentSessions] = useState<TreatmentSession[]>(SAMPLE_TREATMENT_SESSIONS);
  const [newSoapModalOpen, setNewSoapModalOpen] = useState(false);
  const [newSoapData, setNewSoapData] = useState({
    sessionNumber: 5,
    subjective: 'Patient reports walking 2km without pain. No morning effusion.',
    objective: 'Extension 0°, Flexion 112°. Quad recruitment strong with zero extensor lag.',
    assessment: 'Tolerating Phase II closed chain progression smoothly.',
    plan: 'Introduce dynamic balance pad squats and eccentric step-downs.',
    interventions: ['Manual patellofemoral release', 'TKE with heavy band', 'Balance board single leg reach'],
    painBefore: 3,
    painAfter: 1,
  });

  // Transfer Handover Requests (Receiving therapist view)
  const [transferRequests, setTransferRequests] = useState<TherapistTransferRequest[]>([]);
  const [aiSummary, setAiSummary] = useState<AiHandoverSummary | null>(null);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [clinicianReviewNotes, setClinicianReviewNotes] = useState('');
  const [clinicianReviewed, setClinicianReviewed] = useState(false);

  // Home Exercise Program (HEP) Prescription State
  const [prescribedPlan, setPrescribedPlan] = useState<RehabilitationPlan>(SAMPLE_REHAB_PLAN);
  const [prescribeSuccess, setPrescribeSuccess] = useState(false);
  const [customEx, setCustomEx] = useState({
    name: '',
    targetArea: 'Quadriceps / Knee Stability',
    sets: 3,
    repetitions: 15,
    holdSeconds: 5,
    frequencyPerDay: 2,
    instructions: '',
  });

  // Load from Firestore
  useEffect(() => {
    const loadTherapistData = async () => {
      try {
        if (currentUser?.uid) {
          const ptSnap = await getDoc(doc(db, 'physiotherapists', currentUser.uid));
          if (ptSnap.exists()) {
            const data = ptSnap.data() as Physiotherapist;
            setTherapistProfile(data);
            setCvFormData({
              cvFileName: data.cvFileName || 'Physiotherapist_Resume.pdf',
              cvSummary: data.cvSummary || '',
              qualification: data.qualification || '',
              practitionerLevel: data.practitionerLevel || 'experienced',
              certificateName: data.certificateName || '',
              supervisingTherapist: data.supervisingTherapist || '',
              experienceYears: data.experienceYears || 2,
              college: data.college || '',
              graduationYear: data.graduationYear || 2024,
            });
          }
        }

        const planSnap = await getDocs(collection(db, 'rehabilitationPlans'));
        if (!planSnap.empty) {
          planSnap.forEach((d) => {
            const planData = d.data() as RehabilitationPlan;
            if (planData.id === SAMPLE_REHAB_PLAN.id) {
              setPrescribedPlan(planData);
            }
          });
        }

        const apptSnap = await getDocs(collection(db, 'appointments'));
        if (!apptSnap.empty) {
          const list: Appointment[] = [];
          apptSnap.forEach((d) => list.push(d.data() as Appointment));
          setAppointments(list);
        } else {
          setAppointments([
            {
              id: 'app-pt-01',
              patientId: SAMPLE_PATIENT.uid,
              patientName: SAMPLE_PATIENT.fullName,
              patientPhone: SAMPLE_PATIENT.phone,
              therapistId: currentUser?.uid || 'pt-ananya-sharma',
              therapistName: userProfile?.fullName || 'Dr. Ananya Sharma, MPT',
              consultationType: 'clinic',
              date: '2026-03-28',
              timeSlot: '04:00 PM - 04:45 PM',
              status: 'confirmed',
              fee: 1200,
              chiefComplaint: 'Post-Op Knee Phase II Closed Chain Review',
              createdAt: '2026-03-24T10:00:00.000Z',
            },
            {
              id: 'app-pt-02',
              patientId: 'patient-new-02',
              patientName: 'Kavita Sundaram',
              patientPhone: '+91 98451 99882',
              therapistId: currentUser?.uid || 'pt-ananya-sharma',
              therapistName: userProfile?.fullName || 'Dr. Ananya Sharma, MPT',
              consultationType: 'home',
              date: '2026-03-29',
              timeSlot: '11:00 AM - 11:45 AM',
              status: 'pending',
              fee: 1200,
              chiefComplaint: 'Acute cervical radiculopathy with radiating shoulder numbness',
              createdAt: '2026-03-25T11:00:00.000Z',
            },
          ]);
        }

        const trSnap = await getDocs(collection(db, 'therapistTransferRequests'));
        if (!trSnap.empty) {
          const trList: TherapistTransferRequest[] = [];
          trSnap.forEach((d) => trList.push(d.data() as TherapistTransferRequest));
          setTransferRequests(trList);
        } else {
          // Default transfer request from Vikram moving to Dr. Rajesh
          const defaultTransfer: TherapistTransferRequest = {
            id: 'transfer-sample-vikram',
            patientId: SAMPLE_PATIENT.uid,
            patientName: SAMPLE_PATIENT.fullName,
            previousTherapistId: 'pt-ananya-sharma',
            previousTherapistName: 'Dr. Ananya Sharma, MPT',
            newTherapistId: 'pt-rajesh-verma',
            newTherapistName: 'Dr. Rajesh Verma, MPT',
            reason: 'relocation',
            reasonDetails: 'Relocation to DLF Cyber City. Closer to office and home.',
            status: 'pending',
            scopeOfAccess: ['assessments', 'treatment_notes', 'rehab_plans', 'progress_metrics'],
            patientConsentGiven: true,
            consentTimestamp: '2026-03-24T12:00:00.000Z',
            createdAt: '2026-03-24T12:00:00.000Z',
            updatedAt: '2026-03-24T12:00:00.000Z',
          };
          setTransferRequests([defaultTransfer]);
        }
      } catch (err) {
        console.warn('Error loading therapist data:', err);
      }
    };
    loadTherapistData();
  }, [currentUser]);

  // Appointment actions
  const updateAppointmentStatus = async (
    apptId: string,
    status: Appointment['status'],
    declineReason?: string
  ) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === apptId ? { ...a, status, declineReason } : a))
    );
    try {
      await updateDoc(doc(db, 'appointments', apptId), {
        status,
        declineReason: declineReason || null,
      });
    } catch (e) {
      console.warn('Firestore appointment status update failed:', e);
    }
  };

  // Prescribe Exercise Handlers
  const handleAddCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEx.name || !customEx.instructions) return;
    const newExercise: ExerciseItem = {
      id: 'ex-' + Date.now(),
      name: customEx.name,
      targetArea: customEx.targetArea,
      sets: Number(customEx.sets),
      repetitions: Number(customEx.repetitions),
      holdSeconds: Number(customEx.holdSeconds),
      frequencyPerDay: Number(customEx.frequencyPerDay),
      instructions: customEx.instructions,
      completedToday: false,
    };
    setPrescribedPlan((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));
    setCustomEx({
      name: '',
      targetArea: 'Quadriceps / Knee Stability',
      sets: 3,
      repetitions: 15,
      holdSeconds: 5,
      frequencyPerDay: 2,
      instructions: '',
    });
  };

  const handleQuickAddPreset = (
    name: string,
    targetArea: string,
    sets: number,
    reps: number,
    hold: number,
    instructions: string
  ) => {
    const newEx: ExerciseItem = {
      id: 'ex-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name,
      targetArea,
      sets,
      repetitions: reps,
      holdSeconds: hold,
      frequencyPerDay: 2,
      instructions,
      completedToday: false,
    };
    setPrescribedPlan((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newEx],
    }));
  };

  const handleRemoveExercise = (exId: string) => {
    setPrescribedPlan((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((e) => e.id !== exId),
    }));
  };

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedPlan: RehabilitationPlan = {
        ...prescribedPlan,
        therapistId: currentUser?.uid || therapistProfile.id,
        therapistName: therapistProfile.fullName,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'rehabilitationPlans', updatedPlan.id), updatedPlan);
      setPrescribedPlan(updatedPlan);
      setPrescribeSuccess(true);
      setTimeout(() => setPrescribeSuccess(false), 2500);
    } catch (err) {
      console.warn('Failed to save prescription to Firestore:', err);
      setPrescribeSuccess(true);
      setTimeout(() => setPrescribeSuccess(false), 2500);
    }
  };

  // Create new assessment
  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAssId = 'assess-' + Date.now();
    const assessmentRecord: ClinicalAssessment = {
      id: newAssId,
      patientId: SAMPLE_PATIENT.uid,
      patientName: newAssessmentData.patientName,
      therapistId: currentUser?.uid || 'pt-ananya-sharma',
      therapistName: userProfile?.fullName || 'Dr. Ananya Sharma, MPT',
      assessmentType: newAssessmentData.assessmentType,
      date: new Date().toISOString().split('T')[0],
      chiefComplaint: newAssessmentData.chiefComplaint,
      historyOfIllness: 'Ongoing supervised post-operative recovery protocol.',
      painLocation: newAssessmentData.painLocation,
      painIntensity: newAssessmentData.painIntensity,
      painCharacter: 'Mild ache on terminal flexion',
      aggravatingFactors: 'Loaded flexion past 100 degrees',
      relievingFactors: 'Brief rest, gentle patellar glides',
      medicalHistory: 'Controlled hypertension',
      functionalLimitations: 'Stair descent slightly guarded',
      patientGoals: 'Return to running drills',
      postureObservation: newAssessmentData.postureObservation,
      rangeOfMotion: [
        { joint: 'Right Knee', movement: 'Flexion', activeRom: newAssessmentData.activeRomFlexion, passiveRom: newAssessmentData.activeRomFlexion + 5, normalRom: 135, unit: 'deg' },
        { joint: 'Right Knee', movement: 'Extension', activeRom: newAssessmentData.activeRomExtension, passiveRom: 0, normalRom: 0, unit: 'deg' },
      ],
      muscleStrength: [
        { muscleGroup: 'Right Quadriceps', side: 'Right', grade: newAssessmentData.quadStrengthGrade },
      ],
      outcomeMeasures: {
        nprsPainScore: newAssessmentData.painIntensity,
        timedUpAndGoSeconds: 9.2,
      },
      clinicalImpression: newAssessmentData.clinicalImpression,
      identifiedImpairments: ['Mild terminal flexion restriction'],
      shortTermGoals: newAssessmentData.shortTermGoals,
      longTermGoals: 'Full athletic return',
      plannedInterventions: ['Patellar mobilizations', 'Balance board reaches'],
      precautions: newAssessmentData.precautions,
      reassessmentSchedule: '4 weeks',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'clinicalAssessments', newAssId), assessmentRecord);
      setAssessments((prev) => [assessmentRecord, ...prev]);
      setNewAssessmentModalOpen(false);
    } catch (err) {
      console.error('Error saving clinical assessment:', err);
    }
  };

  // Create new SOAP note
  const handleCreateSoap = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSessionId = 'session-' + Date.now();
    const sessionRecord: TreatmentSession = {
      id: newSessionId,
      patientId: SAMPLE_PATIENT.uid,
      therapistId: currentUser?.uid || 'pt-ananya-sharma',
      therapistName: userProfile?.fullName || 'Dr. Ananya Sharma, MPT',
      sessionNumber: newSoapData.sessionNumber,
      date: new Date().toISOString().split('T')[0],
      subjective: newSoapData.subjective,
      objective: newSoapData.objective,
      assessment: newSoapData.assessment,
      plan: newSoapData.plan,
      interventions: newSoapData.interventions,
      exercisesPerformed: [],
      painBefore: newSoapData.painBefore,
      painAfter: newSoapData.painAfter,
      patientResponse: 'Tolerated without acute distress',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'treatmentSessions', newSessionId), sessionRecord);
      setTreatmentSessions((prev) => [...prev, sessionRecord]);
      setNewSoapModalOpen(false);
    } catch (err) {
      console.error('Error creating SOAP session:', err);
    }
  };

  // Generate AI Handover Summary via Server API (Google Gemini)
  const generateAiHandover = async () => {
    setGeneratingAi(true);
    try {
      const response = await fetch('/api/ai-handover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: SAMPLE_PATIENT.fullName,
          assessments,
          treatmentSessions,
          progressMeasurements: SAMPLE_PROGRESS_MEASUREMENTS,
          rehabilitationPlans: [SAMPLE_REHAB_PLAN],
          reasonForTransfer: 'Patient relocated to DLF Cyber City; requesting specialist continuation.',
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const generated: AiHandoverSummary = {
          id: 'summary-' + Date.now(),
          patientId: SAMPLE_PATIENT.uid,
          patientName: SAMPLE_PATIENT.fullName,
          sourceTherapistName: 'Dr. Ananya Sharma, MPT',
          newTherapistId: currentUser?.uid || 'pt-rajesh-verma',
          summaryText: resData.data.fullSummaryText || '',
          sections: {
            reasonForRehab: resData.data.reasonForRehab || '',
            clinicalHistory: resData.data.clinicalHistory || '',
            keyFindings: resData.data.keyFindings || '',
            interventionsPerformed: resData.data.interventionsPerformed || '',
            currentProgressAndGoals: resData.data.currentProgressAndGoals || '',
            precautionsAndContraindications: resData.data.precautionsAndContraindications || '',
            missingOrUnclearInfo: resData.data.missingOrUnclearInfo || '',
          },
          sourceRecordCount: resData.sourceRecordCount || {
            assessments: assessments.length,
            sessions: treatmentSessions.length,
            metrics: SAMPLE_PROGRESS_MEASUREMENTS.length,
          },
          isClinicianReviewed: false,
          sourceRecordReferences: [
            'Baseline Assessment: 01 March 2026',
            'SOAP Sessions 1-4: 03-22 March 2026',
            'Progress Tracking ROM flex/ext: 01-22 March 2026',
          ],
          generatedAt: new Date().toISOString(),
        };

        setAiSummary(generated);
      }
    } catch (err) {
      console.error('Error in AI handover generation:', err);
    } finally {
      setGeneratingAi(false);
    }
  };

  // Finalize Handover Review
  const finalizeHandover = async () => {
    if (!aiSummary) return;
    const updated = {
      ...aiSummary,
      isClinicianReviewed: true,
      clinicianNotes: clinicianReviewNotes || 'Handover reviewed. Independent receiving physical examination scheduled.',
    };
    setAiSummary(updated);
    setClinicianReviewed(true);
    try {
      await setDoc(doc(db, 'aiHandoverSummaries', updated.id), updated);
      // Mark transfer accepted
      if (transferRequests.length > 0) {
        await updateDoc(doc(db, 'therapistTransferRequests', transferRequests[0].id), {
          status: 'accepted',
          updatedAt: new Date().toISOString(),
        });
        setTransferRequests((prev) =>
          prev.map((t) => (t.id === transferRequests[0].id ? { ...t, status: 'accepted' } : t))
        );
      }
    } catch (e) {
      console.warn('Error saving finalized summary:', e);
    }
  };

  const pendingAppointments = appointments.filter((a) => a.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Clinician Header Banner (Mobile Optimized) */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-2xl text-white shrink-0">
              <Stethoscope className="w-7 h-7 sm:w-8 sm:h-8 text-teal-300" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{therapistProfile.fullName}</h1>
                
                {/* PRACTITIONER LEVEL BADGE */}
                {therapistProfile.practitionerLevel === 'experienced' ? (
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-emerald-400/25 text-emerald-200 border border-emerald-300/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Experienced Practitioner ({therapistProfile.experienceYears}+ Yrs)</span>
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-teal-400/25 text-teal-200 border border-teal-300/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-teal-300" />
                    <span>Fresher Graduate Practitioner</span>
                  </span>
                )}

                <span className="text-[10px] font-bold bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-teal-300" /> Verified
                </span>
              </div>

              <p className="text-xs text-teal-100 font-medium">
                {therapistProfile.qualification}
              </p>
              
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300 pt-0.5">
                <span>Council Reg: <strong className="text-white">{therapistProfile.registrationNumber || 'DCPTOT/2016/5412'}</strong></span>
                <span>•</span>
                <span>Hub: <strong className="text-white">{therapistProfile.clinicAddress || 'PhysioGo Care Center'}</strong></span>
                {therapistProfile.practitionerLevel === 'fresher' && therapistProfile.supervisingTherapist && (
                  <>
                    <span>•</span>
                    <span className="text-teal-300 font-semibold">Supervised by: {therapistProfile.supervisingTherapist}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Demo Switcher */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
            {/* Quick Demo Toggle for Hackathon Evaluator */}
            <div className="flex items-center gap-1 bg-black/30 p-1 rounded-2xl border border-white/10 text-[11px] font-bold w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-[10px] text-slate-400 px-2 hidden sm:inline">View Mode:</span>
              <button
                type="button"
                onClick={() => handleSwitchLevel('experienced')}
                className={`px-2.5 py-1 rounded-xl transition-all ${
                  therapistProfile.practitionerLevel === 'experienced'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                🎓 Experienced PT
              </button>
              <button
                type="button"
                onClick={() => handleSwitchLevel('fresher')}
                className={`px-2.5 py-1 rounded-xl transition-all ${
                  therapistProfile.practitionerLevel === 'fresher'
                    ? 'bg-teal-400 text-slate-950 font-black shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                🌱 Fresher PT
              </button>
            </div>

            <button
              onClick={() => {
                setActiveTab('transfers');
                generateAiHandover();
              }}
              className="bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Handover Tool</span>
            </button>
            <button
              onClick={() => setNewSoapModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-3.5 py-2 rounded-xl text-xs border border-white/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New SOAP Note</span>
            </button>
          </div>
        </div>

        {/* Certificate & CV Quick Bar in Header */}
        <div className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-300 text-[11px]">Credentials on Record:</span>
            
            {/* Certificate Pill */}
            <button
              type="button"
              onClick={() => setCertificateModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-teal-200 hover:text-white px-3 py-1 rounded-xl border border-white/20 flex items-center gap-1.5 text-[11px] font-semibold transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-teal-300" />
              <span className="truncate max-w-[200px] sm:max-w-none">
                {therapistProfile.practitionerLevel === 'experienced'
                  ? 'Council License Certificate (Verified)'
                  : 'Provisional Degree Certificate (Verified)'}
              </span>
            </button>

            {/* CV Pill */}
            <button
              type="button"
              onClick={() => setCvModalOpen(true)}
              className="bg-teal-500/20 hover:bg-teal-500/30 text-teal-100 hover:text-white px-3 py-1 rounded-xl border border-teal-400/30 flex items-center gap-1.5 text-[11px] font-bold transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-teal-300" />
              <span className="truncate max-w-[180px] sm:max-w-none">
                CV on File: {therapistProfile.cvFileName || 'Physiotherapist_CV.pdf'}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setUpdateCvModalOpen(true)}
            className="text-[11px] font-bold text-teal-300 hover:text-teal-200 flex items-center gap-1 hover:underline ml-auto sm:ml-0"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Add / Update CV & Credentials</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-1 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs font-semibold scrollbar-none">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-2 px-3.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`py-2 px-3.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'appointments' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Appointments ({appointments.length})</span>
          {pendingAppointments.length > 0 && (
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('patients')}
          className={`py-2 px-3.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'patients' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>My Patients</span>
        </button>

        <button
          onClick={() => setActiveTab('assessments')}
          className={`py-2 px-3.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'assessments' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Clinical Assessments</span>
        </button>

        <button
          onClick={() => setActiveTab('soap_sessions')}
          className={`py-2 px-3.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'soap_sessions' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>SOAP Session Notes</span>
        </button>

        <button
          onClick={() => setActiveTab('prescribe_exercises')}
          className={`py-2 px-3.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'prescribe_exercises' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Prescribe Home Exercises</span>
        </button>

        <button
          onClick={() => setActiveTab('transfers')}
          className={`py-2 px-3.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'transfers' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Smart Handover & Transfer Requests</span>
        </button>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Today's Appointments</span>
              <p className="text-3xl font-black text-slate-900">2 Sessions</p>
              <p className="text-[11px] text-teal-700 font-semibold">1 Clinic, 1 Home Visit</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Pending Bookings</span>
              <p className="text-3xl font-black text-amber-600">{pendingAppointments.length} Requests</p>
              <p className="text-[11px] text-slate-500">Action required</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Active Patients</span>
              <p className="text-3xl font-black text-slate-900">14 Active</p>
              <p className="text-[11px] text-slate-500">ACL, Stroke, Cervical Rehab</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Documentation Up-to-date</span>
              <p className="text-3xl font-black text-emerald-600">100%</p>
              <p className="text-[11px] text-slate-500">All SOAP sessions finalized</p>
            </div>
          </div>

          {/* PROFESSIONAL CREDENTIALS, CERTIFICATE & CV CARD */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Professional Practitioner Profile & Attached CV
                  </h3>
                  <p className="text-xs text-slate-500">
                    {therapistProfile.practitionerLevel === 'experienced'
                      ? 'Registered Experienced Physiotherapist • Full Clinical Practice & Council License'
                      : 'Fresher Graduate Physiotherapist • Supervised Mentorship & Provisional Degree'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCvModalOpen(true)}
                  className="bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold px-3 py-2 rounded-xl text-xs border border-teal-200 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>View Full CV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUpdateCvModalOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <UploadCloud className="w-4 h-4 text-teal-400" />
                  <span>Update CV / Credentials</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Box 1: Practitioner Status */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-500">Practitioner Category</span>
                  {therapistProfile.practitionerLevel === 'experienced' ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full">
                      EXPERIENCED
                    </span>
                  ) : (
                    <span className="text-[10px] bg-teal-100 text-teal-800 font-black px-2 py-0.5 rounded-full">
                      FRESHER GRADUATE
                    </span>
                  )}
                </div>
                <p className="font-black text-sm text-slate-900">{therapistProfile.qualification}</p>
                <p className="text-xs text-slate-600">
                  {therapistProfile.college} ({therapistProfile.graduationYear})
                </p>
                <p className="text-[11px] text-teal-700 font-semibold pt-1">
                  {therapistProfile.practitionerLevel === 'experienced'
                    ? `${therapistProfile.experienceYears} Years Clinical Practice`
                    : `Practicing under: ${therapistProfile.supervisingTherapist || 'Senior Hospital Clinician'}`}
                </p>
              </div>

              {/* Box 2: Certificate Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-500">Practice Certificate</span>
                  <button
                    type="button"
                    onClick={() => setCertificateModalOpen(true)}
                    className="text-[11px] text-teal-700 hover:text-teal-900 font-bold underline"
                  >
                    View Doc
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{therapistProfile.certificateName || 'Council Registration Certificate.pdf'}</span>
                </div>
                <p className="text-xs text-slate-600">
                  Registration: <strong className="text-slate-800">{therapistProfile.registrationNumber || 'DCPTOT/2016/5412'}</strong>
                </p>
                <p className="text-[11px] text-slate-500">
                  Authority: {therapistProfile.registrationAuthority || 'State Council for Physiotherapy'}
                </p>
              </div>

              {/* Box 3: CV File & Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-500">Curriculum Vitae (CV)</span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                    ATTACHED
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="truncate">{therapistProfile.cvFileName || 'Physiotherapist_Resume.pdf'}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {therapistProfile.cvSummary || 'Comprehensive clinical physiotherapy CV with orthopedics and neurology rotations.'}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Appointment Requests */}
          {pendingAppointments.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-base text-slate-900">Pending Booking Requests</h3>
                </div>
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  Needs Decision
                </span>
              </div>

              <div className="space-y-3">
                {pendingAppointments.map((appt) => (
                  <div key={appt.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{appt.patientName}</span>
                        <span className="text-slate-500">• {appt.patientPhone}</span>
                        <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                          {appt.consultationType}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        Date: <strong>{appt.date}</strong> at <strong>{appt.timeSlot}</strong> • Fee: ₹{appt.fee}
                      </p>
                      <p className="text-slate-500">Complaint: {appt.chiefComplaint}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => updateAppointmentStatus(appt.id, 'confirmed')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept & Confirm</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApptForDecline(appt);
                          setDeclineReasonModalOpen(true);
                        }}
                        className="bg-white hover:bg-slate-100 border border-slate-300 text-rose-700 font-bold px-3 py-2 rounded-xl text-xs transition-colors flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-black text-slate-900">Appointment Management</h2>
            <div className="space-y-3">
              {appointments.map((appt) => (
                <div key={appt.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{appt.patientName}</h4>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : appt.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {appt.status}
                      </span>
                      <span className="text-slate-500">• {appt.consultationType}</span>
                    </div>
                    <p className="text-slate-600">
                      {appt.date} • {appt.timeSlot} • Fee: ₹{appt.fee}
                    </p>
                    <p className="text-slate-500">Complaint: {appt.chiefComplaint}</p>
                    {appt.declineReason && (
                      <p className="text-rose-600 font-medium">Decline reason: {appt.declineReason}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {appt.status === 'confirmed' && (
                      <button
                        onClick={() => updateAppointmentStatus(appt.id, 'completed')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MY PATIENTS */}
      {activeTab === 'patients' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-black text-slate-900">Patient Roster & Care Status</h2>
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    VM
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{SAMPLE_PATIENT.fullName}</h4>
                    <p className="text-slate-500">Age: 42 • Male • Gurugram</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                  Phase II Post-Op
                </span>
              </div>
              <p className="text-slate-700">
                <strong>Diagnosis:</strong> {SAMPLE_PATIENT.primaryDiagnosis}
              </p>
              <div className="flex gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setActiveTab('assessments')}
                  className="bg-white border border-slate-300 hover:bg-slate-50 font-bold px-3 py-1.5 rounded-lg text-xs text-slate-800"
                >
                  View Clinical Assessment
                </button>
                <button
                  onClick={() => setActiveTab('soap_sessions')}
                  className="bg-white border border-slate-300 hover:bg-slate-50 font-bold px-3 py-1.5 rounded-lg text-xs text-slate-800"
                >
                  View 4 SOAP Sessions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CLINICAL ASSESSMENTS */}
      {activeTab === 'assessments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900">Structured Physiotherapy Assessments</h2>
                <p className="text-xs text-slate-600">
                  Comprehensive subjective, objective, ROM, muscle strength, and outcome measure records
                </p>
              </div>
              <button
                onClick={() => setNewAssessmentModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Assessment / Reassessment</span>
              </button>
            </div>

            <div className="space-y-4">
              {assessments.map((ass) => (
                <div key={ass.id} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-sm text-slate-900">{ass.patientName}</span>
                      <span className="text-slate-500 text-[11px] ml-2">• Assessment Date: {ass.date}</span>
                      <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded ml-2">
                        {ass.assessmentType}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[11px]">Author: {ass.therapistName}</span>
                  </div>

                  <p><strong>Chief Complaint:</strong> {ass.chiefComplaint}</p>
                  <p><strong>Clinical Impression:</strong> {ass.clinicalImpression}</p>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <strong>Range of Motion:</strong>
                      {ass.rangeOfMotion.map((r, i) => (
                        <p key={i} className="text-slate-600 text-[11px]">
                          {r.joint} {r.movement}: Active {r.activeRom}° / Passive {r.passiveRom}°
                        </p>
                      ))}
                    </div>
                    <div>
                      <strong>Strength & Outcome Measures:</strong>
                      <p className="text-slate-600 text-[11px]">Pain (NPRS): {ass.painIntensity}/10</p>
                      <p className="text-slate-600 text-[11px]">TUG Score: {ass.outcomeMeasures.timedUpAndGoSeconds || 9.2}s</p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl">
                    <strong>Precautions:</strong> {ass.precautions}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SOAP SESSION NOTES */}
      {activeTab === 'soap_sessions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900">Treatment Session Notes (SOAP Format)</h2>
                <p className="text-xs text-slate-600">
                  Chronological records preserving author identity, timestamps, and auditable history
                </p>
              </div>
              <button
                onClick={() => setNewSoapModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Document New Session</span>
              </button>
            </div>

            <div className="space-y-3">
              {treatmentSessions.map((session) => (
                <div key={session.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-sm text-slate-900">
                      Session #{session.sessionNumber} — {session.date}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Pain: {session.painBefore}/10 → {session.painAfter}/10
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <strong className="text-blue-700 block text-[11px]">Subjective</strong>
                      <p className="text-slate-700">{session.subjective}</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <strong className="text-teal-700 block text-[11px]">Objective</strong>
                      <p className="text-slate-700">{session.objective}</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <strong className="text-indigo-700 block text-[11px]">Assessment</strong>
                      <p className="text-slate-700">{session.assessment}</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <strong className="text-purple-700 block text-[11px]">Plan</strong>
                      <p className="text-slate-700">{session.plan}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: PRESCRIBE HOME EXERCISES (HEP)                            */}
      {/* ============================================================== */}
      {activeTab === 'prescribe_exercises' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                  <Dumbbell className="w-4 h-4 text-emerald-600" />
                  Clinical Protocol Management
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Prescribe Home Exercise Program (HEP)
                </h2>
                <p className="text-xs text-slate-600">
                  Create, customize, and issue verified home exercise routines directly to your patient's portal.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 hidden sm:inline">Active Patient:</span>
                <span className="text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  Vikram Malhotra (ACL Post-Op)
                </span>
              </div>
            </div>

            {/* Success notification */}
            {prescribeSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-semibold animate-in fade-in">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Prescription updated and published to patient Vikram Malhotra's Home Exercise portal!
                </span>
              </div>
            )}

            {/* Plan Configuration Form */}
            <form onSubmit={handleSavePrescription} className="space-y-6">
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Prescription Parameters & Diagnosis
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Program Title</label>
                    <input
                      type="text"
                      value={prescribedPlan.title}
                      onChange={(e) => setPrescribedPlan({ ...prescribedPlan, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Target Condition / Joint</label>
                    <input
                      type="text"
                      value={prescribedPlan.targetCondition}
                      onChange={(e) => setPrescribedPlan({ ...prescribedPlan, targetCondition: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Daily Schedule & Frequency</label>
                    <input
                      type="text"
                      value={prescribedPlan.frequency}
                      onChange={(e) => setPrescribedPlan({ ...prescribedPlan, frequency: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Duration (Weeks)</label>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={prescribedPlan.durationWeeks}
                      onChange={(e) => setPrescribedPlan({ ...prescribedPlan, durationWeeks: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block text-slate-700 font-bold mb-1">
                    Mandatory Safety Precautions & Contraindications
                  </label>
                  <textarea
                    rows={2}
                    value={prescribedPlan.precautions}
                    onChange={(e) => setPrescribedPlan({ ...prescribedPlan, precautions: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </div>

              {/* Quick Add Exercise Library */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800">
                    Quick-Add from Clinical Exercise Library:
                  </h4>
                  <span className="text-[11px] text-slate-500">Click to append to routine</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickAddPreset(
                        'Isometric Quadriceps Setting',
                        'Quadriceps (VMO)',
                        3,
                        15,
                        6,
                        'Contract quad firmly against rolled towel under knee. Hold 6s and relax smoothly.'
                      )
                    }
                    className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Isometric Quad Sets
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickAddPreset(
                        'Terminal Knee Extension with Band',
                        'Knee Extension Lock',
                        3,
                        15,
                        3,
                        'Anchor loop band to table leg. Straighten knee against resistance until full lockout.'
                      )
                    }
                    className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Terminal Knee Extension (TKE)
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickAddPreset(
                        'Mini Wall Squats with Gym Ball',
                        'Quadriceps & Gluteals',
                        2,
                        10,
                        5,
                        'Place swiss ball behind lower back. Squat to 45 deg knee flexion, push up through heels.'
                      )
                    }
                    className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Wall Squats (Ball)
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickAddPreset(
                        'Heel Slides with Towel Assist',
                        'Hamstring Flexion & Joint Range',
                        3,
                        12,
                        4,
                        'Loop towel under foot, slide heel toward buttocks smoothly. Hold end range without jerking.'
                      )
                    }
                    className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Heel Slides
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickAddPreset(
                        'Patellar Superior & Inferior Mobilizations',
                        'Patellofemoral Joint',
                        2,
                        20,
                        2,
                        'With relaxed knee, use thumbs to gently translate patella superiorly and inferiorly.'
                      )
                    }
                    className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Patellar Mobilizations
                  </button>
                </div>
              </div>

              {/* Prescribed Exercises in Plan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">
                    Currently Prescribed Exercises ({prescribedPlan.exercises.length})
                  </h4>
                  <span className="text-xs text-slate-500">Patient sees these directly in their portal</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {prescribedPlan.exercises.map((ex, idx) => (
                    <div
                      key={ex.id}
                      className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            #{idx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            {ex.targetArea}
                          </span>
                          <h5 className="font-bold text-sm text-slate-900">{ex.name}</h5>
                        </div>
                        <p className="text-xs text-slate-600">{ex.instructions}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-3 pt-0.5 font-medium">
                          <span>Sets: <strong className="text-slate-800">{ex.sets}</strong></span>
                          <span>•</span>
                          <span>Reps: <strong className="text-slate-800">{ex.repetitions}</strong></span>
                          <span>•</span>
                          <span>Hold: <strong className="text-slate-800">{ex.holdSeconds}s</strong></span>
                          <span>•</span>
                          <span>Frequency: <strong className="text-slate-800">{ex.frequencyPerDay || 2}x / day</strong></span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(ex.id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-xl transition-colors self-end sm:self-center"
                        title="Remove from prescription"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Custom Exercise to Prescription */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  Add Custom Exercise to Prescription
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">Exercise Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Straight Leg Raise with Ankle Weight"
                      value={customEx.name}
                      onChange={(e) => setCustomEx({ ...customEx, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">Target Joint / Muscle</label>
                    <input
                      type="text"
                      placeholder="e.g., Hip Flexors / Quadriceps"
                      value={customEx.targetArea}
                      onChange={(e) => setCustomEx({ ...customEx, targetArea: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Sets</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={customEx.sets}
                      onChange={(e) => setCustomEx({ ...customEx, sets: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Reps</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={customEx.repetitions}
                      onChange={(e) => setCustomEx({ ...customEx, repetitions: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Hold (Seconds)</label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={customEx.holdSeconds}
                      onChange={(e) => setCustomEx({ ...customEx, holdSeconds: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Frequency (Daily)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={customEx.frequencyPerDay}
                      onChange={(e) => setCustomEx({ ...customEx, frequencyPerDay: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-2 md:col-span-4">
                    <label className="block text-slate-600 font-semibold mb-1">Clinical Instructions & Form Cues</label>
                    <input
                      type="text"
                      placeholder="e.g., Keep knee straight without bending. Lift heel 6 inches off ground. Do not arch back."
                      value={customEx.instructions}
                      onChange={(e) => setCustomEx({ ...customEx, instructions: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomExercise}
                  disabled={!customEx.name || !customEx.instructions}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Exercise to List</span>
                </button>
              </div>

              {/* Submit & Publish Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Submitting will officially stamp this Home Exercise Program with your registered clinician signature.
                </p>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save & Publish Home Exercise Prescription</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: SMART HANDOVER & TRANSFERS (CORE INNOVATION) */}
      {activeTab === 'transfers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Continuity of Care System
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  Smart Therapist Handover & Patient Transfer Tool
                </h2>
                <p className="text-xs text-slate-600">
                  Receiving clinician review of authorized Rehabilitation Passports with Gemini AI assistance
                </p>
              </div>

              <button
                onClick={generateAiHandover}
                disabled={generatingAi}
                className="bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-teal-200" />
                <span>{generatingAi ? 'Generating Synthesis...' : 'Generate AI Handover Summary'}</span>
              </button>
            </div>

            {/* Active Transfer Request Card */}
            {transferRequests.length > 0 && (
              <div className="p-5 bg-teal-50/80 border border-teal-200 rounded-2xl space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-sm text-slate-900">
                    Incoming Transfer Request for {transferRequests[0].patientName}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-200 text-teal-900">
                    Status: {transferRequests[0].status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-teal-100">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Transferring Clinician:</span>
                    <strong className="text-slate-900">{transferRequests[0].previousTherapistName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Reason for Handover:</span>
                    <strong className="text-teal-800">{transferRequests[0].reasonDetails}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-[11px]">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    Patient consent confirmed at {new Date(transferRequests[0].consentTimestamp).toLocaleString()}. Scope: Full Assessments, SOAP Notes, and Progress Curves.
                  </span>
                </div>
              </div>
            )}

            {/* AI Generated Clinical Handover Summary */}
            {aiSummary ? (
              <div className="p-6 bg-slate-900 text-slate-100 rounded-3xl shadow-xl space-y-5 border border-slate-800 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">AI-Assisted Handover Continuity Summary</h3>
                      <p className="text-[11px] text-teal-300 font-medium">
                        Patient: {aiSummary.patientName} • Generated via Google Gemini Server Proxy
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-900/80 text-teal-300 border border-teal-700 px-2 py-0.5 rounded">
                    Clinical Decision Support
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <strong className="text-teal-300 font-bold block">1. Reason for Rehabilitation:</strong>
                    <p className="text-slate-300">{aiSummary.sections.reasonForRehab}</p>
                  </div>
                  <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <strong className="text-teal-300 font-bold block">2. Documented Clinical History:</strong>
                    <p className="text-slate-300">{aiSummary.sections.clinicalHistory}</p>
                  </div>
                  <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <strong className="text-teal-300 font-bold block">3. Key Objective Findings:</strong>
                    <p className="text-slate-300">{aiSummary.sections.keyFindings}</p>
                  </div>
                  <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <strong className="text-teal-300 font-bold block">4. Prior Interventions Performed:</strong>
                    <p className="text-slate-300">{aiSummary.sections.interventionsPerformed}</p>
                  </div>
                  <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <strong className="text-teal-300 font-bold block">5. Current Progress & Goals:</strong>
                    <p className="text-slate-300">{aiSummary.sections.currentProgressAndGoals}</p>
                  </div>
                  <div className="p-3.5 bg-amber-950/60 rounded-xl border border-amber-800/60 space-y-1">
                    <strong className="text-amber-300 font-bold block flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> 6. Documented Precautions & Warnings:
                    </strong>
                    <p className="text-amber-200">{aiSummary.sections.precautionsAndContraindications}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-xs space-y-1">
                  <strong className="text-slate-300">7. Identified Missing / Pending Clinical Information:</strong>
                  <p className="text-slate-400">{aiSummary.sections.missingOrUnclearInfo}</p>
                </div>

                {/* Clinician Review & Verification Section */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">
                    Receiving Physiotherapist Review Notes & Clinical Plan:
                  </label>
                  <textarea
                    rows={2}
                    value={clinicianReviewNotes}
                    onChange={(e) => setClinicianReviewNotes(e.target.value)}
                    placeholder="Enter your clinical confirmation notes before taking over patient care..."
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={clinicianReviewed}
                        onChange={(e) => setClinicianReviewed(e.target.checked)}
                        className="rounded text-teal-500 focus:ring-teal-400"
                      />
                      <span>I have reviewed previous clinical records and agree to conduct an independent receiving assessment.</span>
                    </label>

                    <button
                      onClick={finalizeHandover}
                      disabled={!clinicianReviewed}
                      className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-md disabled:opacity-50"
                    >
                      Finalize Handover & Accept Care
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-3">
                <p>Click "Generate AI Handover Summary" to analyze Vikram Malhotra's records.</p>
                <button
                  onClick={generateAiHandover}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Generate Handover Summary Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEW ASSESSMENT MODAL */}
      {newAssessmentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-slate-100 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">New Structured Clinical Assessment</h3>
              <button onClick={() => setNewAssessmentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chief Complaint</label>
                <input
                  type="text"
                  required
                  value={newAssessmentData.chiefComplaint}
                  onChange={(e) => setNewAssessmentData({ ...newAssessmentData, chiefComplaint: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pain (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={newAssessmentData.painIntensity}
                    onChange={(e) => setNewAssessmentData({ ...newAssessmentData, painIntensity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Flexion ROM (°)</label>
                  <input
                    type="number"
                    value={newAssessmentData.activeRomFlexion}
                    onChange={(e) => setNewAssessmentData({ ...newAssessmentData, activeRomFlexion: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quad Strength</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="5"
                    value={newAssessmentData.quadStrengthGrade}
                    onChange={(e) => setNewAssessmentData({ ...newAssessmentData, quadStrengthGrade: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Impression</label>
                <textarea
                  rows={2}
                  required
                  value={newAssessmentData.clinicalImpression}
                  onChange={(e) => setNewAssessmentData({ ...newAssessmentData, clinicalImpression: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Precautions</label>
                <input
                  type="text"
                  value={newAssessmentData.precautions}
                  onChange={(e) => setNewAssessmentData({ ...newAssessmentData, precautions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-colors"
              >
                Save Final Assessment to Passport
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NEW SOAP NOTE MODAL */}
      {newSoapModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-slate-100 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Document Treatment Session (SOAP)</h3>
              <button onClick={() => setNewSoapModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSoap} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subjective (S)</label>
                <textarea
                  rows={2}
                  value={newSoapData.subjective}
                  onChange={(e) => setNewSoapData({ ...newSoapData, subjective: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Objective (O)</label>
                <textarea
                  rows={2}
                  value={newSoapData.objective}
                  onChange={(e) => setNewSoapData({ ...newSoapData, objective: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assessment (A)</label>
                <textarea
                  rows={2}
                  value={newSoapData.assessment}
                  onChange={(e) => setNewSoapData({ ...newSoapData, assessment: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Plan (P)</label>
                <textarea
                  rows={2}
                  value={newSoapData.plan}
                  onChange={(e) => setNewSoapData({ ...newSoapData, plan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pain Before (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={newSoapData.painBefore}
                    onChange={(e) => setNewSoapData({ ...newSoapData, painBefore: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pain After (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={newSoapData.painAfter}
                    onChange={(e) => setNewSoapData({ ...newSoapData, painAfter: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-colors"
              >
                Save SOAP Note to Patient Passport
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DECLINE APPOINTMENT MODAL */}
      {declineReasonModalOpen && selectedApptForDecline && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 space-y-4 text-xs">
            <h3 className="font-bold text-base text-slate-900">Decline Appointment Request</h3>
            <p className="text-slate-600">Please provide a reason to help the patient find an alternative clinician:</p>

            <select
              value={declineReasonText}
              onChange={(e) => setDeclineReasonText(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
            >
              <option value="Outside service area">Outside service area</option>
              <option value="Scheduling conflict">Scheduling conflict</option>
              <option value="Outside area of clinical practice">Outside area of clinical practice</option>
              <option value="Unavailable for selected date">Unavailable for selected date</option>
            </select>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeclineReasonModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateAppointmentStatus(selectedApptForDecline.id, 'declined', declineReasonText);
                  setDeclineReasonModalOpen(false);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: VIEW CURRICULUM VITAE (CV)                            */}
      {/* ============================================================== */}
      {cvModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-100 p-5 sm:p-7 space-y-5 animate-in fade-in zoom-in-95">
            {/* CV Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black text-slate-900">{therapistProfile.fullName}</span>
                  {therapistProfile.practitionerLevel === 'experienced' ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      EXPERIENCED
                    </span>
                  ) : (
                    <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                      FRESHER GRADUATE
                    </span>
                  )}
                </div>
                <p className="text-xs text-teal-700 font-bold">{therapistProfile.qualification}</p>
                <p className="text-[11px] text-slate-500">
                  {therapistProfile.email} • {therapistProfile.phone || '+91 98765 43210'} • {therapistProfile.clinicAddress || 'PhysioGo Care Center'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCvModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document badge */}
            <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-200/80 flex items-center justify-between text-xs text-teal-900">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>
                  Attached File: <strong>{therapistProfile.cvFileName || 'Physiotherapist_Resume.pdf'}</strong> (245 KB • Verified)
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase bg-teal-200/60 text-teal-900 px-2 py-0.5 rounded-md">
                Active Profile CV
              </span>
            </div>

            {/* CV Body Sections */}
            <div className="space-y-4 text-xs">
              {/* Executive Summary */}
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500">
                  Clinical Summary & Professional Focus
                </h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {therapistProfile.cvSummary || therapistProfile.bio || 'Dedicated physiotherapist committed to evidence-based musculoskeletal assessment, patient-controlled rehabilitation continuity, and structured recovery plans.'}
                </p>
              </div>

              {/* Education & Council Registration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-teal-600" />
                    <span>Academic Qualification</span>
                  </h4>
                  <p className="font-bold text-slate-800">{therapistProfile.qualification}</p>
                  <p className="text-slate-600">{therapistProfile.college}</p>
                  <p className="text-[11px] text-slate-400">Class of {therapistProfile.graduationYear}</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-teal-600" />
                    <span>Council Registration</span>
                  </h4>
                  <p className="font-bold text-slate-800">{therapistProfile.registrationNumber || 'DCPTOT/2016/5412'}</p>
                  <p className="text-slate-600">{therapistProfile.registrationAuthority || 'State Council for Physiotherapy'}</p>
                  <p className="text-[11px] text-emerald-600 font-bold">Verified Practitioner License</p>
                </div>
              </div>

              {/* Mentorship or Clinical Experience */}
              <div className="p-3.5 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500">
                  {therapistProfile.practitionerLevel === 'fresher'
                    ? 'Clinical Internship & Supervised Mentorship'
                    : 'Clinical Rotations & Specialization History'}
                </h4>
                {therapistProfile.practitionerLevel === 'fresher' ? (
                  <div className="space-y-1.5">
                    <p className="text-slate-700">
                      <strong>Senior Supervising Clinician:</strong> {therapistProfile.supervisingTherapist || 'Dr. Ananya Sharma, MPT (Safdarjung Hospital)'}
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      • 6-Month Compulsory Rotatory Internship: Orthopedic OPD, Spine Rehabilitation, Neuro ICU, and Sports Injury Wing.
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      • Supervised protocol delivery for post-op ACL reconstruction, cervical spondylosis, and stroke gait retraining.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-slate-700">
                      <strong>Senior Practice:</strong> {therapistProfile.experienceYears} Years clinical experience across hospital departments and dedicated outpatient rehabilitation centers.
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      • Lead consultant for postoperative knee & hip arthroplasty protocols and athletic return-to-sport testing.
                    </p>
                  </div>
                )}
              </div>

              {/* Specializations & Skills */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500 mb-1.5">
                  Core Clinical Specializations
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(therapistProfile.specializations || ['Orthopedics', 'Sports Rehab', 'Post-Op Knee']).map((spec, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium text-xs">
                      {spec}
                    </span>
                  ))}
                  {(therapistProfile.additionalQualifications || ['Dry Needling', 'Kinesiology Taping']).map((q, i) => (
                    <span key={i} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-medium text-xs">
                      ✓ {q}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  alert(`Downloading verified copy of ${therapistProfile.cvFileName || 'CV.pdf'}`);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download CV PDF</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCvModalOpen(false);
                    setUpdateCvModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Update / Replace CV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCvModalOpen(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: ADD / UPDATE CV & CREDENTIALS                         */}
      {/* ============================================================== */}
      {updateCvModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-slate-100 p-5 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Add / Update Curriculum Vitae (CV)</h3>
                  <p className="text-[11px] text-slate-500">Update professional details and attached credentials</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUpdateCvModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cvUpdateSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your CV & practitioner credentials have been saved to Cloud Firestore!</span>
              </div>
            )}

            <form onSubmit={handleSaveCv} className="space-y-3.5">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Practitioner Level Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCvFormData({ ...cvFormData, practitionerLevel: 'experienced' })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      cvFormData.practitionerLevel === 'experienced'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs font-bold">🎓 Experienced Therapist</span>
                    <span className="block text-[10px] text-slate-500 font-normal">2+ years clinical license</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCvFormData({ ...cvFormData, practitionerLevel: 'fresher' })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      cvFormData.practitionerLevel === 'fresher'
                        ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold ring-1 ring-teal-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs font-bold">🌱 Fresher Graduate</span>
                    <span className="block text-[10px] text-slate-500 font-normal">Supervised mentorship</span>
                  </button>
                </div>
              </div>

              {/* CV Document File Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Curriculum Vitae (CV) Document File Name
                </label>
                <input
                  type="text"
                  required
                  value={cvFormData.cvFileName}
                  onChange={(e) => setCvFormData({ ...cvFormData, cvFileName: e.target.value })}
                  placeholder="e.g. Dr_Sneha_Kulkarni_CV_2026.pdf"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs bg-slate-50 focus:bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Attached to your clinician portal and visible during transfer handovers.
                </p>
              </div>

              {/* CV Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  CV Summary & Clinical Objectives
                </label>
                <textarea
                  rows={3}
                  required
                  value={cvFormData.cvSummary}
                  onChange={(e) => setCvFormData({ ...cvFormData, cvSummary: e.target.value })}
                  placeholder="Brief overview of clinical focus, patient management philosophy..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              {/* Practice Certificate Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Practice Certificate / Degree Document
                </label>
                <input
                  type="text"
                  value={cvFormData.certificateName}
                  onChange={(e) => setCvFormData({ ...cvFormData, certificateName: e.target.value })}
                  placeholder="e.g. State_Council_License_Certificate.pdf"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Mentorship if Fresher */}
              {cvFormData.practitionerLevel === 'fresher' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Senior Supervising Clinician / Hospital
                  </label>
                  <input
                    type="text"
                    value={cvFormData.supervisingTherapist}
                    onChange={(e) => setCvFormData({ ...cvFormData, supervisingTherapist: e.target.value })}
                    placeholder="e.g. Dr. Ananya Sharma, MPT / Safdarjung Hospital"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Graduation College</label>
                  <input
                    type="text"
                    value={cvFormData.college}
                    onChange={(e) => setCvFormData({ ...cvFormData, college: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {cvFormData.practitionerLevel === 'experienced' ? 'Experience (Years)' : 'Graduation Year'}
                  </label>
                  <input
                    type="number"
                    value={cvFormData.practitionerLevel === 'experienced' ? cvFormData.experienceYears : cvFormData.graduationYear}
                    onChange={(e) => {
                      if (cvFormData.practitionerLevel === 'experienced') {
                        setCvFormData({ ...cvFormData, experienceYears: Number(e.target.value) });
                      } else {
                        setCvFormData({ ...cvFormData, graduationYear: Number(e.target.value) });
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUpdateCvModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/20"
                >
                  Save CV to Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: VIEW CERTIFICATE                                      */}
      {/* ============================================================== */}
      {certificateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-slate-100 p-6 space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-base text-slate-900">Official Practice Certificate</h3>
              </div>
              <button
                type="button"
                onClick={() => setCertificateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Preview Frame */}
            <div className="p-6 rounded-2xl bg-amber-50/40 border-2 border-dashed border-amber-300 space-y-4 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 text-amber-800 font-black text-lg">
                ★
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-slate-900 uppercase tracking-widest">
                  {therapistProfile.registrationAuthority || 'Council for Physiotherapy'}
                </h4>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">
                  Official Verification & Licensure Certificate
                </p>
              </div>

              <div className="py-2 border-y border-amber-200/80 space-y-1">
                <p className="text-[11px] text-slate-600">This certifies that</p>
                <p className="text-base font-black text-slate-900 font-serif">{therapistProfile.fullName}</p>
                <p className="text-xs text-slate-700">
                  has duly satisfied council requirements as an{' '}
                  <strong className="text-teal-800">
                    {therapistProfile.practitionerLevel === 'experienced'
                      ? 'Experienced Licensed Physiotherapist'
                      : 'Fresher Graduate Physiotherapist'}
                  </strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left bg-white p-3 rounded-xl border border-amber-100 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Registration Number:</span>
                  <strong className="text-slate-900">{therapistProfile.registrationNumber || 'DCPTOT/2016/5412'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Document Name:</span>
                  <strong className="text-slate-900 truncate block">
                    {therapistProfile.certificateName || 'License_Certificate.pdf'}
                  </strong>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>STATE COUNCIL VERIFIED & VALIDATED</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCertificateModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold"
            >
              Close Certificate Viewer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
