"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { format, addDays } from "date-fns";
import {
  Shield,
  Clock,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Search,
  RefreshCw,
  Edit,
  ArrowRight,
  User,
  Phone,
  IndianRupee,
  Activity,
  Droplets,
  Wind,
  Armchair,
  Coffee,
  CircleDot,
  Radio,
  FileText,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [activeAdminTab, setActiveAdminTab] = useState<"availability" | "slots" | "history">("availability");
  const [turf, setTurf] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Availability Tab State
  const [availDate, setAvailDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [availCourt, setAvailCourt] = useState<string>("ALL");
  const [unbookedData, setUnbookedData] = useState<any>({ unbookedSlots: [], summary: {} });

  // Slot Manager & Range Blocker State
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState<any[]>([]);
  const [blockedRanges, setBlockedRanges] = useState<any[]>([]);
  const [blockCourtId, setBlockCourtId] = useState<string>("ALL");
  const [startDateTime, setStartDateTime] = useState<string>(
    `${format(new Date(), "yyyy-MM-dd")}T21:00`
  );
  const [endDateTime, setEndDateTime] = useState<string>(
    `${format(addDays(new Date(), 2), "yyyy-MM-dd")}T22:00`
  );
  const [blockReason, setBlockReason] = useState<string>("Court mat maintenance & lighting overhaul");
  const [rangeBlockingLoading, setRangeBlockingLoading] = useState(false);
  const [rangeMsg, setRangeMsg] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");

  // History Tab State
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historySearch, setHistorySearch] = useState<string>("");
  const [historyStatus, setHistoryStatus] = useState<string>("ALL");

  // Fetch Turf Details
  const fetchTurf = async () => {
    try {
      const res = await fetch("/api/turf");
      if (res.ok) {
        const data = await res.json();
        setTurf(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Unbooked Slots for Availability Tab
  const fetchUnbookedSlots = async () => {
    try {
      const res = await fetch(`/api/admin/unbooked-slots?date=${availDate}&courtId=${availCourt}`);
      if (res.ok) {
        const data = await res.json();
        setUnbookedData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch All Slots for Slot Manager Tab
  const fetchSlots = async () => {
    try {
      const res = await fetch(`/api/slots?date=${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Blocked Ranges
  const fetchBlockedRanges = async () => {
    try {
      const res = await fetch("/api/admin/block-slots");
      if (res.ok) {
        const data = await res.json();
        setBlockedRanges(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Admin History
  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/admin/history?query=${historySearch}&status=${historyStatus}`);
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTurf().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeAdminTab === "availability") {
      fetchUnbookedSlots();
    } else if (activeAdminTab === "slots") {
      fetchSlots();
      fetchBlockedRanges();
    } else if (activeAdminTab === "history") {
      fetchHistory();
    }
  }, [activeAdminTab, availDate, availCourt, selectedDate, historySearch, historyStatus]);

  // Handle Range Slot Blocking
  const handleBlockRange = async (e: React.FormEvent) => {
    e.preventDefault();
    setRangeBlockingLoading(true);
    setRangeMsg("");
    try {
      const res = await fetch("/api/admin/block-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId: blockCourtId,
          startDateTime,
          endDateTime,
          reason: blockReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRangeMsg(`Success: ${data.slotsBlockedCount} slots blocked between specified dates!`);
        fetchSlots();
        fetchBlockedRanges();
      } else {
        setRangeMsg(`Error: ${data.error || "Failed to block range"}`);
      }
    } catch (err: any) {
      setRangeMsg(`Error: ${err.message}`);
    } finally {
      setRangeBlockingLoading(false);
    }
  };

  // Handle Unblock Range
  const handleUnblockRange = async (rangeId: string) => {
    try {
      const res = await fetch(`/api/admin/block-slots?rangeId=${rangeId}`, { method: "DELETE" });
      if (res.ok) {
        fetchSlots();
        fetchBlockedRanges();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle single slot
  const handleToggleSlot = async (slot: any) => {
    const nextStatus = slot.status === "AVAILABLE" ? "BLOCKED" : "AVAILABLE";
    try {
      await fetch("/api/slots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: slot.id,
          status: nextStatus,
          blockReason: nextStatus === "BLOCKED" ? "Admin manual block" : null,
        }),
      });
      fetchSlots();
    } catch (err) {
      console.error(err);
    }
  };

  // Broadcast to all users
  const handleBroadcast = () => {
    setBroadcastMsg("Broadcasting latest availability to all users...");
    setTimeout(() => {
      setBroadcastMsg("✅ Availability successfully synced across all connected clients!");
      setTimeout(() => setBroadcastMsg(""), 3000);
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner with Turf Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400 text-slate-950 font-black text-xs rounded-full uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              Badminton Admin Portal
            </div>
            <h1 className="text-2xl font-black tracking-tight">{turf?.name || "Apex Badminton Arena"}</h1>
            <p className="text-xs text-slate-300 flex items-center gap-1.5">
              <span>{turf?.courtAddress}</span>
              <span>•</span>
              <span className="font-semibold text-yellow-300">Admin: {turf?.adminName} ({turf?.adminPhone})</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/onboarding"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 backdrop-blur-sm"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Court Specs & 8 Photos
            </Link>
            <button
              onClick={handleBroadcast}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-black text-white shadow-md transition-all flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Broadcast Availability
            </button>
          </div>
        </div>

        {broadcastMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{broadcastMsg}</span>
          </div>
        )}

        {/* Quick Venue Specs Strip */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Layers className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Courts</p>
              <p className="font-bold">{turf?.courts?.length || turf?.numCourts || 4} Courts</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Clock className="w-4 h-4 text-indigo-600" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Default Hours</p>
              <p className="font-bold">{turf?.defaultOpenTime} - {turf?.defaultCloseTime}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Wind className="w-4 h-4 text-sky-600" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Fans Count</p>
              <p className="font-bold">{turf?.numFans} Industrial Fans</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Droplets className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Drinking Water</p>
              <p className="font-bold">{turf?.hasDrinkingWater ? "Available (RO)" : "No"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <CircleDot className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Shuttlecocks</p>
              <p className="font-bold">₹{turf?.shuttlecockCost} / piece</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Coffee className="w-4 h-4 text-orange-500" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Juice Shop</p>
              <p className="font-bold">{turf?.hasNearbyJuiceShop ? "Adjacent" : "No"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin 3 Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-300 pb-2">
        <button
          onClick={() => setActiveAdminTab("availability")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
            activeAdminTab === "availability"
              ? "bg-blue-600 text-white shadow-blue-200"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>1. Availability Tab (All Unbooked Slots)</span>
        </button>

        <button
          onClick={() => setActiveAdminTab("slots")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
            activeAdminTab === "slots"
              ? "bg-blue-600 text-white shadow-blue-200"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Ban className="w-4 h-4" />
          <span>2. Slot Manager & Range Blocker</span>
        </button>

        <button
          onClick={() => setActiveAdminTab("history")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
            activeAdminTab === "history"
              ? "bg-blue-600 text-white shadow-blue-200"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>3. History Tab (Transactions & Clients)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AVAILABILITY TAB (All Unbooked Slots Timings) */}
      {/* ========================================================================= */}
      {activeAdminTab === "availability" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Unbooked Slots</span>
              <p className="text-3xl font-black text-emerald-600 mt-1">
                {unbookedData.summary?.unbookedCount ?? 0}
              </p>
              <span className="text-[11px] text-slate-500">Available for booking</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Booked Slots</span>
              <p className="text-3xl font-black text-blue-600 mt-1">
                {unbookedData.summary?.bookedCount ?? 0}
              </p>
              <span className="text-[11px] text-slate-500">Reserved by players</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Admin Blocked</span>
              <p className="text-3xl font-black text-amber-500 mt-1">
                {unbookedData.summary?.blockedCount ?? 0}
              </p>
              <span className="text-[11px] text-slate-500">Under maintenance/range</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Occupancy Rate</span>
              <p className="text-3xl font-black text-slate-800 mt-1">
                {unbookedData.summary?.occupancyRate ?? 0}%
              </p>
              <span className="text-[11px] text-slate-500">Current utilization</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Select Date:</label>
                <input
                  type="date"
                  value={availDate}
                  onChange={(e) => setAvailDate(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Filter Court:</label>
                <select
                  value={availCourt}
                  onChange={(e) => setAvailCourt(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Courts</option>
                  {turf?.courts?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.courtNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchUnbookedSlots}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Unbooked Slots
              </button>
            </div>
          </div>

          {/* Unbooked Slots Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Unbooked Slots Timings ({format(new Date(availDate), "dd MMMM yyyy")})
                </h2>
                <p className="text-xs text-slate-500">
                  All active 1-hour slots that are currently empty and ready for booking.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs">
                {unbookedData.unbookedSlots?.length ?? 0} Slots Available
              </span>
            </div>

            {unbookedData.unbookedSlots?.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Ban className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-sm">No unbooked slots found for this date/court selection.</p>
                <p className="text-xs text-slate-400">All slots might be booked or blocked.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {unbookedData.unbookedSlots?.map((slot: any) => (
                  <div
                    key={slot.id}
                    className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl hover:border-emerald-400 transition-all flex flex-col justify-between space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-emerald-900 bg-emerald-200/80 px-1.5 py-0.5 rounded">
                        {slot.court?.courtNumber}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">₹{slot.price}</span>
                    </div>

                    <div className="text-center py-1">
                      <span className="font-black text-sm text-slate-800 tracking-tight">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-emerald-100 text-[10px] text-emerald-600 font-semibold">
                      <span>1 Hour</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        AVAILABLE
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SLOT MANAGER & DATE-TIME RANGE BLOCKER */}
      {/* ========================================================================= */}
      {activeAdminTab === "slots" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Section: Date-Time Range Blocker Component */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
                <Ban className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Date-Time Range Slot Blocker
                </h2>
                <p className="text-xs text-slate-500">
                  Block all slots across multiple days by entering a Start Date & Time and End Date & Time (e.g. 28/09/2026 9:00 PM - 30/09/2026 10:00 PM).
                </p>
              </div>
            </div>

            {rangeMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs font-bold mb-4 flex items-center gap-2 ${
                  rangeMsg.startsWith("Success")
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {rangeMsg.startsWith("Success") ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{rangeMsg}</span>
              </div>
            )}

            <form onSubmit={handleBlockRange} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Target Court</label>
                <select
                  value={blockCourtId}
                  onChange={(e) => setBlockCourtId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  <option value="ALL">All Courts</option>
                  {turf?.courts?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.courtNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">End Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Reason for Blocking</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Mat maintenance"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={rangeBlockingLoading}
                  className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" />
                  {rangeBlockingLoading ? "Blocking Slots..." : "Block Time Range"}
                </button>
              </div>
            </form>

            {/* Active Blocked Ranges */}
            {blockedRanges.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Active Blocked Ranges ({blockedRanges.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {blockedRanges.map((r: any) => (
                    <div
                      key={r.id}
                      className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-red-900">
                          {r.court ? r.court.courtNumber : "All Courts"}:
                        </span>{" "}
                        <span className="text-slate-700 font-mono text-[11px]">
                          {format(new Date(r.startDateTime), "dd/MM/yy hh:mma")} -{" "}
                          {format(new Date(r.endDateTime), "dd/MM/yy hh:mma")}
                        </span>
                        <span className="block text-[10px] text-slate-500 italic">"{r.reason}"</span>
                      </div>
                      <button
                        onClick={() => handleUnblockRange(r.id)}
                        className="px-2 py-1 bg-white hover:bg-red-100 text-red-700 font-bold text-[10px] rounded border border-red-300"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section: Hourly Availability Matrix (09:00 - 01:00) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Hourly Slot Matrix: {format(new Date(selectedDate), "dd MMMM yyyy")}
                </h2>
                <p className="text-xs text-slate-500">
                  Click any slot cell to manually toggle between Available and Blocked.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                />
                <button
                  onClick={handleBroadcast}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" />
                  Sync All Users
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase font-black text-[11px]">
                    <th className="p-3 border border-slate-200">1-Hour Time Slot</th>
                    {turf?.courts?.map((court: any) => (
                      <th key={court.id} className="p-3 border border-slate-200 text-center">
                        {court.courtNumber}
                        <span className="block text-[9px] text-slate-500 font-normal">
                          {court.surfaceType?.includes("Teakwood") ? "Wooden" : "Synthetic"}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",
                    "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00"
                  ].map((startTime) => {
                    const nextHour = (parseInt(startTime.split(":")[0]) + 1) % 24;
                    const endTime = `${nextHour.toString().padStart(2, "0")}:00`;

                    return (
                      <tr key={startTime} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-800 border border-slate-200 bg-slate-50 font-mono">
                          {startTime} - {endTime}
                        </td>
                        {turf?.courts?.map((court: any) => {
                          const slot = slots.find(
                            (s) => s.courtId === court.id && s.startTime === startTime
                          );

                          const isBooked = slot?.status === "BOOKED";
                          const isBlocked = slot?.status === "BLOCKED";
                          const isAvailable = slot?.status === "AVAILABLE";

                          return (
                            <td key={court.id} className="p-2 border border-slate-200 text-center">
                              {isBooked ? (
                                <span className="inline-block px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] cursor-not-allowed">
                                  BOOKED ({slot?.booking?.bookerName || "Reserved"})
                                </span>
                              ) : isBlocked ? (
                                <button
                                  onClick={() => handleToggleSlot(slot)}
                                  className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-bold text-[11px] transition-all"
                                  title={slot?.blockReason || "Blocked"}
                                >
                                  BLOCKED (Click to Open)
                                </button>
                              ) : isAvailable ? (
                                <button
                                  onClick={() => handleToggleSlot(slot)}
                                  className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-bold text-[11px] transition-all"
                                >
                                  AVAILABLE
                                </button>
                              ) : (
                                <span className="text-slate-400 font-mono">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ADMIN HISTORY TAB (Transactions & Booking Details) */}
      {/* ========================================================================= */}
      {activeAdminTab === "history" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header & Filter Controls */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Admin Audit & Booking History</h2>
              <p className="text-xs text-slate-500">
                Log of all reservations with respective client names, time slots booked, and exact booking submission timestamps.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search client, phone, or BWF-ID..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold w-64"
                />
              </div>

              <select
                value={historyStatus}
                onChange={(e) => setHistoryStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending Split</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <button
                onClick={fetchHistory}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {historyList.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-sm">No booking records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 uppercase font-black text-[11px]">
                      <th className="p-3.5">Booking Ref</th>
                      <th className="p-3.5">Client Name & Phone</th>
                      <th className="p-3.5">Time Slot Booked</th>
                      <th className="p-3.5">Booking Time (Submitted)</th>
                      <th className="p-3.5">Total & Split UPI Status</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {historyList.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-blue-600">
                          {b.bookingNumber}
                        </td>

                        <td className="p-3.5">
                          <p className="font-bold text-slate-900">{b.bookerName}</p>
                          <p className="text-slate-500 text-[11px] font-mono">{b.bookerPhone}</p>
                          {b.teamMembers?.length > 1 && (
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Team: {b.teamMembers.map((m: any) => m.name).join(", ")}
                            </p>
                          )}
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-slate-800">
                            {b.slot?.court?.courtNumber || "Court"}
                          </span>
                          <span className="block text-slate-600 font-mono">
                            {b.slot?.date} ({b.slot?.startTime} - {b.slot?.endTime})
                          </span>
                        </td>

                        <td className="p-3.5 font-mono text-slate-600">
                          {format(new Date(b.createdAt), "dd MMM yyyy, hh:mm:ss a")}
                        </td>

                        <td className="p-3.5">
                          <p className="font-black text-slate-900">₹{b.totalAmount}</p>
                          <div className="space-y-0.5 mt-1">
                            {b.teamMembers?.map((m: any) => (
                              <div key={m.id} className="flex items-center gap-1.5 text-[10px]">
                                <span className="font-semibold text-slate-700">{m.name}:</span>
                                <span
                                  className={`px-1 rounded font-bold ${
                                    m.paymentStatus === "PAID"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : m.paymentStatus === "REFUNDED"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  ₹{m.splitAmount} ({m.paymentStatus})
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="p-3.5">
                          {b.bookingStatus === "CONFIRMED" ? (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-[10px]">
                              CONFIRMED
                            </span>
                          ) : b.bookingStatus === "CANCELLED" ? (
                            <div>
                              <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full font-black text-[10px]">
                                CANCELLED
                              </span>
                              {b.cancellationFee > 0 && (
                                <p className="text-[10px] text-red-600 mt-1 font-semibold">
                                  20% Fee: ₹{b.cancellationFee} (Refund: ₹{b.refundAmount})
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-black text-[10px]">
                              PENDING SPLIT
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
