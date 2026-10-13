import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    const where: any = {};
    if (phone) {
      where.OR = [
        { reporterPhone: phone },
        { reportedUserPhone: phone },
      ];
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const parsedReports = reports.map((r) => ({
      ...r,
      replies: JSON.parse(r.repliesJson || "[]"),
    }));

    return NextResponse.json(parsedReports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reporterName, reporterPhone, reportedUserPhone, category, description } = body;

    if (!reporterName || !reporterPhone || !category || !description) {
      return NextResponse.json(
        { error: "Reporter name, phone, category, and description are required." },
        { status: 400 }
      );
    }

    const newReport = await prisma.report.create({
      data: {
        reporterName,
        reporterPhone,
        reportedUserPhone: reportedUserPhone || null,
        category,
        description,
        status: "OPEN",
        repliesJson: "[]",
      },
    });

    return NextResponse.json(newReport);
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { reportId, sender, message } = body;

    if (!reportId || !sender || !message) {
      return NextResponse.json(
        { error: "Report ID, sender, and message are required." },
        { status: 400 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const replies = JSON.parse(report.repliesJson || "[]");
    replies.push({
      sender,
      message,
      timestamp: Date.now(),
    });

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: {
        repliesJson: JSON.stringify(replies),
      },
    });

    return NextResponse.json({
      ...updated,
      replies,
    });
  } catch (error) {
    console.error("Error replying to report:", error);
    return NextResponse.json({ error: "Failed to reply to report" }, { status: 500 });
  }
}
