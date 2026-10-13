import { NextResponse } from "next/server";
import { getChatMessages, addChatMessage } from "@/lib/inMemoryChat";

// STRICT ZERO-DB PERSISTENCE POLICY:
// Messages are handled exclusively by volatile in-memory storage.

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }

    const messages = getChatMessages(roomId);
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error reading in-memory messages:", error);
    return NextResponse.json({ error: "Failed to read messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, senderPhone, senderName, text } = body;

    if (!roomId || !senderPhone || !text) {
      return NextResponse.json(
        { error: "Room ID, sender phone, and message text are required" },
        { status: 400 }
      );
    }

    const newMessage = addChatMessage(roomId, senderPhone, senderName || "Player", text);
    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("Error adding in-memory message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
