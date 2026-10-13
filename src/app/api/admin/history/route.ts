import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const status = searchParams.get("status") || "ALL";

    const where: any = {};
    if (status !== "ALL") {
      where.bookingStatus = status;
    }

    if (query) {
      where.OR = [
        { bookerName: { contains: query } },
        { bookerPhone: { contains: query } },
        { bookingNumber: { contains: query } },
        { teamMembers: { some: { name: { contains: query } } } },
        { teamMembers: { some: { phone: { contains: query } } } },
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
    console.error("Error fetching admin booking history:", error);
    return NextResponse.json({ error: "Failed to fetch admin history" }, { status: 500 });
  }
}
