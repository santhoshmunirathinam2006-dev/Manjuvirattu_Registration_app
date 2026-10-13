"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, PRESET_USERS } from "@/context/UserContext";
import { Shield, User, AlertCircle, Sun, Moon } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, setCurrentUser, defaulterInfo, isDark, toggleTheme } = useUser();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 bg-[#2874f0] dark:bg-slate-900 text-white shadow-md transition-colors duration-200 border-b border-transparent dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl filter drop-shadow">🏸</span>
              <div>
                <span className="font-black text-xl tracking-tight text-white italic">
                  Apex<span className="text-yellow-300 dark:text-emerald-400">Badminton</span>
                </span>
                <span className="block text-[10px] text-blue-100 dark:text-slate-400 uppercase tracking-widest font-semibold -mt-1">
                  Turf Arena & Community
                </span>
              </div>
            </Link>

            {/* Portal Switcher */}
            <div className="hidden sm:flex items-center bg-blue-700/60 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold border border-transparent dark:border-slate-700">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-md transition-all ${
                  !isAdmin
                    ? "bg-white text-blue-600 dark:bg-slate-700 dark:text-white shadow-sm"
                    : "text-blue-100 dark:text-slate-300 hover:text-white"
                }`}
              >
                Client Portal (5 Tabs)
              </Link>
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-md transition-all ${
                  isAdmin
                    ? "bg-white text-blue-600 dark:bg-slate-700 dark:text-white shadow-sm"
                    : "text-blue-100 dark:text-slate-300 hover:text-white"
                }`}
              >
                Admin Portal
              </Link>
            </div>
          </div>

          {/* Right Controls: Dark Mode Toggle, User Selector, Admin Button */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Defaulter Tag if active */}
            {defaulterInfo.isDefaulter && (
              <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                Defaulter Flagged
              </span>
            )}

            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-xl bg-blue-700/80 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-yellow-300 dark:text-amber-400 transition-all border border-blue-500/30 dark:border-slate-700 shadow-sm"
            >
              {isDark ? (
                <Sun className="w-4 h-4 animate-in spin-in-90 duration-300" />
              ) : (
                <Moon className="w-4 h-4 animate-in spin-in-90 duration-300" />
              )}
            </button>

            {/* Simulated Active User Switcher */}
            <div className="flex items-center gap-2 bg-blue-800/80 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-blue-600/40 dark:border-slate-700 text-xs">
              <User className="w-4 h-4 text-yellow-300 dark:text-emerald-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-blue-200 dark:text-slate-400 uppercase font-medium">Player:</span>
                <select
                  value={currentUser.phone}
                  onChange={(e) => {
                    const selected = PRESET_USERS.find((u) => u.phone === e.target.value);
                    if (selected) setCurrentUser(selected);
                  }}
                  className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer"
                >
                  {PRESET_USERS.map((user) => (
                    <option key={user.phone} value={user.phone} className="text-slate-900 bg-white dark:bg-slate-800 dark:text-white">
                      {user.name} ({user.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Admin Direct Button */}
            <Link
              href="/admin"
              className="p-2 bg-yellow-400 hover:bg-yellow-300 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-slate-900 dark:text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Admin Mode</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
