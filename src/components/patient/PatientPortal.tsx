import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  FileText,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  TrendingUp,
  Dumbbell,
  Users,
  ShoppingBag,
  AlertCircle,
  ArrowRightLeft,
  CheckCircle,
  Download,
  ChevronRight,
  Plus,
  AlertTriangle,
  QrCode,
  X,
  Phone,
  MapPin,
  Printer,
  Sparkles,
  Edit3,
} from 'lucide-react';
import {
  Appointment,
  ClinicalAssessment,
  TreatmentSession,
  RehabilitationPlan,
  ProgressMeasurement,
  TherapistTransferRequest,
  RecordAccessGrant,
  CommunityPost,
  Complaint,
  Physiotherapist,
} from '../../types';
import {
  SAMPLE_ASSESSMENT,
  SAMPLE_TREATMENT_SESSIONS,
  SAMPLE_PROGRESS_MEASUREMENTS,
  SAMPLE_REHAB_PLAN,
  INITIAL_PHYSIOTHERAPISTS,
  SAMPLE_COMMUNITY_POSTS,
} from '../../data/seedData';
import { db, collection, getDocs, doc, setDoc, updateDoc } from '../../lib/firebase';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface PatientPortalProps {
  initialTab?: string;
  onOpenTransferWizard?: () => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  initialTab = 'dashboard',
  onOpenTransferWizard,
}) => {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  // Map old 'passport' tab value if passed to 'patient_data'
  const resolvedInitialTab = initialTab === 'passport' ? 'patient_data' : initialTab;
  const [activeTab, setActiveTab] = useState(resolvedInitialTab);

  // Edit Personal Details Modal state
  const [editPersonalModalOpen, setEditPersonalModalOpen] = useState(false);
  const [personalDetailsSuccess, setPersonalDetailsSuccess] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    fullName: userProfile?.fullName || 'Vikram Malhotra',
    mobile: userProfile?.mobile || '+91 98200 44556',
    email: userProfile?.email || 'vikram.malhotra@gmail.com',
    city: userProfile?.city || 'Gurugram, Haryana',
    state: userProfile?.state || 'Haryana',
    age: userProfile?.age || 42,
    gender: userProfile?.gender || 'Male',
    emergencyContactName: 'Priya Malhotra (Spouse)',
    emergencyContactPhone: '+91 98101 23456',
    bloodGroup: 'B+',
  });

  // Keep form in sync when userProfile updates
  useEffect(() => {
    if (userProfile) {
      setPersonalForm((prev) => ({
        ...prev,
        fullName: userProfile.fullName || prev.fullName,
        mobile: userProfile.mobile || prev.mobile,
        email: userProfile.email || prev.email,
        city: userProfile.city || prev.city,
      }));
    }
  }, [userProfile]);

  const handleSavePersonalDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({
        fullName: personalForm.fullName,
        mobile: personalForm.mobile,
        city: personalForm.city,
        age: Number(personalForm.age) || 42,
        gender: personalForm.gender,
      });

      // Update Firestore patient doc
      const patientDocId = currentUser?.uid || 'patient-vikram-malhotra';
      try {
        await updateDoc(doc(db, 'patients', patientDocId), {
          fullName: personalForm.fullName,
          phone: personalForm.mobile,
          city: personalForm.city,
          age: Number(personalForm.age) || 42,
          gender: personalForm.gender,
          emergencyContact: `${personalForm.emergencyContactName} • ${personalForm.emergencyContactPhone}`,
          bloodGroup: personalForm.bloodGroup,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Could not update patient doc in Firestore:', err);
      }

      setPersonalDetailsSuccess(true);
      setTimeout(() => {
        setPersonalDetailsSuccess(false);
        setEditPersonalModalOpen(false);
      }, 1200);
    } catch (err) {
      console.error('Error saving personal details:', err);
    }
  };

  // Clinical records state
  const [assessment, setAssessment] = useState<ClinicalAssessment>(SAMPLE_ASSESSMENT);
  const [treatmentSessions, setTreatmentSessions] = useState<TreatmentSession[]>(SAMPLE_TREATMENT_SESSIONS);
  const [progressMetrics, setProgressMetrics] = useState<ProgressMeasurement[]>(SAMPLE_PROGRESS_MEASUREMENTS);
  const [rehabPlan, setRehabPlan] = useState<RehabilitationPlan>(SAMPLE_REHAB_PLAN);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transferRequests, setTransferRequests] = useState<TherapistTransferRequest[]>([]);
  const [accessGrants, setAccessGrants] = useState<RecordAccessGrant[]>([
    {
      id: 'grant-pt-ananya',
      patientId: currentUser?.uid || 'patient-vikram-malhotra',
      patientName: userProfile?.fullName || 'Vikram Malhotra',
      therapistId: 'pt-ananya-sharma',
      therapistName: 'Dr. Ananya Sharma, MPT',
      status: 'active',
      scope: ['assessments', 'treatment_notes', 'rehab_plans', 'progress_metrics'],
      grantedAt: '2026-03-01T10:00:00.000Z',
      expiresAt: '2026-06-01T10:00:00.000Z',
    },
  ]);

  // Community state
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(SAMPLE_COMMUNITY_POSTS);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');

  // Complaints state
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [newComplaintCategory, setNewComplaintCategory] = useState<Complaint['category']>('service_quality');
  const [newComplaintDesc, setNewComplaintDesc] = useState('');
  const [complaintSuccess, setComplaintSuccess] = useState(false);

  // Therapist change request modal
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedNewTherapist, setSelectedNewTherapist] = useState<Physiotherapist | null>(null);
  const [transferReason, setTransferReason] = useState<TherapistTransferRequest['reason']>('relocation');
  const [transferNotes, setTransferNotes] = useState('');
  const [transferConsent, setTransferConsent] = useState(true);
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Detail modals
  const [selectedSessionForModal, setSelectedSessionForModal] = useState<TreatmentSession | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Home Exercise Program (HEP) Feedback state
  const [exerciseFeedbackModalOpen, setExerciseFeedbackModalOpen] = useState(false);
  const [feedbackPainRating, setFeedbackPainRating] = useState<number>(2);
  const [feedbackExerciseNotes, setFeedbackExerciseNotes] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [selectedExForFeedback, setSelectedExForFeedback] = useState<string | null>(null);

  // Load from Firestore
  useEffect(() => {
    const loadPatientData = async () => {
      try {
        // Load rehabilitation plans (prescribed by therapist)
        const planSnap = await getDocs(collection(db, 'rehabilitationPlans'));
        if (!planSnap.empty) {
          let matchedPlan: RehabilitationPlan | null = null;
          planSnap.forEach((d) => {
            const planData = d.data() as RehabilitationPlan;
            if (planData.patientId === (currentUser?.uid || 'patient-vikram-malhotra')) {
              matchedPlan = planData;
            }
          });
          if (matchedPlan) {
            setRehabPlan(matchedPlan);
          }
        }

        // Load appointments
        const apptSnap = await getDocs(collection(db, 'appointments'));
        if (!apptSnap.empty) {
          const list: Appointment[] = [];
          apptSnap.forEach((d) => list.push(d.data() as Appointment));
          setAppointments(list);
        } else {
          setAppointments([
            {
              id: 'app-01',
              patientId: currentUser?.uid || 'patient-vikram-malhotra',
              patientName: userProfile?.fullName || 'Vikram Malhotra',
              therapistId: 'pt-ananya-sharma',
              therapistName: 'Dr. Ananya Sharma, MPT',
              consultationType: 'clinic',
              date: '2026-03-28',
              timeSlot: '04:00 PM - 04:45 PM',
              status: 'confirmed',
              fee: 1200,
              chiefComplaint: 'Post-Op Knee Phase II Closed Chain Review',
              createdAt: '2026-03-24T10:00:00.000Z',
            },
          ]);
        }

        // Load transfer requests
        const trSnap = await getDocs(collection(db, 'therapistTransferRequests'));
        if (!trSnap.empty) {
          const trList: TherapistTransferRequest[] = [];
          trSnap.forEach((d) => trList.push(d.data() as TherapistTransferRequest));
          setTransferRequests(trList);
        }

        // Load complaints
        const cmpSnap = await getDocs(collection(db, 'complaints'));
        if (!cmpSnap.empty) {
          const cmpList: Complaint[] = [];
          cmpSnap.forEach((d) => cmpList.push(d.data() as Complaint));
          setComplaints(cmpList);
        }
      } catch (err) {
        console.warn('Error fetching Firestore patient data:', err);
      }
    };
    loadPatientData();
  }, [currentUser]);

  // Toggle exercise completion today & sync
  const toggleExercise = async (exId: string) => {
    setRehabPlan((prev) => {
      const updated = prev.exercises.map((ex) =>
        ex.id === exId ? { ...ex, completedToday: !ex.completedToday } : ex
      );
      const newPlan = { ...prev, exercises: updated };
      try {
        updateDoc(doc(db, 'rehabilitationPlans', newPlan.id), {
          exercises: updated,
        });
      } catch (e) {
        // local state remains responsive
      }
      return newPlan;
    });
  };

  // Reset daily completed status for new day
  const handleResetDailyExercises = () => {
    setRehabPlan((prev) => {
      const reset = prev.exercises.map((ex) => ({ ...ex, completedToday: false }));
      const newPlan = { ...prev, exercises: reset };
      try {
        updateDoc(doc(db, 'rehabilitationPlans', newPlan.id), { exercises: reset });
      } catch (e) {
        // ignore
      }
      return newPlan;
    });
  };

  // Submit exercise feedback to clinician
  const handleSendExerciseFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSuccess(true);
    const feedbackNote = `[Patient Feedback ${new Date().toLocaleDateString()}]: NPRS Pain ${feedbackPainRating}/10. Note: ${feedbackExerciseNotes || 'Routine completed successfully.'}`;
    try {
      await updateDoc(doc(db, 'rehabilitationPlans', rehabPlan.id), {
        notes: rehabPlan.notes ? `${rehabPlan.notes}\n${feedbackNote}` : feedbackNote,
      });
      setRehabPlan((prev) => ({
        ...prev,
        notes: prev.notes ? `${prev.notes}\n${feedbackNote}` : feedbackNote,
      }));
    } catch (err) {
      console.warn('Sync feedback failed:', err);
    }
    setTimeout(() => {
      setFeedbackSuccess(false);
      setExerciseFeedbackModalOpen(false);
      setFeedbackExerciseNotes('');
      setSelectedExForFeedback(null);
    }, 1800);
  };

  // Submit transfer request with patient consent
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewTherapist) return;

    const newReqId = 'transfer-' + Date.now();
    const newReq: TherapistTransferRequest = {
      id: newReqId,
      patientId: currentUser?.uid || 'patient-vikram-malhotra',
      patientName: userProfile?.fullName || 'Vikram Malhotra',
      previousTherapistId: 'pt-ananya-sharma',
      previousTherapistName: 'Dr. Ananya Sharma, MPT',
      newTherapistId: selectedNewTherapist.id,
      newTherapistName: selectedNewTherapist.fullName,
      reason: transferReason,
      reasonDetails: transferNotes || 'Relocation closer to DLF Cyber City office location.',
      status: 'pending',
      scopeOfAccess: ['assessments', 'treatment_notes', 'rehab_plans', 'progress_metrics'],
      patientConsentGiven: transferConsent,
      consentTimestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'therapistTransferRequests', newReqId), newReq);
      setTransferRequests((prev) => [newReq, ...prev]);

      // Create Record Access Grant
      const newGrantId = 'grant-' + selectedNewTherapist.id;
      const newGrant: RecordAccessGrant = {
        id: newGrantId,
        patientId: currentUser?.uid || 'patient-vikram-malhotra',
        patientName: userProfile?.fullName || 'Vikram Malhotra',
        therapistId: selectedNewTherapist.id,
        therapistName: selectedNewTherapist.fullName,
        status: 'active',
        scope: ['assessments', 'treatment_notes', 'rehab_plans', 'progress_metrics'],
        grantedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      };
      await setDoc(doc(db, 'recordAccessGrants', newGrantId), newGrant);
      setAccessGrants((prev) => [newGrant, ...prev]);

      setTransferSuccess(true);
      setTimeout(() => {
        setTransferSuccess(false);
        setTransferModalOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Error creating transfer request:', err);
    }
  };

  // Revoke grant
  const revokeGrant = async (grantId: string) => {
    setAccessGrants((prev) =>
      prev.map((g) => (g.id === grantId ? { ...g, status: 'revoked', revokedAt: new Date().toISOString() } : g))
    );
    try {
      await updateDoc(doc(db, 'recordAccessGrants', grantId), {
        status: 'revoked',
        revokedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Revoke in Firestore failed:', e);
    }
  };

  // Community post
  const handleCommunityPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostContent) return;

    const newPost: CommunityPost = {
      id: 'post-' + Date.now(),
      communityId: 'postop-stroke-rehab',
      communityName: 'Postoperative & Stroke Recovery',
      authorId: currentUser?.uid || 'patient-vikram-malhotra',
      authorDisplayName: userProfile?.fullName || 'Vikram Malhotra',
      authorRole: 'patient',
      title: newPostTitle,
      content: newPostContent,
      likesCount: 0,
      commentsCount: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'communityPosts', newPost.id), newPost);
      setCommunityPosts((prev) => [newPost, ...prev]);
      setNewPostTitle('');
      setNewPostContent('');
    } catch (err) {
      console.error('Error creating community post:', err);
    }
  };

  // Complaint submission
  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cId = 'cmp-' + Date.now();
    const newCmp: Complaint = {
      id: cId,
      patientId: currentUser?.uid || 'patient-vikram-malhotra',
      patientName: userProfile?.fullName || 'Vikram Malhotra',
      therapistId: 'pt-ananya-sharma',
      therapistName: 'Dr. Ananya Sharma, MPT',
      category: newComplaintCategory,
      description: newComplaintDesc,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'complaints', cId), newCmp);
      setComplaints((prev) => [newCmp, ...prev]);
      setComplaintSuccess(true);
      setNewComplaintDesc('');
      setTimeout(() => setComplaintSuccess(false), 2500);
    } catch (e) {
      console.error('Complaint submission error:', e);
    }
  };

  // Calculate adherence
  const completedCount = rehabPlan.exercises.filter((e) => e.completedToday).length;
  const adherencePercent = Math.round((completedCount / (rehabPlan.exercises.length || 1)) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* SIMPLE & CLEAN PATIENT HEADER */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center font-black text-xl text-white shadow-md shadow-blue-500/20">
            {userProfile?.fullName?.[0] || 'V'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {userProfile?.fullName || 'Vikram Malhotra'}
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Recovery
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Post-Op Right Knee ACL Rehab • Week 5 • Primary Clinician:{' '}
              <strong className="text-slate-800">Dr. Ananya Sharma, MPT</strong>
            </p>
          </div>
        </div>

        {/* Clean Header Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('patient_data')}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-4 py-2 rounded-xl text-xs border border-blue-200 transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>My Patient Data</span>
          </button>
          <button
            onClick={() => setTransferModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ArrowRightLeft className="w-4 h-4 text-teal-400" />
            <span>Change Doctor / Handover</span>
          </button>
        </div>
      </div>

      {/* CLEAN NAVIGATION TABS (NO 'Join as Physiotherapist' in patient window) */}
      <div className="flex overflow-x-auto gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-2 px-4 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'dashboard'
              ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Activity className="w-4 h-4 text-blue-600" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('patient_data')}
          className={`py-2 px-4 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'patient_data'
              ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FileText className="w-4 h-4 text-teal-600" />
          <span>Patient Data</span>
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`py-2 px-4 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'progress'
              ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <span>Recovery Progress</span>
        </button>

        <button
          onClick={() => setActiveTab('exercises')}
          className={`py-2 px-4 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'exercises'
              ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Dumbbell className="w-4 h-4 text-emerald-600" />
          <span>Home Exercises</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
            Prescribed
          </span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`py-2 px-4 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'appointments'
              ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Appointments</span>
        </button>

        <button
          onClick={() => setActiveTab('transfer_history')}
          className={`py-2 px-4 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'transfer_history'
              ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4 text-teal-600" />
          <span>Change Doctor & Handover</span>
        </button>

        <button
          onClick={() => setActiveTab('community')}
          className={`py-2 px-4 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'community'
              ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-600" />
          <span>Community</span>
        </button>


        <button
          onClick={() => setActiveTab('complaints')}
          className={`py-2 px-4 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'complaints'
              ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>Support & Complaints</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: SIMPLE, FRIENDLY HOME WINDOW                            */}
      {/* ============================================================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Friendly Welcome Card */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-teal-200" />
              <span>Recovery on track • Week 5 of 12</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Hello, {userProfile?.fullName || 'Vikram'}!
            </h2>
            <p className="text-sm text-blue-100 max-w-2xl leading-relaxed">
              Your rehabilitation program is progressing well. Your knee flexion has reached 108° and your pain is down to 3/10. Keep up with your daily exercises below.
            </p>
          </div>

          {/* 3 Main Summary Cards in Simple Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Next Appointment */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Next Appointment
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                    Confirmed
                  </span>
                </div>
                <div className="pt-3 space-y-1.5">
                  <p className="text-base font-black text-slate-900">Saturday, 28 Mar 2026</p>
                  <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    04:00 PM - 04:45 PM
                  </p>
                  <p className="text-xs text-slate-600">
                    With <strong>Dr. Ananya Sharma, MPT</strong> (In-Clinic)
                  </p>
                  <p className="text-xs text-slate-500 pt-1">
                    Agenda: Closed-chain review & gait pattern check
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('appointments')}
                className="w-full mt-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors"
              >
                View Appointment Details
              </button>
            </div>

            {/* 2. Current Recovery Snapshot */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                    Recovery Snapshot
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    Improving
                  </span>
                </div>
                <div className="pt-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Current Pain Level:</span>
                    <span className="text-sm font-black text-slate-900">
                      3/10 <span className="text-xs text-emerald-600 font-bold">(Mild)</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Knee Flexion (ROM):</span>
                    <span className="text-sm font-black text-slate-900">
                      108° <span className="text-xs text-teal-600 font-bold">(Target 135°)</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Extension Lag:</span>
                    <span className="text-sm font-black text-emerald-600">
                      0° <span className="text-xs text-slate-500 font-normal">(Resolved)</span>
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('progress')}
                className="w-full mt-2 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded-xl transition-colors"
              >
                View Full Recovery Chart
              </button>
            </div>

            {/* 3. Today's Exercises */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Dumbbell className="w-4 h-4 text-emerald-600" />
                    Today's Exercises
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {completedCount}/{rehabPlan.exercises.length} Done
                  </span>
                </div>
                <div className="pt-3 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900">{adherencePercent}%</span>
                    <span className="text-xs text-slate-500 font-semibold">Completed Today</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${adherencePercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 pt-1">
                    {adherencePercent === 100
                      ? 'Great job! All prescribed exercises for today are complete.'
                      : 'You still have 2 exercises remaining today.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('exercises')}
                className="w-full mt-2 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-colors"
              >
                Open Daily Exercise List
              </button>
            </div>
          </div>

          {/* 3 Large Simple Quick-Action Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab('patient_data')}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex items-start gap-3.5"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                  My Patient Data
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  View complete medical assessment, doctor notes, and past sessions in simple form.
                </p>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('exercises')}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group flex items-start gap-3.5"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                  My Daily Exercises
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Follow step-by-step instructions, sets, and check off completed repetitions.
                </p>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('transfer_history')}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group flex items-start gap-3.5"
            >
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                  Change Physiotherapist
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Transfer seamlessly to another doctor without losing your treatment history.
                </p>
              </div>
            </div>
          </div>

          {/* Simple Recent Doctor Notes */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                Recent Notes from Your Physiotherapist
              </h3>
              <button
                onClick={() => setActiveTab('patient_data')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                View All in Patient Data →
              </button>
            </div>

            <div className="space-y-3">
              {treatmentSessions.slice(-2).reverse().map((session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSessionForModal(session)}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-blue-50/40 hover:border-blue-200 transition-all cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        Session #{session.sessionNumber}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{session.date}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-xs font-semibold text-teal-700">
                        {session.therapistName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong>Assessment:</strong> {session.assessment}
                    </p>
                    <p className="text-xs text-slate-500">
                      <strong>Next step:</strong> {session.plan}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: PATIENT DATA IN SIMPLE FORM                             */}
      {/* ============================================================== */}
      {activeTab === 'patient_data' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">Patient Data & Clinical Record</h2>
                    <span className="text-xs font-bold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full">
                      Verified Clinical Record
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Your complete health records, assessments, and treatment notes in simple readable form.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setQrModalOpen(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <QrCode className="w-4 h-4 text-slate-600" />
                  <span>Clinic QR Check-In</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save Record</span>
                </button>
              </div>
            </div>

            {/* SIMPLE FORM SECTION 1: Patient Information (Editable by Patient) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide text-blue-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  1. Patient Personal Information
                </h3>
                <button
                  type="button"
                  onClick={() => setEditPersonalModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors w-fit"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit Personal Details</span>
                </button>
              </div>

              {personalDetailsSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Personal details saved and synchronized with Firestore!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Full Name</span>
                  <strong className="text-slate-900 text-sm">
                    {userProfile?.fullName || personalForm.fullName}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Mobile Number</span>
                  <strong className="text-slate-900 text-sm">
                    {userProfile?.mobile || personalForm.mobile}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">City / Location</span>
                  <strong className="text-slate-900 text-sm">
                    {userProfile?.city || personalForm.city}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Emergency Contact</span>
                  <strong className="text-slate-900 text-sm">
                    {personalForm.emergencyContactName} • {personalForm.emergencyContactPhone}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Email Address</span>
                  <strong className="text-slate-900 text-xs truncate block">
                    {userProfile?.email || personalForm.email}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Age & Gender</span>
                  <strong className="text-slate-900 text-sm">
                    {personalForm.age} Yrs • {personalForm.gender}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Blood Group</span>
                  <strong className="text-slate-900 text-sm">
                    {personalForm.bloodGroup}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">State / Region</span>
                  <strong className="text-slate-900 text-sm">
                    {personalForm.state || 'Haryana, India'}
                  </strong>
                </div>
              </div>
            </div>

            {/* SIMPLE FORM SECTION 2: Medical Condition & Doctor */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide text-teal-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                2. Medical Condition & Treating Doctor
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-teal-50/50 p-4 rounded-2xl border border-teal-200/60 text-xs">
                <div>
                  <span className="text-teal-800 font-semibold block text-[11px]">Primary Diagnosis</span>
                  <strong className="text-slate-900">
                    Post-Op Right Knee ACL Reconstruction with Medial Meniscal Repair
                  </strong>
                </div>
                <div>
                  <span className="text-teal-800 font-semibold block text-[11px]">Treating Clinician</span>
                  <strong className="text-slate-900">
                    Dr. Ananya Sharma, MPT (Ortho & Sports Rehab)
                  </strong>
                </div>
                <div>
                  <span className="text-teal-800 font-semibold block text-[11px]">Current Rehabilitation Stage</span>
                  <strong className="text-slate-900">
                    Phase II (Week 5) — Active Closed-Chain Strengthening
                  </strong>
                </div>
              </div>
            </div>

            {/* SIMPLE FORM SECTION 3: Chronological Treatment Notes */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                3. Treatment Sessions History Log
              </h3>

              <div className="space-y-3">
                {treatmentSessions.map((session) => (
                  <div key={session.id} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">Session #{session.sessionNumber}</span>
                        <span className="text-slate-500">• {session.date}</span>
                        <span className="text-teal-700 font-semibold">• {session.therapistName}</span>
                      </div>
                      <span className="bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-bold text-[11px]">
                        Pain: {session.painBefore}/10 → {session.painAfter}/10
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <strong className="text-slate-800 block mb-0.5">Doctor's Observation:</strong>
                        <p className="text-slate-600">{session.assessment}</p>
                      </div>
                      <div>
                        <strong className="text-slate-800 block mb-0.5">Exercises & Plan:</strong>
                        <p className="text-slate-600">{session.plan}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                      <span className="font-semibold text-slate-700">Interventions:</span>
                      {session.interventions.map((intv, idx) => (
                        <span key={idx} className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                          {intv}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SIMPLE FORM SECTION 5: Record Sharing & Handover */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs space-y-3 mt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-blue-950 uppercase text-[11px] tracking-wide">
                    Doctor Handover & Record Sharing
                  </h4>
                  <p className="text-blue-800 text-xs mt-0.5">
                    Your records are portable. If you change your physiotherapist or move to a different city, your full clinical data can be transferred to the new doctor seamlessly.
                  </p>
                </div>
                <button
                  onClick={() => setTransferModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shrink-0 shadow-sm"
                >
                  Change Doctor & Transfer Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: RECOVERY PROGRESS                                       */}
      {/* ============================================================== */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900">Recovery Progress Tracker</h2>
                <p className="text-xs text-slate-500">
                  Track your recovery over time based on pain reduction and knee mobility
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Steady Improvement</span>
              </div>
            </div>

            {/* Chart 1: Pain Level vs Knee Flexion ROM */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900">
                1. Pain Reduction (0-10) vs Knee Range of Motion (Degrees)
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressMetrics} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis
                      yAxisId="left"
                      domain={[0, 10]}
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Pain (0-10)', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[50, 140]}
                      tick={{ fontSize: 11 }}
                      label={{ value: 'ROM (deg)', angle: 90, position: 'insideRight', style: { fontSize: 10 } }}
                    />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="painScore"
                      name="Pain Level (0-10)"
                      stroke="#e11d48"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="flexionRomDeg"
                      name="Knee Flexion ROM (°)"
                      stroke="#0d9488"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Functional Mobility */}
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                2. Functional Mobility — Timed Up & Go (Seconds) & Quadriceps Strength
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressMetrics} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar
                      dataKey="timedUpAndGoSeconds"
                      name="Timed Up & Go (Seconds)"
                      fill="#6366f1"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="strengthGrade"
                      name="Quadriceps Strength (0-5)"
                      fill="#0ea5e9"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: PRESCRIBED HOME EXERCISES (HEP)                         */}
      {/* ============================================================== */}
      {activeTab === 'exercises' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            {/* Clinical Prescription Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Official Clinician Prescription
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Home Exercise Program (HEP)
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{rehabPlan.title}</h2>
                <p className="text-xs text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>Prescribed by: <strong className="text-slate-900">{rehabPlan.therapistName}</strong></span>
                  <span>•</span>
                  <span>Target: <strong className="text-teal-700">{rehabPlan.targetCondition}</strong></span>
                  <span>•</span>
                  <span>Schedule: <strong>{rehabPlan.frequency}</strong></span>
                </p>
              </div>

              {/* Action Buttons: Log Feedback & Adherence */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedExForFeedback(null);
                    setExerciseFeedbackModalOpen(true);
                  }}
                  className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  <span>Log Pain / Feedback to Therapist</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetDailyExercises}
                  title="Reset daily completion checkmarks for a fresh routine today"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                >
                  Reset Daily Checks
                </button>
              </div>
            </div>

            {/* Daily Adherence Progress Bar */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  Today's Prescribed Routine Progress:
                </span>
                <span className="font-black text-teal-700">
                  {completedCount} of {rehabPlan.exercises.length} Exercises Completed ({adherencePercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${adherencePercent}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500">
                Perform each exercise in order according to the prescribed sets, repetitions, and hold intervals. Click the checkmark upon completing each exercise.
              </p>
            </div>

            {/* Clinician's Mandatory Precautions Box */}
            <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl text-xs text-amber-950 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Clinician's Safety Precautions & Guidance:</p>
                <p className="leading-relaxed text-amber-900">{rehabPlan.precautions}</p>
              </div>
            </div>

            {/* Prescribed Exercises List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rehabPlan.exercises.map((ex, index) => (
                <div
                  key={ex.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    ex.completedToday
                      ? 'bg-emerald-50/60 border-emerald-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            EX #{index + 1}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                            {ex.targetArea}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{ex.name}</h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExercise(ex.id)}
                        className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                          ex.completedToday
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'border-2 border-slate-300 text-slate-400 hover:border-teal-500 hover:text-teal-600'
                        }`}
                        title={ex.completedToday ? 'Mark as incomplete' : 'Mark completed today'}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        <span className="font-bold text-slate-900">Clinician Instructions: </span>
                        {ex.instructions}
                      </p>
                    </div>

                    {/* Prescribed Dosage Metrics */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">Sets</span>
                        <strong className="text-slate-900 text-sm">{ex.sets}</strong>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">Reps</span>
                        <strong className="text-slate-900 text-sm">{ex.repetitions}</strong>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">Hold</span>
                        <strong className="text-slate-900 text-sm">{ex.holdSeconds}s</strong>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">Frequency</span>
                        <strong className="text-slate-900 text-sm">{ex.frequencyPerDay || 2}x / day</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">
                      {ex.completedToday ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Completed for today
                        </span>
                      ) : (
                        <span className="text-slate-500">Pending completion today</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedExForFeedback(ex.name);
                        setExerciseFeedbackModalOpen(true);
                      }}
                      className="text-teal-700 hover:text-teal-900 font-bold text-[11px] hover:underline"
                    >
                      Report issue with this exercise
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Prescribing Therapist Contact & Notes */}
            {rehabPlan.notes && (
              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl text-xs space-y-1">
                <p className="font-bold text-teal-900">Dr. {rehabPlan.therapistName}'s Ongoing Session Notes & Patient Log:</p>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed font-mono text-[11px]">{rehabPlan.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: APPOINTMENTS                                            */}
      {/* ============================================================== */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900">My Appointments</h2>
                <p className="text-xs text-slate-500">
                  Review booked, confirmed, and completed rehabilitation sessions
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{appt.therapistName}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {appt.consultationType} consultation
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {appt.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 flex items-center gap-3">
                      <span>Date: {appt.date}</span>
                      <span>•</span>
                      <span>Time: {appt.timeSlot}</span>
                      <span>•</span>
                      <span className="font-bold text-slate-900">Fee: ₹{appt.fee}</span>
                    </p>
                    <p className="text-xs text-slate-500">Agenda: {appt.chiefComplaint}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: CHANGE THERAPIST & HANDOVER                             */}
      {/* ============================================================== */}
      {activeTab === 'transfer_history' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900">Change Doctor & Handover History</h2>
                <p className="text-xs text-slate-500">
                  Request a change of physiotherapist and share your verified patient data with your new doctor
                </p>
              </div>

              <button
                onClick={() => setTransferModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Request New Doctor Handover</span>
              </button>
            </div>

            {transferRequests.length > 0 ? (
              <div className="space-y-4">
                {transferRequests.map((tr) => (
                  <div key={tr.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">Transfer Request #{tr.id}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                          {tr.status}
                        </span>
                      </div>
                      <span className="text-slate-500 text-[11px]">
                        Submitted {new Date(tr.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Previous Physiotherapist</span>
                        <strong className="text-slate-900">{tr.previousTherapistName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">New / Receiving Physiotherapist</span>
                        <strong className="text-teal-700">{tr.newTherapistName}</strong>
                      </div>
                    </div>

                    <div>
                      <p><strong>Reason for change:</strong> {tr.reason} ({tr.reasonDetails})</p>
                      <p className="text-emerald-700 font-semibold mt-1 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Patient Data access granted for assessments, treatment notes, and recovery graphs.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs space-y-3">
                <p>No doctor transfers requested yet.</p>
                <button
                  onClick={() => setTransferModalOpen(true)}
                  className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Request a Change of Physiotherapist
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: COMMUNITY                                               */}
      {/* ============================================================== */}
      {activeTab === 'community' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900">Rehabilitation Support Communities</h2>
                <p className="text-xs text-slate-500">
                  Connect with fellow patients recovering from knee surgery, stroke, and sports injuries
                </p>
              </div>
            </div>

            {/* Create Post Form */}
            <form onSubmit={handleCommunityPost} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Share an Experience or Question</h4>
              <input
                type="text"
                required
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Title (e.g. Tips on managing morning knee stiffness)"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              />
              <textarea
                rows={3}
                required
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Write your question or experience here..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              />
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  Post to Community
                </button>
              </div>
            </form>

            {/* Posts Stream */}
            <div className="space-y-3">
              {communityPosts.map((post) => (
                <div key={post.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{post.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        Posted by {post.authorDisplayName} • {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                      {post.communityName}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{post.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 8: COMPLAINTS & FEEDBACK                                   */}
      {/* ============================================================== */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900">Patient Support & Service Quality</h2>
              <p className="text-xs text-slate-500">
                Submit complaints, feedback, or report billing/service issues directly to platform operations
              </p>
            </div>

            {complaintSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your complaint has been logged and assigned to the platform administration team.</span>
              </div>
            )}

            <form onSubmit={handleComplaintSubmit} className="space-y-3 text-xs max-w-xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newComplaintCategory}
                  onChange={(e) => setNewComplaintCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="service_quality">Service Quality Issue</option>
                  <option value="unprofessional_conduct">Unprofessional Conduct</option>
                  <option value="billing">Billing or Fee Dispute</option>
                  <option value="marketplace_issue">Marketplace Equipment Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={newComplaintDesc}
                  onChange={(e) => setNewComplaintDesc(e.target.value)}
                  placeholder="Explain what happened..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                />
              </div>

              <button
                type="submit"
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors"
              >
                Submit Feedback / Complaint
              </button>
            </form>

            {complaints.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h4 className="font-bold text-sm text-slate-900">Your Submitted Cases</h4>
                {complaints.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-white text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">Case #{c.id}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {c.status}
                      </span>
                    </div>
                    <p className="text-slate-600">{c.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CHANGE DOCTOR / HANDOVER                                */}
      {/* ============================================================== */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-base text-slate-900">Request Change of Physiotherapist</h3>
              </div>
              <button onClick={() => setTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {transferSuccess ? (
              <div className="p-6 text-center space-y-2">
                <div className="h-12 w-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-base text-slate-900">Transfer & Patient Data Handover Sent!</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your patient clinical records have been authorized for <strong>{selectedNewTherapist?.fullName}</strong>. They can now review your treatment history and continue your care without interruption.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
                <p className="text-slate-600">
                  Changing therapists does not mean starting over. Your authorized clinical notes, ROM progress, and precautions will accompany you to the new doctor.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select New Physiotherapist
                  </label>
                  <select
                    required
                    value={selectedNewTherapist?.id || ''}
                    onChange={(e) => {
                      const pt = INITIAL_PHYSIOTHERAPISTS.find((p) => p.id === e.target.value);
                      setSelectedNewTherapist(pt || null);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="">-- Choose a verified physiotherapist --</option>
                    {INITIAL_PHYSIOTHERAPISTS.filter(
                      (p) => p.verificationStatus === 'verified' && p.id !== 'pt-ananya-sharma'
                    ).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} — {p.qualification} (₹{p.consultationFee})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Transfer</label>
                  <select
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="relocation">Relocation / Closer to Home or Office</option>
                    <option value="scheduling">Scheduling / Time Slot Conflicts</option>
                    <option value="rehab_change">Change in Rehabilitation Needs</option>
                    <option value="preference">Personal Preference</option>
                    <option value="service_quality">Service Quality Concern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Context</label>
                  <textarea
                    rows={2}
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    placeholder="e.g. Relocated to DLF Cyber City; looking for clinic closer to work."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>

                <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transferConsent}
                      onChange={(e) => setTransferConsent(e.target.checked)}
                      className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-slate-800 font-medium">
                      I authorize <strong>PhysioGo</strong> to securely share my Patient Data (assessment, treatment notes, and recovery graphs) with the new physiotherapist.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!selectedNewTherapist || !transferConsent}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  Confirm Transfer & Share Patient Data
                </button>
              </form>
            )}
          </div>
        </div>
      )}



      {/* MODAL: SESSION DETAIL */}
      {selectedSessionForModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                Session #{selectedSessionForModal.sessionNumber} Notes
              </h3>
              <button onClick={() => setSelectedSessionForModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-500">Date: {selectedSessionForModal.date} • Clinician: {selectedSessionForModal.therapistName}</p>

            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p><strong>Patient Feedback:</strong> {selectedSessionForModal.subjective}</p>
              <p><strong>Physical Examination:</strong> {selectedSessionForModal.objective}</p>
              <p><strong>Doctor's Assessment:</strong> {selectedSessionForModal.assessment}</p>
              <p><strong>Next Steps:</strong> {selectedSessionForModal.plan}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: QR CODE */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-slate-900">Clinic Desk Check-In</span>
              <button onClick={() => setQrModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-100 rounded-2xl flex items-center justify-center">
              <div className="h-44 w-44 bg-white p-2 rounded-xl border border-slate-300 flex flex-col items-center justify-center shadow-inner">
                <QrCode className="w-32 h-32 text-slate-900" />
                <span className="text-[10px] font-mono text-slate-400 mt-1">TOKEN: PG-CHK-{Date.now().toString().slice(-6)}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Show this token at the clinic reception desk to instantly link your appointment.
            </p>
          </div>
        </div>
      )}

      {/* MODAL: EXERCISE FEEDBACK TO THERAPIST */}
      {exerciseFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Report Exercise Feedback</h3>
                  <p className="text-xs text-slate-500">Send updates directly to {rehabPlan.therapistName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExerciseFeedbackModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedbackSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base text-emerald-950">Feedback Sent to Clinician!</h4>
                <p className="text-xs text-emerald-800">
                  Your pain rating and notes have been logged for Dr. {rehabPlan.therapistName} to review during your next check-in.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendExerciseFeedback} className="space-y-4 text-xs">
                {selectedExForFeedback && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Specific Exercise:</span>
                    <strong className="text-slate-900 text-sm">{selectedExForFeedback}</strong>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    NPRS Pain Level During Routine: <span className="text-teal-700 font-black text-sm">{feedbackPainRating} / 10</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={feedbackPainRating}
                    onChange={(e) => setFeedbackPainRating(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0: No Pain</span>
                    <span>3: Mild Ache</span>
                    <span>7: Sharp Pain</span>
                    <span>10: Unbearable</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Notes, Difficulties, or Questions for Therapist
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackExerciseNotes}
                    onChange={(e) => setFeedbackExerciseNotes(e.target.value)}
                    placeholder="e.g., Felt mild stiffness on rep 12 of heel slides. No swelling observed."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-xs"
                  />
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900">
                  ⚠️ If you experience sudden sharp pain, joint swelling, or numbness, stop the exercise immediately and contact your doctor.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setExerciseFeedbackModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm transition-colors"
                  >
                    Send to Therapist
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* MODAL: EDIT PATIENT PERSONAL DETAILS */}
      {editPersonalModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Edit Personal Information</h3>
                  <p className="text-xs text-slate-500">Update your contact, location, and emergency records</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditPersonalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {personalDetailsSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base text-emerald-950">Personal Details Updated!</h4>
                <p className="text-xs text-emerald-800">
                  Your updated records have been synchronized to Firestore.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSavePersonalDetails} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={personalForm.fullName}
                    onChange={(e) => setPersonalForm({ ...personalForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={personalForm.mobile}
                      onChange={(e) => setPersonalForm({ ...personalForm, mobile: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={personalForm.email}
                      onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City / Location</label>
                    <input
                      type="text"
                      value={personalForm.city}
                      onChange={(e) => setPersonalForm({ ...personalForm, city: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">State / Region</label>
                    <input
                      type="text"
                      value={personalForm.state}
                      onChange={(e) => setPersonalForm({ ...personalForm, state: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={personalForm.age}
                      onChange={(e) => setPersonalForm({ ...personalForm, age: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={personalForm.gender}
                      onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={personalForm.bloodGroup}
                      onChange={(e) => setPersonalForm({ ...personalForm, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="font-bold text-slate-700 block text-xs">Emergency Contact Details</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">Contact Name & Relation</label>
                      <input
                        type="text"
                        value={personalForm.emergencyContactName}
                        onChange={(e) => setPersonalForm({ ...personalForm, emergencyContactName: e.target.value })}
                        placeholder="e.g. Priya Malhotra (Spouse)"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">Emergency Phone</label>
                      <input
                        type="tel"
                        value={personalForm.emergencyContactPhone}
                        onChange={(e) => setPersonalForm({ ...personalForm, emergencyContactPhone: e.target.value })}
                        placeholder="+91 98101 23456"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditPersonalModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-colors"
                  >
                    Save & Sync to Firestore
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
