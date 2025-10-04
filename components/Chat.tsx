"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatProps {
  user?: {
    firstName?: string | null;
    fullName?: string | null;
  } | null;
  displayName: string;
}

export default function Chat({ user, displayName }: ChatProps) {
  // States
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Functions
  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage: Message = {
        role: "user",
        content: inputValue.trim(),
      };

      // Add user message immediately
      const currentInput = inputValue.trim();
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsLoading(true);

      try {
        // Send request to API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();

        // Add assistant response
        const assistantMessage: Message = {
          role: "assistant",
          content: data.reply || "I'm sorry, I couldn't process your request.",
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Error sending message:", error);
        // Add error message
        const errorMessage: Message = {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen px-4">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto mt-4 p-4 space-y-4 bg-gray-50 rounded-3xl">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Hello {user?.firstName ?? user?.fullName ?? displayName}
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              How can I help you today?
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
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
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gray-100 text-gray-800">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </>
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
              disabled={isLoading}
              className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "↑"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
