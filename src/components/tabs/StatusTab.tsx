"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import {
  Users,
  Search,
  UserCheck,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Radio,
  Sparkles,
} from "lucide-react";

export function StatusTab() {
  const { currentUser, setActiveTab, setActiveChatRoom } = useUser();
  const [mode, setMode] = useState<"find" | "ready">("find");

  // Request Sender Mode State
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<string>("ALL");
  const [sendingRequestId, setSendingRequestId] = useState<string | null>(null);
  const [requestSentNotice, setRequestSentNotice] = useState<string>("");

  // Request Receiver Mode State
  const [myCourt, setMyCourt] = useState<string>("Court 1");
  const [mySkill, setMySkill] = useState<string>("Intermediate");
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [updatingVisibility, setUpdatingVisibility] = useState<boolean>(false);

  // Fetch available partners for Request Sender
  const fetchPartners = async () => {
    try {
      const res = await fetch(`/api/partner?courtNumber=${selectedCourt}`);
      if (res.ok) {
        const data = await res.json();
        setPartners(data.filter((p: any) => p.phone !== currentUser.phone));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch incoming & outgoing requests for current user
  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/partner/requests?phone=${currentUser.phone}`);
      if (res.ok) {
        const data = await res.json();
        setIncomingRequests(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPartners();
    fetchRequests();
    const interval = setInterval(() => {
      fetchPartners();
      fetchRequests();
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedCourt, currentUser]);

  // Toggle Visibility for Request Receiver
  const handleToggleVisibility = async (newVal: boolean) => {
    setIsVisible(newVal);
    setUpdatingVisibility(true);
    try {
      await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentUser.name,
          phone: currentUser.phone,
          courtNumber: myCourt,
          skillLevel: mySkill,
          isAvailable: newVal,
        }),
      });
      fetchPartners();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingVisibility(false);
    }
  };

  // Send Partner Request (Sender)
  const handleSendRequest = async (targetPartner: any) => {
    setSendingRequestId(targetPartner.id);
    try {
      const res = await fetch("/api/partner/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: currentUser.name,
          senderPhone: currentUser.phone,
          senderSkill: mySkill,
          receiverName: targetPartner.name,
          receiverPhone: targetPartner.phone,
          courtNumber: targetPartner.courtNumber,
        }),
      });

      if (res.ok) {
        setRequestSentNotice(`Request sent to ${targetPartner.name}! Waiting for them to accept.`);
        setTimeout(() => setRequestSentNotice(""), 4000);
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingRequestId(null);
    }
  };

  // Accept / Decline Request (Receiver)
  const handleRequestAction = async (requestId: string, action: "ACCEPT" | "DECLINE") => {
    try {
      const res = await fetch("/api/partner/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });

      if (res.ok) {
        const updated = await res.json();
        if (action === "ACCEPT" && updated.chatRoomId) {
          const isMeReceiver = updated.receiverPhone === currentUser.phone;
          setActiveChatRoom({
            roomId: updated.chatRoomId,
            partnerName: isMeReceiver ? updated.senderName : updated.receiverName,
            partnerPhone: isMeReceiver ? updated.senderPhone : updated.receiverPhone,
            courtNumber: updated.courtNumber,
          });
          setActiveTab("chat");
        } else {
          fetchRequests();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Selector: Sender vs Receiver */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            🏸 Real-Time Badminton Partner Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Find an opponent or teammate in real-time. Once accepted, unlocks WhatsApp-like in-memory chat!
          </p>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setMode("find")}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
              mode === "find"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Option 1: Request Sender (Find Partner)
          </button>
          <button
            onClick={() => setMode("ready")}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
              mode === "ready"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Option 2: Request Receiver (I am Ready)
          </button>
        </div>
      </div>

      {requestSentNotice && (
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 rounded-xl text-xs font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{requestSentNotice}</span>
        </div>
      )}

      {/* =============================================================== */}
      {/* OPTION 1: REQUEST SENDER (Finding a Partner) */}
      {/* =============================================================== */}
      {mode === "find" && (
        <div className="space-y-4">
          {/* Court Filter */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Search by Court:</span>
              <div className="flex gap-2">
                {["ALL", "Court 1", "Court 2", "Court 3", "Court 4"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCourt(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedCourt === c
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {partners.length} players online & available
            </span>
          </div>

          {/* Partner Cards Grid */}
          {partners.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No partners currently visible on {selectedCourt}.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Switch to "Request Receiver" to make yourself visible and wait for others to request!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900 dark:text-white text-base">{partner.name}</h3>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{partner.phone}</p>
                    </div>

                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-[11px] rounded-lg">
                      {partner.courtNumber}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Skill Level:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 px-2 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
                      {partner.skillLevel}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSendRequest(partner)}
                    disabled={sendingRequestId === partner.id}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" />
                    {sendingRequestId === partner.id ? "Sending Request..." : "Send Partner Request"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =============================================================== */}
      {/* OPTION 2: REQUEST RECEIVER (Ready to be Partner in Real-Time) */}
      {/* =============================================================== */}
      {mode === "ready" && (
        <div className="space-y-6">
          {/* Receiver Profile & Live Visibility Toggle */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Ready to be a Partner Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your preferred court and toggle your visibility so others can send you partner requests.
                </p>
              </div>

              {/* LIVE TOGGLE BUTTON */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Make Me Visible:</span>
                <button
                  onClick={() => handleToggleVisibility(!isVisible)}
                  disabled={updatingVisibility}
                  className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isVisible ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isVisible ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
                <span
                  className={`text-xs font-black ${
                    isVisible ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"
                  }`}
                >
                  {isVisible ? "ONLINE" : "HIDDEN"}
                </span>
              </div>
            </div>

            {/* Inputs: Court & Skill */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Your Name</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.name}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Select Ready Court</label>
                <select
                  value={myCourt}
                  onChange={(e) => {
                    setMyCourt(e.target.value);
                    handleToggleVisibility(isVisible);
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="Court 1">Court 1 (Yonex Synthetic)</option>
                  <option value="Court 2">Court 2 (Yonex Synthetic)</option>
                  <option value="Court 3">Court 3 (Teakwood Wooden)</option>
                  <option value="Court 4">Court 4 (Teakwood Wooden)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Skill Level</label>
                <select
                  value={mySkill}
                  onChange={(e) => {
                    setMySkill(e.target.value);
                    handleToggleVisibility(isVisible);
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="Beginner">Beginner (Rally Fun)</option>
                  <option value="Intermediate">Intermediate (Club Player)</option>
                  <option value="Advanced">Advanced (Smash Pro)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Incoming Partner Requests List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                Incoming Partner Requests for You
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Auto-refreshes every 4s
              </span>
            </div>

            {incomingRequests.filter((r) => r.receiverPhone === currentUser.phone && r.status === "PENDING")
              .length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500">
                <p className="text-xs font-semibold">No pending partner requests right now.</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Keep your visibility toggle ON and requests from players searching your court will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {incomingRequests
                  .filter((r) => r.receiverPhone === currentUser.phone && r.status === "PENDING")
                  .map((req) => (
                    <div
                      key={req.id}
                      className="p-4 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{req.senderName}</span>
                          <span className="text-[11px] text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full font-semibold">
                            {req.courtNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          Phone: {req.senderPhone} • Skill: {req.senderSkill}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRequestAction(req.id, "ACCEPT")}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Accept & Open Chat
                        </button>
                        <button
                          onClick={() => handleRequestAction(req.id, "DECLINE")}
                          className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Accepted Connections & Active Chat Rooms */}
      {incomingRequests.filter((r) => r.status === "ACCEPTED").length > 0 && (
        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-black uppercase text-emerald-900 dark:text-emerald-300 tracking-wider flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            Connected Badminton Partners (Unlocked Chats)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {incomingRequests
              .filter((r) => r.status === "ACCEPTED")
              .map((r) => {
                const partnerName = r.senderPhone === currentUser.phone ? r.receiverName : r.senderName;
                const partnerPhone = r.senderPhone === currentUser.phone ? r.receiverPhone : r.senderPhone;

                return (
                  <div
                    key={r.id}
                    className="p-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{partnerName}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{r.courtNumber} • {partnerPhone}</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveChatRoom({
                          roomId: r.chatRoomId,
                          partnerName,
                          partnerPhone,
                          courtNumber: r.courtNumber,
                        });
                        setActiveTab("chat");
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Open WhatsApp Chat
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
