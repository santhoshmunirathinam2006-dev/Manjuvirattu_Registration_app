import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courtNumber = searchParams.get("courtNumber");

    const where: any = {
      isAvailable: true,
    };
    if (courtNumber && courtNumber !== "ALL") {
      where.courtNumber = courtNumber;
    }

    const partners = await prisma.partnerProfile.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(partners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, courtNumber, skillLevel, isAvailable } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    const profile = await prisma.partnerProfile.upsert({
      where: { phone },
      update: {
        name,
        courtNumber: courtNumber || "Court 1",
        skillLevel: skillLevel || "Intermediate",
        isAvailable: isAvailable ?? true,
      },
      create: {
        name,
        phone,
        courtNumber: courtNumber || "Court 1",
        skillLevel: skillLevel || "Intermediate",
        isAvailable: isAvailable ?? true,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating partner profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
