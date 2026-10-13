"use client";

import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { AlertTriangle, ShieldAlert, QrCode, CheckCircle2, Lock } from "lucide-react";
import { format } from "date-fns";

export function DefaulterBannerModal() {
  const { defaulterInfo, currentUser, settlePenalty } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  if (!defaulterInfo.isDefaulter) return null;

  const handlePayPenalty = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    await settlePenalty();
    setIsProcessing(false);
    setPaidSuccess(true);
    setTimeout(() => {
      setPaidSuccess(false);
    }, 2000);
  };

  const deadlineStr = defaulterInfo.penaltyDeadline
    ? format(new Date(defaulterInfo.penaltyDeadline), "dd MMM yyyy, hh:mm a")
    : "10 Days from today";

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border-4 border-red-600 animate-in fade-in zoom-in duration-200">
        {/* Header Warning Banner */}
        <div className="bg-red-600 text-white p-5 text-center relative">
          <div className="inline-flex p-3 bg-red-700 rounded-full mb-2">
            <ShieldAlert className="w-10 h-10 text-white animate-bounce" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-wider">
            Account Blocked: Unpaid Charges
          </h2>
          <p className="text-xs text-red-100 mt-1">
            All platform activities are restricted until settlement
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">
                  LEGAL WARNING: CYBERCRIME REPORT NOTICE
                </p>
                <p className="text-xs mt-1 text-red-800 leading-relaxed">
                  You failed to pay your equal share of the 20% cancellation charges for badminton court reservation{" "}
                  <strong>{defaulterInfo.bookingNumber || "BWF Booking"}</strong>. You must pay within{" "}
                  <span className="font-bold underline text-red-900">10 days</span> (Deadline: {deadlineStr}) or your phone number and account will be officially reported to the{" "}
                  <span className="font-bold uppercase text-red-950">Cybercrime Department</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Amount Due Box */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Registered User</p>
              <p className="font-bold text-slate-800">{currentUser.name}</p>
              <p className="text-xs text-slate-500">{currentUser.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-red-600 uppercase">Penalty Due</p>
              <p className="text-2xl font-black text-red-600">₹{defaulterInfo.penaltyAmount || 90}</p>
            </div>
          </div>

          {/* Simulated UPI Payment Section */}
          <div className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/50 space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm">
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>Direct UPI Clearance Gateway</span>
            </div>

            <div className="flex items-center justify-center p-3 bg-white rounded-lg border border-indigo-100 shadow-sm">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-slate-100 rounded-lg flex items-center justify-center border border-dashed border-slate-300">
                  <span className="text-xs font-mono text-slate-400">QR CODE<br/>₹{defaulterInfo.penaltyAmount || 90}</span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1">UPI ID: badminton.penalty@upi</p>
              </div>
            </div>

            {paidSuccess ? (
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-center font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Penalty Settled! Restoring Access...</span>
              </div>
            ) : (
              <button
                onClick={handlePayPenalty}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing UPI Payment...
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay ₹{defaulterInfo.penaltyAmount || 90} & Unlock Account
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
