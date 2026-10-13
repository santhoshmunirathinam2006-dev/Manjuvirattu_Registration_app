import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const courtId = searchParams.get("courtId");

    const where: any = {};
    if (date) where.date = date;
    if (courtId) where.courtId = courtId;

    const slots = await prisma.slot.findMany({
      where,
      include: {
        court: true,
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            bookerName: true,
            bookingStatus: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(slots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { slotId, status, blockReason } = body;

    const updated = await prisma.slot.update({
      where: { id: slotId },
      data: {
        status,
        blockReason: status === "BLOCKED" ? blockReason || "Admin maintenance" : null,
        lastUpdatedByAdmin: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating slot:", error);
    return NextResponse.json({ error: "Failed to update slot" }, { status: 500 });
  }
}
