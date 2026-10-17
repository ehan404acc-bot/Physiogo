import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Star,
  ShieldCheck,
  Calendar,
  Clock,
  Video,
  Home,
  Building,
  ArrowRight,
  SlidersHorizontal,
  X,
  Compass,
  Sparkles,
  Info,
} from 'lucide-react';
import { Physiotherapist } from '../../types';
import { INITIAL_PHYSIOTHERAPISTS } from '../../data/seedData';
import { db, collection, getDocs, addDoc, doc, setDoc } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

interface TherapistDirectoryProps {
  onSelectTherapistForBooking?: (pt: Physiotherapist) => void;
  onRequestTransfer?: (pt: Physiotherapist) => void;
  isTransferMode?: boolean;
}

export const TherapistDirectory: React.FC<TherapistDirectoryProps> = ({
  onSelectTherapistForBooking,
  onRequestTransfer,
  isTransferMode = false,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [therapists, setTherapists] = useState<Physiotherapist[]>(INITIAL_PHYSIOTHERAPISTS);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [filterHomeVisit, setFilterHomeVisit] = useState(false);
  const [filterClinic, setFilterClinic] = useState(false);
  const [filterOnline, setFilterOnline] = useState(false);
  const [maxFee, setMaxFee] = useState<number>(2000);
  const [minExp, setMinExp] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'rating' | 'fee_asc' | 'fee_desc' | 'experience'>('rating');

  // Selected therapist for detail view or modal booking
  const [selectedTherapist, setSelectedTherapist] = useState<Physiotherapist | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Booking form state
  const [bookingType, setBookingType] = useState<'clinic' | 'home' | 'online'>('clinic');
  const [bookingDate, setBookingDate] = useState('2026-03-28');
  const [bookingSlot, setBookingSlot] = useState('10:00 AM - 10:45 AM');
  const [bookingComplaint, setBookingComplaint] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // SmartMatch Drawer / Modal
  const [smartMatchOpen, setSmartMatchOpen] = useState(false);
  const [smartMatchNeed, setSmartMatchNeed] = useState('Postoperative Knee / ACL');
  const [smartMatchMode, setSmartMatchMode] = useState('home');
  const [smartMatchBudget, setSmartMatchBudget] = useState(1500);
  const [smartMatchResult, setSmartMatchResult] = useState<Physiotherapist | null>(null);

  // Fetch from Firestore or fallback to seed
  useEffect(() => {
    const loadTherapists = async () => {
      try {
        const snap = await getDocs(collection(db, 'physiotherapists'));
        if (!snap.empty) {
          const list: Physiotherapist[] = [];
          snap.forEach((d) => list.push(d.data() as Physiotherapist));
          setTherapists(list);
        }
      } catch (e) {
        console.warn('Could not fetch therapists, using initial seed data:', e);
      }
    };
    loadTherapists();
  }, []);

  // Filter & Sort
  const filteredTherapists = therapists
    .filter((pt) => {
      // Only show verified therapists in directory
      if (pt.verificationStatus !== 'verified') return false;

      // Search match
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = pt.fullName.toLowerCase().includes(q);
        const matchQual = pt.qualification.toLowerCase().includes(q);
        const matchSpec = pt.specializations.some((s) => s.toLowerCase().includes(q));
        const matchArea = pt.serviceAreas.some((a) => a.toLowerCase().includes(q));
        if (!matchName && !matchQual && !matchSpec && !matchArea) return false;
      }

      // Specialty match
      if (selectedSpecialty !== 'All') {
        if (!pt.specializations.some((s) => s.toLowerCase().includes(selectedSpecialty.toLowerCase()))) {
          return false;
        }
      }

      // City match
      if (selectedCity !== 'All') {
        if (!pt.clinicAddress?.toLowerCase().includes(selectedCity.toLowerCase()) && !pt.serviceAreas.some((a) => a.toLowerCase().includes(selectedCity.toLowerCase()))) {
          return false;
        }
      }

      // Modality match
      if (filterHomeVisit && !pt.offersHomeVisit) return false;
      if (filterClinic && !pt.offersClinicVisit) return false;
      if (filterOnline && !pt.offersOnline) return false;

      // Fee & Experience
      if (pt.consultationFee > maxFee) return false;
      if (pt.experienceYears < minExp) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'fee_asc') return a.consultationFee - b.consultationFee;
      if (sortBy === 'fee_desc') return b.consultationFee - a.consultationFee;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      return 0;
    });

  // SmartMatch transparent rule-based algorithm
  const runSmartMatch = () => {
    const candidates = therapists.filter((pt) => pt.verificationStatus === 'verified');
    let bestMatch: Physiotherapist | null = null;
    let highestScore = -1;

    for (const pt of candidates) {
      let score = 0;
      // Match need
      if (smartMatchNeed.includes('ACL') || smartMatchNeed.includes('Postoperative')) {
        if (pt.specializations.some((s) => s.includes('Orthopedic') || s.includes('Post-Surgical') || s.includes('Sports'))) score += 50;
      } else if (smartMatchNeed.includes('Stroke') || smartMatchNeed.includes('Neuro')) {
        if (pt.specializations.some((s) => s.includes('Neurological') || s.includes('Stroke'))) score += 50;
      } else if (smartMatchNeed.includes('Geriatric') || smartMatchNeed.includes('Balance')) {
        if (pt.specializations.some((s) => s.includes('Geriatric') || s.includes('Balance'))) score += 40;
      }

      // Modality match
      if (smartMatchMode === 'home' && pt.offersHomeVisit) score += 30;
      if (smartMatchMode === 'clinic' && pt.offersClinicVisit) score += 30;
      if (smartMatchMode === 'online' && pt.offersOnline) score += 30;

      // Budget match
      if (pt.consultationFee <= smartMatchBudget) score += 20;

      // Rating boost
      score += pt.rating * 5;

      if (score > highestScore) {
        highestScore = score;
        bestMatch = pt;
      }
    }

    setSmartMatchResult(bestMatch);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTherapist) return;
    setBookingLoading(true);

    try {
      const newApptId = 'appt-' + Date.now();
      const appointmentRecord = {
        id: newApptId,
        patientId: currentUser?.uid || 'guest-patient',
        patientName: userProfile?.fullName || 'Vikram Malhotra',
        patientPhone: userProfile?.mobile || '+91 98200 44556',
        therapistId: selectedTherapist.id,
        therapistName: selectedTherapist.fullName,
        consultationType: bookingType,
        date: bookingDate,
        timeSlot: bookingSlot,
        status: 'pending', // Pending Therapist confirmation
        fee: selectedTherapist.consultationFee,
        chiefComplaint: bookingComplaint || 'Physiotherapy rehabilitation consultation request',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'appointments', newApptId), appointmentRecord);
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setBookingModalOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Booking submission error:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Title & SmartMatch Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Verified Practitioner Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {isTransferMode ? 'Select Receiving Physiotherapist for Handover' : 'Find Qualified Physiotherapists'}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            {isTransferMode
              ? 'Choose a verified specialist to receive your portable Rehabilitation Passport'
              : 'Search state-council registered clinicians offering clinic, home-visit, and tele-rehab care'}
          </p>
        </div>

        {/* SmartMatch CTA */}
        <button
          onClick={() => {
            setSmartMatchOpen(true);
            runSmartMatch();
          }}
          className="bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 self-start lg:self-auto transition-all"
        >
          <Sparkles className="w-4 h-4 text-teal-200" />
          <span>SmartMatch Recommendation</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Text Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by clinician name, specialty (e.g. ACL, Stroke, Spine)..."
              className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Specialty Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="All">All Specialties</option>
              <option value="Orthopedic">Orthopedic Rehabilitation</option>
              <option value="Neurological">Neurological & Stroke</option>
              <option value="Sports">Sports Injuries</option>
              <option value="Cardiopulmonary">Cardiopulmonary Sciences</option>
              <option value="Geriatric">Geriatric & Balance</option>
            </select>
          </div>

          {/* City / Service Area Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="All">All Regions</option>
              <option value="Gurugram">Gurugram / NCR</option>
              <option value="Delhi">Delhi</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Chennai">Chennai</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="md:col-span-2 flex items-center justify-end gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              <span>Map View</span>
            </button>
          </div>
        </div>

        {/* Second Row: Detailed Badges & Sliders */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-700">Modalities:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filterHomeVisit}
                onChange={(e) => setFilterHomeVisit(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="flex items-center gap-1 text-slate-700">
                <Home className="w-3.5 h-3.5 text-slate-500" /> Home Visits
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filterClinic}
                onChange={(e) => setFilterClinic(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="flex items-center gap-1 text-slate-700">
                <Building className="w-3.5 h-3.5 text-slate-500" /> Clinic Care
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filterOnline}
                onChange={(e) => setFilterOnline(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="flex items-center gap-1 text-slate-700">
                <Video className="w-3.5 h-3.5 text-slate-500" /> Tele-Rehab
              </span>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Max Fee: ₹{maxFee}</span>
              <input
                type="range"
                min="600"
                max="2500"
                step="100"
                value={maxFee}
                onChange={(e) => setMaxFee(Number(e.target.value))}
                className="w-24 accent-blue-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-1 px-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                <option value="rating">Highest Rated</option>
                <option value="fee_asc">Lowest Fee</option>
                <option value="fee_desc">Highest Fee</option>
                <option value="experience">Most Experienced</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Content: List or Map View */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTherapists.map((pt) => (
            <div
              key={pt.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={pt.photoUrl}
                    alt={pt.fullName}
                    className="h-14 w-14 rounded-full object-cover border-2 border-slate-100 shadow-sm shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-slate-900">{pt.fullName}</h3>
                      <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-tight">{pt.qualification}</p>
                    <p className="text-[11px] text-teal-700 font-semibold mt-0.5">
                      Reg: {pt.registrationNumber}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                        {pt.rating}
                      </span>
                      <span>•</span>
                      <span>{pt.experienceYears} yrs</span>
                      <span>•</span>
                      <span>{pt.totalReviews} reviews</span>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1.5">
                  {pt.specializations.map((spec, i) => (
                    <span key={i} className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{pt.bio}</p>

                {/* Offerings badges */}
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 pt-1">
                  {pt.offersHomeVisit && (
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      <Home className="w-3 h-3" /> Home Visit
                    </span>
                  )}
                  {pt.offersClinicVisit && (
                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                      <Building className="w-3 h-3" /> Clinic
                    </span>
                  )}
                  {pt.offersOnline && (
                    <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                      <Video className="w-3 h-3" /> Tele-Rehab
                    </span>
                  )}
                </div>

                {/* Location & Fee */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-500 truncate max-w-[170px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{pt.serviceAreas.join(', ')}</span>
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 text-base">₹{pt.consultationFee}</span>
                    <span className="text-[10px] text-slate-500"> / {pt.sessionDurationMinutes}m</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
                {isTransferMode ? (
                  <button
                    onClick={() => {
                      if (onRequestTransfer) onRequestTransfer(pt);
                    }}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Request Transfer to {pt.fullName.split(',')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setSelectedTherapist(pt);
                        setBookingModalOpen(true);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition-colors"
                    >
                      Book Consultation
                    </button>
                    <button
                      onClick={() => setSelectedTherapist(pt)}
                      className="px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700"
                    >
                      Profile
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Map View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-teal-600" />
              <span className="font-semibold text-slate-800">
                Interactive Regional Service Coverage Map • Gurugram & Delhi NCR Hubs
              </span>
            </div>
            <div className="text-slate-500 text-[11px]">
              Displaying approximate clinical practice zones (Home-visit radii preserve private clinician residences)
            </div>
          </div>

          <div className="p-6 relative bg-gradient-to-br from-slate-100 via-blue-50/50 to-slate-100 min-h-[460px] flex items-center justify-center">
            {/* Visual Schematic Map Canvas */}
            <div className="w-full max-w-4xl h-[400px] bg-white rounded-2xl border border-slate-300 relative shadow-inner p-6 overflow-hidden">
              {/* Grid Lines simulating city topography */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: 'radial-gradient(#2563eb 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Highway / Metro line representation */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-blue-200/80 -rotate-6 transform"></div>
              <div className="absolute left-1/3 top-0 bottom-0 w-1 bg-teal-200/80 rotate-12 transform"></div>

              {/* Therapist Location Markers */}
              {filteredTherapists.map((pt, idx) => {
                // Preset representative coordinates for visual demo map
                const positions = [
                  { top: '35%', left: '28%' }, // Sector 44 Gurugram (Dr. Ananya)
                  { top: '48%', left: '55%' }, // Cyber City Phase 2 (Dr. Rajesh)
                  { top: '70%', left: '42%' }, // Bengaluru Studio (Dr. Meera)
                  { top: '25%', left: '72%' }, // Chennai Care (Dr. Arun)
                ];
                const pos = positions[idx % positions.length];

                return (
                  <div
                    key={pt.id}
                    onClick={() => setSelectedTherapist(pt)}
                    style={{ top: pos.top, left: pos.left }}
                    className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
                  >
                    {/* Radius Circle */}
                    <div className="w-24 h-24 rounded-full bg-teal-500/10 border border-teal-500/30 absolute -top-9 -left-9 pointer-events-none animate-pulse"></div>

                    {/* Marker Pin */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="h-11 w-11 rounded-full p-0.5 bg-gradient-to-tr from-blue-600 to-teal-500 shadow-lg group-hover:scale-110 transition-transform">
                        <img
                          src={pt.photoUrl}
                          alt={pt.fullName}
                          className="h-full w-full rounded-full object-cover"
                        />
                      </div>
                      <div className="mt-1 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                        {pt.fullName.split(' ')[1]} • ₹{pt.consultationFee}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Active Selected Marker Details Drawer */}
              {selectedTherapist && (
                <div className="absolute bottom-4 right-4 max-w-sm bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-slate-200 z-20 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      Selected Clinician
                    </span>
                    <button
                      onClick={() => setSelectedTherapist(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{selectedTherapist.fullName}</h4>
                  <p className="text-xs text-slate-600">{selectedTherapist.qualification}</p>
                  <p className="text-xs text-slate-500">Service Hub: {selectedTherapist.serviceAreas.join(', ')}</p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setBookingModalOpen(true)}
                      className="flex-1 bg-blue-600 text-white font-bold py-1.5 rounded-lg text-xs hover:bg-blue-700"
                    >
                      Book Session (₹{selectedTherapist.consultationFee})
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModalOpen && selectedTherapist && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Request Appointment</h3>
              </div>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-6 text-center space-y-2">
                <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-base text-slate-900">Appointment Request Submitted!</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your booking request has been sent to <strong>{selectedTherapist.fullName}</strong>. You will be notified in your patient portal once confirmed.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <p className="font-bold text-slate-900">{selectedTherapist.fullName}</p>
                  <p className="text-slate-600">{selectedTherapist.qualification}</p>
                  <p className="text-teal-700 font-semibold">
                    Consultation Fee: ₹{selectedTherapist.consultationFee} ({selectedTherapist.sessionDurationMinutes} min session)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Mode</label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setBookingType('clinic')}
                      className={`p-2 rounded-lg border font-medium flex flex-col items-center gap-1 ${
                        bookingType === 'clinic' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200'
                      }`}
                    >
                      <Building className="w-4 h-4" />
                      <span>Clinic</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingType('home')}
                      className={`p-2 rounded-lg border font-medium flex flex-col items-center gap-1 ${
                        bookingType === 'home' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200'
                      }`}
                    >
                      <Home className="w-4 h-4" />
                      <span>Home Visit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingType('online')}
                      className={`p-2 rounded-lg border font-medium flex flex-col items-center gap-1 ${
                        bookingType === 'online' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>Tele-Rehab</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Time Slot</label>
                    <select
                      value={bookingSlot}
                      onChange={(e) => setBookingSlot(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="10:00 AM - 10:45 AM">10:00 AM - 10:45 AM</option>
                      <option value="11:30 AM - 12:15 PM">11:30 AM - 12:15 PM</option>
                      <option value="04:00 PM - 04:45 PM">04:00 PM - 04:45 PM</option>
                      <option value="05:30 PM - 06:15 PM">05:30 PM - 06:15 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Chief Complaint / Condition</label>
                  <textarea
                    rows={2}
                    value={bookingComplaint}
                    onChange={(e) => setBookingComplaint(e.target.value)}
                    placeholder="e.g. Post-op knee rehab, acute back pain, stroke recovery..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
                >
                  {bookingLoading ? 'Submitting Request...' : 'Confirm Booking Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SmartMatch Modal */}
      {smartMatchOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-base text-slate-900">SmartMatch Therapist Recommendation</h3>
              </div>
              <button onClick={() => setSmartMatchOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Transparent, rule-based clinical matching based on your rehabilitation condition, preferred visit modality, and budget.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rehabilitation Need</label>
                <select
                  value={smartMatchNeed}
                  onChange={(e) => setSmartMatchNeed(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Postoperative Knee / ACL">Postoperative Knee / ACL Reconstruction</option>
                  <option value="Stroke & Neuro Recovery">Stroke & Neurological Recovery</option>
                  <option value="Sports Injury">Acute Sports Injury & Sprain</option>
                  <option value="Geriatric Mobility">Geriatric Mobility & Fall Prevention</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Setting</label>
                  <select
                    value={smartMatchMode}
                    onChange={(e) => setSmartMatchMode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="home">Home Visits</option>
                    <option value="clinic">Clinic Consultation</option>
                    <option value="online">Online Tele-Rehab</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Budget: Up to ₹{smartMatchBudget}</label>
                  <input
                    type="range"
                    min="800"
                    max="2000"
                    step="100"
                    value={smartMatchBudget}
                    onChange={(e) => setSmartMatchBudget(Number(e.target.value))}
                    className="w-full accent-teal-600 mt-2"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={runSmartMatch}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-xl text-xs"
              >
                Re-calculate Match
              </button>
            </div>

            {smartMatchResult && (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wide">
                    Top Recommended Match
                  </span>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" /> {smartMatchResult.rating}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{smartMatchResult.fullName}</h4>
                <p className="text-xs text-slate-700 leading-tight">
                  {smartMatchResult.qualification} • ₹{smartMatchResult.consultationFee}/session
                </p>
                <div className="p-2.5 bg-white/80 rounded-lg text-slate-600 text-[11px] border border-teal-100 flex items-start gap-1.5">
                  <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Why matched:</strong> Specializes in {smartMatchResult.specializations.slice(0, 2).join(', ')}, offers {smartMatchMode} consultations in your selected region, and fits your budget threshold.
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedTherapist(smartMatchResult);
                    setSmartMatchOpen(false);
                    setBookingModalOpen(true);
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-xl text-xs transition-colors"
                >
                  Book Consultation with {smartMatchResult.fullName.split(',')[0]}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
