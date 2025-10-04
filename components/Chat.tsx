"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        role: "user",
        content: inputValue.trim(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full px-4">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto mt-4 p-4 space-y-4 bg-gray-50 rounded-3xl">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Start a conversation
            </h2>
            <p className="mt-2 text-gray-400">
              Ask me anything about your health concerns
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-purple-400 to-pink-400 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input area */}
      <div className="py-4 border-gray-50">
        <div className="w-full">
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-3 rounded-xl">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder="Ask something.."
            />
            <button
              onClick={handleSendMessage}
              className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
