"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { format } from "date-fns";
import {
  ShieldAlert,
  Send,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  Flag,
} from "lucide-react";

export function ReportTab() {
  const { currentUser } = useUser();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Report Form State
  const [category, setCategory] = useState<string>("Service & Facility Issue");
  const [reportedPhone, setReportedPhone] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Reply Input State per report
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const res = await fetch(`/api/reports?phone=${currentUser.phone}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [currentUser]);

  // Submit New Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporterName: currentUser.name,
          reporterPhone: currentUser.phone,
          reportedUserPhone: reportedPhone.trim() || null,
          category,
          description: description.trim(),
        }),
      });

      if (res.ok) {
        setDescription("");
        setReportedPhone("");
        setReportSuccess(true);
        setTimeout(() => setReportSuccess(false), 3000);
        fetchReports();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Reply to Report Thread
  const handleSendReply = async (reportId: string) => {
    const text = replyTexts[reportId]?.trim();
    if (!text) return;

    setReplyingId(reportId);
    try {
      const res = await fetch("/api/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          sender: `${currentUser.name} (${currentUser.phone})`,
          message: text,
        }),
      });

      if (res.ok) {
        setReplyTexts({ ...replyTexts, [reportId]: "" });
        fetchReports();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReplyingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
            Reports, Service Feedback & Dispute Resolution
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Submit reports about turf venue facilities or report abusive player acts. View and reply to reports involving your profile.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Reports
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Submit New Report (Part 1) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Flag className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                1. File a New Report or Feedback
              </h3>
            </div>

            {reportSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Report submitted successfully! It is now listed in the resolution board.</span>
              </div>
            )}

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Report Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Service & Facility Issue">Venue Service & Facility (Mat, Net, Lights, Water)</option>
                  <option value="Abusive Conduct of Player">Abusive Act / Behavior of Player</option>
                  <option value="Partner No-Show">Partner No-Show / Late Arrival</option>
                  <option value="Payment Dispute">Split Payment / UPI Refund Dispute</option>
                </select>
              </div>

              {category.includes("Player") || category.includes("Partner") ? (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Reported User Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={reportedPhone}
                    onChange={(e) => setReportedPhone(e.target.value)}
                    placeholder="e.g. 9899001122"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              ) : null}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Description of Incident or Feedback *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide clear details of what occurred..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs leading-relaxed text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
                Filing as: <strong className="text-slate-800 dark:text-slate-200">{currentUser.name} ({currentUser.phone})</strong>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Flag className="w-4 h-4" />
                {submitting ? "Submitting..." : "Submit Official Report"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Reports List & Bilateral Reply System (Part 2) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                  2. Reports Concerning You & Bilateral Replies
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {reports.length} Reports
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No active reports found!</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Your profile has a clean record with no grievances or disputes filed.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => {
                  const isReported = report.reportedUserPhone === currentUser.phone;

                  return (
                    <div
                      key={report.id}
                      className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4"
                    >
                      {/* Report Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-700 text-xs">
                        <div>
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 font-bold rounded text-[10px] uppercase">
                            {report.category}
                          </span>
                          <span className="text-slate-400 ml-2 font-mono text-[10px]">
                            {format(new Date(report.createdAt), "dd MMM yyyy, hh:mm a")}
                          </span>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isReported
                              ? "bg-red-600 text-white"
                              : "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300"
                          }`}
                        >
                          {isReported ? "REPORT FILED ON YOU" : "FILED BY YOU"}
                        </span>
                      </div>

                      {/* Complaint Description */}
                      <div className="text-xs space-y-1">
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">
                          Reported by: <strong className="text-slate-800 dark:text-slate-200">{report.reporterName} ({report.reporterPhone})</strong>
                          {report.reportedUserPhone && (
                            <> • On user: <strong className="text-slate-800 dark:text-slate-200">{report.reportedUserPhone}</strong></>
                          )}
                        </p>
                        <p className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed">
                          {report.description}
                        </p>
                      </div>

                      {/* Bilateral Reply Thread */}
                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide block">
                          Discussion & Reply Thread ({report.replies?.length || 0}):
                        </span>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {report.replies?.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic">
                              No replies yet. Use the box below to post a response or clarification.
                            </p>
                          ) : (
                            report.replies?.map((reply: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-0.5"
                              >
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                  <span>{reply.sender}</span>
                                  <span>{format(new Date(reply.timestamp), "hh:mm a")}</span>
                                </div>
                                <p className="text-slate-800 dark:text-slate-200 text-[11px] leading-relaxed">
                                  {reply.message}
                                </p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Reply Input Form */}
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            value={replyTexts[report.id] || ""}
                            onChange={(e) =>
                              setReplyTexts({
                                ...replyTexts,
                                [report.id]: e.target.value,
                              })
                            }
                            placeholder="Type your response to this report..."
                            className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleSendReply(report.id)}
                            disabled={replyingId === report.id || !replyTexts[report.id]?.trim()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
