export type UserRole = 'patient' | 'physiotherapist' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  mobile?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  age?: number;
  gender?: string;
  createdAt: string;
  updatedAt?: string;
}

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
export type PractitionerLevel = 'experienced' | 'fresher';

export interface Physiotherapist {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  qualification: string;
  practitionerLevel?: PractitionerLevel; // 'experienced' | 'fresher'
  college?: string;
  graduationYear?: number;
  additionalQualifications?: string[];
  experienceYears: number;
  registrationNumber?: string;
  registrationAuthority?: string;
  verificationStatus: VerificationStatus;
  specializations: string[];
  languages: string[];
  consultationFee: number;
  sessionDurationMinutes: number;
  clinicAddress?: string;
  serviceAreas: string[];
  offersHomeVisit: boolean;
  offersClinicVisit: boolean;
  offersOnline: boolean;
  rating: number;
  totalReviews: number;
  bio: string;
  verificationNotes?: string;
  certificateName?: string;
  certificateUrl?: string;
  cvFileName?: string;
  cvUrl?: string;
  cvSummary?: string;
  supervisingTherapist?: string;
  idProofUrl?: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  city?: string;
  state?: string;
  currentTherapistId?: string;
  currentTherapistName?: string;
  primaryDiagnosis?: string;
  createdAt: string;
}

export type AppointmentStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'rescheduling_requested'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export type ConsultationType = 'clinic' | 'home' | 'online';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  therapistId: string;
  therapistName: string;
  consultationType: ConsultationType;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM - 11:00 AM"
  status: AppointmentStatus;
  fee: number;
  chiefComplaint: string;
  declineReason?: string;
  suggestedAltTime?: string;
  notes?: string;
  createdAt: string;
}

export type AssessmentCategory =
  | 'general'
  | 'musculoskeletal'
  | 'neurological'
  | 'cardiopulmonary'
  | 'pediatric'
  | 'geriatric'
  | 'sports'
  | 'postoperative'
  | 'followup'
  | 'discharge';

export interface RangeOfMotionRecord {
  joint: string;
  movement: string;
  activeRom: number;
  passiveRom: number;
  normalRom: number;
  unit: string;
  notes?: string;
}

export interface MuscleStrengthRecord {
  muscleGroup: string;
  side: 'Left' | 'Right' | 'Bilateral';
  grade: number; // 0 to 5 MRC scale
  notes?: string;
}

export interface OutcomeMeasures {
  nprsPainScore?: number; // 0-10
  vasScore?: number; // 0-100
  timedUpAndGoSeconds?: number;
  tenMeterWalkSeconds?: number;
  bergBalanceScore?: number; // 0-56
  oswestryDisabilityIndex?: number; // 0-100%
  neckDisabilityIndex?: number; // 0-100%
}

export interface ClinicalAssessment {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  assessmentType: AssessmentCategory;
  date: string;
  // Subjective
  chiefComplaint: string;
  historyOfIllness: string;
  painLocation: string;
  painIntensity: number; // 0-10
  painCharacter: string;
  aggravatingFactors: string;
  relievingFactors: string;
  medicalHistory: string;
  surgicalHistory?: string;
  medications?: string;
  functionalLimitations: string;
  patientGoals: string;
  // Objective
  postureObservation: string;
  palpationTenderness?: string;
  swellingDeformity?: string;
  rangeOfMotion: RangeOfMotionRecord[];
  muscleStrength: MuscleStrengthRecord[];
  sensoryAndReflexes?: string;
  balanceAndGait?: string;
  specialTests?: string;
  outcomeMeasures: OutcomeMeasures;
  // Clinical Impression & Plan
  clinicalImpression: string;
  identifiedImpairments: string[];
  shortTermGoals: string;
  longTermGoals: string;
  plannedInterventions: string[];
  precautions: string;
  reassessmentSchedule: string;
  createdAt: string;
  isDraft?: boolean;
}

export interface ExerciseItem {
  id: string;
  name: string;
  instructions: string;
  targetArea: string;
  sets: number;
  repetitions: number;
  holdSeconds: number;
  frequencyPerDay: number;
  precautions?: string;
  imageUrl?: string;
  completedToday?: boolean;
}

