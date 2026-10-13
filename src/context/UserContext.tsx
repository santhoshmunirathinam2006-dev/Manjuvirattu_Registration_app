"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  name: string;
  phone: string;
}

export const PRESET_USERS: UserProfile[] = [
  { name: "Arjun Verma (Booker)", phone: "9845012345" },
  { name: "Rohan Das (Team Player)", phone: "9876501234" },
  { name: "Vikram Sen (Partner Searcher)", phone: "9811223344" },
  { name: "Sneha Reddy (Advanced Partner)", phone: "9822334455" },
  { name: "Test Defaulter (Penalty User)", phone: "9899001122" },
];

interface DefaulterInfo {
  isDefaulter: boolean;
  penaltyAmount?: number;
  penaltyDeadline?: string;
  bookingNumber?: string;
  courtNumber?: string;
}

interface UserContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  defaulterInfo: DefaulterInfo;
  checkDefaulterStatus: () => Promise<void>;
  settlePenalty: () => Promise<void>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeChatRoom: { roomId: string; partnerName: string; partnerPhone: string; courtNumber: string } | null;
  setActiveChatRoom: (room: { roomId: string; partnerName: string; partnerPhone: string; courtNumber: string } | null) => void;
  theme: "light" | "dark";
  isDark: boolean;
  toggleTheme: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(PRESET_USERS[0]);
  const [activeTab, setActiveTab] = useState<string>("booking");
  const [activeChatRoom, setActiveChatRoom] = useState<{
    roomId: string;
    partnerName: string;
    partnerPhone: string;
    courtNumber: string;
  } | null>(null);

  const [defaulterInfo, setDefaulterInfo] = useState<DefaulterInfo>({ isDefaulter: false });
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Load and apply theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("apex_turf_theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("apex_turf_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const checkDefaulterStatus = async () => {
    try {
      const res = await fetch(`/api/defaulter?phone=${currentUser.phone}`);
      if (res.ok) {
        const data = await res.json();
        setDefaulterInfo(data);
      }
    } catch (err) {
      console.error("Failed to check defaulter status", err);
    }
  };

  const settlePenalty = async () => {
    try {
      const res = await fetch("/api/defaulter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: currentUser.phone,
          upiTransactionId: `UPI/FINE/${Date.now().toString().slice(-8)}`,
        }),
      });
      if (res.ok) {
        await checkDefaulterStatus();
      }
    } catch (err) {
      console.error("Failed to settle penalty", err);
    }
  };

  useEffect(() => {
    checkDefaulterStatus();
  }, [currentUser]);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        defaulterInfo,
        checkDefaulterStatus,
        settlePenalty,
        activeTab,
        setActiveTab,
        activeChatRoom,
        setActiveChatRoom,
        theme,
        isDark: theme === "dark",
        toggleTheme,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}
