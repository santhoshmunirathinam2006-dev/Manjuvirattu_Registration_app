import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { Navbar } from "@/components/Navbar";
import { DefaulterBannerModal } from "@/components/DefaulterBannerModal";

export const metadata: Metadata = {
  title: "Apex Badminton Turf - Booking & Partner Hub",
  description: "Badminton court booking, real-time partner matching, and venue management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f1f3f6] min-h-screen text-slate-900 antialiased">
        <UserProvider>
          <Navbar />
          <DefaulterBannerModal />
          <main className="min-h-[calc(100vh-64px)] pb-12">
            {children}
          </main>
        </UserProvider>
      </body>
    </html>
  );
}