export interface TreatmentSession {
  id: string;
  patientId: string;
  therapistId: string;
  therapistName: string;
  sessionNumber: number;
  date: string;
  // SOAP Format
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  interventions: string[];
  exercisesPerformed: ExerciseItem[];
  painBefore: number;
  painAfter: number;
  patientResponse: string;
  adverseSymptoms?: string;
  createdAt: string;
}

export interface RehabilitationPlan {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  title: string;
  targetCondition: string;
  startDate: string;
  durationWeeks: number;
  frequency: string;
  precautions: string;
  exercises: ExerciseItem[];
  status: 'active' | 'completed' | 'discontinued';
  notes?: string;
  createdAt: string;
}

export interface ProgressMeasurement {
  id: string;
  patientId: string;
  therapistId: string;
  therapistName: string;
  date: string;
  painScore: number; // 0-10
  flexionRomDeg?: number;
  extensionRomDeg?: number;
  strengthGrade?: number; // 0-5
  timedUpAndGoSeconds?: number;
  functionalAdherencePct?: number; // 0-100
  notes?: string;
  createdAt: string;
}

export type TransferStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
export type TransferReason =
  | 'relocation'
  | 'scheduling'
  | 'preference'
  | 'service_quality'
  | 'rehab_change'
  | 'other';

export interface TherapistTransferRequest {
  id: string;
  patientId: string;
  patientName: string;
  previousTherapistId: string;
  previousTherapistName: string;
  newTherapistId: string;
  newTherapistName: string;
  reason: TransferReason;
  reasonDetails?: string;
  status: TransferStatus;
  scopeOfAccess: ('assessments' | 'treatment_notes' | 'rehab_plans' | 'progress_metrics')[];
  patientConsentGiven: boolean;
  consentTimestamp: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordAccessGrant {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  status: 'active' | 'revoked' | 'expired';
  scope: ('assessments' | 'treatment_notes' | 'rehab_plans' | 'progress_metrics')[];
  grantedAt: string;
  expiresAt: string;
  revokedAt?: string;
}

export interface AiHandoverSummary {
  id: string;
  patientId: string;
  patientName: string;
  sourceTherapistName: string;
  newTherapistId: string;
  summaryText: string;
  sections: {
    reasonForRehab: string;
    clinicalHistory: string;
    keyFindings: string;
    interventionsPerformed: string;
    currentProgressAndGoals: string;
    precautionsAndContraindications: string;
    missingOrUnclearInfo: string;
  };
  sourceRecordCount: {
    assessments: number;
    sessions: number;
    metrics: number;
  };
  isClinicianReviewed: boolean;
  clinicianNotes?: string;
  sourceRecordReferences: string[];
  generatedAt: string;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  communityName: string;
  authorId: string;
  authorDisplayName: string;
  authorRole: string;
  title: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  likedBy: string[];
  isReported?: boolean;
  reportReason?: string;
  createdAt: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorDisplayName: string;
  content: string;
  createdAt: string;
}

export interface EquipmentListing {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  price: number;
  rentalPricePerDay?: number;
  isForSale: boolean;
  isForRent: boolean;
  condition: 'Brand New' | 'Like New' | 'Refurbished' | 'Good' | 'Used';
  readinessStatus: 'Inspected' | 'Verified Clean' | 'Self-Reported';
  lastServicedDate?: string;
  maintenanceHistory?: string;
  deliveryOptions: string[];
  available: boolean;
  createdAt: string;
}

export interface EquipmentRequest {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentPrice: number;
  requesterId: string;
  requesterName: string;
  requesterPhone: string;
  requestType: 'purchase' | 'rental';
  rentalDays?: number;
  status: 'pending' | 'approved' | 'fulfilled' | 'declined';
  notes?: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  category:
    | 'missed_appointment'
    | 'poor_communication'
    | 'unprofessional_behaviour'
    | 'billing_concern'
    | 'service_quality'
    | 'patient_safety'
    | 'other';
  description: string;
  status: 'submitted' | 'under_review' | 'awaiting_response' | 'investigation' | 'resolved' | 'closed';
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'appointment' | 'transfer' | 'rehab' | 'verification' | 'complaint' | 'system';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}
