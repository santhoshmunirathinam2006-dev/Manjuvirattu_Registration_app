import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required." }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        slot: true,
        teamMembers: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (booking.isCancelled) {
      return NextResponse.json({ error: "Booking is already cancelled." }, { status: 400 });
    }

    const now = new Date();
    const slotTime = new Date(booking.slotStartTime);
    const diffMinutes = (slotTime.getTime() - now.getTime()) / (1000 * 60);

    const isEligibleForFullRefund = diffMinutes > 30;
    const memberCount = booking.teamMembers.length;
    let totalCancellationFee = 0;
    let totalRefundIssued = 0;

    if (!isEligibleForFullRefund) {
      // 20% cancellation charges
      totalCancellationFee = Math.round(booking.totalAmount * 0.2);
    }

    const cancellationFeePerMember =
      memberCount > 0 ? Math.round((totalCancellationFee / memberCount) * 100) / 100 : 0;

    // Process each team member
    for (const member of booking.teamMembers) {
      if (member.paymentStatus === "PAID") {
        // Issue refund minus cancellation fee share if late
        const refundForMember = Math.max(0, member.splitAmount - cancellationFeePerMember);
        totalRefundIssued += refundForMember;

        await prisma.teamMember.update({
          where: { id: member.id },
          data: {
            paymentStatus: "REFUNDED",
          },
        });
      } else {
        // Member had not paid!
        // If cancellation fee is applicable, mark them as a defaulter with a 10-day deadline
        if (cancellationFeePerMember > 0) {
          const tenDaysLater = new Date();
          tenDaysLater.setDate(tenDaysLater.getDate() + 10);

          await prisma.teamMember.update({
            where: { id: member.id },
            data: {
              isDefaulter: true,
              penaltyAmount: cancellationFeePerMember,
              penaltyDeadline: tenDaysLater,
            },
          });
        }
      }
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        isCancelled: true,
        bookingStatus: "CANCELLED",
        cancelledAt: new Date(),
        cancellationFee: totalCancellationFee,
        refundAmount: totalRefundIssued,
      },
      include: {
        teamMembers: true,
        slot: { include: { court: true } },
      },
    });

    // Reopen slot to AVAILABLE
    await prisma.slot.update({
      where: { id: booking.slotId },
      data: {
        status: "AVAILABLE",
        lastUpdatedByAdmin: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      isEligibleForFullRefund,
      cancellationFee: totalCancellationFee,
      refundAmount: totalRefundIssued,
      message: isEligibleForFullRefund
        ? "Cancelled successfully! 100% full refund issued."
        : `Cancelled less than 30 minutes before slot start. 20% cancellation fee (₹${totalCancellationFee}) deducted.`,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }
}
