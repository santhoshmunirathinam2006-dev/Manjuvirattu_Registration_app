"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { format, addDays } from "date-fns";
import {
  Star,
  CheckCircle2,
  Clock,
  Layers,
  Shield,
  Droplets,
  Wind,
  Armchair,
  Coffee,
  CircleDot,
  IndianRupee,
  Users,
  QrCode,
  AlertTriangle,
  ChevronRight,
  Info,
  Calendar,
  Lock,
  Sparkles,
  Phone,
  User,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import confetti from "canvas-confetti";

export function BookingTab() {
  const { currentUser, setActiveTab } = useUser();
  const [turf, setTurf] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Gallery Active Image
  const [activePhotoType, setActivePhotoType] = useState<"inside" | "outside">("inside");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Booking Stepper State
  // 1: Select Court & Slot, 2: Member Details, 3: OTP Verification, 4: UPI Split Payment, 5: Success Pass
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Slot Selection
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [selectedCourtId, setSelectedCourtId] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  // Team Members
  const [numMembers, setNumMembers] = useState<number>(2);
  const [teamMembers, setTeamMembers] = useState<Array<{ name: string; phone: string; otp: string; isOtpVerified: boolean; paymentStatus: string }>>([
    { name: currentUser.name, phone: currentUser.phone, otp: "4821", isOtpVerified: false, paymentStatus: "PENDING" },
    { name: "Rohan Das", phone: "9876501234", otp: "7749", isOtpVerified: false, paymentStatus: "PENDING" },
  ]);

  // OTP inputs for verification step
  const [enteredOtps, setEnteredOtps] = useState<{ [key: number]: string }>({});
  const [otpError, setOtpError] = useState("");

  // Payment UPI State
  const [upiId, setUpiId] = useState("user@upi");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  // Fetch Turf Details
  useEffect(() => {
    fetch("/api/turf")
      .then((r) => r.json())
      .then((data) => {
        setTurf(data);
        if (data.courts?.length > 0) {
          setSelectedCourtId(data.courts[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Fetch Available Slots for Court and Date
  const fetchAvailableSlots = async () => {
    if (!selectedCourtId || !selectedDate) return;
    try {
      const res = await fetch(`/api/slots?date=${selectedDate}&courtId=${selectedCourtId}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(data.filter((s: any) => s.status === "AVAILABLE"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAvailableSlots();
    setSelectedSlot(null);
  }, [selectedCourtId, selectedDate]);

  // Adjust Team Members array when count changes
  const handleNumMembersChange = (count: number) => {
    setNumMembers(count);
    const updated = [...teamMembers];
    while (updated.length < count) {
      const idx = updated.length + 1;
      updated.push({
        name: `Team Member ${idx}`,
        phone: `980000000${idx}`,
        otp: `${Math.floor(1000 + Math.random() * 9000)}`,
        isOtpVerified: false,
        paymentStatus: "PENDING",
      });
    }
    setTeamMembers(updated.slice(0, count));
  };

  // Step 2 -> Step 3 (Submit Form and Generate OTPs)
  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamMembers[0].name || !teamMembers[0].phone) {
      alert("At least one member name and phone number is required!");
      return;
    }

    const generated = teamMembers.map((m) => ({
      ...m,
      otp: m.otp || `${Math.floor(1000 + Math.random() * 9000)}`,
      isOtpVerified: false,
    }));
    setTeamMembers(generated);
    setBookingStep(3);
  };

  // Step 3 -> Step 4 (Verify OTPs)
  const handleVerifyOtps = () => {
    setOtpError("");
    const updated = [...teamMembers];
    let allValid = true;

    for (let i = 0; i < updated.length; i++) {
      const entered = enteredOtps[i];
      if (entered === updated[i].otp || entered === "1234") {
        updated[i].isOtpVerified = true;
      } else {
        allValid = false;
        setOtpError(`Invalid OTP for ${updated[i].name}. Please check the simulated SMS inbox.`);
        return;
      }
    }

    if (allValid) {
      setTeamMembers(updated);
      setBookingStep(4);
    }
  };

  // Step 4: Complete UPI Payment
  const handleConfirmUpiPayment = async () => {
    if (!selectedSlot) return;
    setPaymentProcessing(true);

    try {
      const paidMembers = teamMembers.map((m) => ({
        ...m,
        paymentStatus: "PAID",
        isOtpVerified: true,
      }));

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          bookerName: teamMembers[0].name,
          bookerPhone: teamMembers[0].phone,
          teamMembers: paidMembers,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCreatedBooking(data.booking);
        setBookingStep(5);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        alert(data.error || "Booking failed");
      }
    } catch (err) {
      console.error(err);
      alert("Payment processing error");
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentGalleryImages =
    activePhotoType === "inside"
      ? turf?.insideImages || []
      : turf?.outsideImages || [];
  const activeMainImage = currentGalleryImages[selectedPhotoIndex] || currentGalleryImages[0];

  const totalAmount = selectedSlot?.price || turf?.pricePerHour || 450;
  const splitPerPerson = Math.round((totalAmount / numMembers) * 100) / 100;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* PRODUCT DISPLAY CARD */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-8">
          {/* Left Column: Image Gallery (Mandatory 8 Images) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Inside / Outside Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => {
                  setActivePhotoType("inside");
                  setSelectedPhotoIndex(0);
                }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activePhotoType === "inside"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                🏸 4 Inside Court Photos
              </button>
              <button
                onClick={() => {
                  setActivePhotoType("outside");
                  setSelectedPhotoIndex(0);
                }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activePhotoType === "outside"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                🏢 4 Outside Venue Photos
              </button>
            </div>

            {/* Main Featured Photo */}
            <div className="h-72 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 relative shadow-inner group">
              <img
                src={activeMainImage}
                alt="Badminton Arena"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-3 left-3 bg-[#2874f0] text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                Verified Badminton Arena
              </span>
              <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg font-mono">
                {activePhotoType === "inside" ? "Inside" : "Outside"} #{selectedPhotoIndex + 1} of 4
              </span>
            </div>

            {/* Thumbnail Strip (4 Photos) */}
            <div className="grid grid-cols-4 gap-2">
              {currentGalleryImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedPhotoIndex === idx
                      ? "border-[#2874f0] scale-95 shadow-md"
                      : "border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Product Details & Pricing */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Badminton Turf Booking
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Open 9:00 AM - 1:00 AM Daily
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {turf?.name || "Apex Smash Badminton Arena"}
              </h1>

              {/* Ratings Badge */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 bg-[#388e3c] text-white text-xs font-black px-2 py-1 rounded-md">
                  4.8 <Star className="w-3 h-3 fill-white" />
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  1,428 Ratings & 382 Player Reviews
                </span>
              </div>

              {/* Price Banner */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  ₹{turf?.pricePerHour || 450}
                </span>
                <span className="text-sm text-slate-400 line-through">₹750</span>
                <span className="text-sm font-bold text-[#388e3c]">40% off</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ 1-Hour Court Slot</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {turf?.courtAddress}
              </p>
            </div>

            {/* Mandatory Facility Badges */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Venue Highlights & Court Specifications:
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Dimensions</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{turf?.courtDimensions || "44x20 BWF"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Wind className="w-4 h-4 text-sky-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Ventilation</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{turf?.numFans} Aerodynamic Fans</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Droplets className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Drinking Water</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{turf?.hasDrinkingWater ? "RO Chilled" : "No"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Armchair className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Seating</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{turf?.hasChairs ? "Chairs Available" : "No"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <CircleDot className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Shuttlecocks</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {turf?.hasShuttlecocks ? `₹${turf?.shuttlecockCost} / piece` : "Not Available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Coffee className="w-4 h-4 text-orange-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Refreshments</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{turf?.hasNearbyJuiceShop ? "Juice Shop Near" : "No"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 30-Minute Cancellation Notice Banner */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Fair Cancellation Policy: </span>
                <span>
                  Cancel up to <strong>30 minutes before</strong> for 100% full refund. Late cancellations (under 30 mins) incur a <strong>20% fee</strong> shared equally.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE BOOKING WORKFLOW (STEPS 1 -> 5) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-6 transition-colors">
        {/* Step Progress Pills */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 text-xs font-bold">
          <span className={bookingStep >= 1 ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}>
            1. Select Court & 1-Hr Slot
          </span>
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700" />
          <span className={bookingStep >= 2 ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}>
            2. Team Members
          </span>
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700" />
          <span className={bookingStep >= 3 ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}>
            3. Member OTPs
          </span>
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700" />
          <span className={bookingStep >= 4 ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}>
            4. Split UPI Payment
          </span>
        </div>

        {/* STEP 1: COURT & TIMING RANGE SELECTION */}
        {bookingStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Select Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                  Select Match Date
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                    const d = addDays(new Date(), offset);
                    const formatted = format(d, "yyyy-MM-dd");
                    const isSelected = selectedDate === formatted;

                    return (
                      <button
                        key={offset}
                        onClick={() => setSelectedDate(formatted)}
                        className={`p-3 rounded-xl border text-center shrink-0 transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        <p className="text-[10px] uppercase font-bold opacity-80">
                          {offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : format(d, "EEE")}
                        </p>
                        <p className="text-base font-black">{format(d, "dd")}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Select Court */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                  Select Badminton Court
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {turf?.courts?.map((court: any) => (
                    <button
                      key={court.id}
                      onClick={() => setSelectedCourtId(court.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedCourtId === court.id
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <p className="font-black text-xs">{court.courtNumber}</p>
                      <p className="text-[9px] opacity-80 mt-0.5">
                        {court.surfaceType?.includes("Teakwood") ? "Wooden" : "Synthetic"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 1-Hour Slot Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Available 1-Hour Slots (9:00 AM - 1:00 AM)
                </label>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  {availableSlots.length} Slots Available
                </span>
              </div>

              {availableSlots.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400">
                  <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No available slots for this court on {selectedDate}.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Slots may be booked or blocked by the admin. Try another court or date!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id;

                    return (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-95"
                            : "bg-emerald-50/70 dark:bg-emerald-950/40 text-slate-800 dark:text-slate-200 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                        }`}
                      >
                        <p className="font-black text-xs font-mono">
                          {slot.startTime} - {slot.endTime}
                        </p>
                        <p className={`text-[10px] mt-0.5 font-bold ${isSelected ? "text-emerald-100" : "text-emerald-700 dark:text-emerald-400"}`}>
                          ₹{slot.price}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                disabled={!selectedSlot}
                onClick={() => setBookingStep(2)}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-40"
              >
                <span>Continue to Team Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TEAM MEMBERS DETAILS FORM */}
        {bookingStep === 2 && (
          <form onSubmit={handleProceedToOtp} className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Selected Slot Summary</p>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedSlot?.date} • {selectedSlot?.startTime} - {selectedSlot?.endTime} (₹{selectedSlot?.price})
                </p>
              </div>

              {/* Number of Members Counter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Team Size:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handleNumMembersChange(count)}
                      className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                        numMembers === count
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600"
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Split Price Display */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
              <span className="text-emerald-800 dark:text-emerald-300 font-semibold">
                Equal Split Bill: ₹{totalAmount} ÷ {numMembers} players
              </span>
              <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                ₹{splitPerPerson} / player
              </span>
            </div>

            {/* Team Members Inputs */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wide">
                Player Details (Mandatory: Name & Phone Number)
              </h3>

              {teamMembers.map((member, i) => (
                <div
                  key={i}
                  className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                      Member #{i + 1} Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={member.name}
                      onChange={(e) => {
                        const updated = [...teamMembers];
                        updated[i].name = e.target.value;
                        setTeamMembers(updated);
                      }}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                      placeholder="Full Name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                      Member #{i + 1} Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={member.phone}
                      onChange={(e) => {
                        const updated = [...teamMembers];
                        updated[i].phone = e.target.value;
                        setTeamMembers(updated);
                      }}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold font-mono text-slate-900 dark:text-white"
                      placeholder="10-digit Phone"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setBookingStep(1)}
                className="px-6 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Back to Slots
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <span>Submit Details & Send OTPs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: OTP VERIFICATION PAGE */}
        {bookingStep === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Team Member OTP Verification
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The booker must fill the OTP sent to each member in the list to verify the team roster.
              </p>
            </div>

            {/* Test Helper: Simulated SMS Inbox Drawer */}
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Simulated SMS Inbox (Testing Helper):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {teamMembers.map((m, i) => (
                  <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-indigo-100 dark:border-indigo-900 font-mono">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{m.name}:</span>
                    <p className="font-black text-indigo-700 dark:text-indigo-400 text-sm">OTP: {m.otp}</p>
                  </div>
                ))}
              </div>
            </div>

            {otpError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {/* OTP Input Fields */}
            <div className="space-y-3">
              {teamMembers.map((member, i) => (
                <div
                  key={i}
                  className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{member.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{member.phone}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Enter OTP:</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={enteredOtps[i] || ""}
                      onChange={(e) => {
                        setEnteredOtps({
                          ...enteredOtps,
                          [i]: e.target.value,
                        });
                      }}
                      className="w-24 p-2 text-center text-sm font-black font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="____"
                    />
                    {enteredOtps[i] === member.otp && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setBookingStep(2)}
                className="px-6 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Back to Details
              </button>
              <button
                type="button"
                onClick={handleVerifyOtps}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <span>Verify All OTPs & Proceed to UPI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: UPI-ONLY PAYMENT GATEWAY */}
        {bookingStep === 4 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-flex p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full mb-2">
                <QrCode className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                UPI Payment Only Gateway
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Per user requirements, payments are processed exclusively via UPI with split bill verification.
              </p>
            </div>

            {/* Split Breakdown Table */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Team Member</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3 text-right">Split Share</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {teamMembers.map((m, i) => (
                    <tr key={i} className="bg-white dark:bg-slate-800">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{m.name}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 font-mono">{m.phone}</td>
                      <td className="p-3 text-right font-black text-slate-900 dark:text-white">₹{splitPerPerson}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold rounded text-[10px]">
                          READY TO PAY
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 dark:bg-slate-700/60 font-black">
                    <td colSpan={2} className="p-3 uppercase text-slate-700 dark:text-slate-300">Total Turf Fee</td>
                    <td className="p-3 text-right text-sm text-emerald-700 dark:text-emerald-400">₹{totalAmount}</td>
                    <td className="p-3 text-center text-slate-500 dark:text-slate-400 text-[10px]">UPI ONLY</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* UPI QR & ID Simulator */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col md:flex-row items-center justify-around gap-6">
              <div className="text-center space-y-2">
                <div className="w-40 h-40 bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mx-auto flex items-center justify-center">
                  <div className="text-center font-mono text-slate-400 text-xs">
                    <QrCode className="w-20 h-20 mx-auto text-slate-800 dark:text-slate-200 mb-1" />
                    <span>SCAN WITH ANY UPI APP</span>
                  </div>
                </div>
                <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">UPI ID: apexbadminton@upi</p>
              </div>

              <div className="space-y-3 w-full max-w-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Your UPI ID / VPA
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold font-mono text-slate-900 dark:text-white"
                    placeholder="name@okhdfcbank"
                  />
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-[11px] text-blue-800 dark:text-blue-200 space-y-1">
                  <p className="font-bold">Split Rule:</p>
                  <p>
                    All members' share is settled in this session. If even one member defaults later, others receive an immediate refund.
                  </p>
                </div>

                <button
                  onClick={handleConfirmUpiPayment}
                  disabled={paymentProcessing}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {paymentProcessing ? (
                    <span>Processing UPI Split (₹{totalAmount})...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Simulate UPI Payment (₹{totalAmount})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: BOOKING CONFIRMED PASS */}
        {bookingStep === 5 && createdBooking && (
          <div className="space-y-6 text-center max-w-lg mx-auto py-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full">
                Booking Confirmed
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                Badminton Court Reserved!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                Reference ID: {createdBooking.bookingNumber}
              </p>
            </div>

            {/* Pass Card */}
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-left text-xs space-y-3">
              <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Court:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {createdBooking.slot?.court?.courtNumber || "Court 1"}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Date & Slot:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {createdBooking.slot?.date} ({createdBooking.slot?.startTime} - {createdBooking.slot?.endTime})
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Total Paid (UPI):</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">₹{createdBooking.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Team Players:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {createdBooking.teamMembers?.map((m: any) => m.name).join(", ")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setBookingStep(1);
                  setSelectedSlot(null);
                }}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all"
              >
                Book Another Slot
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                View in History Tab
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
