import { PrismaClient } from "@prisma/client";
import { format, addDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding badminton turf data...");

  // Clean existing data
  await prisma.report.deleteMany();
  await prisma.partnerRequest.deleteMany();
  await prisma.partnerProfile.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.blockedRange.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.court.deleteMany();
  await prisma.turf.deleteMany();

  // 4 Inside Images (high quality badminton courts)
  const insideImages = [
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=800&auto=format&fit=crop&q=80",
  ];

  // 4 Outside Images (exterior, lounge, parking, cafeteria)
  const outsideImages = [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=80",
  ];

  // Create Turf with all mandatory fields
  const turf = await prisma.turf.create({
    data: {
      name: "Apex Smash Badminton Arena & Club",
      adminName: "Karthik Subramanian",
      adminPhone: "9876543210",
      courtAddress: "No. 42, BWF Boulevard, Indiranagar, Bengaluru, Karnataka 560038",
      adminAddress: "Tower B, Flat 401, Prestige Palms, Old Airport Road, Bengaluru",
      insideImagesJson: JSON.stringify(insideImages),
      outsideImagesJson: JSON.stringify(outsideImages),
      numCourts: 4,
      courtDimensions: "44 ft x 20 ft (BWF Standard)",
      hasDrinkingWater: true,
      numFans: 8,
      hasChairs: true,
      hasNearbyJuiceShop: true,
      hasShuttlecocks: true,
      shuttlecockCost: 60.0,
      defaultOpenTime: "09:00",
      defaultCloseTime: "01:00",
      pricePerHour: 450.0,
    },
  });

  // Create 4 Courts
  const courts = [];
  const courtNames = [
    { number: "Court 1", surface: "Yonex BWF Synthetic Mat" },
    { number: "Court 2", surface: "Yonex BWF Synthetic Mat" },
    { number: "Court 3", surface: "Teakwood Cushioned Wooden Court" },
    { number: "Court 4", surface: "Teakwood Cushioned Wooden Court" },
  ];

  for (const c of courtNames) {
    const court = await prisma.court.create({
      data: {
        turfId: turf.id,
        courtNumber: c.number,
        surfaceType: c.surface,
        dimensions: "44 ft x 20 ft",
        isActive: true,
      },
    });
    courts.push(court);
  }

  // 1-hour slot hours from 09:00 to 01:00 (16 slots per court per day)
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
  let sampleBookingSlotId: string | null = null;
  let sampleSlotStartTime: Date = new Date();

  // Populate slots for 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDay = addDays(today, dayOffset);
    const dateStr = format(currentDay, "yyyy-MM-dd");

    for (const court of courts) {
      for (let i = 0; i < slotHours.length; i++) {
        const slotHour = slotHours[i];
        
        // Let's create one pre-booked slot on Court 1 for today evening for demo/history
        const isDemoBooked = dayOffset === 0 && court.courtNumber === "Court 1" && slotHour.start === "18:00";
        
        const slot = await prisma.slot.create({
          data: {
            courtId: court.id,
            date: dateStr,
            startTime: slotHour.start,
            endTime: slotHour.end,
            price: 450.0,
            status: isDemoBooked ? "BOOKED" : "AVAILABLE",
          },
        });

        if (isDemoBooked) {
          sampleBookingSlotId = slot.id;
          const [h] = slotHour.start.split(":").map(Number);
          sampleSlotStartTime = new Date(currentDay);
          sampleSlotStartTime.setHours(h, 0, 0, 0);
        }
      }
    }
  }

  // Create sample booking for Admin History & Client History tab
  if (sampleBookingSlotId) {
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: "BWF-2026-8821",
        slotId: sampleBookingSlotId,
        bookerName: "Arjun Verma",
        bookerPhone: "9845012345",
        totalAmount: 450.0,
        paymentStatus: "PAID",
        bookingStatus: "CONFIRMED",
        slotStartTime: sampleSlotStartTime,
        createdAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      },
    });

    // 2 Team members with split payment (225 each)
    await prisma.teamMember.createMany({
      data: [
        {
          bookingId: booking.id,
          name: "Arjun Verma",
          phone: "9845012345",
          otp: "4821",
          isOtpVerified: true,
          splitAmount: 225.0,
          paymentStatus: "PAID",
          upiTransactionId: "UPI/SBIN/882194821",
          isDefaulter: false,
        },
        {
          bookingId: booking.id,
          name: "Rohan Das",
          phone: "9876501234",
          otp: "7749",
          isOtpVerified: true,
          splitAmount: 225.0,
          paymentStatus: "PAID",
          upiTransactionId: "UPI/HDFC/992147102",
          isDefaulter: false,
        },
      ],
    });
  }

  // Seed sample partner profiles for Status Tab
  await prisma.partnerProfile.createMany({
    data: [
      {
        name: "Vikram Sen",
        phone: "9811223344",
        courtNumber: "Court 1",
        skillLevel: "Intermediate",
        isAvailable: true,
      },
      {
        name: "Sneha Reddy",
        phone: "9822334455",
        courtNumber: "Court 2",
        skillLevel: "Advanced",
        isAvailable: true,
      },
      {
        name: "Manoj Kumar",
        phone: "9833445566",
        courtNumber: "Court 3",
        skillLevel: "Beginner",
        isAvailable: true,
      },
    ],
  });

  // Seed sample report for Report Tab
  await prisma.report.create({
    data: {
      reporterName: "Arjun Verma",
      reporterPhone: "9845012345",
      reportedUserPhone: "9899001122",
      category: "Facility Issue",
      description: "Net tension on Court 3 was slightly loose in the center. Requesting staff to adjust the cord.",
      status: "OPEN",
      repliesJson: JSON.stringify([
        {
          sender: "Admin Management",
          message: "Thank you for letting us know Arjun! Our on-ground staff inspected and calibrated the net tension at 2:00 PM.",
          timestamp: Date.now() - 1800000,
        },
      ]),
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
