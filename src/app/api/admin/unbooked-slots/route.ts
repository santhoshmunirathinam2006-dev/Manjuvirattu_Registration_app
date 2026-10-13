import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const courtId = searchParams.get("courtId");

    const where: any = {
      status: "AVAILABLE",
    };

    if (date) where.date = date;
    if (courtId && courtId !== "ALL") where.courtId = courtId;

    const unbookedSlots = await prisma.slot.findMany({
      where,
      include: {
        court: true,
      },
      orderBy: [{ date: "asc" }, { court: { courtNumber: "asc" } }, { startTime: "asc" }],
    });

    // Also get overall counts for today
    const totalSlots = await prisma.slot.count({
      where: date ? { date } : {},
    });
    const bookedCount = await prisma.slot.count({
      where: {
        status: "BOOKED",
        ...(date ? { date } : {}),
      },
    });
    const blockedCount = await prisma.slot.count({
      where: {
        status: "BLOCKED",
        ...(date ? { date } : {}),
      },
    });

    return NextResponse.json({
      unbookedSlots,
      summary: {
        unbookedCount: unbookedSlots.length,
        bookedCount,
        blockedCount,
        totalSlots,
        occupancyRate: totalSlots > 0 ? Math.round((bookedCount / totalSlots) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching unbooked slots:", error);
    return NextResponse.json({ error: "Failed to fetch unbooked slots" }, { status: 500 });
  }
}
