import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays, format } from "date-fns";

export async function GET() {
  try {
    const turf = await prisma.turf.findFirst({
      include: {
        courts: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!turf) {
      return NextResponse.json({ error: "No turf found" }, { status: 404 });
    }

    return NextResponse.json({
      ...turf,
      insideImages: JSON.parse(turf.insideImagesJson || "[]"),
      outsideImages: JSON.parse(turf.outsideImagesJson || "[]"),
    });
  } catch (error) {
    console.error("Error fetching turf:", error);
    return NextResponse.json({ error: "Failed to fetch turf" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      adminName,
      adminPhone,
      courtAddress,
      adminAddress,
      insideImages,
      outsideImages,
      numCourts = 4,
      courtDimensions = "44 ft x 20 ft (BWF Standard)",
      hasDrinkingWater = true,
      numFans = 8,
      hasChairs = true,
      hasNearbyJuiceShop = true,
      hasShuttlecocks = true,
      shuttlecockCost = 50.0,
      defaultOpenTime = "09:00",
      defaultCloseTime = "01:00",
      pricePerHour = 450.0,
    } = body;

    // Validate mandatory 8 images
    if (!insideImages || insideImages.length < 4 || !outsideImages || outsideImages.length < 4) {
      return NextResponse.json(
        { error: "Mandatory: 4 images inside the court and 4 images outside the court required." },
        { status: 400 }
      );
    }

    // Upsert or create turf
    const existingTurf = await prisma.turf.findFirst();
    let turf;

    if (existingTurf) {
      turf = await prisma.turf.update({
        where: { id: existingTurf.id },
        data: {
          name,
          adminName,
          adminPhone,
          courtAddress,
          adminAddress,
          insideImagesJson: JSON.stringify(insideImages),
          outsideImagesJson: JSON.stringify(outsideImages),
          numCourts: Number(numCourts),
          courtDimensions,
          hasDrinkingWater: Boolean(hasDrinkingWater),
          numFans: Number(numFans),
          hasChairs: Boolean(hasChairs),
          hasNearbyJuiceShop: Boolean(hasNearbyJuiceShop),
          hasShuttlecocks: Boolean(hasShuttlecocks),
          shuttlecockCost: Number(shuttlecockCost),
          defaultOpenTime,
          defaultCloseTime,
          pricePerHour: Number(pricePerHour),
        },
      });
    } else {
      turf = await prisma.turf.create({
        data: {
          name,
          adminName,
          adminPhone,
          courtAddress,
          adminAddress,
          insideImagesJson: JSON.stringify(insideImages),
          outsideImagesJson: JSON.stringify(outsideImages),
          numCourts: Number(numCourts),
          courtDimensions,
          hasDrinkingWater: Boolean(hasDrinkingWater),
          numFans: Number(numFans),
          hasChairs: Boolean(hasChairs),
          hasNearbyJuiceShop: Boolean(hasNearbyJuiceShop),
          hasShuttlecocks: Boolean(hasShuttlecocks),
          shuttlecockCost: Number(shuttlecockCost),
          defaultOpenTime,
          defaultCloseTime,
          pricePerHour: Number(pricePerHour),
        },
      });
    }

    // Ensure courts exist
    const currentCourts = await prisma.court.findMany({ where: { turfId: turf.id } });
    if (currentCourts.length < turf.numCourts) {
      for (let i = currentCourts.length + 1; i <= turf.numCourts; i++) {
        const court = await prisma.court.create({
          data: {
            turfId: turf.id,
            courtNumber: `Court ${i}`,
            surfaceType: i % 2 === 1 ? "Yonex BWF Synthetic Mat" : "Teakwood Cushioned Wooden Court",
            dimensions: turf.courtDimensions,
          },
        });

        // Generate 7 days default 9am-1am slots
        const slotHours = [
          { start: "09:00", end: "10:00" },
          { start: "10:00", end: "11:00" },
          { start: "11:00", end: "12:00" },
          { start: "12:00", end: "13:00" },
          { start: "13:00", end: "14:00" },
          { start: "14:00", end: "15:00" },
          { start: "15:00", end: "16:00" },
          { start: "16:00", end: "17:00" },
          { start: "17:00", end: "18:00" },
          { start: "18:00", end: "19:00" },
          { start: "19:00", end: "20:00" },
          { start: "20:00", end: "21:00" },
          { start: "21:00", end: "22:00" },
          { start: "22:00", end: "23:00" },
          { start: "23:00", end: "00:00" },
          { start: "00:00", end: "01:00" },
        ];

        const today = new Date();
        for (let d = 0; d < 7; d++) {
          const dateStr = format(addDays(today, d), "yyyy-MM-dd");
          for (const s of slotHours) {
            await prisma.slot.create({
              data: {
                courtId: court.id,
                date: dateStr,
                startTime: s.start,
                endTime: s.end,
                price: turf.pricePerHour,
                status: "AVAILABLE",
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, turf });
  } catch (error) {
    console.error("Error updating turf:", error);
    return NextResponse.json({ error: "Failed to update turf" }, { status: 500 });
  }
}
