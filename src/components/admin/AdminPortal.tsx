import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Users,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Search,
  Activity,
  Layers,
  Check,
  X,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { Physiotherapist, UserProfile, Complaint, CommunityPost } from '../../types';
import { INITIAL_PHYSIOTHERAPISTS, SAMPLE_PATIENT, SAMPLE_COMMUNITY_POSTS } from '../../data/seedData';
import { db, collection, getDocs, doc, updateDoc, setDoc } from '../../lib/firebase';

export const AdminPortal: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'verification' | 'users' | 'complaints' | 'moderation' | 'analytics'>('verification');

  // Physiotherapists for verification
  const [therapists, setTherapists] = useState<Physiotherapist[]>(INITIAL_PHYSIOTHERAPISTS);
  const [selectedPtForReview, setSelectedPtForReview] = useState<Physiotherapist | null>(null);

  // Complaints
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: 'cmp-101',
      patientId: SAMPLE_PATIENT.uid,
      patientName: SAMPLE_PATIENT.fullName,
      therapistId: 'pt-ananya-sharma',
      therapistName: 'Dr. Ananya Sharma, MPT',
      category: 'service_quality',
      description: 'Clinic session delayed by 25 minutes due to prior emergency trauma walk-in.',
      status: 'under_review',
      createdAt: '2026-03-20T10:00:00.000Z',
      updatedAt: '2026-03-20T10:00:00.000Z',
    },
  ]);
  const [resolutionInput, setResolutionInput] = useState('');
  const [selectedCmp, setSelectedCmp] = useState<Complaint | null>(null);

  // Community moderation
  const [posts, setPosts] = useState<CommunityPost[]>([
    ...SAMPLE_COMMUNITY_POSTS,
    {
      id: 'post-reported-sample',
      communityId: 'stroke-recovery',
      communityName: 'Stroke Recovery & Neurological Support',
      authorId: 'unverified-user-1',
      authorDisplayName: 'Herbal Remedies Online',
      authorRole: 'Unverified Guest',
      title: 'Guaranteed 100% cure for paralysis in 7 days without physio',
      content: 'Stop doing rehabilitation exercises. Buy our special herbal tea for instant stroke cure.',
      likesCount: 0,
      commentsCount: 0,
      likedBy: [],
      isReported: true,
      reportReason: 'Misleading unverified medical claim / Spam',
      createdAt: '2026-03-24T08:00:00.000Z',
    },
  ]);

  // Load from Firestore
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const ptSnap = await getDocs(collection(db, 'physiotherapists'));
        if (!ptSnap.empty) {
          const list: Physiotherapist[] = [];
          ptSnap.forEach((d) => list.push(d.data() as Physiotherapist));
          setTherapists(list);
        }
        const cmpSnap = await getDocs(collection(db, 'complaints'));
        if (!cmpSnap.empty) {
          const cList: Complaint[] = [];
          cmpSnap.forEach((d) => cList.push(d.data() as Complaint));
          setComplaints(cList);
        }
      } catch (e) {
        console.warn('Error loading admin records from Firestore:', e);
      }
    };
    loadAdminData();
  }, []);

  // Update therapist verification status
  const handleVerificationDecision = async (ptId: string, status: 'verified' | 'rejected') => {
    setTherapists((prev) =>
      prev.map((p) => (p.id === ptId ? { ...p, verificationStatus: status } : p))
    );
    try {
      await updateDoc(doc(db, 'physiotherapists', ptId), {
        verificationStatus: status,
      });
      setSelectedPtForReview(null);
    } catch (e) {
      console.warn('Verification update error:', e);
    }
  };

  // Resolve complaint
  const handleResolveComplaint = async (cmpId: string) => {
    const notes = resolutionInput || 'Case investigated with treating clinician. Explanation provided to patient.';
    setComplaints((prev) =>
      prev.map((c) => (c.id === cmpId ? { ...c, status: 'resolved', resolutionNotes: notes } : c))
    );
    try {
      await updateDoc(doc(db, 'complaints', cmpId), {
        status: 'resolved',
        resolutionNotes: notes,
        updatedAt: new Date().toISOString(),
      });
      setSelectedCmp(null);
      setResolutionInput('');
    } catch (e) {
      console.warn('Error resolving complaint:', e);
    }
  };

  // Remove violating community post
  const handleRemovePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const pendingVerificationList = therapists.filter((p) => p.verificationStatus === 'pending');
  const verifiedList = therapists.filter((p) => p.verificationStatus === 'verified');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-2xl text-purple-300">
            <ShieldCheck className="w-8 h-8 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Administrator Operations Console</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-200 border border-purple-400/30 px-2.5 py-0.5 rounded-full">
                Super Admin Access
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-0.5">
              Professional Credential Verification, Dispute Resolution, Community Moderation & System Governance
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs font-semibold scrollbar-none">
        <button
          onClick={() => setActiveTab('verification')}
          className={`py-2 px-3.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'verification' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Verification Queue ({pendingVerificationList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`py-2 px-3.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'complaints' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Complaints & Grievances ({complaints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`py-2 px-3.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'moderation' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Community Moderation</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-3.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'users' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory</span>
        </button>
      </div>

      {/* TAB 1: VERIFICATION QUEUE */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Physiotherapist Credential Verification Queue</h2>
              <p className="text-xs text-slate-600">
                Validate council registration numbers, university qualifications, and identity documents before public listing
              </p>
            </div>

            {pendingVerificationList.length > 0 ? (
              <div className="space-y-4">
                {pendingVerificationList.map((pt) => (
                  <div key={pt.id} className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{pt.fullName}</span>
                        {pt.practitionerLevel === 'fresher' ? (
                          <span className="text-[10px] font-bold uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                            🌱 Fresher Graduate
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            🎓 Experienced PT
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded ml-1">
                          Pending Review
                        </span>
                      </div>
                      <span className="text-slate-500 text-[11px]">Submitted {new Date(pt.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-amber-100">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Qualification:</span>
                        <strong className="text-slate-900">{pt.qualification}</strong>
                        <p className="text-slate-600">{pt.college} ({pt.graduationYear})</p>
                        {pt.practitionerLevel === 'fresher' && pt.supervisingTherapist && (
                          <p className="text-[11px] text-teal-700 font-semibold mt-1">
                            Mentor: {pt.supervisingTherapist}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Council Registration #:</span>
                        <strong className="text-teal-800">{pt.registrationNumber}</strong>
                        <p className="text-slate-600">{pt.registrationAuthority}</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Cert: <strong className="text-slate-700">{pt.certificateName || 'License_Cert.pdf'}</strong>
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">CV on File:</span>
                        <strong className="text-indigo-900 truncate block">{pt.cvFileName || 'Resume.pdf'}</strong>
                        <p className="text-slate-600 text-[11px] line-clamp-2 mt-0.5">{pt.cvSummary || pt.bio}</p>
                      </div>
                    </div>

                    <p className="text-slate-600"><strong>Bio:</strong> {pt.bio}</p>

                    <div className="flex gap-2 pt-2 border-t border-amber-200">
                      <button
                        onClick={() => handleVerificationDecision(pt.id, 'verified')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Verify Clinician</span>
                      </button>
                      <button
                        onClick={() => handleVerificationDecision(pt.id, 'rejected')}
                        className="bg-white hover:bg-slate-50 border border-slate-300 text-rose-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject Application</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                No pending verification applications. All registered physiotherapists are processed.
              </div>
            )}

            {/* Already Verified Professionals */}
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Active Verified Clinicians ({verifiedList.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {verifiedList.map((pt) => (
                  <div key={pt.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-slate-900">{pt.fullName}</p>
                        {pt.practitionerLevel === 'fresher' ? (
                          <span className="text-[9px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded">
                            Fresher
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                            Experienced
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500">{pt.qualification} • Reg: {pt.registrationNumber}</p>
                      <p className="text-[11px] text-teal-700">CV: {pt.cvFileName || 'Resume.pdf'}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-black text-slate-900">Patient Complaints & Grievance Resolution</h2>
            <div className="space-y-4">
              {complaints.map((cmp) => (
                <div key={cmp.id} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-sm text-slate-900">Grievance #{cmp.id}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 ml-2">
                        {cmp.status}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[11px]">{new Date(cmp.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p><strong>Complainant:</strong> {cmp.patientName}</p>
                  <p><strong>Regarding Clinician:</strong> {cmp.therapistName}</p>
                  <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-700">
                    {cmp.description}
                  </p>

                  {cmp.resolutionNotes ? (
                    <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200">
                      <strong>Resolution Recorded:</strong> {cmp.resolutionNotes}
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="block text-[11px] font-semibold text-slate-700">
                        Record Administrative Findings & Resolution Notes:
                      </label>
                      <input
                        type="text"
                        value={resolutionInput}
                        onChange={(e) => setResolutionInput(e.target.value)}
                        placeholder="e.g. Discussed with clinic director; reschedule prioritized; fee credit issued."
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                      />
                      <button
                        onClick={() => handleResolveComplaint(cmp.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-4 rounded-xl text-xs transition-colors"
                      >
                        Mark Grievance Resolved
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMMUNITY MODERATION */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-black text-slate-900">Community Safety & Content Moderation</h2>
            <div className="space-y-3">
              {posts.filter((p) => p.isReported).map((post) => (
                <div key={post.id} className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-rose-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Reported Post: {post.title}
                    </span>
                    <span className="text-slate-500 text-[11px]">Author: {post.authorDisplayName}</span>
                  </div>
                  <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-rose-100">{post.content}</p>
                  <p className="text-rose-700 font-semibold text-[11px]">Reason flagged: {post.reportReason}</p>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleRemovePost(post.id)}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                    >
                      Remove Harmful Content
                    </button>
                    <button
                      onClick={() => {
                        setPosts((prev) =>
                          prev.map((p) => (p.id === post.id ? { ...p, isReported: false } : p))
                        );
                      }}
                      className="bg-white border border-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs"
                    >
                      Dismiss Report
                    </button>
                  </div>
                </div>
              ))}
              {posts.filter((p) => p.isReported).length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  No flagged posts in moderation queue.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: USER DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-black text-slate-900">Platform User Directory</h2>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">Vikram Malhotra</p>
                  <p className="text-slate-500">vikram.malhotra@gmail.com • Role: Patient</p>
                </div>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px]">Active</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">Dr. Ananya Sharma, MPT</p>
                  <p className="text-slate-500">dr.ananya@physiogo.care • Role: Physiotherapist</p>
                </div>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px]">Verified</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">Dr. Rajesh Verma, MPT</p>
                  <p className="text-slate-500">dr.rajesh@physiogo.care • Role: Physiotherapist</p>
                </div>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px]">Verified</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
