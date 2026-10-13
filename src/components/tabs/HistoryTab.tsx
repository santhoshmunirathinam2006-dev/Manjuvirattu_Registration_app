"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { format } from "date-fns";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Info,
} from "lucide-react";

export function HistoryTab() {
  const { currentUser, checkDefaulterStatus } = useUser();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<any>(null);
  const [cancelNotice, setCancelNotice] = useState<string>("");

  const fetchBookings = async () => {
    try {
      const res = await fetch(`/api/bookings?phone=${currentUser.phone}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentUser]);

  // Execute Cancellation
  const handleConfirmCancel = async () => {
    if (!cancelModal) return;
    setCancellingId(cancelModal.id);

    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: cancelModal.id }),
      });

      const data = await res.json();
      if (res.ok) {
        setCancelNotice(data.message);
        setCancelModal(null);
        await fetchBookings();
        await checkDefaulterStatus();
      } else {
        alert(data.error || "Failed to cancel");
      }
    } catch (err) {
      console.error(err);
      alert("Cancellation error");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Client Activity & Transaction Ledger
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Every booking, cancellation, UPI payment, split status, and refund receipt for {currentUser.name} ({currentUser.phone}).
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh History
        </button>
      </div>

      {cancelNotice && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-bold flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{cancelNotice}</span>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading transaction records...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No reservations found for {currentUser.name}.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Book a badminton slot in the Booking Tab to see it recorded here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const now = new Date();
            const slotStartTime = new Date(b.slotStartTime);
            const diffMinutes = (slotStartTime.getTime() - now.getTime()) / (1000 * 60);
            const isEligibleForFullRefund = diffMinutes > 30;

            return (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400">
                      {b.bookingNumber}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      Booked on {format(new Date(b.createdAt), "dd MMM yyyy, hh:mm a")}
                    </span>
                  </div>

                  <div>
                    {b.bookingStatus === "CONFIRMED" ? (
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-full font-black text-xs inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        CONFIRMED
                      </span>
                    ) : b.bookingStatus === "CANCELLED" ? (
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 rounded-full font-black text-xs inline-flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                        CANCELLED
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-full font-black text-xs inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        PENDING SPLIT
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Reserved Court
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {b.slot?.court?.courtNumber || "Court"}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 font-mono">
                      {b.slot?.date} ({b.slot?.startTime} - {b.slot?.endTime})
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Financials (UPI)
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      Total: ₹{b.totalAmount}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      Split ({b.teamMembers?.length} players): ₹{Math.round((b.totalAmount / (b.teamMembers?.length || 1)) * 100) / 100} each
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        Cancellation Policy Status
                      </span>
                      {b.isCancelled ? (
                        <p className="text-xs text-red-700 dark:text-red-400 font-bold">
                          Fee: ₹{b.cancellationFee} • Refund Issued: ₹{b.refundAmount}
                        </p>
                      ) : isEligibleForFullRefund ? (
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                          Eligible for 100% Full Refund (over 30m before slot)
                        </p>
                      ) : (
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                          Less than 30 mins: 20% cancellation charges apply
                        </p>
                      )}
                    </div>

                    {!b.isCancelled && (
                      <button
                        onClick={() => setCancelModal(b)}
                        className="mt-2 text-left text-xs text-red-600 dark:text-red-400 font-bold hover:underline"
                      >
                        Cancel This Booking →
                      </button>
                    )}
                  </div>
                </div>

                {/* Team Members Split Status */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide block mb-2">
                    Team Members & Split UPI Status:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {b.teamMembers?.map((m: any) => (
                      <div
                        key={m.id}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{m.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{m.phone}</p>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            m.paymentStatus === "PAID"
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                              : m.paymentStatus === "REFUNDED"
                              ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"
                              : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                          }`}
                        >
                          {m.paymentStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Confirm Cancellation</h3>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>
                Booking Ref: <strong className="font-mono text-slate-900 dark:text-white">{cancelModal.bookingNumber}</strong>
              </p>
              <p>
                Match Slot: <strong className="text-slate-900 dark:text-white">{cancelModal.slot?.date} ({cancelModal.slot?.startTime})</strong>
              </p>

              {(() => {
                const diff = (new Date(cancelModal.slotStartTime).getTime() - Date.now()) / (1000 * 60);
                const isOver30 = diff > 30;
                return isOver30 ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl font-medium">
                    ✅ More than 30 minutes before slot start: <strong>100% Full Refund (₹{cancelModal.totalAmount})</strong> will be issued to all paid members.
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-xl font-medium space-y-1">
                    <p className="font-bold">⚠️ Cancellation Rule Notice:</p>
                    <p>
                      Less than 30 minutes before slot start! A <strong>20% cancellation charge (₹{Math.round(cancelModal.totalAmount * 0.2)})</strong> will be shared equally among all members.
                    </p>
                    <p className="text-[11px] text-red-700 dark:text-red-400">
                      Unpaid members must settle their share within 10 days or face the Cybercrime Department referral penalty!
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setCancelModal(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={Boolean(cancellingId)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {cancellingId ? "Cancelling..." : "Confirm & Process Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
