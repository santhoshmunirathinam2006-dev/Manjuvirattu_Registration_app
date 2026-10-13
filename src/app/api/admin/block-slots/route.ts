import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courtId, startDateTime, endDateTime, reason } = body;

    if (!startDateTime || !endDateTime) {
      return NextResponse.json(
        { error: "Start date-time and End date-time are required." },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date-time format." },
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: "Start date-time must be before End date-time." },
        { status: 400 }
      );
    }

    // 1. Record the blocked range
    const blockedRange = await prisma.blockedRange.create({
      data: {
        courtId: courtId === "ALL" ? null : courtId,
        startDateTime: startDate,
        endDateTime: endDate,
        reason: reason || "Court maintenance",
      },
    });

    // 2. Fetch all slots that may intersect
    const courtFilter = courtId === "ALL" ? {} : { courtId };
    const allSlots = await prisma.slot.findMany({
      where: {
        ...courtFilter,
        status: { not: "BOOKED" }, // Don't overwrite existing paid bookings
      },
      include: { court: true },
    });

    // Filter slots whose start or end falls within the range
    const slotIdsToBlock: string[] = [];

    for (const slot of allSlots) {
      // Slot date is "YYYY-MM-DD", startTime is "HH:mm"
      const [sh, sm] = slot.startTime.split(":").map(Number);
      const slotStart = new Date(`${slot.date}T00:00:00`);
      slotStart.setHours(sh, sm, 0, 0);

      const [eh, em] = slot.endTime.split(":").map(Number);
      const slotEnd = new Date(`${slot.date}T00:00:00`);
      // If endTime is 00:00 or 01:00 (next day midnight)
      if (eh < sh) {
        slotEnd.setDate(slotEnd.getDate() + 1);
      }
      slotEnd.setHours(eh, em, 0, 0);

      // Check overlap: (slotStart < endDate && slotEnd > startDate)
      if (slotStart < endDate && slotEnd > startDate) {
        slotIdsToBlock.push(slot.id);
      }
    }

    if (slotIdsToBlock.length > 0) {
      await prisma.slot.updateMany({
        where: { id: { in: slotIdsToBlock } },
        data: {
          status: "BLOCKED",
          blockReason: reason || "Admin blocked",
          lastUpdatedByAdmin: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      blockedRange,
      slotsBlockedCount: slotIdsToBlock.length,
    });
  } catch (error) {
    console.error("Error blocking slots by range:", error);
    return NextResponse.json({ error: "Failed to block slots" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const ranges = await prisma.blockedRange.findMany({
      include: {
        court: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(ranges);
  } catch (error) {
    console.error("Error fetching blocked ranges:", error);
    return NextResponse.json({ error: "Failed to fetch blocked ranges" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rangeId = searchParams.get("rangeId");

    if (!rangeId) {
      return NextResponse.json({ error: "Range ID required" }, { status: 400 });
    }

    const range = await prisma.blockedRange.findUnique({
      where: { id: rangeId },
    });

    if (!range) {
      return NextResponse.json({ error: "Blocked range not found" }, { status: 404 });
    }

    // Unblock the affected slots (only those currently BLOCKED)
    const courtFilter = range.courtId ? { courtId: range.courtId } : {};
    const slots = await prisma.slot.findMany({
      where: {
        ...courtFilter,
        status: "BLOCKED",
      },
    });

    const slotIdsToUnblock: string[] = [];
    for (const slot of slots) {
      const [sh, sm] = slot.startTime.split(":").map(Number);
      const slotStart = new Date(`${slot.date}T00:00:00`);
      slotStart.setHours(sh, sm, 0, 0);

      const [eh, em] = slot.endTime.split(":").map(Number);
      const slotEnd = new Date(`${slot.date}T00:00:00`);
      if (eh < sh) slotEnd.setDate(slotEnd.getDate() + 1);
      slotEnd.setHours(eh, em, 0, 0);

      if (slotStart < range.endDateTime && slotEnd > range.startDateTime) {
        slotIdsToUnblock.push(slot.id);
      }
    }

    if (slotIdsToUnblock.length > 0) {
      await prisma.slot.updateMany({
        where: { id: { in: slotIdsToUnblock } },
        data: {
          status: "AVAILABLE",
          blockReason: null,
          lastUpdatedByAdmin: new Date(),
        },
      });
    }

    await prisma.blockedRange.delete({
      where: { id: rangeId },
    });

    return NextResponse.json({ success: true, unblockedCount: slotIdsToUnblock.length });
  } catch (error) {
    console.error("Error deleting blocked range:", error);
    return NextResponse.json({ error: "Failed to unblock range" }, { status: 500 });
  }
}
