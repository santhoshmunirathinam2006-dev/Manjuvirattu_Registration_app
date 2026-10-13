import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json({ isDefaulter: false });
    }

    const defaulterRecord = await prisma.teamMember.findFirst({
      where: {
        phone,
        isDefaulter: true,
        penaltyAmount: { gt: 0 },
      },
      include: {
        booking: {
          include: {
            slot: {
              include: { court: true },
            },
          },
        },
      },
    });

    if (defaulterRecord) {
      return NextResponse.json({
        isDefaulter: true,
        memberId: defaulterRecord.id,
        penaltyAmount: defaulterRecord.penaltyAmount,
        penaltyDeadline: defaulterRecord.penaltyDeadline,
        bookingNumber: defaulterRecord.booking.bookingNumber,
        courtNumber: defaulterRecord.booking.slot.court.courtNumber,
      });
    }

    return NextResponse.json({ isDefaulter: false });
  } catch (error) {
    console.error("Error checking defaulter status:", error);
    return NextResponse.json({ error: "Failed to check defaulter status" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, upiTransactionId } = body;

    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    // Clear all defaulter penalties for this phone
    await prisma.teamMember.updateMany({
      where: {
        phone,
        isDefaulter: true,
      },
      data: {
        isDefaulter: false,
        penaltyAmount: 0,
        upiTransactionId: upiTransactionId || `PENALTY/UPI/${Date.now().toString().slice(-8)}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Penalty paid successfully! Your account has been restored.",
    });
  } catch (error) {
    console.error("Error settling penalty:", error);
    return NextResponse.json({ error: "Failed to settle penalty" }, { status: 500 });
  }
}
