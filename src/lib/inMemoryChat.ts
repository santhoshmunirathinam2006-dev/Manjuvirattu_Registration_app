// STRICT REQUIREMENT: Chat messages are NOT stored in the database.
// This in-memory store keeps messages in volatile Node.js runtime memory only.

export interface ChatMessage {
  id: string;
  roomId: string;
  senderPhone: string;
  senderName: string;
  text: string;
  timestamp: number;
}

const globalForChat = globalThis as unknown as {
  inMemoryChatStore: Map<string, ChatMessage[]> | undefined;
};

if (!globalForChat.inMemoryChatStore) {
  globalForChat.inMemoryChatStore = new Map<string, ChatMessage[]>();
}

const chatStore = globalForChat.inMemoryChatStore;

export function getChatMessages(roomId: string): ChatMessage[] {
  return chatStore.get(roomId) || [];
}

export function addChatMessage(
  roomId: string,
  senderPhone: string,
  senderName: string,
  text: string
): ChatMessage {
  const messages = chatStore.get(roomId) || [];
  const newMessage: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    roomId,
    senderPhone,
    senderName,
    text,
    timestamp: Date.now(),
  };

  messages.push(newMessage);
  // Keep last 100 messages in memory per room
  if (messages.length > 100) {
    messages.shift();
  }
  chatStore.set(roomId, messages);
  return newMessage;
}

export function clearChatRoom(roomId: string): void {
  chatStore.delete(roomId);
}
