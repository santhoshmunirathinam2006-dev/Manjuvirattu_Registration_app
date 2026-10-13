import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    const requests = await prisma.partnerRequest.findMany({
      where: {
        OR: [{ receiverPhone: phone }, { senderPhone: phone }],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching partner requests:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { senderName, senderPhone, senderSkill, receiverName, receiverPhone, courtNumber } = body;

    if (!senderPhone || !receiverPhone) {
      return NextResponse.json({ error: "Sender and receiver phones required" }, { status: 400 });
    }

    const partnerReq = await prisma.partnerRequest.create({
      data: {
        senderName,
        senderPhone,
        senderSkill: senderSkill || "Intermediate",
        receiverName,
        receiverPhone,
        courtNumber: courtNumber || "Court 1",
        status: "PENDING",
      },
    });

    return NextResponse.json(partnerReq);
  } catch (error) {
    console.error("Error creating partner request:", error);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { requestId, action } = body; // action: "ACCEPT" | "DECLINE"

    if (!requestId || !action) {
      return NextResponse.json({ error: "Request ID and action required" }, { status: 400 });
    }

    let chatRoomId: string | null = null;
    let newStatus: string = "DECLINED";

    if (action === "ACCEPT") {
      newStatus = "ACCEPTED";
      chatRoomId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }

    const updated = await prisma.partnerRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        chatRoomId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating partner request:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
