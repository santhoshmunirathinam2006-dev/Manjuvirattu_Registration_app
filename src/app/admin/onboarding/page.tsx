"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Upload,
  CheckCircle2,
  Building,
  Phone,
  MapPin,
  Clock,
  Layers,
  Ruler,
  Droplets,
  Wind,
  Armchair,
  Coffee,
  CircleDot,
  IndianRupee,
  AlertCircle,
} from "lucide-react";

const SAMPLE_INSIDE_IMAGES = [
  "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=800&auto=format&fit=crop&q=80",
];

const SAMPLE_OUTSIDE_IMAGES = [
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=80",
];

export default function AdminOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [name, setName] = useState("Apex Smash Badminton Arena & Sports Hub");
  const [adminName, setAdminName] = useState("Karthik Subramanian");
  const [adminPhone, setAdminPhone] = useState("9876543210");
  const [courtAddress, setCourtAddress] = useState("No. 42, BWF Boulevard, Indiranagar, Bengaluru, 560038");
  const [adminAddress, setAdminAddress] = useState("Tower B, Flat 401, Prestige Palms, Old Airport Road, Bengaluru");
  const [defaultOpenTime, setDefaultOpenTime] = useState("09:00");
  const [defaultCloseTime, setDefaultCloseTime] = useState("01:00");
  const [numCourts, setNumCourts] = useState(4);
  const [courtDimensions, setCourtDimensions] = useState("44 ft x 20 ft (BWF Standard)");
  const [pricePerHour, setPricePerHour] = useState(450);

  // Facilities
  const [hasDrinkingWater, setHasDrinkingWater] = useState(true);
  const [numFans, setNumFans] = useState(8);
  const [hasChairs, setHasChairs] = useState(true);
  const [hasNearbyJuiceShop, setHasNearbyJuiceShop] = useState(true);
  const [hasShuttlecocks, setHasShuttlecocks] = useState(true);
  const [shuttlecockCost, setShuttlecockCost] = useState(60);

  // 8 Images (4 inside + 4 outside)
  const [insideImages, setInsideImages] = useState<string[]>(SAMPLE_INSIDE_IMAGES);
  const [outsideImages, setOutsideImages] = useState<string[]>(SAMPLE_OUTSIDE_IMAGES);

  // Load existing if available
  useEffect(() => {
    fetch("/api/turf")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setName(data.name || "");
          setAdminName(data.adminName || "");
          setAdminPhone(data.adminPhone || "");
          setCourtAddress(data.courtAddress || "");
          setAdminAddress(data.adminAddress || "");
          setNumCourts(data.numCourts || 4);
          setCourtDimensions(data.courtDimensions || "44 ft x 20 ft (BWF Standard)");
          setPricePerHour(data.pricePerHour || 450);
          setHasDrinkingWater(data.hasDrinkingWater ?? true);
          setNumFans(data.numFans || 8);
          setHasChairs(data.hasChairs ?? true);
          setHasNearbyJuiceShop(data.hasNearbyJuiceShop ?? true);
          setHasShuttlecocks(data.hasShuttlecocks ?? true);
          setShuttlecockCost(data.shuttlecockCost || 60);
          if (data.insideImages?.length === 4) setInsideImages(data.insideImages);
          if (data.outsideImages?.length === 4) setOutsideImages(data.outsideImages);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (insideImages.length < 4 || outsideImages.length < 4) {
      setError("Mandatory: Exactly 4 inside images and 4 outside images are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/turf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          adminName,
          adminPhone,
          courtAddress,
          adminAddress,
          defaultOpenTime,
          defaultCloseTime,
          numCourts,
          courtDimensions,
          pricePerHour,
          hasDrinkingWater,
          numFans,
          hasChairs,
          hasNearbyJuiceShop,
          hasShuttlecocks,
          shuttlecockCost,
          insideImages,
          outsideImages,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save court details");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Shield className="w-8 h-8 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Admin Court Registration & Onboarding</h1>
              <p className="text-sm text-blue-100">
                Setup your badminton courts, mandatory 8 gallery images, default availability, and facility specifications.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="m-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-bold">Court registered successfully! Redirecting to dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Section 1: 8 Mandatory Photos */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              1. Mandatory Court Images (4 Inside + 4 Outside)
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Upload or configure high-resolution images. These appear directly on the client Flipkart-style booking showcase.
            </p>

            <div className="space-y-6">
              {/* 4 Inside Photos */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  4 Images INSIDE the Court (Mat, Lighting, Net, Boundary):
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {insideImages.map((img, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-28 rounded-lg overflow-hidden border border-slate-300 bg-slate-200 relative group">
                        <img src={img} alt={`Inside ${i + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                          Inside #{i + 1}
                        </span>
                      </div>
                      <input
                        type="url"
                        value={img}
                        onChange={(e) => {
                          const updated = [...insideImages];
                          updated[i] = e.target.value;
                          setInsideImages(updated);
                        }}
                        className="w-full text-[11px] p-1.5 border border-slate-300 rounded bg-white font-mono"
                        placeholder="Image URL"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 Outside Photos */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  4 Images OUTSIDE of the Court (Exterior, Parking, Lounge, Cafeteria):
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {outsideImages.map((img, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-28 rounded-lg overflow-hidden border border-slate-300 bg-slate-200 relative group">
                        <img src={img} alt={`Outside ${i + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                          Outside #{i + 1}
                        </span>
                      </div>
                      <input
                        type="url"
                        value={img}
                        onChange={(e) => {
                          const updated = [...outsideImages];
                          updated[i] = e.target.value;
                          setOutsideImages(updated);
                        }}
                        className="w-full text-[11px] p-1.5 border border-slate-300 rounded bg-white font-mono"
                        placeholder="Image URL"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 2: General Details */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              2. Court & Admin Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Court / Turf Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Admin Full Name *</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Admin Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price Per Hour (₹) *</label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    required
                    min={100}
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(Number(e.target.value))}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white font-semibold"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Court Physical Address *</label>
                <textarea
                  required
                  rows={2}
                  value={courtAddress}
                  onChange={(e) => setCourtAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Admin Address *</label>
                <textarea
                  required
                  rows={2}
                  value={adminAddress}
                  onChange={(e) => setAdminAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 3: Capacity & Dimensions */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              3. Court Capacity & Physical Specifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Number of Playgrounds / Courts Available *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={12}
                  value={numCourts}
                  onChange={(e) => setNumCourts(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Dimensions of Each Ground *
                </label>
                <input
                  type="text"
                  required
                  value={courtDimensions}
                  onChange={(e) => setCourtDimensions(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                  placeholder="e.g. 44 ft x 20 ft (BWF Standard)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Default Availability Schedule (Daily) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    disabled
                    value="09:00 AM"
                    className="w-1/2 p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 text-center"
                  />
                  <span className="text-xs text-slate-400 font-bold">TO</span>
                  <input
                    type="text"
                    disabled
                    value="01:00 AM (Next Day)"
                    className="w-1/2 p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 text-center"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Automatic 1-hour slots generated everyday</p>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 4: Facilities Checklist */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              4. Facility Checklist (Mandatory Details)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Drinking Water */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-semibold text-slate-800">Drinking Water</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHasDrinkingWater(true)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg ${
                      hasDrinkingWater ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-300"
                    }`}
                  >
                    YES
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasDrinkingWater(false)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg ${
                      !hasDrinkingWater ? "bg-red-600 text-white" : "bg-white text-slate-600 border border-slate-300"
                    }`}
                  >
                    NO
                  </button>
                </div>
              </div>

              {/* Number of Fans */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-sky-500" />
                  <span className="text-sm font-semibold text-slate-800">No. of Fans</span>
                </div>
                <input
                  type="number"
                  min={0}
                  value={numFans}
                  onChange={(e) => setNumFans(Number(e.target.value))}
                  className="w-16 p-1.5 bg-white border border-slate-300 rounded-lg text-sm text-center font-bold"
                />
              </div>

              {/* Chairs */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Armchair className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-semibold text-slate-800">Chairs / Seating</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHasChairs(true)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg ${
                      hasChairs ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-300"
                    }`}
                  >
                    YES
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasChairs(false)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg ${
                      !hasChairs ? "bg-red-600 text-white" : "bg-white text-slate-600 border border-slate-300"
                    }`}
                  >
                    NO
                  </button>
                </div>
              </div>

              {/* Nearby Juice Shop */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-semibold text-slate-800">Nearby Juice Shop</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHasNearbyJuiceShop(true)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg ${
                      hasNearbyJuiceShop ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-300"
                    }`}
                  >
                    YES
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasNearbyJuiceShop(false)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg ${
                      !hasNearbyJuiceShop ? "bg-red-600 text-white" : "bg-white text-slate-600 border border-slate-300"
                    }`}
                  >
                    NO
                  </button>
                </div>
              </div>

              {/* Shuttlecocks Available */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 sm:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CircleDot className="w-5 h-5 text-indigo-500" />
                    <span className="text-sm font-semibold text-slate-800">Shuttlecocks Available</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHasShuttlecocks(true)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg ${
                        hasShuttlecocks ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-300"
                      }`}
                    >
                      YES
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasShuttlecocks(false)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg ${
                        !hasShuttlecocks ? "bg-red-600 text-white" : "bg-white text-slate-600 border border-slate-300"
                      }`}
                    >
                      NO
                    </button>
                  </div>
                </div>

                {hasShuttlecocks && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-xs font-semibold text-slate-600">Cost per Shuttlecock (₹):</span>
                    <input
                      type="number"
                      min={10}
                      value={shuttlecockCost}
                      onChange={(e) => setShuttlecockCost(Number(e.target.value))}
                      className="w-24 p-1.5 bg-white border border-slate-300 rounded-lg text-sm text-center font-bold"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-base shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Saving Court Profile...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Save & Complete Admin Onboarding
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
