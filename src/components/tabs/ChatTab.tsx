"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@/context/UserContext";
import {
  Send,
  Lock,
  MessageCircle,
  Phone,
  Video,
  CheckCheck,
  Smile,
  Paperclip,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";

export function ChatTab() {
  const { currentUser, activeChatRoom, setActiveTab, isDark } = useUser();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll in-memory messages for the active room (strictly zero database)
  const fetchMessages = async () => {
    if (!activeChatRoom?.roomId) return;
    try {
      const res = await fetch(`/api/chat?roomId=${activeChatRoom.roomId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2500);
    return () => clearInterval(interval);
  }, [activeChatRoom?.roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatRoom?.roomId) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: activeChatRoom.roomId,
          senderPhone: currentUser.phone,
          senderName: currentUser.name,
          text: textToSend,
        }),
      });

      if (res.ok) {
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  // If no chat partner is connected yet
  if (!activeChatRoom) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 shadow-sm text-center max-w-xl mx-auto my-8 transition-colors">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">WhatsApp-Style Ephemeral Chat</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Chat is unlocked automatically when a partner request is accepted in the Status Tab.
          In accordance with your privacy requirements,{" "}
          <strong className="text-emerald-700 dark:text-emerald-400">no messages are ever stored in the database</strong>.
        </p>
        <button
          onClick={() => setActiveTab("status")}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to Status Tab & Connect with a Partner
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-[#efeae2] dark:bg-[#0b141a] rounded-2xl shadow-xl overflow-hidden border border-slate-300 dark:border-slate-800 flex flex-col h-[700px] transition-colors">
      {/* WhatsApp Header */}
      <div className="bg-[#075e54] dark:bg-[#202c33] text-white p-3 sm:p-4 flex items-center justify-between shadow-md border-b dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-700 dark:bg-slate-700 flex items-center justify-center font-bold text-white text-base border-2 border-emerald-400 dark:border-emerald-500">
              {activeChatRoom.partnerName.charAt(0)}
            </div>
            <span className="w-3 h-3 rounded-full bg-emerald-400 absolute bottom-0 right-0 border-2 border-[#075e54] dark:border-[#202c33]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight text-white">{activeChatRoom.partnerName}</h3>
              <span className="text-[10px] bg-emerald-800 dark:bg-slate-700 text-emerald-200 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                {activeChatRoom.courtNumber}
              </span>
            </div>
            <p className="text-[11px] text-emerald-100 dark:text-slate-400 flex items-center gap-1 font-mono">
              <span>{activeChatRoom.partnerPhone}</span>
              <span>•</span>
              <span className="text-emerald-300 dark:text-emerald-400 font-bold">Online</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-emerald-100 dark:text-slate-300">
          <button title="Simulated Call" className="hover:text-white p-1">
            <Phone className="w-4 h-4" />
          </button>
          <button title="Simulated Video" className="hover:text-white p-1">
            <Video className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab("status")}
            className="text-xs bg-emerald-800 dark:bg-slate-700 hover:bg-emerald-700 dark:hover:bg-slate-600 text-white px-2.5 py-1 rounded-lg font-bold transition-all"
          >
            Change Partner
          </button>
        </div>
      </div>

      {/* Zero DB Privacy Notice Banner */}
      <div className="bg-[#ffeecd] dark:bg-[#182229] border-b border-[#ffd993] dark:border-[#222e35] px-4 py-2 text-[11px] text-[#72521d] dark:text-[#ffd279] flex items-center justify-center gap-2 font-semibold">
        <ShieldCheck className="w-4 h-4 text-[#a37222] dark:text-[#ffd279]" />
        <span>🔒 Zero Database Storage Policy: Messages in this room exist only in ephemeral server memory.</span>
      </div>

      {/* Messages Canvas */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[radial-gradient(#d4cdb4_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm px-4 py-2 rounded-xl text-xs text-slate-500 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700">
              👋 Start the conversation with {activeChatRoom.partnerName}! Say hi and finalize your court time.
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderPhone === currentUser.phone;

            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl p-3 shadow-sm relative ${
                    isMe
                      ? "bg-[#dcf8c6] dark:bg-[#005c4b] text-slate-900 dark:text-white rounded-tr-none"
                      : "bg-white dark:bg-[#202c33] text-slate-900 dark:text-white rounded-tl-none border border-slate-200 dark:border-slate-700/50"
                  }`}
                >
                  {!isMe && (
                    <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 mb-0.5">
                      {msg.senderName}
                    </p>
                  )}
                  <p className="text-xs leading-relaxed break-words">{msg.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-500 dark:text-slate-300">
                    <span>{format(new Date(msg.timestamp), "hh:mm a")}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-500 dark:text-emerald-300" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Message Input Bar */}
      <form onSubmit={handleSendMessage} className="bg-[#f0f2f5] dark:bg-[#202c33] p-3 flex items-center gap-2 border-t border-slate-300 dark:border-slate-800">
        <button
          type="button"
          className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          <Smile className="w-5 h-5" />
        </button>

        <button
          type="button"
          className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Type a message to ${activeChatRoom.partnerName}...`}
          className="flex-1 bg-white dark:bg-[#2a3942] border border-slate-300 dark:border-slate-700 rounded-full px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          className="w-10 h-10 rounded-full bg-[#128c7e] hover:bg-[#075e54] text-white flex items-center justify-center shadow-md transition-all disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
