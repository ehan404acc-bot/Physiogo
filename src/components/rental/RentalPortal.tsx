import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  Clock,
  ShieldCheck,
  Calendar,
  CheckCircle,
  Phone,
  MapPin,
  Truck,
  RotateCcw,
  Sparkles,
  Info,
  X,
  Search,
  Filter,
  Check,
  Package,
} from 'lucide-react';
import { EquipmentListing, EquipmentRequest } from '../../types';
import { SAMPLE_EQUIPMENT_LISTINGS } from '../../data/seedData';
import { db, collection, getDocs, doc, setDoc } from '../../lib/firebase';

export const RentalPortal: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [equipmentList, setEquipmentList] = useState<EquipmentListing[]>(SAMPLE_EQUIPMENT_LISTINGS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePortalTab, setActivePortalTab] = useState<'catalog' | 'my_rentals'>('catalog');

  // Booking Modal
  const [selectedItem, setSelectedItem] = useState<EquipmentListing | null>(null);
  const [orderType, setOrderType] = useState<'rental' | 'purchase'>('rental');
  const [rentalDays, setRentalDays] = useState<number>(14);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Flat 402, DLF Phase 5, Gurugram');
  const [contactPhone, setContactPhone] = useState<string>(userProfile?.mobile || '+91 98200 44556');
  const [patientFullName, setPatientFullName] = useState<string>(userProfile?.fullName || 'Vikram Malhotra');
  const [startDate, setStartDate] = useState<string>('2026-03-26');
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Active user rental orders
  const [myRentalOrders, setMyRentalOrders] = useState<any[]>([
    {
      id: 'eqreq-sample-01',
      equipmentName: 'Continuous Passive Motion (CPM) Knee Unit',
      category: 'Knee & Joint Rehabilitation',
      requestType: 'rental',
      rentalDays: 21,
      startDate: '2026-03-10',
      returnDate: '2026-03-31',
      status: 'active',
      dailyRate: 150,
      totalAmount: 3150,
      deliveryStatus: 'Delivered • Hospital Sanitized',
      depositRefundStatus: '₹2,000 Refundable Deposit Held',
    },
  ]);

  // Load from Firestore
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const snap = await getDocs(collection(db, 'equipmentListings'));
        if (!snap.empty) {
          const items: EquipmentListing[] = [];
          snap.forEach((d) => items.push(d.data() as EquipmentListing));
          setEquipmentList(items);
        }
      } catch (err) {
        console.warn('Using seed equipment listings:', err);
      }
    };
    fetchEquipment();
  }, []);

  const categories = [
    { id: 'all', label: 'All Equipment' },
    { id: 'Knee & Joint Rehabilitation', label: 'Knee & Hip CPM' },
    { id: 'Electrotherapy & Pain Relief', label: 'TENS & Electrotherapy' },
    { id: 'Mobility & Ambulation', label: 'Walkers & Crutches' },
    { id: 'Sports Rehabilitation', label: 'Resistance & Recovery' },
  ];

  const filteredEquipment = equipmentList.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmitting(true);

    const orderId = 'eqreq-' + Date.now();
    const newOrder = {
      id: orderId,
      equipmentId: selectedItem.id,
      equipmentName: selectedItem.name,
      equipmentPrice: selectedItem.price,
      requesterId: currentUser?.uid || 'guest-patient',
      requesterName: patientFullName,
      requesterPhone: contactPhone,
      requestType: orderType,
      rentalDays: orderType === 'rental' ? rentalDays : null,
      startDate,
      deliveryAddress,
      dailyRate: selectedItem.rentalPricePerDay || 60,
      totalAmount:
        orderType === 'rental'
          ? (selectedItem.rentalPricePerDay || 60) * rentalDays
          : selectedItem.price,
      status: 'pending',
      deliveryStatus: 'Scheduled for Sanitized Dispatch',
      depositRefundStatus: '₹1,500 Refundable Deposit upon return',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'equipmentRequests', orderId), newOrder);
      setMyRentalOrders((prev) => [newOrder, ...prev]);
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedItem(null);
        setActivePortalTab('my_rentals');
      }, 2000);
    } catch (err) {
      console.error('Failed to submit rental order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* RENTAL PORTAL HERO BANNER */}
      <div className="bg-gradient-to-r from-teal-800 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            <span>Dedicated Rehabilitation Equipment Rental Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Medical Rehabilitation Equipment Rental & Purchase
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Rent certified CPM machines, TENS stimulators, crutches, and recovery gear directly to your doorstep. Every device is hospital-grade sterilized, inspected, and pre-calibrated.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-teal-200">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-teal-300" /> Same-day doorstep delivery
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-300" /> Hospital-grade sanitized
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-teal-300" /> Free doorstep return pickup
            </span>
          </div>
        </div>

        {/* Portal Tab Switcher */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
          <button
            onClick={() => setActivePortalTab('catalog')}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
              activePortalTab === 'catalog'
                ? 'bg-teal-500 text-slate-950 shadow-teal-500/20'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Equipment Catalog</span>
          </button>
          <button
            onClick={() => setActivePortalTab('my_rentals')}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
              activePortalTab === 'my_rentals'
                ? 'bg-teal-500 text-slate-950 shadow-teal-500/20'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Active Rentals ({myRentalOrders.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW A: CATALOG VIEW */}
      {activePortalTab === 'catalog' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search equipment (e.g. CPM, TENS, Crutches)..."
                className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Category pills */}
            <div className="flex overflow-x-auto gap-1.5 w-full md:w-auto scrollbar-none pb-1 md:pb-0">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === c.id
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEquipment.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Image / Header */}
                  <div className="relative h-44 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                      {item.category}
                    </div>
                    <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3 h-3" /> Sanitized
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-snug">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Highlights */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Condition:</span>
                      <strong className="text-slate-900">{item.condition}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Hygiene Verification:</span>
                      <strong className="text-emerald-700">{item.readinessStatus}</strong>
                    </div>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    {item.isForRent && (
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Rental Rate</span>
                        <p className="text-base font-black text-teal-700">
                          ₹{item.rentalPricePerDay}
                          <span className="text-xs font-normal text-slate-500"> / day</span>
                        </p>
                      </div>
                    )}
                    {!item.isForRent && (
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Purchase Only</span>
                        <p className="text-base font-black text-slate-900">₹{item.price}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1.5">
                    {item.isForRent && (
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setOrderType('rental');
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm"
                      >
                        Rent Device
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setOrderType('purchase');
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                    >
                      Buy (₹{item.price})
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW B: MY ACTIVE RENTALS */}
      {activePortalTab === 'my_rentals' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900">Active Equipment Rentals</h2>
              <p className="text-xs text-slate-500">
                Track your active rental devices, scheduled delivery dates, and return pickups
              </p>
            </div>
            <button
              onClick={() => setActivePortalTab('catalog')}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-colors"
            >
              Rent Another Item
            </button>
          </div>

          <div className="space-y-4">
            {myRentalOrders.map((order, idx) => (
              <div
                key={order.id || idx}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{order.equipmentName}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      {order.status || 'Active Rental'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Order ID: #{order.id}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Rental Term</span>
                    <strong className="text-slate-900">{order.rentalDays || 14} Days</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Delivery Status</span>
                    <strong className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> {order.deliveryStatus || 'Delivered'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Daily Rate</span>
                    <strong className="text-slate-900">₹{order.dailyRate || 150}/day</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Security Deposit</span>
                    <strong className="text-blue-700">{order.depositRefundStatus}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <p className="text-xs text-slate-500">
                    Need help with calibration or device operation? Call our medical technician support at <strong>1800-419-7497</strong>.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert('Return pickup request scheduled! Our logistics partner will arrive tomorrow.')}
                      className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                    >
                      Schedule Return Pickup
                    </button>
                    <button
                      onClick={() => alert('Rental extended by 7 days. Receipt sent to your registered mobile number.')}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                    >
                      Extend Rental (+7 Days)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RENTAL / ORDER MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-base text-slate-900">
                  {orderType === 'rental' ? 'Rent Equipment' : 'Purchase Equipment'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-6 text-center space-y-2">
                <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-base text-slate-900">Order Confirmed!</h4>
                <p className="text-xs text-slate-600">
                  Your sanitized device has been scheduled for dispatch. We will send live GPS tracking to {contactPhone}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                {/* Item Summary */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{selectedItem.name}</h4>
                    <p className="text-slate-500 text-[11px]">{selectedItem.category}</p>
                    <p className="text-teal-700 font-bold mt-0.5">
                      {orderType === 'rental'
                        ? `₹${selectedItem.rentalPricePerDay}/day • Hospital Sterilized`
                        : `₹${selectedItem.price} (Brand New)`}
                    </p>
                  </div>
                </div>

                {/* Option Toggle */}
                {selectedItem.isForRent && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType('rental')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        orderType === 'rental'
                          ? 'border-teal-600 bg-teal-50 text-teal-900'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      Rent (₹{selectedItem.rentalPricePerDay}/day)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('purchase')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        orderType === 'purchase'
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      Buy New (₹{selectedItem.price})
                    </button>
                  </div>
                )}

                {/* Duration Slider if Rental */}
                {orderType === 'rental' && (
                  <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-teal-950">Rental Duration:</span>
                      <span className="font-black text-sm text-teal-800">{rentalDays} Days</span>
                    </div>
                    <input
                      type="range"
                      min="7"
                      max="60"
                      step="7"
                      value={rentalDays}
                      onChange={(e) => setRentalDays(Number(e.target.value))}
                      className="w-full accent-teal-600"
                    />
                    <div className="flex justify-between text-[11px] text-teal-800">
                      <span>7 Days (Min)</span>
                      <span>14 Days (Recommended)</span>
                      <span>60 Days</span>
                    </div>
                    <div className="pt-2 border-t border-teal-200 flex justify-between font-bold text-teal-950">
                      <span>Estimated Rental Total:</span>
                      <span>₹{(selectedItem.rentalPricePerDay || 60) * rentalDays}</span>
                    </div>
                  </div>
                )}

                {/* Patient Information & Delivery Address */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Patient / Recipient Name
                    </label>
                    <input
                      type="text"
                      required
                      value={patientFullName}
                      onChange={(e) => setPatientFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Street address, apartment, city, PIN code"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Includes free delivery, setup assistance, and hospital sanitation certificate.</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-teal-600/20 disabled:opacity-50 text-sm"
                >
                  {submitting
                    ? 'Processing Order...'
                    : orderType === 'rental'
                    ? `Confirm Rental Order (₹${(selectedItem.rentalPricePerDay || 60) * rentalDays})`
                    : `Confirm Purchase (₹${selectedItem.price})`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
