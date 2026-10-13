"use client";

import React from "react";
import { useUser } from "@/context/UserContext";
import { StatusTab } from "@/components/tabs/StatusTab";
import { ChatTab } from "@/components/tabs/ChatTab";
import { BookingTab } from "@/components/tabs/BookingTab";
import { HistoryTab } from "@/components/tabs/HistoryTab";
import { ReportTab } from "@/components/tabs/ReportTab";
import {
  Users,
  MessageCircle,
  ShoppingBag,
  FileText,
  ShieldAlert,
} from "lucide-react";

export default function ClientPortalPage() {
  const { activeTab, setActiveTab, activeChatRoom } = useUser();

  const tabs = [
    {
      id: "status",
      label: "1. Status Tab",
      subtitle: "Partner Finding",
      icon: Users,
    },
    {
      id: "chat",
      label: "2. Chat Tab",
      subtitle: "WhatsApp Ephemeral",
      icon: MessageCircle,
      badge: activeChatRoom ? "Active Room" : undefined,
    },
    {
      id: "booking",
      label: "3. Booking Tab",
      subtitle: "Courts & Split UPI",
      icon: ShoppingBag,
    },
    {
      id: "history",
      label: "4. History Tab",
      subtitle: "Bookings & Refunds",
      icon: FileText,
    },
    {
      id: "report",
      label: "5. Report Tab",
      subtitle: "Disputes & Feedback",
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 5-Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-2 transition-colors">
        <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left relative ${
                  isActive
                    ? "bg-[#2874f0] dark:bg-blue-600 text-white shadow-md shadow-blue-100 dark:shadow-none"
                    : "bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/60"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-black text-xs truncate tracking-tight">{tab.label}</p>
                  <p
                    className={`text-[10px] truncate ${
                      isActive ? "text-blue-100 dark:text-blue-200" : "text-slate-400 dark:text-slate-400"
                    }`}
                  >
                    {tab.subtitle}
                  </p>
                </div>

                {tab.badge && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-500 text-white text-[9px] font-black rounded-full animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === "status" && <StatusTab />}
        {activeTab === "chat" && <ChatTab />}
        {activeTab === "booking" && <BookingTab />}
        {activeTab === "history" && <HistoryTab />}
        {activeTab === "report" && <ReportTab />}
      </div>
    </div>
  );
}
