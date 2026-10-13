import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    const where: any = {};
    if (phone) {
      where.OR = [
        { bookerPhone: phone },
        { teamMembers: { some: { phone } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        slot: {
          include: {
            court: true,
          },
        },
        teamMembers: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slotId, bookerName, bookerPhone, teamMembers } = body;

    // Validate inputs
    if (!slotId || !bookerName || !bookerPhone || !teamMembers || teamMembers.length === 0) {
      return NextResponse.json(
        { error: "Slot, booker information, and at least one team member are required." },
        { status: 400 }
      );
    }

    // Verify slot availability
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { court: true },
    });

    if (!slot) {
      return NextResponse.json({ error: "Slot not found." }, { status: 404 });
    }

    if (slot.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: "Slot is no longer available. Please select another slot." },
        { status: 400 }
      );
    }

    // Calculate slot start time
    const [sh, sm] = slot.startTime.split(":").map(Number);
    const slotStartTime = new Date(`${slot.date}T00:00:00`);
    slotStartTime.setHours(sh, sm, 0, 0);

    const totalAmount = slot.price;
    const splitAmount = Math.round((totalAmount / teamMembers.length) * 100) / 100;
    const bookingNumber = `BWF-${Date.now().toString().slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Check payment status across team members
    // If all members paid via UPI -> CONFIRMED, else PENDING
    const allPaid = teamMembers.every((m: any) => m.paymentStatus === "PAID");
    const anyPaid = teamMembers.some((m: any) => m.paymentStatus === "PAID");

    const bookingStatus = allPaid ? "CONFIRMED" : "PENDING";
    const paymentStatus = allPaid ? "PAID" : anyPaid ? "PARTIAL" : "PENDING";

    // Create booking and team members in atomic transaction
    const [newBooking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          bookingNumber,
          slotId: slot.id,
          bookerName,
          bookerPhone,
          totalAmount,
          paymentStatus,
          bookingStatus,
          slotStartTime,
          teamMembers: {
            create: teamMembers.map((m: any) => ({
              name: m.name,
              phone: m.phone,
              otp: m.otp || `${Math.floor(1000 + Math.random() * 9000)}`,
              isOtpVerified: Boolean(m.isOtpVerified),
              splitAmount,
              paymentStatus: m.paymentStatus || "PENDING",
              upiTransactionId: m.upiTransactionId || (m.paymentStatus === "PAID" ? `UPI/APP/${Date.now().toString().slice(-8)}` : null),
              isDefaulter: false,
            })),
          },
        },
        include: {
          teamMembers: true,
          slot: {
            include: { court: true },
          },
        },
      }),
      prisma.slot.update({
        where: { id: slot.id },
        data: {
          status: "BOOKED",
          lastUpdatedByAdmin: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
